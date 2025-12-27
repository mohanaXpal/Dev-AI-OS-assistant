/**
 * Main Application Entry Point
 * Dev Auth Backend System & API Gateway
 */

import express from 'express';
import cors from 'cors';
import { JWTService } from './modules/auth/jwt.service';
import { OAuthHandler } from './modules/auth/oauth.handler';
import { userService } from './modules/user/user.service';
import { Contact } from './models/Contact';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { GitHubService } from './services/github.service';

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
  process.env.GITHUB_REDIRECT_URI || 'http://localhost:3001/api/auth/github/callback'
);

const githubService = new GitHubService(process.env.GITHUB_TOKEN || '');

// Command Normalization Helper (Simple NLP Layer)
const normalizeCommandInput = (cmd: string): { action: string | null, params: any, response?: string } => {
  const lower = cmd.toLowerCase().trim();

  // 1. System Keywords (Global Scanners)
  const isMute = ['mute', 'shut up', 'silence', 'be quiet'].some(k => lower.includes(k));
  const isUnmute = ['unmute', 'speak', 'talk', 'listen'].some(k => lower.includes(k));
  const isMic = ['mic', 'microphone', 'voice'].some(k => lower.includes(k));

  if (isMute && isMic) return { action: 'set_mic_mute', params: { mute: true }, response: "Microphone deactivated. System is now silent." };
  if (isUnmute && isMic) return { action: 'set_mic_mute', params: { mute: false }, response: "Microphone activated. I am listening." };
  if (lower === 'unmute' || lower === 'mute') {
    return {
      action: 'set_mic_mute',
      params: { mute: lower === 'mute' },
      response: lower === 'mute' ? "Muting system microphone..." : "Unmuting system microphone..."
    };
  }

  // 2. App/Tool Mapping
  const appMap: Record<string, string> = {
    'file manager': 'explorer',
    'files': 'explorer',
    'explorer': 'explorer',
    'my pc': 'explorer',
    'chrome': 'chrome',
    'google chrome': 'chrome',
    'browser': 'chrome',
    'web': 'chrome',
    'calculator': 'calc',
    'calc': 'calc',
    'notepad': 'notepad',
    'vs code': 'code',
    'vscode': 'code',
    'code': 'code'
  };

  // 3. Strict StartsWith Triggers (OS Automation)
  if (lower.startsWith('open ') || lower.startsWith('launch ') || lower.startsWith('start ')) {
    const rawTarget = lower.replace(/^(open|launch|start)\s+(my\s+)?/, '').replace(/\.$/, '').trim();
    const target = appMap[rawTarget] || rawTarget;

    // Safety: Only auto-trigger strict map apps or legitimate URLs
    if (appMap[rawTarget] || target.startsWith('http')) {
      return {
        action: 'open_app',
        params: { app_name: target },
        response: `Understood. Launching ${rawTarget}...`
      };
    }
  }

  if (lower.startsWith('set volume ')) {
    const arg = lower.replace('set volume ', '').trim();
    return {
      action: 'set_volume',
      params: { direction: arg === 'mute' ? 'mute' : arg, count: 5 },
      response: `Adjusting system volume to ${arg}.`
    };
  }

  if (lower.startsWith('set brightness ')) {
    const level = parseInt(lower.replace('set brightness ', '').trim());
    return {
      action: 'set_brightness',
      params: { level: isNaN(level) ? 50 : level },
      response: `Setting screen brightness to ${level}%...`
    };
  }

  if (lower.startsWith('power ')) {
    const mode = lower.replace('power ', '').trim();
    return {
      action: 'power',
      params: { mode },
      response: `Initiating system ${mode} sequence.`
    };
  }

  // 4. Simple Keywords
  if (lower === 'stop' || lower === 'wait' || lower === 'halt') {
    return {
      action: 'system_info',
      params: { message: "System activity paused." },
      response: "All operations paused. Standing by."
    };
  }

  return { action: null, params: {} };
};


// Logic for Code Creation on Desktop
const writeCodeToDesktop = async (language: string, fileName: string, code: string) => {
  try {
    const desktopPath = path.join(os.homedir(), 'Desktop', 'DevAI_Projects');
    if (!fs.existsSync(desktopPath)) {
      fs.mkdirSync(desktopPath, { recursive: true });
    }
    const filePath = path.join(desktopPath, fileName);
    fs.writeFileSync(filePath, code);
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Failed to write code to desktop:', error);
    return { success: false, error: String(error) };
  }
};

const githubPush = async (userToken: string | undefined, userGithubName: string | undefined, repo: string, filePath: string, commitMessage: string, content: string) => {
  try {
    if (!userToken) {
      return { success: false, error: 'GitHub account not linked. Please visit the Plugins page to connect your GitHub account.' };
    }

    const personalService = new GitHubService(userToken);

    // Extract owner and repo from string like "owner/repo"
    let owner: string;
    let repoName: string;

    if (repo.includes('/')) {
      const parts = repo.split('/');
      owner = parts[0];
      repoName = parts[1];
    } else {
      // Priority: 1. userGithubName from database, 2. system default
      owner = userGithubName || process.env.GITHUB_DEFAULT_OWNER || 'suvam-paul145';
      repoName = repo;
    }

    console.log(`[GitHub Push] Targeting ${owner}/${repoName}`);
    const result = await personalService.pushFile(owner, repoName, filePath, content, commitMessage);
    return result;
  } catch (error: any) {
    console.error('Failed to push to github:', error.message);
    return { success: false, error: error.message };
  }
};

