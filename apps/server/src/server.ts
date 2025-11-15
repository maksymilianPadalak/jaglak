import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocket, WebSocketServer } from 'ws';
import chatRoutes from './routes/chatRoutes';
import { analyzeImage, ImageAnalysisResult } from './services/chatService';
import { transcribeAudio } from './services/whisperService';
import { saveCreditCard } from './services/creditCardService';

const app = express();

// HTTP request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function (body) {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    return originalSend.call(this, body);
  };
  
  next();
});

app.use(cors());
// Increase body size limit to 100MB for image uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use('/api', chatRoutes);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set<WebSocket>();
let canBroadcastAction = true; // Flag to control action/text broadcasting - only true when actionDone is received

const broadcastMessage = (message: string, exclude?: WebSocket) => {
  console.log('[WS] Broadcasting message to clients');
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== exclude) {
      client.send(message);
    }
  });
};

const broadcastTextMessage = (text: string, exclude?: WebSocket) => {
  if (!canBroadcastAction) {
    console.log('[WS] Cannot broadcast text - waiting for action to complete');
    return false;
  }
  
  canBroadcastAction = false;
  const textMessage = JSON.stringify({ type: 'text', text });
  broadcastMessage(textMessage, exclude);
  return true;
};

const broadcastAction = (action: string, exclude?: WebSocket) => {
  // Send action wrapped as text message for Unreal Engine compatibility
  // broadcastTextMessage will handle the flag check and reset
  const actionText = JSON.stringify({ action });
  return broadcastTextMessage(actionText, exclude);
};

const processImageAnalysis = async (imageDataUrl: string, sender: WebSocket) => {
  console.log('[Analysis] Starting GPT analysis pipeline');
  try {
    const analysisResult = await analyzeImage(imageDataUrl);
    console.log('[Analysis] GPT returned response:', {
      description: analysisResult.description?.substring(0, 100),
      action: analysisResult.action,
    });

    // Save credit card to DB if detected
    if (analysisResult.action === 'transferMoney' && analysisResult.creditCard) {
      try {
        console.log('[Analysis] Saving credit card details to database');
        const result = await saveCreditCard(analysisResult.creditCard);
        
        if (result.saved) {
          console.log('[Analysis] Credit card saved successfully');
        } else {
          console.log('[Analysis] Card already added:', result.message);
        }
      } catch (error) {
        console.error('[Analysis] Error saving credit card:', error);
      }
    }

    const updatedMessage = JSON.stringify({
      type: 'image',
      data: imageDataUrl,
      aiResponse: JSON.stringify(analysisResult),
      isLoading: false,
    });

    broadcastMessage(updatedMessage, sender);

    // Send action as separate message (skip if noAction)
    if (analysisResult.action !== 'noAction') {
      broadcastAction(analysisResult.action);
    }
  } catch (error) {
    console.error('[Analysis] Error analyzing image:', error);
    const errorAnalysis: ImageAnalysisResult = {
      description: `Error: ${error instanceof Error ? error.message : 'Failed to analyze image'}`,
      action: 'noAction',
    };
    const errorMessage = JSON.stringify({
      type: 'image',
      data: imageDataUrl,
      aiResponse: JSON.stringify(errorAnalysis),
      isLoading: false,
    });

    broadcastMessage(errorMessage, sender);

    // Don't send text message for noAction
  }
};

const processAudioResponse = async (audioBuffer: Buffer, sender: WebSocket, originalDataUrl?: string) => {
  console.log('[Audio] Starting audio processing pipeline');
  try {
    const result = await transcribeAudio({
      audioBuffer,
      responseFormat: 'text',
    });

    console.log('[Audio] Processing complete:', {
      transcriptionLength: result.transcription.length,
      aiResponseLength: result.aiResponse.length,
      audioSize: result.audioBuffer.length,
    });

    // Convert AI response audio buffer to base64 data URL
    const audioBase64 = result.audioBuffer.toString('base64');
    const responseAudioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

    // Send audio message to all clients with isLoading: false to stop UI animation
    const audioMessage = JSON.stringify({
      type: 'audio',
      audio: responseAudioDataUrl,
      isLoading: false,
    });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(audioMessage);
      }
    });
  } catch (error) {
    console.error('[Audio] Error processing audio:', error);
    
    // Update original message to show error
    if (originalDataUrl) {
      const errorMessage = JSON.stringify({
        type: 'audio',
        data: originalDataUrl,
        error: error instanceof Error ? error.message : 'Failed to process audio',
        isLoading: false,
      });
      broadcastMessage(errorMessage, sender);
    }
  }
};

