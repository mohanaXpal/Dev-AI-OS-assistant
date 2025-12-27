# DEV.OS Full-Stack Deployment Guide

Since DEV.OS uses **Socket.io** for real-time automation updates, you need a hosting setup that supports persistent connections.

## 🚀 Recommended Architecture
- **Frontend**: [Vercel](https://vercel.com) (Optimized for Next.js)
- **Backend**: [Render](https://render.com) or [Railway](https://railway.app) (Supports persistent Node.js/WebSockets)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Cloud DB)

---

## 1. Deploy the Backend (Render - Free Tier)
1. **New Web Service**: Connect your GitHub repo.
2. **Build Settings**:
   - **Root Directory**: `apps/dev-auth-backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. **Environment Variables**: Copy everything from your local `.env` to Render:
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
   - `MONGODB_URI`
   - `GEMINI_API_KEY`
   - `GITHUB_REDIRECT_URI`: `https://your-backend.render.com/api/auth/github/callback`
   - `GOOGLE_REDIRECT_URI`: `https://your-backend.render.com/api/auth/google/callback`

---

## 2. Deploy the Frontend (Vercel)
1. **New Project**: Import your repo.
2. **Framework Preset**: `Next.js`.
3. **Root Directory**: `apps/dev-frontend-ui`.
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://your-backend.render.com/api`
   - `NEXT_PUBLIC_SOCKET_URL`: `https://your-backend.render.com`
5. **Deploy**: Vercel will give you a URL like `https://dev-os-frontend.vercel.app`.

---

## 3. Update OAuth Credentials (CRITICAL)
Your local login won't work in production until you update your provider settings:

### A. Google Cloud Console
1. Go to **APIs & Services > Credentials**.
2. Edit your OAuth Client ID.
3. **Authorized JavaScript Origins**: Add your Vercel URL.
4. **Authorized Redirect URIs**: Add `https://your-backend.render.com/api/auth/google/callback`.

### B. GitHub Developer Settings
1. Go to **Settings > Developer Settings > OAuth Apps**.
2. **Homepage URL**: Add your Vercel URL.
3. **Authorization callback URL**: Add `https://your-backend.render.com/api/auth/github/callback`.

---

## 4. Why not Vercel for Backend?
> [!WARNING]
> Vercel uses **Serverless Functions** which timeout after 10-60 seconds and do NOT support persistent Socket.io connections. To see your "Neural Core" status updates and real-time logs, the backend **must** run on a platform like Render or Railway.