const githubCreateRepo = async (userToken: string, name: string, description?: string) => {
  try {
    const token = userToken || process.env.GITHUB_TOKEN;
    if (!token) return { success: false, error: 'GitHub credentials not found.' };
    const personalService = new GitHubService(token);
    const data = await personalService.createRepo(name, description);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to create repo:', error);
    return { success: false, error: String(error) };
  }
};

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
    const userId = decoded?.sub;

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

// Contact Us Endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contact = new Contact({ name, email, message });
    await contact.save();
    res.json({ success: true, message: 'Message recorded' });
  } catch (error) {
    console.error('Failed to save contact:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

app.get('/api/user/status', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwtService.verifyAccessToken(token) as any;
    const user = await userService.getUserById(decoded?.sub);

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      githubLinked: !!user.githubToken,
      githubUsername: user.githubUsername,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
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

    // 1. Normalized Triggers (High Responsiveness)
    const normalization = normalizeCommandInput(command);
    const { action, params } = normalization;

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
          message: normalization.response || `Successfully executed: ${action}`
        });
        io.emit('system_status_update'); // Tell UI to refresh stats

        return res.json({
          command: { original: command },
          response: { text: normalization.response || `Executed: ${command}`, type: 'text' },
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
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
            You are DEV.OS, the world's most advanced OS automation and productivity AI.
            Character Name: DEV.OS
            Core Traits: Professional, direct, highly efficient, futuristic, and slightly witty but always helpful.
            Current OS Context: Windows 11 / Node.js Backend / Python OS Layer.
            
            Operational Guidelines:
            1. Response Style: Keep answers concise but powerful. No fluff. Use technical terminology accurately but understandably.
            2. System Actions: If the user wants to PERFORM an action (volume, brightness, power, files, etc.), use the JSON format.
            3. Context Normalization: If a user says "File Manager", it means "explorer". If they say "Browser", it means "chrome".
            4. Web/URL Support: You can open websites by returning: { "action": "open_app", "params": { "app_name": "https://github.com" } }.
            5. Thinking: You help with coding, system management, and daily workflows.
            
            Supported Actions & Parameters:
            - open_app: { "action": "open_app", "params": { "app_name": string } }
            - set_volume: { "action": "set_volume", "params": { "direction": "up" | "down" | "mute" | "unmute" } }
            - set_brightness: { "action": "set_brightness", "params": { "level": number } }
            - power: { "action": "power", "params": { "mode": "lock" | "sleep" | "shutdown" } }
            - write_code: { "action": "write_code", "params": { "language": string, "file_name": string, "code": string } }
            - github_push: { "action": "github_push", "params": { "repo": string, "file_path": string, "commit_message": string, "content": string } }
            - github_create_repo: { "action": "github_create_repo", "params": { "name": string, "description": string } }
            - set_mic_mute: { "action": "set_mic_mute", "params": { "mute": boolean } }

            GitHub Logic:
            1. If pushing, 'repo' should be the name (e.g., "my-repo"). The owner is resolved automatically.
            2. If you need to create a new folder/project, use 'github_create_repo' followed by 'github_push'.
            
            Formatting:
            - If triggering an action: Return ONLY the JSON object. 
              Example: { "action": "open_app", "params": { "app_name": "https://github.com" } }
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
          console.log(`🤖 AI triggered recursive action: ${aiAction.action}`);

          if (aiAction.action === 'write_code') {
            const result = await writeCodeToDesktop(aiAction.params.language, aiAction.params.file_name, aiAction.params.code);
            io.emit('activity', {
              timestamp: new Date().toLocaleTimeString(),
              type: 'success',
              title: 'Code Created',
              message: `Project saved to Desktop: ${aiAction.params.file_name}`
            });
            return res.json({ response: { text: `Done. I've created the ${aiAction.params.language} file on your desktop in 'DevAI_Projects'.`, type: 'text' }, execution: result });
          }

          if (aiAction.action === 'github_push') {
            // Get user from DB for token and dynamic owner resolution
            const user = await userService.getUserById(userId);
            const token = user?.githubToken;

            if (!token) {
              return res.json({
                response: { text: "I can't push to GitHub yet. Your account isn't linked! Please go to the Plugins page and connect your GitHub account first.", type: 'text' },
                execution: { success: false, error: 'GitHub not linked' }
              });
            }

            const result = (await githubPush(token, user?.githubUsername, aiAction.params.repo, aiAction.params.file_path, aiAction.params.commit_message, aiAction.params.content || '')) as any;
            io.emit('activity', {
              timestamp: new Date().toLocaleTimeString(),
              type: result.success ? 'success' : 'error',
              title: 'GitHub Sync',
              message: result.success ? `Pushed to ${aiAction.params.repo}` : `Push failed: ${result.error || 'Unknown error'}`
            });
            return res.json({ response: { text: result.success ? `I've pushed the updates to ${aiAction.params.repo}.` : `I tried to push to GitHub but failed: ${result.error || 'Unknown error'}`, type: result.success ? 'text' : 'error' }, execution: result });
          }

          if (aiAction.action === 'github_create_repo') {
            const user = await userService.getUserById(userId);
            const token = user?.githubToken || process.env.GITHUB_TOKEN || '';
            const result = await githubCreateRepo(token, aiAction.params.name, aiAction.params.description);
            io.emit('activity', {
              timestamp: new Date().toLocaleTimeString(),
              type: result.success ? 'success' : 'error',
              title: 'GitHub Repo Created',
              message: result.success ? `Created repository: ${aiAction.params.name}` : result.error
            });
            return res.json({ response: { text: result.success ? `Successfully created repository: ${aiAction.params.name}` : `Failed to create repository: ${result.error}`, type: result.success ? 'text' : 'error' }, execution: result });
          }

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
      } catch (aiError) {
        console.error("AI Error:", aiError);
        return res.json({ response: { text: "AI Unavailable", type: 'error' } });
      }
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

// 1. Google Login
app.get('/api/auth/google', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  const url = oauthHandler.generateGoogleAuthUrl(state);
  res.redirect(url);
});

// 2. Google Callback
app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const profile = await oauthHandler.handleGoogleCallback(code as string);
    const user = await userService.findOrCreate(profile);
    const tokens = jwtService.generateTokenPair(user._id.toString(), user.email, 'session-1');
    res.redirect(`http://localhost:3000/dashboard?token=${tokens.accessToken}&name=${encodeURIComponent(user.name)}`);
  } catch (error) {
    console.error('Auth Failed:', error);
    res.redirect('http://localhost:3000?error=auth_failed');
  }
});

