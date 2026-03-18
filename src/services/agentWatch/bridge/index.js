const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const ngrok = require('@ngrok/ngrok');
const path = require('path');
const fs = require('fs');
const os = require('os');

const PORT = process.env.PORT || 3001;
const CONFIG_FILE = path.join(__dirname, 'config.json');
const NGROK_AUTH_TOKEN = process.env.NGROK_AUTH_TOKEN || '3AsWq9JR3yElDdNkAyOt32iT1By_3b7LDFzgqrd4MseZdQKyi';
const USE_NGROK = process.argv.includes('--ngrok');

let agentStatus = 'idle';
let currentPrompt = null;
let currentFile = null;
let workspacePath = null;
let fileTree = [];
let promptHistory = [];
let fileChangeLog = [];
let pendingPrompts = [];
let cancelRequested = false;
let publicUrl = null;

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });
const clients = new Map();

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, ws => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', ws => {
  const clientId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  clients.set(clientId, { ws, id: clientId, connectedAt: Date.now() });

  console.log(`[WS] Client connected: ${clientId} (total: ${clients.size})`);

  ws.send(JSON.stringify({
    type: 'init',
    agentStatus,
    currentPrompt,
    currentFile,
    workspacePath,
    fileTree,
    promptHistory: promptHistory.slice(-50),
    fileChanges: fileChangeLog.slice(-20),
    connectedClients: clients.size,
    publicUrl,
  }));

  ws.on('message', raw => {
    try {
      const msg = JSON.parse(raw.toString());
      handleMobileMessage(clientId, msg);
    } catch (e) {
      console.error('[WS] Invalid message:', e.message);
    }
  });

  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`[WS] Client disconnected: ${clientId} (total: ${clients.size})`);
  });
});

function broadcast(data) {
  const payload = JSON.stringify(data);
  for (const [, client] of clients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  }
}

function handleMobileMessage(clientId, msg) {
  switch (msg.type) {
    case 'request_file_tree':
      broadcast({ type: 'file_tree', tree: fileTree, workspacePath });
      break;
    case 'request_file':
      if (!workspacePath) return;
      try {
        const fullPath = path.join(workspacePath, msg.path);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const ext = path.extname(msg.path).slice(1);
          broadcast({ type: 'file_content', path: msg.path, content, language: ext });
        }
      } catch (err) {
        console.error('[WS] Error reading file:', err.message);
      }
      break;
    case 'send_prompt':
      if (msg.prompt) {
        console.log(`[Bridge] Received prompt from mobile: ${msg.prompt}`);
        const promptItem = {
          id: Date.now().toString(),
          text: msg.prompt,
          timestamp: Date.now(),
        };
        pendingPrompts.push(promptItem);
        promptHistory.push({
          type: 'chat_message',
          role: 'user',
          content: msg.prompt,
          timestamp: Date.now(),
        });
        
        // Write to a "Live Command" file in the workspace so the IDE Agent can see it automatically
        if (workspacePath) {
          const logPath = path.join(workspacePath, '.agent_prompts.log');
          const logEntry = `[${new Date().toLocaleTimeString()}] MOBILE: ${msg.prompt}\n`;
          fs.appendFileSync(logPath, logEntry);
        }

        broadcast({ type: 'prompt_queued', prompt: msg.prompt });
      }
      break;
    case 'request_cancel':
      cancelRequested = true;
      broadcast({ type: 'cancel_requested' });
      break;
  }
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    agentStatus,
    clients: clients.size,
    workspacePath,
    fileCount: fileTree ? countFiles(fileTree) : 0,
    pendingPrompts: pendingPrompts.length,
    publicUrl,
    isNgrok: USE_NGROK,
  });
});

function buildFileTree(dir, rel = '', depth = 0) {
  try {
    if (!fs.existsSync(dir)) return [];
    // Max depth to prevent crashing mobile with thousands of nodes
    if (depth > 3) return []; 
    
    const items = fs.readdirSync(dir);
    return items
      .filter(item => !['node_modules', '.git', '.DS_Store', '.expo', '.next', 'dist', 'build', 'android', 'ios', 'vendor'].includes(item))
      .map(item => {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(rel, item);
        try {
          const stats = fs.statSync(fullPath);
          const isDir = stats.isDirectory();
          return {
            name: item,
            type: isDir ? 'folder' : 'file',
            path: relativePath,
            children: isDir ? buildFileTree(fullPath, relativePath, depth + 1) : undefined,
          };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  } catch (err) {
    console.error(`[Tree] Error scanning ${dir}:`, err.message);
    return [];
  }
}

function countFiles(nodes) {
  return nodes.reduce((s, n) => s + (n.type === 'file' ? 1 : countFiles(n.children || [])), 0);
}

app.post('/workspace', (req, res) => {
  const { path: wsPath } = req.body;
  if (!wsPath) return res.status(400).json({ error: 'Path required' });
  workspacePath = wsPath;
  console.log(`[Bridge] Workspace set: ${wsPath}`);
  
  // Persist
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ workspacePath }));
  } catch (err) {
    console.error('[Bridge] Error saving config:', err.message);
  }

  startWatching(wsPath);
  fileTree = buildFileTree(wsPath);
  console.log(`[Bridge] Scanned ${countFiles(fileTree)} files`);
  broadcast({ type: 'file_tree', tree: fileTree, workspacePath });
  res.json({ success: true });
});

