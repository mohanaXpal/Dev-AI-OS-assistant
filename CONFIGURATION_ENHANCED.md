# ⚙️ Configuration Guide

```
    ╔═══════════════════════════════════════════════════════════════╗
    ║                  SETUP & CONFIGURATION                        ║
    ║                                                               ║
    ║        Complete Guide to Configure Dev-AI-OS Assistant       ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
```

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Environment Setup](#environment-setup)
3. [Service Configuration](#service-configuration)
4. [API Keys Setup](#api-keys-setup)
5. [Database Configuration](#database-configuration)
6. [Development Environment](#development-environment)
7. [Production Configuration](#production-configuration)
8. [Troubleshooting](#troubleshooting)

---

## 🖥️ System Requirements

### Minimum Requirements

```
┌──────────────────────────────────────────────────────────────┐
│              SYSTEM REQUIREMENTS                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Operating System:                                           │
│   ✅ Windows 10/11 | macOS 12+ | Linux (Ubuntu 20.04+)    │
│                                                              │
│ Hardware:                                                    │
│   ✅ CPU: 4+ cores                                           │
│   ✅ RAM: 8GB minimum (16GB recommended)                    │
│   ✅ Storage: 20GB available                                │
│   ✅ Network: 10Mbps+ internet connection                   │
│                                                              │
│ Software:                                                    │
│   ✅ Node.js v18.0.0 or higher                             │
│   ✅ Python 3.11 or higher                                 │
│   ✅ Git 2.30.0 or higher                                  │
│   ✅ Docker (optional, for containerization)               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Recommended Stack

```
Development Machine
├─ Windows 11 / macOS 13+ / Linux (Ubuntu 22.04+)
├─ 16GB RAM
├─ SSD with 50GB free space
└─ Gigabit Internet Connection

Browser Support
├─ Chrome 90+
├─ Firefox 88+
├─ Safari 14+
└─ Edge 90+
```

---

## 🔧 Environment Setup

### 1️⃣ Prerequisites Installation

#### On Windows (PowerShell):

```powershell
# Check Node.js installation
node --version  # Should be v18+
npm --version   # Should be v9+

# Check Python installation
python --version  # Should be 3.11+

# Check Git installation
git --version  # Should be 2.30+

# Upgrade npm (if needed)
npm install -g npm@latest

# Install global packages
npm install -g typescript ts-node @nestjs/cli
```

#### On macOS/Linux (Bash):

```bash
# Using Homebrew (macOS)
brew install node python git

# Verify installations
node --version
python --version
git --version
```

### 2️⃣ Clone Repository

```bash
# Clone the project
git clone https://github.com/yourname/Dev-AI-OS-assistant.git

# Navigate to project directory
cd Dev-AI-OS-assistant

# Create and activate Python virtual environment
python -m venv env

# Activate virtual environment
# On Windows:
.\env\Scripts\activate

# On macOS/Linux:
source env/bin/activate
```

### 3️⃣ Install Dependencies

```bash
# Install Python dependencies
pip install --upgrade pip
pip install -r requirements-all.txt

# Install Node.js dependencies for each app
cd apps/dev-frontend-ui && npm install
cd ../dev-auth-backend && npm install
cd ../dev-ai-llm && npm install
cd ../dev-assistant-core && npm install
cd ../dev-voice-system && pip install -r requirements.txt
cd ../dev-os-automation && pip install -r requirements.txt
```

---

## 🌍 Service Configuration

### Configuration Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                 CONFIG SOURCES                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1️⃣ Environment Variables (.env files)                  │
│    ↓ Highest Priority                                  │
│    ├─ .env.local (Local Development)                  │
│    ├─ .env.staging (Staging Environment)              │
│    └─ .env.production (Production Environment)        │
│                                                         │
│ 2️⃣ Config Files (config/*.js, *.yml)                   │
│    ↓ Medium Priority                                   │
│    ├─ database.config.js                              │
│    ├─ auth.config.js                                  │
│    └─ ai.config.js                                    │
│                                                         │
│ 3️⃣ Default Values (src/config/defaults.ts)             │
│    ↓ Lowest Priority                                   │
│    └─ Fallback Configuration                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Environment Variables Setup

#### Create `.env.local` file:

```bash
# Copy template
cp .env.example .env.local

# Edit .env.local with your credentials
```

#### `.env.local` Template:

```env
# ═══════════════════════════════════════════════════════════════
# APPLICATION CONFIGURATION
# ═══════════════════════════════════════════════════════════════

NODE_ENV=development
DEBUG=true
PORT=3000
HOST=localhost

# ═══════════════════════════════════════════════════════════════
# DATABASE CONFIGURATION
# ═══════════════════════════════════════════════════════════════

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
MONGODB_DB_NAME=dev-ai-os
REDIS_URL=redis://localhost:6379

# ═══════════════════════════════════════════════════════════════
# AUTHENTICATION
# ═══════════════════════════════════════════════════════════════

JWT_SECRET=your-jwt-secret-key-change-this-in-production
JWT_EXPIRATION=7d
OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# ═══════════════════════════════════════════════════════════════
# AI/LLM CONFIGURATION
# ═══════════════════════════════════════════════════════════════

OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

# Alternative models
GEMINI_API_KEY=your-gemini-api-key
COHERE_API_KEY=your-cohere-api-key

# ═══════════════════════════════════════════════════════════════
# VOICE & SPEECH
# ═══════════════════════════════════════════════════════════════

GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GOOGLE_SPEECH_CREDENTIALS=path/to/service-account-key.json
ELEVENLABS_API_KEY=your-elevenlabs-key

# ═══════════════════════════════════════════════════════════════
# EXTERNAL SERVICES
# ═══════════════════════════════════════════════════════════════

AZURE_SUBSCRIPTION_ID=your-azure-subscription-id
AZURE_RESOURCE_GROUP=your-resource-group
AZURE_STORAGE_ACCOUNT=your-storage-account
AZURE_STORAGE_KEY=your-storage-key

# ═══════════════════════════════════════════════════════════════
# LOGGING & MONITORING
# ═══════════════════════════════════════════════════════════════

LOG_LEVEL=debug
LOG_FILE=logs/app.log
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# ═══════════════════════════════════════════════════════════════
# SECURITY & RATE LIMITING
# ═══════════════════════════════════════════════════════════════

RATE_LIMIT_WINDOW=15  # minutes
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
SESSION_SECRET=your-session-secret-key

# ═══════════════════════════════════════════════════════════════
# FEATURE FLAGS
# ═══════════════════════════════════════════════════════════════

FEATURE_VOICE_ENABLED=true
FEATURE_ADVANCED_AI=true
FEATURE_BETA_FEATURES=false
MAINTENANCE_MODE=false
```

---

## 🔑 API Keys Setup

### Getting Your API Keys

#### 1️⃣ OpenAI API Key

```
STEP 1: Visit https://platform.openai.com/api-keys
STEP 2: Click "Create new secret key"
STEP 3: Copy the key (save securely)
STEP 4: Add to .env.local

Configuration:
├─ OPENAI_API_KEY=sk-...
├─ OPENAI_MODEL=gpt-4
└─ OPENAI_ORG_ID=org-... (if using organization)
```

#### 2️⃣ Google Cloud Setup

```
STEP 1: Create GCP Project
       └─ https://console.cloud.google.com

STEP 2: Enable APIs
       ├─ Cloud Speech-to-Text API
       ├─ Cloud Text-to-Speech API
       └─ Cloud Vision API

STEP 3: Create Service Account
       ├─ IAM & Admin → Service Accounts
       ├─ Create new service account
       └─ Download JSON key file

STEP 4: Add to .env.local
       ├─ GOOGLE_CLOUD_PROJECT_ID=...
       └─ GOOGLE_SPEECH_CREDENTIALS=...
```

#### 3️⃣ GitHub OAuth

```
STEP 1: Settings → Developer settings → OAuth Apps
STEP 2: Click "New OAuth App"
STEP 3: Fill in details
       ├─ Application name: Dev-AI-OS Assistant
       ├─ Homepage URL: http://localhost:3000
       ├─ Authorization callback URL: 
       │  http://localhost:3000/api/auth/github/callback
       └─ Create application

STEP 4: Copy credentials to .env.local
       ├─ GITHUB_CLIENT_ID=...
       └─ GITHUB_CLIENT_SECRET=...
```

#### 4️⃣ MongoDB Atlas

```
STEP 1: Create account at https://www.mongodb.com/cloud/atlas
STEP 2: Create new cluster
STEP 3: Create database user
STEP 4: Get connection string
       └─ mongodb+srv://user:password@cluster.mongodb.net/db

STEP 5: Add to .env.local
       └─ MONGODB_URI=mongodb+srv://...
```

#### 5️⃣ Azure Setup

```
STEP 1: Create Azure Account
STEP 2: Create Resource Group
STEP 3: Create Storage Account
STEP 4: Get credentials
       ├─ Account name
       ├─ Account key
       └─ Connection string

STEP 5: Add to .env.local
       ├─ AZURE_SUBSCRIPTION_ID=...
       ├─ AZURE_RESOURCE_GROUP=...
       ├─ AZURE_STORAGE_ACCOUNT=...
       └─ AZURE_STORAGE_KEY=...
```

---

## 💾 Database Configuration

### MongoDB Setup

```javascript
// apps/dev-auth-backend/src/config/database.config.ts

export const databaseConfig = {
  mongo: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
    },
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB) || 0,
  },
};
```

### Database Connection Check

```bash
# Check MongoDB connection
npm run test:db

# Check Redis connection
npm run test:redis

# Run migrations
npm run migrations:run
```

---

## 🛠️ Development Environment

### VS Code Setup

#### Recommended Extensions

```
┌──────────────────────────────────────────────────────┐
│ VS CODE EXTENSIONS RECOMMENDED                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Code Quality                                        │
│ ├─ ESLint (dbaeumer.vscode-eslint)                │
│ ├─ Prettier (esbenp.prettier-vscode)              │
│ ├─ Python (ms-python.python)                      │
│ └─ Pylance (ms-python.vscode-pylance)             │
│                                                      │
│ AI & Productivity                                   │
│ ├─ GitHub Copilot (GitHub.copilot)               │
│ ├─ Thunder Client (rangav.vscode-thunder-client) │
│ └─ REST Client (humao.rest-client)               │
│                                                      │
│ Development Tools                                   │
│ ├─ Docker (ms-azuretools.vscode-docker)          │
│ ├─ Git Graph (mhutchie.git-graph)                │
│ ├─ MongoDB (mongodb.mongodb-vscode)              │
│ └─ Thunder Client (REST API Testing)             │
│                                                      │
│ Styling & Templates                                │
│ ├─ Tailwind CSS IntelliSense                     │
│ ├─ HTML CSS Support                              │
│ └─ Material Icon Theme                           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### .vscode/settings.json

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "python.defaultInterpreterPath": "${workspaceFolder}/env/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "files.exclude": {
    "**/__pycache__": true,
    "**/*.pyc": true,
    "**/node_modules": true,
    "**/.next": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.env*": true,
    "env/": true
  }
}
```

### Running Services

```bash
# Terminal 1: Frontend
cd apps/dev-frontend-ui
npm run dev
# Runs on http://localhost:3000

# Terminal 2: Backend
cd apps/dev-auth-backend
npm run dev
# Runs on http://localhost:5000

# Terminal 3: OS Automation
cd apps/dev-os-automation
python src/main.py
# Runs on http://localhost:8000

# Terminal 4: Voice System
cd apps/dev-voice-system
python src/main.py
# Runs on http://localhost:8001
```

### Local Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Test API endpoints
npm run test:api
```

---

## 🚀 Production Configuration

### Environment Variables for Production

```env
NODE_ENV=production
DEBUG=false
PORT=8080

# Security
JWT_EXPIRATION=30d
SESSION_TIMEOUT=86400000  # 24 hours

# Database
MONGODB_MAX_POOL_SIZE=20
REDIS_TTL=3600

# Logging
LOG_LEVEL=info
SENTRY_ENVIRONMENT=production

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=1000

# HTTPS
HTTPS=true
SSL_CERT_PATH=/etc/ssl/certs/cert.pem
SSL_KEY_PATH=/etc/ssl/private/key.pem
```

### Docker Deployment

```dockerfile
# Multi-stage build example
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Health Checks

```bash
# Configure health check endpoint
GET /health
Response: { "status": "ok", "timestamp": "2024-01-01T00:00:00Z" }

# Set up monitoring
curl http://localhost:3000/health
```

---

## 🔍 Troubleshooting

### Common Issues & Solutions

#### ❌ Port Already in Use

```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

#### ❌ Python Virtual Environment Issues

```bash
# Recreate virtual environment
rm -rf env
python -m venv env
.\env\Scripts\activate
pip install -r requirements-all.txt
```

#### ❌ Database Connection Failed

```bash
# Check MongoDB connection
mongosh "mongodb+srv://..."

# Check Redis connection
redis-cli ping
```

#### ❌ API Keys Invalid

```bash
# Verify API keys
echo $OPENAI_API_KEY
echo $GOOGLE_CLOUD_PROJECT_ID

# Update .env.local with correct keys
```

#### ❌ Permission Denied Errors

```bash
# Fix file permissions
chmod +x ./scripts/*.sh
chmod 644 .env.local

# On Windows PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📊 Configuration Validation Checklist

```
┌──────────────────────────────────────────────────────────────┐
│  CONFIGURATION VALIDATION CHECKLIST                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ✅ Node.js and npm installed correctly                       │
│ ✅ Python 3.11+ installed                                    │
│ ✅ Virtual environment created and activated                 │
│ ✅ All dependencies installed                                │
│ ✅ .env.local file created with all keys                     │
│ ✅ MongoDB connection verified                               │
│ ✅ Redis connection verified                                 │
│ ✅ API keys validated                                        │
│ ✅ OAuth providers configured                                │
│ ✅ Ports are available (3000, 5000, 8000, 8001)            │
│ ✅ Git repository initialized                                │
│ ✅ All tests passing                                         │
│ ✅ Linting passes without errors                             │
│ ✅ Database migrations completed                             │
│ ✅ Services start without errors                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📞 Support & Resources

```
Need Help?
├─ Documentation: https://docs.dev-ai-os.dev
├─ GitHub Issues: https://github.com/yourname/issues
├─ Discord Community: https://discord.gg/dev-ai-os
└─ Email Support: support@dev-ai-os.dev
```

---

<div align="center">

**Configuration Complete! 🎉**

Ready to start developing? Run `npm run dev` in each terminal!

</div>