// 3. GitHub Link/Login
app.get('/api/auth/github', (req, res) => {
  const { token } = req.query;
  let state = Math.random().toString(36).substring(7);

  console.log(`[GitHub Auth] Initiating auth. Token present: ${!!token}`);

  // If token is provided, it's a linking flow
  if (token) {
    const decoded = jwtService.verifyAccessToken(token as string) as any;
    if (decoded && decoded.sub) {
      state = `link_${decoded.sub}_${state}`;
      console.log(`[GitHub Auth] Linking mode for sub: ${decoded.sub}`);
    } else {
      console.warn(`[GitHub Auth] Provided token is invalid or missing sub`);
    }
  }

  const url = oauthHandler.generateGithubAuthUrl(state);
  res.redirect(url);
});

// 4. GitHub Callback
app.get('/api/auth/github/callback', async (req, res) => {
  const { code, state } = req.query;
  console.log(`[GitHub Callback] Received. State: ${state}`);
  try {
    const profile = await oauthHandler.handleGithubCallback(code as string) as any;
    console.log(`[GitHub Callback] Profile fetched: ${profile.email}`);

    const isLinking = (state as string)?.startsWith('link_');
    let userIdToLink: string | null = null;

    if (isLinking) {
      userIdToLink = (state as string).split('_')[1];
      console.log(`[GitHub Callback] Attempting to link to user: ${userIdToLink}`);
    }

    if (userIdToLink) {
      // LINKING FLOW: Check if email matches
      const currentUser = await userService.getUserById(userIdToLink);
      if (!currentUser) {
        console.error(`[GitHub Callback] User to link not found: ${userIdToLink}`);
        throw new Error('User not found');
      }

      console.log(`[GitHub Callback] Email Check: User=${currentUser.email}, GitHub=${profile.email}`);
      if (currentUser.email !== profile.email) {
        console.warn(`[GitHub Callback] Email mismatch: User=${currentUser.email}, GitHub=${profile.email}`);
        return res.redirect(`http://localhost:3000/plugins?error=email_mismatch`);
      }

      // Update current user
      await userService.updateUser(userIdToLink, {
        githubToken: profile.accessToken,
        githubUsername: profile.username
      });
      console.log(`[GitHub Callback] User ${userIdToLink} linked successfully`);

      return res.redirect(`http://localhost:3000/plugins?github=linked`);
    } else {
      // LOGIN FLOW: Create or Link user by email
      console.log(`[GitHub Callback] Standard login flow for: ${profile.email}`);
      const user = await userService.findOrCreate(profile);

      // Update GitHub specific info
      await userService.updateUser(user._id.toString(), {
        githubToken: profile.accessToken,
        githubUsername: profile.username
      });

      const tokens = jwtService.generateTokenPair(user._id.toString(), user.email, 'session-1');
      console.log(`[GitHub Callback] Login successful for: ${user.email}`);
      res.redirect(`http://localhost:3000/dashboard?token=${tokens.accessToken}&name=${encodeURIComponent(user.name)}&github=linked`);
    }
  } catch (error: any) {
    console.error('[GitHub Auth Failed]:', error.message || error);
    res.redirect(`http://localhost:3000?error=github_failed&message=${encodeURIComponent(error.message || 'Unknown error')}`);
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
