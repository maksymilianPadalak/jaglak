import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocket, WebSocketServer } from 'ws';
import chatRoutes from './routes/chatRoutes';
import { analyzeImage } from './services/chatService';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', chatRoutes);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');
  clients.add(ws);

  ws.on('message', (data: Buffer) => {
    try {
      const isImage =
        data.length > 2 &&
        ((data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) ||
          (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) ||
          (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46));

      if (isImage) {
        const base64Image = data.toString('base64');
        const imageDataUrl = `data:image/jpeg;base64,${base64Image}`;
        
        console.log(`Received image (${data.length} bytes)`);

        // Send image immediately with loading state
        const imageMessage = JSON.stringify({
          type: 'image',
          data: imageDataUrl,
          aiResponse: null,
          isLoading: true,
        });

        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client !== ws) {
            client.send(imageMessage);
          }
        });

        // Analyze image with GPT Vision asynchronously
        analyzeImage(imageDataUrl)
          .then((aiResponse) => {
            const updatedMessage = JSON.stringify({
              type: 'image',
              data: imageDataUrl,
              aiResponse,
              isLoading: false,
            });

            clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN && client !== ws) {
                client.send(updatedMessage);
              }
            });
          })
          .catch((error) => {
            console.error('Error analyzing image:', error);
            const errorMessage = JSON.stringify({
              type: 'image',
              data: imageDataUrl,
              aiResponse: `Error: ${error instanceof Error ? error.message : 'Failed to analyze image'}`,
              isLoading: false,
            });

            clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN && client !== ws) {
                client.send(errorMessage);
              }
            });
          });

        return;
      }

      const text = data.toString();
      console.log(`Received message: ${text}`);

    try {
        const parsed = JSON.parse(text);
        if (parsed.text && parsed.text.length > 1000) {
          const base64Match = parsed.text.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
          if (base64Match) {
            const imageDataUrl = base64Match[0];
            
            // Send image immediately with loading state
            const imageMessage = JSON.stringify({
              type: 'image',
              data: imageDataUrl,
              aiResponse: null,
              isLoading: true,
            });

            clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN && client !== ws) {
                client.send(imageMessage);
              }
            });

            // Analyze image with GPT Vision asynchronously
            analyzeImage(imageDataUrl)
              .then((aiResponse) => {
                const updatedMessage = JSON.stringify({
                  type: 'image',
                  data: imageDataUrl,
                  aiResponse,
                  isLoading: false,
                });

                clients.forEach((client) => {
                  if (client.readyState === WebSocket.OPEN && client !== ws) {
                    client.send(updatedMessage);
                  }
                });
              })
              .catch((error) => {
                console.error('Error analyzing image:', error);
                const errorMessage = JSON.stringify({
                  type: 'image',
                  data: imageDataUrl,
                  aiResponse: `Error: ${error instanceof Error ? error.message : 'Failed to analyze image'}`,
                  isLoading: false,
                });

                clients.forEach((client) => {
                  if (client.readyState === WebSocket.OPEN && client !== ws) {
                    client.send(errorMessage);
                  }
                });
              });

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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
  console.log(`HTTP API server running on http://localhost:${PORT}`);
});
