# Quick Setup - View AI Chat on Mobile

Since ngrok premium is not available, we will use your **Local IP Address** for testing.

## Step 1: Start Bridge Server

```bash
cd src/services/agentWatch/bridge
npm install
npm start
```

The server will start and print your **Local IP Address** in the terminal. Look for:
`WS → ws://192.168.1.XXX:3001`

## Step 2: Connect from Mobile App

1. Make sure your phone is on the **same WiFi** as your computer.
2. Open the BridgeCraft app.
3. Enter the URL shown in your terminal (e.g., `192.168.1.XXX:3001`).
4. Tap **Connect**.

## Step 3: Start MCP Server in IDE

In your IDE (Antigravity), the MCP server is already configured in `~/.gemini/antigravity/mcp_config.json`. 

To run it manually:
```bash
BRIDGE_URL=http://192.168.1.XXX:3001 node /Users/mac/Documents/Frontend/Learning/BridgeCraft/src/services/agentWatch/mcp/index.js
```

## Step 4: Test It

Send a test message from your terminal:

```bash
curl -X POST http://localhost:3001/event \
  -H "Content-Type: application/json" \
  -d '{"type": "chat_message", "data": {"role": "assistant", "content": "Hello from desktop!"}}'
```

Your mobile should show it instantly!

---

### Alternative: Using ngrok
If you want to use ngrok:
```bash
npm run start:remote
```
