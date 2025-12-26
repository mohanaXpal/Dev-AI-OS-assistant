# DEV.OS Vercel Deployment Guide

Follow these steps to deploy your **Neural OS** frontend to Vercel and automate your GitHub workflow.

## 1. Deploying the Frontend (Vercel)

1. **Connect Repository**: Go to [vercel.com/new](https://vercel.com/new) and import your `Suvam-paul145/Dev-AI-OS-assistant` repository.
2. **Project Settings**:
   - **Framework Preset**: Select `Next.js`.
   - **Root Directory**: Click "Edit" and select `apps/dev-frontend-ui`.
3. **Environment Variables**: Add the following variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SOCKET_URL`: Your backend URL (e.g., `https://your-backend.herokuapp.com`).
   - `NEXT_PUBLIC_API_BASE_URL`: Your backend API URL (e.g., `https://your-backend.herokuapp.com/api`).
4. **Deploy**: Click **Deploy**.

## 2. Automating GitHub Pushes

To allow DEV.OS to push code directly to your GitHub account:

1. **Create PAT**: Go to [GitHub Developer Settings](https://github.com/settings/tokens) and create a **Personal Access Token (Classic)**.
2. **Scopes**: Give it the `repo` scope.
3. **Update Backend .env**:
   - Add `GITHUB_TOKEN=your_token_here` to your backend `.env` file.
   - Restart your backend server.

## 3. Deployment Checklist
- [ ] Backend is running on a live server (Heroku, DigitalOcean, or similar).
- [ ] Google OAuth Redirect URI is updated in Google Console to match your live frontend URL.
- [ ] MongoDB Atlas is configured for live database access.

## Automation Command
Once deployed, you can tell CodeBuddy:
> "Write a Python script for a simple calculator and push it to my 'DevAI-Scripts' repository."

DEV.OS will:
1. Generate the code.
2. Create the file on your local desktop.
3. **Push it automatically** to your GitHub repository using the new `GitHubService`.