wss.on('connection', (ws: WebSocket) => {
  console.log('[WS] Client connected');
  clients.add(ws);

  ws.on('message', (data: Buffer) => {
    try {
      const isImage =
        data.length > 2 &&
        ((data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) ||
          (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) ||
          (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46));

      const isMP3 =
        data.length > 3 &&
        (
          // ID3v2 tag
          (data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) ||
          // MP3 frame sync (0xFF followed by sync pattern)
          (data[0] === 0xff && (data[1] & 0xe0) === 0xe0)
        );

      if (isImage) {
        const base64Image = data.toString('base64');
        const imageDataUrl = `data:image/jpeg;base64,${base64Image}`;

        console.log(`[WS] Received image (${data.length} bytes)`);

        // Send image immediately with loading state
        const imageMessage = JSON.stringify({
          type: 'image',
          data: imageDataUrl,
          aiResponse: null,
          isLoading: true,
        });

        broadcastMessage(imageMessage, ws);
        processImageAnalysis(imageDataUrl, ws).catch((error) => {
          console.error('[WS] Unhandled error in processImageAnalysis:', error);
        });

        return;
}

      if (isMP3) {
        const base64Audio = data.toString('base64');
        const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

        console.log(`[WS] Received MP3 audio (${data.length} bytes)`);

        // Send audio immediately with loading state
        const audioMessage = JSON.stringify({
          type: 'audio',
          data: audioDataUrl,
          isLoading: true,
        });

        broadcastMessage(audioMessage, ws);
        
        // Process audio and generate AI response
        processAudioResponse(data, ws, audioDataUrl).catch((error) => {
          console.error('[WS] Unhandled error in processAudioResponse:', error);
        });

        return;
      }

      const text = data.toString();
      console.log('[WS] Received text message');

    try {
        const parsed = JSON.parse(text);
        
        // Handle actionDone messages to allow next action
        if (parsed.actionDone === true || parsed.type === 'actionDone') {
          console.log('[WS] Action done received - allowing next action broadcast');
          canBroadcastAction = true;
          return;
        }
        
        if (parsed.text && parsed.text.length > 1000) {
          // Check for base64 image data
          const imageMatch = parsed.text.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
          if (imageMatch) {
            const imageDataUrl = imageMatch[0];
            
            // Send image immediately with loading state
            const imageMessage = JSON.stringify({
              type: 'image',
              data: imageDataUrl,
              aiResponse: null,
              isLoading: true,
            });

            broadcastMessage(imageMessage, ws);
            processImageAnalysis(imageDataUrl, ws).catch((error) => {
              console.error('[WS] Unhandled error in processImageAnalysis:', error);
            });

            return;
          }

          // Check for base64 audio data
          const audioMatch = parsed.text.match(/data:audio\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
          if (audioMatch) {
            const audioDataUrl = audioMatch[0];
            const base64Data = audioDataUrl.replace(/^data:audio\/[^;]+;base64,/, '');
            const audioBuffer = Buffer.from(base64Data, 'base64');
            
            // Send audio immediately with loading state
            const audioMessage = JSON.stringify({
              type: 'audio',
              data: audioDataUrl,
              isLoading: true,
            });

            broadcastMessage(audioMessage, ws);
            
            // Process audio and generate AI response
            processAudioResponse(audioBuffer, ws, audioDataUrl).catch((error) => {
              console.error('[WS] Unhandled error in processAudioResponse:', error);
            });

    return;
  }
        }
      } catch {
        // ignore invalid JSON
      }

      broadcastTextMessage(text);
    } catch (error) {
      console.error('[WS] Error processing message:', error);
}
  });

  ws.on('close', () => {
    console.log('[WS] Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error: Error) => {
    console.error('[WS] WebSocket error:', error);
    clients.delete(ws);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
  console.log(`HTTP API server running on http://localhost:${PORT}`);
});
