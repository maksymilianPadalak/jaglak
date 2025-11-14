import 'dotenv/config';
import http from 'http';
import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import OpenAI from 'openai';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store connected clients
const clients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');
  clients.add(ws);

  // Handle incoming messages from client
  ws.on('message', (data: Buffer) => {
    try {
      // Check if message is binary (image) by checking magic bytes
      const isImage = data.length > 2 && (
        (data[0] === 0xFF && data[1] === 0xD8 && data[2] === 0xFF) || // JPEG
        (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47) || // PNG
        (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) // GIF
      );

      if (isImage) {
        // Convert binary image to base64
        const base64Image = data.toString('base64');
        const message = JSON.stringify({ 
          type: 'image', 
          data: `data:image/jpeg;base64,${base64Image}` 
        });
        
        console.log(`Received image (${data.length} bytes)`);
        
        // Broadcast image to all OTHER connected clients (excluding sender)
        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client !== ws) {
            client.send(message);
          }
        });
      } else {
        // Handle as text message
        const text = data.toString();
        console.log(`Received message: ${text}`);
        
        // Try to parse as JSON to check if it's already formatted
        try {
          const parsed = JSON.parse(text);
          if (parsed.text && parsed.text.length > 1000) {
            // Likely an image sent as text (base64 or corrupted)
            // Try to extract base64 data
            const base64Match = parsed.text.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
            if (base64Match) {
              const message = JSON.stringify({ 
                type: 'image', 
                data: base64Match[0] 
              });
              clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && client !== ws) {
                  client.send(message);
                }
              });
              return;
            }
          }
        } catch {
          // Not JSON, continue as normal text
        }
        
        // Broadcast text message to all OTHER connected clients (excluding sender)
        const message = JSON.stringify({ type: 'text', text });
        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client !== ws) {
            client.send(message);
          }
        });

        // Process text message with OpenAI if it's a question (ends with ?)
        if (text.trim().endsWith('?') && text.trim().length > 5) {
          processTextWithAI(text).catch((error) => {
            console.error('Error processing text with AI:', error);
          });
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error: Error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Process text with OpenAI GPT-4o-mini
async function processTextWithAI(text: string): Promise<void> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond concisely and clearly.',
        },
        {
          role: 'user',
          content: text,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (aiResponse) {
      const aiMessage = JSON.stringify({ 
        type: 'text', 
        text: `AI: ${aiResponse}` 
      });
      
      // Broadcast AI response to all connected clients
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(aiMessage);
        }
      });
      
      console.log(`AI response sent: ${aiResponse.substring(0, 50)}...`);
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
