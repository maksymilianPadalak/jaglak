import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocket, WebSocketServer } from 'ws';
import chatRoutes from './routes/chatRoutes';
import { analyzeImage, ImageAnalysisResult } from './services/chatService';

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

const broadcastMessage = (message: string, exclude?: WebSocket) => {
  console.log('[WS] Broadcasting message to clients');
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== exclude) {
      client.send(message);
    }
  });
};

const processImageAnalysis = async (imageDataUrl: string, sender: WebSocket) => {
  console.log('[Analysis] Starting GPT analysis pipeline');
  try {
    const analysisResult = await analyzeImage(imageDataUrl);
    console.log('[Analysis] GPT returned response:', {
      description: analysisResult.description?.substring(0, 100),
      action: analysisResult.action,
    });

    const updatedMessage = JSON.stringify({
      type: 'image',
      data: imageDataUrl,
      aiResponse: JSON.stringify(analysisResult),
      isLoading: false,
    });

    broadcastMessage(updatedMessage, sender);
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

        // Send audio immediately
        const audioMessage = JSON.stringify({
          type: 'audio',
          data: audioDataUrl,
        });

        broadcastMessage(audioMessage, ws);
        return;
      }

      const text = data.toString();
      console.log('[WS] Received text message');

    try {
        const parsed = JSON.parse(text);
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
            
            // Send audio immediately
            const audioMessage = JSON.stringify({
              type: 'audio',
              data: audioDataUrl,
            });

            broadcastMessage(audioMessage, ws);
            return;
          }
        }
      } catch {
        // ignore invalid JSON
      }

      const textMessage = JSON.stringify({ type: 'text', text });
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(textMessage);
  }
      });
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