app.get('/workspace/refresh', (req, res) => {
  if (!workspacePath) return res.status(400).json({ error: 'No workspace set' });
  fileTree = buildFileTree(workspacePath);
  broadcast({ type: 'file_tree', tree: fileTree, workspacePath });
  res.json({ success: true, count: countFiles(fileTree) });
});

app.post('/event', (req, res) => {
  const { type, data } = req.body;
  
  if (type === 'file_tree') {
    fileTree = data.tree || [];
    broadcast({ type: 'file_tree', tree: fileTree, workspacePath });
  } else if (type === 'agent_status') {
    agentStatus = data.status || 'idle';
    broadcast({ type: 'agent_status', ...data });
    if (data.status === 'complete' || data.status === 'error') {
      if (workspacePath) {
        try { fs.appendFileSync(path.join(workspacePath, '.agent_prompts.log'), `[${new Date().toLocaleTimeString()}] IDE: Task ${data.status} - ${data.result || data.error || ''}\n`); } catch(e) {}
      }
    }
  } else if (type === 'chat_message') {
    const chatMsg = { type: 'chat_message', ...data };
    promptHistory.push(chatMsg);
    broadcast(chatMsg);
    if (data.role === 'assistant') {
      if (workspacePath) {
        try { fs.appendFileSync(path.join(workspacePath, '.agent_prompts.log'), `[${new Date().toLocaleTimeString()}] IDE: ${data.content}\n`); } catch(e) {}
      }
    }
  } else if (type === 'file_update') {
    broadcast({ type: 'file_update', ...data });
    // Automatically notify mobile that a file change occurred
    broadcast({ 
      type: 'agent_status', 
      status: 'complete', 
      result: `Updated ${path.basename(data.path || 'file')}`,
      timestamp: Date.now()
    });
    if (workspacePath) {
      try { fs.appendFileSync(path.join(workspacePath, '.agent_prompts.log'), `[${new Date().toLocaleTimeString()}] IDE: Updated file ${path.basename(data.path || 'file')}\n`); } catch(e) {}
    }
  }

  res.json({ success: true });
});

app.get('/prompts/pending', (req, res) => {
  res.json({ prompts: pendingPrompts, cancelRequested });
});

app.post('/prompts/clear', (req, res) => {
  const { ids } = req.body;
  if (ids) {
    pendingPrompts = pendingPrompts.filter(p => !ids.includes(p.id));
  } else {
    pendingPrompts = [];
  }
  cancelRequested = false;
  res.json({ success: true });
});

app.get('/monaco.html', (req, res) => {
  const hp = path.join(__dirname, 'monaco.html');
  if (fs.existsSync(hp)) return res.sendFile(hp);
  res.status(404).send('Not found');
});

let watchDebounce;
function startWatching(wsPath) {
  console.log(`[Bridge] Watching workspace: ${wsPath}`);
  fs.watch(wsPath, { recursive: true }, (event, filename) => {
    if (filename && !filename.includes('node_modules') && !filename.includes('.git')) {
      clearTimeout(watchDebounce);
      watchDebounce = setTimeout(() => {
        const fullPath = path.join(wsPath, filename);
        console.log(`[Watcher] File changed: ${filename}`);
        try {
          if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            broadcast({ type: 'file_changed', path: filename, content });
          }
        } catch {}
      }, 500);
    }
  });
}

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

server.listen(PORT, async () => {
  console.log(`\n  Address → http://localhost:${PORT}`);
  const ips = getLocalIPs();
  ips.forEach(ip => console.log(`    Address → http://${ip}:${PORT}`));

  // Load persisted workspace
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      if (config.workspacePath && fs.existsSync(config.workspacePath)) {
        workspacePath = config.workspacePath;
        console.log(`[Bridge] Resuming workspace: ${workspacePath}`);
        startWatching(workspacePath);
        fileTree = buildFileTree(workspacePath);
        console.log(`[Bridge] Scanned ${countFiles(fileTree)} files`);
      }
    } catch (err) {
      console.error('[Bridge] Error loading config:', err.message);
    }
  }

  if (USE_NGROK) {
    try {
      const session = await new ngrok.SessionBuilder().authtoken(NGROK_AUTH_TOKEN).connect();
      const listener = await session.httpEndpoint().listen();
      publicUrl = listener.url();
      console.log(`\n  Public URL → ${publicUrl}`);
    } catch (err) {
      console.error('[ngrok] Error:', err.message);
    }
  }
});
