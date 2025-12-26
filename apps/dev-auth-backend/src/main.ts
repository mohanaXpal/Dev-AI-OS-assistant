/**
 * Main Application Entry Point
 * Dev Auth Backend System & API Gateway
 */

import express from 'express';
import cors from 'cors';
import { JWTService } from './modules/auth/jwt.service';
import { OAuthHandler } from './modules/auth/oauth.handler';
import { userService } from './modules/user/user.service';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/database';
import { Server } from 'socket.io';
import http from 'http';

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
// MOCK_MODE Removed per user request - defaulting to false for LIVE mode
const MOCK_MODE = process.env.MOCK_MODE === 'true';

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log(`🔌 Client Connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`❌ Client Disconnected: ${socket.id}`);
  });
});

// Initialize Services
const jwtService = new JWTService(
  process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret'
);

const oauthHandler = new OAuthHandler(
  process.env.GOOGLE_CLIENT_ID || '',
  process.env.GOOGLE_CLIENT_SECRET || '',
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback',
  process.env.GITHUB_CLIENT_ID || '',
  process.env.GITHUB_CLIENT_SECRET || '',
  process.env.GITHUB_REDIRECT_URI || ''
);


// API Routes

// Health Check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'Dev AI OS Backend',
    mode: MOCK_MODE ? 'MOCK' : 'LIVE',
    timestamp: new Date().toISOString()
  });
});

// System Status Endpoint - Proxy to OS Automation Server
app.get('/api/system/status', async (req, res) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/system/status');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch system status:', error);
    res.status(500).json({
      volume: 50,
      brightness: 75,
      wifi: { connected: true, name: 'Unknown' },
      network: 'Offline',
      cpu_usage: 0,
      memory_usage: 0,
      disk_usage: 0
    });
  }
});

// System Execute Endpoint - Proxy to OS Automation Server
app.post('/api/system/execute', async (req, res) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/system/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Failed to execute system command:', error);
    res.status(500).json({ success: false, message: 'Failed to execute command' });
  }
});

// Command History Endpoint
app.get('/api/history', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = 'anonymous';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwtService.verifyAccessToken(token);
      if (decoded) userId = decoded.sub;
    }

    const history = await userService.getCommandHistory(userId, 10);
    res.json({ commands: history });
  } catch (error) {
    console.error('Failed to fetch history:', error);
    res.json({ commands: [] });
  }
});

// History Clear Endpoint
app.delete('/api/history', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded = jwtService.verifyAccessToken(token) as any;
    const userId = decoded.userId;

    await userService.clearCommandHistory(userId);
    io.emit('activity', {
      timestamp: new Date().toLocaleTimeString(),
      type: 'warning',
      title: 'System',
      message: 'Command history cleared'
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to clear history:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// Command Processing Endpoint
app.post('/api/command', async (req, res) => {
  const { command } = req.body;

  // Identify User
  let userId = 'anonymous';
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = jwtService.verifyAccessToken(token);
    if (decoded) {
      userId = decoded.sub;
    }
  }

  console.log(`[UserId: ${userId}] Command received: ${command}`);

  let executionResult: any = {};

  try {
    const OS_SERVER_URL = 'http://127.0.0.1:8000/execute';
    const lowerCmd = command.toLowerCase();

    // 1. Strict Triggers (OS Automation)
    let action = null;
    let params = {};

    if (lowerCmd.startsWith('open ') || lowerCmd.startsWith('launch ')) {
      action = 'open_app';
      params = { app_name: lowerCmd.replace(/^(open|launch)\s+/, '').trim() };
    } else if (lowerCmd.startsWith('set volume ')) {
      const arg = lowerCmd.replace('set volume ', '').trim();
      action = 'set_volume';
      params = { direction: arg === 'mute' ? 'mute' : arg, count: 5 };
    } else if (lowerCmd.startsWith('set brightness ')) {
      const level = parseInt(lowerCmd.replace('set brightness ', '').trim());
      action = 'set_brightness';
      params = { level: isNaN(level) ? 50 : level };
    } else if (lowerCmd.startsWith('power ')) {
      action = 'power';
      params = { mode: lowerCmd.replace('power ', '').trim() };
    }

    if (action) {
      // Execute OS Action
      try {
        const controller = new AbortController();
        const timeoutMs = action === 'power' ? 2000 : 15000; // 15s timeout
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const osResponse = await fetch(OS_SERVER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, params }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!osResponse.ok) throw new Error(`OS Server Error: ${osResponse.statusText}`);
        const data = await osResponse.json() as any;

        // Log & Emit
        await userService.logCommand(userId, command, action, 'success', data);
        io.emit('activity', {
          timestamp: new Date().toLocaleTimeString(),
          type: 'success',
          title: 'Action Executed',
          message: `Successfully executed: ${action}`
        });
        io.emit('system_status_update'); // Tell UI to refresh stats

        return res.json({
          command: { original: command },
          response: { text: `Executed: ${command}`, type: 'text' },
          execution: { success: true, mode: 'live', details: data }
        });

      } catch (e: any) {
        if (e.name === 'AbortError') {
          // Specialized timeout handling
          if (action === 'power') {
            return res.json({ response: { text: "Power command sent.", type: 'text' } });
          }
          console.error("OS Timeout");
          return res.status(504).json({ error: "OS Server Timeout" });
        }
        console.error("OS Execution Failed:", e);
        return res.status(500).json({ error: String(e) });
      }
    }

    // 2. AI Brain (Gemini)
    try {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (GEMINI_API_KEY) {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        // Using gemini-flash-latest to avoid quota limits on newer models
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
            You are DEV, the world's most advanced OS automation and productivity AI.
            Character Name: DEV
            Core Traits: Professional, direct, highly efficient, futuristic, and slightly witty but always helpful.
            Current OS Context: Windows 11 / Node.js Backend / Python OS Layer.
            
            Operational Guidelines:
            1. Response Style: Keep answers concise but powerful. No fluff. Use technical terminology accurately but understandably.
            2. System Actions: If the user wants to PERFORM an action (volume, brightness, power, files, etc.), use the JSON format.
            3. Thinking: You help with coding, system management, and daily workflows.
            
            Supported Actions & Parameters:
            - open_app: { "app_name": string } (e.g., "calc", "chrome", "notepad", "code", "explorer")
            - set_volume: { "direction": "up" | "down" | "mute" | "unmute" | number(0-100) }
            - set_brightness: { "level": number(0-100) }
            - power: { "mode": "lock" | "sleep" | "shutdown"(blocked) }
            
            Formatting:
            - If triggering an action: Return ONLY the JSON object. Example: { "action": "set_volume", "params": { "direction": "up" } }
            - If answering a query: Use normal text.
            
            User Input: "${command}"
            `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Try Parse JSON
        let aiAction = null;
        try {
          const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          if (cleaned.startsWith('{')) {
            aiAction = JSON.parse(cleaned);
          }
        } catch (ignore) { }

        if (aiAction && aiAction.action) {
          // AI decided to take an action - Recursive Execution
          console.log(`🤖 AI triggered recursive action: ${aiAction.action}`);

          try {
            const osResponse = await fetch(OS_SERVER_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: aiAction.action, params: aiAction.params || {} })
            });
            const osData = await osResponse.json() as any;

            await userService.logCommand(userId, command, aiAction.action, 'success', { ai: responseText, os: osData });
            io.emit('activity', {
              timestamp: new Date().toLocaleTimeString(),
              type: 'info',
              title: 'AI Action',
              message: `AI triggered ${aiAction.action}`
            });
            io.emit('system_status_update');

            return res.json({
              command: { original: command },
              response: { text: responseText, type: 'text' },
              execution: { success: true, mode: 'ai-recursive', details: osData }
            });
          } catch (osErr) {
            console.error("AI Recursive OS Execution Failed:", osErr);
          }
        }

        await userService.logCommand(userId, command, 'ai_chat', 'success', { response: responseText });
        io.emit('activity', {
          timestamp: new Date().toLocaleTimeString(),
          type: 'info',
          title: 'AI Response',
          message: responseText.substring(0, 50) + (responseText.length > 50 ? '...' : '')
        });

        return res.json({
          command: { original: command },
          response: { text: responseText, type: 'text' },
          execution: { success: true, mode: 'ai' }
        });
      }
    } catch (aiError) {
      console.error("AI Error:", aiError);
      return res.json({ response: { text: "AI Unavailable", type: 'error' } });
    }

    // Fallback
    return res.json({ response: { text: "Command not understood.", type: 'error' } });

  } catch (err) {
    console.error(err);
    await userService.logCommand(userId, command, 'error', 'failed', { error: String(err) });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Auth Routes

// 1. Google Login - Redirects to Google
app.get('/api/auth/google', (req, res) => {
  // Generate state for CSRF protection
  const state = Math.random().toString(36).substring(7);
  const url = oauthHandler.generateGoogleAuthUrl(state);
  res.redirect(url);
});

// 2. Google Callback - Handles code exchange
app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const profile = await oauthHandler.handleGoogleCallback(code as string);
    console.log('✅ Google Auth Success:', profile.email);

    // Create or Update User in DB
    const user = await userService.findOrCreate(profile);
    const userId = user._id.toString();

    // Generate Tokens
    const tokens = jwtService.generateTokenPair(userId, user.email, 'session-1');

    // Redirect back to Frontend with Token
    res.redirect(`http://localhost:3000/dashboard?token=${tokens.accessToken}&name=${encodeURIComponent(user.name)}`);

  } catch (error) {
    console.error('Auth Failed:', error);
    res.redirect('http://localhost:3000?error=auth_failed');
  }
});

// Legaacy Mock Login
app.post('/api/auth/login', (req, res) => {
  const token = jwtService.generateTokenPair('user-1', 'suvam@dev.ai', 'session-1');
  res.json(token);
});

// Start Server
server.listen(PORT, () => {
  console.log(`\n🚀 DEV Backend System Online (Socket.io Enabled)`);
  console.log(`📡 Server listening on port ${PORT}`);
  console.log(`🛡️  Mode: ${MOCK_MODE ? 'MOCK SYSTEM' : 'LIVE SYSTEM'}`);
});

export { app, jwtService };
