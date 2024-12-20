import { WebSocketServer } from 'ws';
import WebSocket from 'ws';

const HEARTBEAT_INTERVAL = 30000;
const CLIENT_TIMEOUT = 35000;

let wss;
const clients = new Set();

export const initWebSocket = (server) => {
  wss = new WebSocketServer({ server });

  function heartbeat() {
    this.isAlive = true;
  }

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    ws.on('close', () => {
      clients.delete(ws);
    });
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        clients.delete(ws);
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, HEARTBEAT_INTERVAL);

  wss.on('close', () => {
    clearInterval(interval);
  });
};

export const broadcastUpdate = (type) => {
  const message = JSON.stringify({ type });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};