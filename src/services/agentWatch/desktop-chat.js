#!/usr/bin/env node

const readline = require('readline');

const BRIDGE_URL = process.env.BRIDGE_URL || 'http://localhost:3001';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'You: '
});

console.log('🤖 Desktop Chat → Mobile');
console.log(`📡 Bridge: ${BRIDGE_URL}`);
console.log('Type your messages (Ctrl+C to exit)\n');

rl.prompt();

rl.on('line', async (line) => {
  const message = line.trim();
  if (!message) {
    rl.prompt();
    return;
  }

  try {
    const response = await fetch(`${BRIDGE_URL}/api/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: message,
        timestamp: Date.now()
      })
    });

    if (response.ok) {
      console.log('✓ Sent to mobile');
    } else {
      console.log('✗ Failed:', response.statusText);
    }
  } catch (err) {
    console.log('✗ Error:', err.message);
  }

  rl.prompt();
});

rl.on('close', () => {
  console.log('\nBye!');
  process.exit(0);
});
