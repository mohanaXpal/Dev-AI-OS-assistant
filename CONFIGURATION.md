# Configuration Guide - DEV.OS

This guide provides comprehensive setup and configuration instructions for all components of the DEV.OS system.

---

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Backend Configuration](#backend-configuration)
3. [Frontend Configuration](#frontend-configuration)
4. [OS Automation Setup](#os-automation-setup)
5. [Database Configuration](#database-configuration)
6. [OAuth Integration](#oauth-integration)
7. [API Keys & Secrets](#api-keys--secrets)
8. [Troubleshooting](#troubleshooting)

---

## Environment Setup

### System Requirements

**Minimum:**
- CPU: 2-core processor
- RAM: 4GB
- Disk: 2GB free space
- OS: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)

**Recommended:**
- CPU: 4+ core processor
- RAM: 8GB+
- Disk: 5GB+ free space
- SSD storage

### Prerequisites Installation

#### 1. Node.js & npm
```bash
# Download from https://nodejs.org/ (v18 or higher)
# Verify installation
node --version   # Should be v18.0.0 or higher
npm --version    # Should be 9.0.0 or higher
```

#### 2. Python
```bash
# Download from https://www.python.org/ (3.10 or higher)
# Verify installation
python --version  # Should be 3.10 or higher
pip --version     # Should be 21.0 or higher
```

#### 3. Git
```bash
# Download from https://git-scm.com/
# Verify installation
git --version
```

---

## Backend Configuration

### Step 1: Navigate to Backend Directory
```bash
cd apps/dev-auth-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File

Create `.env` file in `apps/dev-auth-backend/`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dev-os?retryWrites=true&w=majority

# JWT Tokens
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:3001/api/auth/github/callback
GITHUB_TOKEN=github_pat_xxxxx (for API access)

# Google Gemini AI
GOOGLE_GEMINI_API_KEY=your-gemini-api-key

# Logging
LOG_LEVEL=debug

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8000
```

### Step 4: Build & Run
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode (build first)
npm run build
npm start

# Run tests
npm run test
npm run test:watch
```

### Backend Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_ACCESS_SECRET` | Secret for access tokens | Min 32 characters |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `.apps.googleusercontent.com` |
| `GITHUB_TOKEN` | GitHub personal access token | `github_pat_...` |
| `GOOGLE_GEMINI_API_KEY` | Google's Gemini API key | `AIzaSy...` |

---

## Frontend Configuration

### Step 1: Navigate to Frontend Directory
```bash
cd apps/dev-frontend-ui
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File

Create `.env.local` file in `apps/dev-frontend-ui/`:

```env
# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_OS_AUTOMATION_URL=http://localhost:8000

# Feature Flags
NEXT_PUBLIC_ENABLE_VOICE=true
NEXT_PUBLIC_ENABLE_GITHUB_SYNC=true
NEXT_PUBLIC_ENABLE_VOICE_FEEDBACK=true

# Analytics (Optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=

# Environment
NEXT_PUBLIC_APP_ENV=development
```

### Step 4: Build & Run
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start

# Run tests
npm run test

# Build for production deployment
npm run build
# Output in .next/ directory
```

### Frontend Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001/api` |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `ws://localhost:3001` |
| `NEXT_PUBLIC_OS_AUTOMATION_URL` | OS automation service URL | `http://localhost:8000` |
| `NEXT_PUBLIC_ENABLE_VOICE` | Enable voice commands | `true` |

---

## OS Automation Setup

### Step 1: Navigate to OS Automation Directory
```bash
cd apps/dev-os-automation
```

### Step 2: Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Create Environment File

Create `.env` file in `apps/dev-os-automation/`:

```env
# Server Configuration
PORT=8000
HOST=0.0.0.0
DEBUG=true

# API Gateway Backend URL
API_GATEWAY_URL=http://localhost:3001/api

# File Operations
DEFAULT_FILE_PATH=/Users/YourUsername/Documents
ALLOWED_PATHS=/Users/YourUsername

# Application Paths (Windows)
APP_PATHS_CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe
APP_PATHS_VSCODE=C:\Users\YourUsername\AppData\Local\Programs\Microsoft VS Code\Code.exe
APP_PATHS_EXPLORER=explorer.exe
APP_PATHS_CALC=calc.exe

# Application Paths (macOS)
# APP_PATHS_CHROME=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
# APP_PATHS_VSCODE=/Applications/Visual Studio Code.app/Contents/MacOS/Code

# Guard Agent
AUDIT_LOG_ENABLED=true
PERMISSION_SYSTEM_ENABLED=true

# Logging
LOG_LEVEL=INFO
```

### Step 5: Run OS Automation Server
```bash
# Basic run
python src/server.py

# With auto-reload (development)
pip install watchdog
watchmedo auto-restart -d . -p '*.py' -- python src/server.py
```

### OS Automation Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | FastAPI server port | `8000` |
| `API_GATEWAY_URL` | Backend API URL | `http://localhost:3001/api` |
| `DEFAULT_FILE_PATH` | Default file operations path | `/Users/Documents` |
| `APP_PATHS_*` | Full paths to applications | Full executable path |
| `AUDIT_LOG_ENABLED` | Enable operation logging | `true` |

---

## Database Configuration

### MongoDB Atlas Setup

#### 1. Create MongoDB Atlas Account
- Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Sign up for free account
- Verify email

#### 2. Create a Cluster
1. Click "Create Deployment"
2. Select "Shared" (Free tier)
3. Choose region (closest to you)
4. Click "Create Deployment"
5. Set credentials (username & password)

#### 3. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Drivers"
3. Copy connection string
4. Replace `<password>` with your password
5. Replace `<username>` with your username

**Connection String Format:**
```
mongodb+srv://username:password@cluster-name.mongodb.net/database-name?retryWrites=true&w=majority
```

#### 4. Create Database
1. In MongoDB Atlas, go to "Collections"
2. Click "Create Database"
3. Database name: `dev-os`
4. Collection name: `users`

#### 5. Setup Collections

The backend will automatically create these collections:

- **users** - User accounts and profiles
- **commands** - Command execution history
- **sessions** - User sessions
- **audit_logs** - Security audit trail

#### 6. Create Indexes (Optional but Recommended)
```javascript
// In MongoDB Atlas Web Console
// Collection: users
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "githubId": 1 });

// Collection: commands
db.commands.createIndex({ "userId": 1, "createdAt": -1 });

// Collection: sessions
db.sessions.createIndex({ "userId": 1 });
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
```

---

## OAuth Integration

### Google OAuth Setup

#### 1. Create Google Cloud Project
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Project name: "DEV.OS"

#### 2. Enable APIs
1. Search for "Gemini API"
2. Click "Enable"
3. Go to "APIs & Services" > "Enabled APIs"
4. Search for "Google+ API"
5. Click "Enable"

#### 3. Create OAuth Credentials
1. Go to "Credentials"
2. Click "Create Credentials" > "OAuth Client ID"
3. Choose "Web application"
4. Add Authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback`
   - `https://yourdomain.com/api/auth/google/callback`
5. Copy Client ID and Client Secret

#### 4. Get Gemini API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. Add to `.env` as `GOOGLE_GEMINI_API_KEY`

### GitHub OAuth Setup

#### 1. Create GitHub OAuth App
1. Visit [GitHub Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: DEV.OS
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:3001/api/auth/github/callback

#### 2. Generate Personal Access Token
1. Go to [GitHub Settings](https://github.com/settings/tokens)
2. Click "Generate new token"
3. Select scopes:
   - `repo` (full control of repositories)
   - `user` (read user profile)
   - `gist` (manage gists)
4. Copy token and save in `.env` as `GITHUB_TOKEN`

#### 3. Copy Credentials
- Copy Client ID → `GITHUB_CLIENT_ID`
- Click "Generate new client secret" → `GITHUB_CLIENT_SECRET`

---

## API Keys & Secrets

### Getting Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Select project
4. Copy key to `.env`

### Generating Secure JWT Secrets

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).Guid + (New-Guid).Guid))
```

**macOS/Linux (Bash):**
```bash
openssl rand -base64 32
```

Use generated strings for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

---

## Troubleshooting

### Backend Issues

#### "Cannot find module" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### MongoDB connection failed
- Check connection string in `.env`
- Verify username/password
- Check if IP is whitelisted in MongoDB Atlas
- Ensure network access is enabled

#### Port already in use
```bash
# Find process on port 3001
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Frontend Issues

#### "Failed to compile" errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

#### WebSocket connection failed
- Ensure backend is running on correct port
- Check `NEXT_PUBLIC_WS_URL` environment variable
- Verify CORS settings in backend

### OS Automation Issues

#### FastAPI not starting
```bash
# Check Python version
python --version

# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

#### Permission denied on file operations
- Check `DEFAULT_FILE_PATH` exists
- Verify user has read/write permissions
- On macOS, allow Terminal full disk access in Security settings

#### Applications not launching
- Verify full path in `APP_PATHS_*`
- Check application is installed at that path
- Use quotes for paths with spaces: `"C:\Program Files\...\app.exe"`

---

## Performance Optimization

### MongoDB Optimization
```javascript
// Add indexes for frequently queried fields
db.commands.createIndex({ "userId": 1, "createdAt": -1 });
db.commands.createIndex({ "status": 1 });
```

### Frontend Performance
```bash
# Enable Static Generation
npm run build

# Analyze bundle size
npm install --save-dev @next/bundle-analyzer
```

### Backend Optimization
```typescript
// Use connection pooling
// Enable compression for large responses
// Implement caching with Redis (optional)
```

---

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use strong JWT secrets** - Minimum 32 characters
3. **Rotate tokens regularly** - Implement token refresh
4. **Enable HTTPS** in production
5. **Use environment-specific configs** - Don't hardcode values
6. **Validate all inputs** - Prevent injection attacks
7. **Keep dependencies updated** - Run `npm audit` regularly

---

## Next Steps

1. Complete all configuration steps above
2. Test each component separately
3. Run the system end-to-end
4. See [QUICK_START.md](./QUICK_START.md) for running the full system
5. Check [API.md](./API.md) for API documentation

---

**Last Updated**: December 27, 2025
