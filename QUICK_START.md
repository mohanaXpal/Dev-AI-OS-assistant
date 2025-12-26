# Quick Start Guide - Real-Time Dashboard

## Prerequisites
- Python 3.8+
- Node.js 16+
- pip (Python package manager)
- npm (Node package manager)

## Setup & Running

### Step 1: Install Backend Dependencies
```bash
cd apps/dev-os-automation
pip install -r requirements.txt
```

### Step 2: Install Frontend Dependencies
```bash
cd apps/dev-frontend-ui
npm install
```

### Step 3: Start Backend Server (Terminal 1)
```bash
cd apps/dev-os-automation
python src/server.py
```
Expected output:
```
🚀 Starting OS Automation Server on port 8000...
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Step 4: Start Frontend Dev Server (Terminal 2)
```bash
cd apps/dev-frontend-ui
npm run dev
```
Expected output:
```
Ready in 1.23s
```

### Step 5: Access Dashboard
Open browser and navigate to: `http://localhost:3000/dashboard?token=test&name=Suvam`

## Features Overview

### 🎤 Voice Commands
Click the microphone icon and say commands like:
- "Open Chrome"
- "Open Code"
- "List applications"
- "What is the date?"

### ⚡ Quick Actions
Click any quick action button to:
- Launch applications directly
- Execute pre-defined commands
- Get instant feedback

### 📊 Real-Time System Stats
Monitor live system information:
- **Volume Level**: Current system volume
- **Wi-Fi Status**: Connection status and SSID
- **Brightness**: Screen brightness level
- **Network**: Current network connectivity
- **CPU/Memory/Disk**: Usage percentages

### 📜 Command History
- Automatically shows last executed commands
- Real-time updates from running applications
- Search functionality to filter commands
- Dynamic command statistics

### 🎯 Activity Log
- Live feed of system activities
- Color-coded event types (info, success, warning, error)
- WebSocket real-time updates
- Connection status indicator

### 🔒 System Controls
Execute system-level commands:
- **Lock**: Lock the computer
- **Sleep**: Put system to sleep
- **Shutdown**: Graceful shutdown (requires confirmation)

## Scrollable Interface

The dashboard is now **fully scrollable** on all pages:
- Left panel (Command History) scrolls independently
- Center panel (Chat & Activity) stacks vertically with scroll
- Right panel (Controls) scrolls with system options
- All content is accessible without getting cut off

## API Endpoints

### Available Endpoints
```
GET  /                          - Health check
GET  /system/status             - Real system metrics
GET  /history                   - Command history
POST /command                   - Execute text/voice commands
POST /execute                   - Execute direct OS actions
POST /system/execute            - System-level commands
WS   /ws                        - WebSocket real-time updates
```

### Example API Calls
```bash
# Get system status
curl http://localhost:8000/system/status

# Execute command
curl -X POST http://localhost:8000/command \
  -H "Content-Type: application/json" \
  -d '{"command":"open chrome"}'

# Get history
curl http://localhost:8000/history
```

## Troubleshooting

### WebSocket Connection Issues
If you see "⚪ OFFLINE" status:
- Check if backend server is running on port 8000
- Check browser console for WebSocket error messages
- Try refreshing the page
- Ensure CORS is properly configured

### System Status Not Updating
- Verify `psutil` is installed: `pip install psutil`
- Check backend is running and accessible
- Look for errors in backend terminal

### Voice Commands Not Working
- Check browser permissions for microphone
- Ensure browser supports Web Speech API
- Try in Chrome or Edge browser
- Check console for speech recognition errors

### Applications Not Launching
- Verify application names are correct
- Check Windows PATH includes application directories
- Try full application path instead of just name
- Check security policy allows app launching

## Performance Tips

1. **Close unnecessary apps** to improve system response time
2. **Monitor system resources** using System Controls panel
3. **Use voice commands** for hands-free operation
4. **Enable WebSocket** for real-time updates
5. **Limit command history** polling if CPU usage high

## Security Notes

⚠️ **IMPORTANT**: This application can execute system commands.
- Only run in trusted environments
- Add proper authentication in production
- Implement command logging for audit trails
- Add rate limiting for API endpoints
- Validate all user inputs

## Development Mode

For development with hot-reload:
```bash
# Terminal 1 - Backend
cd apps/dev-os-automation
python -m uvicorn src.server:app --reload

# Terminal 2 - Frontend
cd apps/dev-frontend-ui
npm run dev
```

## Building for Production

### Frontend Build
```bash
cd apps/dev-frontend-ui
npm run build
npm run start
```

### Backend Deployment
```bash
# Create production requirements
pip freeze > requirements-prod.txt

# Run with production server
gunicorn src.server:app --workers 4
```

## Support & Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

**Ready to go!** Your real-time OS assistant dashboard is now live! 🚀
