# Deployment Guide - DEV.OS

Complete guide for deploying DEV.OS to production environments.

---

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Monitoring & Logging](#monitoring--logging)
9. [Security Hardening](#security-hardening)
10. [Rollback Procedures](#rollback-procedures)

---

## Deployment Overview

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Production Environment                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │        CDN / Load Balancer (Cloudflare)         │  │
│  └──────────────────┬───────────────────────────────┘  │
│                     │                                    │
│       ┌─────────────┼─────────────┐                     │
│       │             │             │                     │
│  ┌────▼──┐     ┌────▼──┐    ┌────▼──┐                 │
│  │Front  │     │API    │    │OS      │                 │
│  │End    │     │Gateway│    │Auto    │                 │
│  │(Vercel│     │(Railway)   │(VPS)   │                 │
│  │)      │     │       │    │        │                 │
│  └────┬──┘     └────┬──┘    └────┬──┘                 │
│       │             │             │                     │
│       └─────────────┼─────────────┘                     │
│                     │                                    │
│              ┌──────▼──────┐                            │
│              │  MongoDB    │                            │
│              │   Atlas     │                            │
│              └─────────────┘                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Deployment Options

| Option | Cost | Setup Time | Recommended For |
|--------|------|-----------|-----------------|
| **Local Machine** | Free | 5 min | Development |
| **Docker** | Minimal | 10 min | Testing |
| **VPS (AWS/Azure/DigitalOcean)** | $5-50/mo | 30 min | Small projects |
| **Cloud Platform (Heroku/Railway)** | $7-50/mo | 15 min | Rapid deployment |
| **Kubernetes** | Variable | 2+ hours | Enterprise |

---

## Pre-Deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] No console errors or warnings
- [ ] Environment variables configured for production
- [ ] Database backups configured
- [ ] SSL/TLS certificates obtained
- [ ] Domain name configured
- [ ] Monitoring & logging set up
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Team notified of deployment

---

## Docker Deployment

### Step 1: Create Dockerfile for Backend

Create `Dockerfile` in `apps/dev-auth-backend/`:

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build application
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built application from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### Step 2: Create Dockerfile for Frontend

Create `Dockerfile` in `apps/dev-frontend-ui/`:

```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
```

### Step 3: Create docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./apps/dev-frontend-ui
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:3001/api
      NEXT_PUBLIC_WS_URL: ws://backend:3001
      NODE_ENV: production
    depends_on:
      - backend
    networks:
      - dev-os-network

  backend:
    build:
      context: ./apps/dev-auth-backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      PORT: 3001
      NODE_ENV: production
      MONGODB_URI: ${MONGODB_URI}
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID}
      GITHUB_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET}
      GOOGLE_GEMINI_API_KEY: ${GOOGLE_GEMINI_API_KEY}
    depends_on:
      - mongodb
    networks:
      - dev-os-network

  os-automation:
    build:
      context: ./apps/dev-os-automation
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      PORT: 8000
      API_GATEWAY_URL: http://backend:3001/api
    networks:
      - dev-os-network

  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - dev-os-network

volumes:
  mongodb_data:

networks:
  dev-os-network:
    driver: bridge
```

### Step 4: Build and Run

```bash
# Build images
docker-compose build

# Run containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

---

## Cloud Deployment

### Option A: Deploy on Railway

#### 1. Create Railway Account
- Visit [railway.app](https://railway.app)
- Sign up with GitHub account
- Authorize access to repositories

#### 2. Deploy Backend
```bash
cd apps/dev-auth-backend

# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init

# Add environment variables in Railway dashboard
# PORT, MONGODB_URI, etc.

# Deploy
railway up
```

#### 3. Deploy Frontend
```bash
cd apps/dev-frontend-ui

railway init
# Configure environment variables
# NEXT_PUBLIC_API_URL, etc.

railway up
```

#### 4. Get Production URLs
- Frontend: `https://your-app.railway.app`
- Backend: `https://your-backend.railway.app`

### Option B: Deploy on Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/dev-frontend-ui
vercel

# Follow prompts and configure environment variables
```

### Option C: Deploy on AWS EC2

#### 1. Launch EC2 Instance
```bash
# Create instance (Ubuntu 22.04)
# Security group: Allow ports 80, 443, 3000, 3001, 8000, 27017

# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip
```

#### 2. Setup Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python
sudo apt install -y python3 python3-pip python3-venv

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install MongoDB (or use Atlas)
sudo apt install -y mongodb-org
sudo systemctl start mongod
```

#### 3. Deploy Application
```bash
# Clone repository
git clone https://github.com/your-repo.git
cd Dev-AI-OS-assistant

# Build backend
cd apps/dev-auth-backend
npm install
npm run build

# Build frontend
cd ../dev-frontend-ui
npm install
npm run build

# Setup OS automation
cd ../dev-os-automation
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 4. Setup PM2 for Process Management
```bash
# Install PM2
sudo npm install -g pm2

# Start backend
pm2 start --name "dev-os-backend" npm -- start --prefix apps/dev-auth-backend

# Start frontend
pm2 start --name "dev-os-frontend" npm -- start --prefix apps/dev-frontend-ui

# Start OS automation
pm2 start --name "dev-os-automation" python3 -- apps/dev-os-automation/src/server.py

# Save PM2 config
pm2 save

# Setup auto-start
pm2 startup
```

#### 5. Setup Nginx Reverse Proxy
```bash
sudo apt install -y nginx

# Create Nginx config
sudo tee /etc/nginx/sites-available/dev-os > /dev/null <<EOF
upstream frontend {
    server localhost:3000;
}

upstream backend {
    server localhost:3001;
}

upstream osautomation {
    server localhost:8000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
    }

    location /os {
        proxy_pass http://osautomation;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/dev-os /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Setup SSL with Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx

certbot --nginx -d your-domain.com
```

---

## Database Setup

### MongoDB Atlas Production Setup

#### 1. Create Production Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create new organization and project
3. Create production cluster:
   - Tier: M10 or higher
   - Region: Primary region + backup region
   - Enable automated backups

#### 2. Configure Security
```javascript
// In MongoDB Atlas, create database user
Username: prod-user
Password: [strong-password]
Roles: readWrite on admin database

// Whitelist IP addresses
Production IP: xxx.xxx.xxx.xxx
Development IP: yyy.yyy.yyy.yyy
```

#### 3. Create Indexes
```javascript
// Use MongoDB Atlas Web Shell

use('dev-os');

// User indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "githubId": 1 }, { sparse: true });
db.users.createIndex({ "lastLogin": -1 });

// Command indexes
db.commands.createIndex({ "userId": 1, "createdAt": -1 });
db.commands.createIndex({ "status": 1 });

// Session indexes
db.sessions.createIndex({ "userId": 1 });
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
```

---

## Environment Configuration

### Production Environment Variables

**Backend (.env):**
```env
# Server
PORT=3001
NODE_ENV=production
LOG_LEVEL=info

# Database
MONGODB_URI=mongodb+srv://prod-user:password@cluster.mongodb.net/dev-os-prod?retryWrites=true&w=majority

# Security
JWT_ACCESS_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-key-min-32-chars
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# OAuth
GOOGLE_CLIENT_ID=prod-google-id
GOOGLE_CLIENT_SECRET=prod-google-secret
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/auth/google/callback

GITHUB_CLIENT_ID=prod-github-id
GITHUB_CLIENT_SECRET=prod-github-secret
GITHUB_REDIRECT_URI=https://api.yourdomain.com/api/auth/github/callback

# AI
GOOGLE_GEMINI_API_KEY=prod-gemini-key

# Monitoring
SENTRY_DSN=https://your-sentry-dsn

# CORS
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
```

**Frontend (.env.production):**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
NEXT_PUBLIC_OS_AUTOMATION_URL=https://automation.yourdomain.com
NEXT_PUBLIC_ENABLE_VOICE=true
NEXT_PUBLIC_APP_ENV=production
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Run linting
        run: npm run lint

      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up
```

---

## Monitoring & Logging

### Setup Sentry for Error Tracking

1. Create [Sentry](https://sentry.io) account
2. Create project for backend
3. Add to backend:

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Setup CloudWatch Logs (AWS)

```typescript
const CloudWatchTransport = require('winston-cloudwatch');

logger.add(new CloudWatchTransport({
  logGroupName: '/dev-os/backend',
  logStreamName: 'production',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
}));
```

### Setup Application Insights (Azure)

```typescript
const appInsights = require("applicationinsights");

appInsights.setup(process.env.APPINSIGHTS_CONNECTION_STRING)
  .setAutoCollectConsole(true, true)
  .start();
```

---

## Security Hardening

### 1. Enable HTTPS
```bash
# Use Let's Encrypt with certbot
sudo certbot certonly --standalone -d yourdomain.com
```

### 2. Setup WAF (Web Application Firewall)
```
Cloudflare:
- Enable DDoS protection
- Setup rate limiting rules
- Enable Bot Management
```

### 3. Configure CORS Headers
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(','),
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### 4. Security Headers
```typescript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

### 5. Database Encryption
```
MongoDB Atlas:
- Enable encryption at rest
- Enable encryption in transit (TLS)
- Use IP whitelist
```

---

## Rollback Procedures

### Rollback Backend Deployment

```bash
# Check deployment history
railway logs

# Rollback to previous version
railway rollback <deployment-id>

# Or manually redeploy previous commit
git checkout <previous-commit>
git push --force origin main
```

### Rollback Database
```bash
# Restore from backup
# In MongoDB Atlas > Backup > Snapshots
# Click "Restore" on previous snapshot
```

### Rollback Frontend
```bash
# Vercel rollback
vercel rollback

# Or redeploy from git
git push --force origin <previous-commit>
```

---

## Health Checks

### Backend Health Endpoint

```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION
  });
});
```

### Monitor Health

```bash
# Check continuously
watch -n 5 'curl -s https://yourdomain.com/health | jq'
```

---

## Troubleshooting Deployment

### Container won't start
```bash
docker logs <container-id>
docker exec -it <container-id> /bin/sh
```

### Database connection issues
- Verify MongoDB URI in environment variables
- Check IP whitelist in MongoDB Atlas
- Verify network connectivity

### Memory issues
```bash
# Check memory usage
docker stats
pm2 logs

# Increase heap size
NODE_OPTIONS=--max-old-space-size=4096
```

---

**Last Updated**: December 27, 2025
