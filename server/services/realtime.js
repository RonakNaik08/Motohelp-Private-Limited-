/**
 * Real-Time Event Broadcasting Service (Server-Sent Events - SSE)
 * Provides genuine real-time, event-driven updates from SQLite transactions to connected clients.
 */

class RealtimeService {
  constructor() {
    this.clients = new Map();
    this.heartbeatInterval = null;
    this.startHeartbeat();
  }

  startHeartbeat() {
    // Send a lightweight keepalive ping every 25 seconds to keep proxies from terminating idle connections
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client) => {
        try {
          client.res.write(': keepalive-ping\n\n');
        } catch {
          this.removeClient(client.id);
        }
      });
    }, 25000);
  }

  addClient(req, res, user) {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*'
    });

    res.write(`event: connected\ndata: ${JSON.stringify({ clientId, timestamp: new Date().toISOString() })}\n\n`);

    const client = {
      id: clientId,
      res,
      user,
      connectedAt: new Date()
    };

    this.clients.set(clientId, client);

    req.on('close', () => {
      this.removeClient(clientId);
    });

    return clientId;
  }

  removeClient(clientId) {
    if (this.clients.has(clientId)) {
      this.clients.delete(clientId);
    }
  }

  /**
   * Broadcast an event to connected clients.
   * Supports target scoping (e.g. admin-only, role-specific, or customer-specific).
   */
  broadcast(eventType, data = {}, filter = null) {
    const message = `event: ${eventType}\ndata: ${JSON.stringify({ ...data, _timestamp: Date.now() })}\n\n`;

    this.clients.forEach((client) => {
      try {
        if (filter && typeof filter === 'function') {
          if (!filter(client.user)) return;
        }
        client.res.write(message);
      } catch (err) {
        console.warn(`[Realtime] Failed writing to client ${client.id}:`, err?.message);
        this.removeClient(client.id);
      }
    });
  }

  getActiveClientCount() {
    return this.clients.size;
  }

  closeAll() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.clients.forEach((client) => {
      try {
        client.res.end();
      } catch {}
    });
    this.clients.clear();
  }
}

export const realtimeService = new RealtimeService();
