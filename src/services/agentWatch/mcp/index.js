const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');

const BRIDGE_URL = process.env.BRIDGE_URL || 'http://localhost:3001';
let WORKSPACE_PATH = process.env.WORKSPACE_PATH || '/Users/mac/Documents/Frontend/Learning/BridgeCraft';

async function postToBridge(endpoint, data) {
  try {
    const res = await fetch(`${BRIDGE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (e) {
    console.error(`[MCP → Bridge] Error posting to ${endpoint}:`, e.message);
    return { ok: false, error: e.message };
  }
}

async function getFromBridge(endpoint) {
  try {
    const res = await fetch(`${BRIDGE_URL}${endpoint}`);
    return await res.json();
  } catch (e) {
    console.error(`[MCP → Bridge] Error getting ${endpoint}:`, e.message);
    return null;
  }
}

function detectLanguage(filepath) {
  const ext = path.extname(filepath).toLowerCase();
  const map = {
    '.ts': 'typescript', '.tsx': 'typescript',
    '.js': 'javascript', '.jsx': 'javascript',
    '.py': 'python', '.go': 'go', '.rs': 'rust',
    '.java': 'java', '.kt': 'kotlin', '.swift': 'swift',
    '.c': 'c', '.cpp': 'cpp', '.cs': 'csharp',
    '.rb': 'ruby', '.php': 'php',
    '.css': 'css', '.scss': 'scss',
    '.html': 'html', '.xml': 'xml',
    '.json': 'json', '.yaml': 'yaml', '.yml': 'yaml',
    '.md': 'markdown', '.sql': 'sql',
    '.sh': 'shell', '.bash': 'shell',
  };
  return map[ext] || 'plaintext';
}

const server = new Server(
  { name: 'agentwatch', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'agentwatch_notify',
        description: 'Notify AgentWatch mobile app about activity.',
        inputSchema: {
          type: 'object',
          properties: {
            event: { type: 'string', enum: ['prompt_start', 'prompt_complete', 'prompt_error', 'chat_message'] },
            prompt: { type: 'string' },
            result: { type: 'string' },
            error: { type: 'string' },
            role: { type: 'string', enum: ['assistant', 'system'] },
            content: { type: 'string' }
          },
          required: ['event'],
        },
      },
      {
        name: 'agentwatch_stream_file',
        description: 'Sync file content to mobile app.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            content: { type: 'string' },
            full_sync: { type: 'boolean' }
          },
          required: ['path'],
        },
      },
      {
        name: 'agentwatch_get_mobile_prompts',
        description: 'Check for prompts from mobile user.',
        inputSchema: { type: 'object', properties: {} },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'agentwatch_notify': {
        const payload = {
          type: args.event === 'chat_message' ? 'chat_message' : 'agent_status',
          data: {
            status: args.event.replace('prompt_', ''),
            prompt: args.prompt,
            result: args.result,
            error: args.error,
            role: args.role,
            content: args.content,
            timestamp: Date.now(),
          }
        };
        await postToBridge('/event', payload);
        return { content: [{ type: 'text', text: `Notified AgentWatch: ${args.event}` }] };
      }

      case 'agentwatch_stream_file': {
        const filePath = args.path;
        let content = args.content;
        if (!content) {
          const fullPath = path.isAbsolute(filePath) ? filePath : path.join(WORKSPACE_PATH, filePath);
          content = fs.readFileSync(fullPath, 'utf-8');
        }
        const relPath = path.isAbsolute(filePath) ? path.relative(WORKSPACE_PATH, filePath) : filePath;
        
        await postToBridge('/event', {
          type: 'file_update',
          data: { path: relPath, content, language: detectLanguage(relPath), timestamp: Date.now() }
        });
        return { content: [{ type: 'text', text: `Streamed ${relPath} to mobile` }] };
      }

      case 'agentwatch_get_mobile_prompts': {
        const data = await getFromBridge('/prompts/pending');
        if (!data || !data.prompts || data.prompts.length === 0) {
          return { content: [{ type: 'text', text: 'No new mobile prompts. I am idling and waiting for your phone...' }] };
        }
        
        const promptList = data.prompts.map(p => `[MOBILE USER]: ${p.text}`).join('\n\n');
        await postToBridge('/prompts/clear', { ids: data.prompts.map(p => p.id) });
        
        return {
          content: [{ type: 'text', text: `RECEIVING FROM MOBILE:\n\n${promptList}\n\nI will now execute these instructions.` }],
          isError: false,
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AgentWatch MCP server running on stdio');
  await postToBridge('/workspace', { path: WORKSPACE_PATH });
}

main().catch(err => {
  console.error('Fatal error in MCP server:', err);
  process.exit(1);
});
