/**
 * Main Application Entry Point
 * Dev Auth Backend System & API Gateway
 */

import express from 'express';
import cors from 'cors';
import { JWTService } from './modules/auth/jwt.service';
import { OAuthHandler } from './modules/auth/oauth.handler';
import { SessionManager } from './modules/session/session.manager';
import { PermissionManager } from './modules/permission/permission.manager';
import { UserService } from './modules/user/user.service';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/database';

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;
const MOCK_MODE = process.env.MOCK_MODE === 'true' || true; // Default to true for now as requested

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Services
const jwtService = new JWTService(
  process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret'
);

// Mock Data for AI Responses
const MOCK_RESPONSES: Record<string, string> = {
  "hello": "Hello Suvam, I am JARVIS. Systems are online and functioning within normal parameters.",
  "status": "All systems operational. CPU at 12%, Memory at 45%. Network stable.",
  "open chrome": "Executing: Opening Google Chrome...",
  "open vs code": "Executing: Opening Visual Studio Code...",
  "time": new Date().toLocaleTimeString(),
  "default": "I processed your command. However, I am currently in Mock Mode, so I cannot execute real system actions yet."
};

/**
 * API Routes
 */

// Health Check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'Dev AI OS Backend',
    mode: MOCK_MODE ? 'MOCK' : 'LIVE',
    timestamp: new Date().toISOString()
  });
});

// Command Processing Endpoint
app.post('/api/command', async (req, res) => {
  const { command } = req.body;
  console.log(`[UserId: default] Command received: ${command}`);

  if (MOCK_MODE) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowerCmd = command.toLowerCase();

    // NEW: Live Automation Integration (Hybrid approach)
    // If command starts with "open", try to hit the automation server
    if (lowerCmd.startsWith('open')) {
      try {
        const appName = lowerCmd.replace('open', '').trim();
        console.log(`⚡ Sending execution request to OS Layer: open_app ${appName}`);

        const authResponse = await fetch('http://localhost:8000/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'open_app',
            params: { app_name: appName }
          })
        });

        if (authResponse.ok) {
          const data = await authResponse.json() as any;
          return res.json({
            command: { original: command, parsed: lowerCmd },
            response: { text: `Executed: ${data.message}`, type: 'text' },
            execution: { success: true, mode: 'live', details: data }
          });
        }
      } catch (error) {
        console.error("OS Automation Error:", error);
        // Fallback to mock response
      }
    }

    let responseText = MOCK_RESPONSES['default'];

    if (lowerCmd.includes('hello') || lowerCmd.includes('hi')) responseText = MOCK_RESPONSES['hello'];
    else if (lowerCmd.includes('status')) responseText = MOCK_RESPONSES['status'];
    else if (lowerCmd.includes('chrome')) responseText = MOCK_RESPONSES['open chrome'];
    else if (lowerCmd.includes('code')) responseText = MOCK_RESPONSES['open vs code'];
    else if (lowerCmd.includes('time')) responseText = `Current core time is ${new Date().toLocaleTimeString()}`;

    return res.json({
      command: { original: command, parsed: lowerCmd },
      response: { text: responseText, type: 'text' },
      execution: { success: true, mode: 'mock' }
    });
  } else {
    // TODO: Connect to actual AILLMSystem and AssistantCore
    return res.status(501).json({ error: 'Live mode not fully implemented yet' });
  }
});

// Auth Routes (Placeholder for now)
app.post('/api/auth/login', (req, res) => {
  // Mock login
  const token = jwtService.generateTokenPair('user-1', 'suvam@dev.ai', 'session-1');
  res.json(token);
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 JARVIS Backend System Online`);
  console.log(`📡 Server listening on port ${PORT}`);
  console.log(`🛡️  Mode: ${MOCK_MODE ? 'MOCK SYSTEM (Safe)' : 'LIVE SYSTEM (Active)'}\n`);
});

// Export services for testing if needed
export { app, jwtService };

