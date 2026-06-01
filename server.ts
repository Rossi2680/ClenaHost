import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const DB_FILE = path.join(process.cwd(), 'db.json');

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading db.json, returning empty structure:', err);
  }
  return {
    registeredUsers: [],
    properties: [],
    professionals: [],
    supportProfessionals: [],
    requests: [],
    supportJobs: [],
    financeSettings: {
      pixKey: 'cleanhost.oficial@gmail.com',
      standardTax: 12,
      loyaltyTax: 5,
      recipientAccount: 'CleanHost Hold S.A. - Banco Cora IP',
      autoRepassActive: true
    },
    financeLogs: []
  };
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add bodyParser for uploading profiles and data (inc. profile photos) safely
  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ extended: true, limit: '60mb' }));

  // API State Endpoints
  app.get('/api/state', (req, res) => {
    const data = readDb();
    res.json(data);
  });

  app.post('/api/state', (req, res) => {
    const incoming = req.body;
    if (!incoming) {
      return res.status(400).json({ error: 'Nenhum dado enviado.' });
    }

    const current = readDb();

    // Helper to merge lists of objects by their "id" field to protect from race conditions
    const mergeById = (currentList: any[], incomingList: any[]) => {
      if (!Array.isArray(incomingList)) return currentList || [];
      if (!Array.isArray(currentList)) return incomingList;
      const map = new Map();
      currentList.forEach(item => {
        if (item && item.id) map.set(item.id, item);
      });
      incomingList.forEach(item => {
        if (item && item.id) map.set(item.id, item);
      });
      return Array.from(map.values());
    };

    const updatedState = {
      registeredUsers: mergeById(current.registeredUsers, incoming.registeredUsers),
      properties: mergeById(current.properties, incoming.properties),
      professionals: mergeById(current.professionals, incoming.professionals),
      supportProfessionals: mergeById(current.supportProfessionals, incoming.supportProfessionals),
      requests: mergeById(current.requests, incoming.requests),
      supportJobs: mergeById(current.supportJobs, incoming.supportJobs),
      financeSettings: incoming.financeSettings || current.financeSettings,
      financeLogs: mergeById(current.financeLogs, incoming.financeLogs)
    };

    writeDb(updatedState);
    res.json(updatedState);
  });

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Setup Vite Dev server middleware or static directory serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CleanHost Backend] Servidor rodando na porta ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[CleanHost Backend] Falha ao iniciar servidor express:', err);
});
