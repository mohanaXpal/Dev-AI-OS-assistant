# System Architecture - Real-Time Dashboard

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ CodeBuddy    │  │ActivityLog   │  │ TasksControls          │ │
│  │ (Chat)       │  │(Real Events) │  │(System Status)         │ │
│  └────┬─────────┘  └────┬─────────┘  └────────┬───────────────┘ │
│       │                 │                     │                  │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐   │
│  │CommandHistory  │  │                │  │                 │   │
│  │(Real Commands) │  │  WebSocket     │  │ HTTP REST API   │   │
│  └────┬───────────┘  │  Connection    │  │                 │   │
│       │              │  (Real-time)   │  │                 │   │
│       └──────────────┴────────────────┴──┴─────────────────┘   │
│                                                                   │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                    HTTP/WebSocket
                            │
┌───────────────────────────┴──────────────────────────────────────┐
│              FastAPI Backend (Port 8000)                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ /command     │  │ /system      │  │ /ws (WebSocket)        │ │
│  │ (Execute)    │  │ /status      │  │ (Real-time Events)     │ │
│  └──────┬───────┘  │ /execute     │  └────────┬───────────────┘ │
│         │          │ /history     │            │                 │
│         │          └──────┬───────┘            │                 │
│         │                 │                    │                 │
│  ┌──────┴─────────────────┴────────────────────┴─────────────┐  │
│  │                   Core Services                           │  │
│  │                                                            │  │
│  │  ┌────────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ AppController  │  │FileController│  │GuardAgent    │  │  │
│  │  │ (App Mgmt)     │  │ (Files)      │  │(Validation)  │  │  │
│  │  └────────┬───────┘  └──────────────┘  └──────────────┘  │  │
│  └───────────┼──────────────────────────────────────────────┘  │
│              │                                                   │
└──────────────┼───────────────────────────────────────────────────┘
               │
         ┌─────┴──────┬──────────┬──────────────┐
         │            │          │              │
    ┌────▼─┐  ┌──────▼────┐  ┌──▼─────┐  ┌────▼────┐
    │Chrome│  │VS Code    │  │Process │  │Network  │
    │      │  │           │  │Monitor │  │Monitor  │
    └──────┘  └───────────┘  └────────┘  └─────────┘
         (System Resources & Applications)
```

## Data Flow

### 1. User Input → Command Execution
```
User Types Command / Says Voice Command
            ↓
        CodeBuddy Component
            ↓
        POST /command (API)
            ↓
    Backend Route Handler
            ↓
    AppController / System Command
            ↓
    Application Launch / Command Execute
            ↓
    Response Sent to Frontend
            ↓
    Display Result in UI
```

### 2. Real-Time System Events → Activity Display
```
OS Event Occurs (App Launch, System Alert, etc)
            ↓
    AppController detects event
            ↓
    Backend broadcasts via WebSocket
            ↓
    All connected clients receive event
            ↓
    ActivityLog Component updates
            ↓
    New event appears in Activity Log
```

### 3. System Status Polling
```
Frontend Polls /system/status every 10 seconds
            ↓
    Backend gathers live metrics (psutil)
            ↓
    Returns: Volume, WiFi, Brightness, CPU, Memory, Disk
            ↓
    TasksControls Component updates display
            ↓
    User sees real system information
```

### 4. Command History Sync
```
Frontend Polls /history every 5 seconds
            ↓
    Backend queries running applications
            ↓
    Returns list of active processes
            ↓
    CommandHistory Component displays
            ↓
    User sees real command history
```

## WebSocket Event Flow

```
┌─────────────────────────────────────────┐
│     Frontend WebSocket Client            │
│  wsManager.connect() → Subscribes        │
└────────────┬────────────────────────────┘
             │
        (WS Connection)
             │
┌────────────▼────────────────────────────┐
│   Backend WebSocket Server               │
│  Maintains active_connections set        │
└────────────┬────────────────────────────┘
             │
      Event Triggered:
      - App Launch
      - System Alert
      - Status Change
             │
      broadcast_activity()
             │
┌────────────▼────────────────────────────┐
│  Send JSON to all connections            │
│  {type: "activity", timestamp, data}    │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│  Frontend receives WebSocket event       │
│  Listener triggers: wsManager.on()       │
│  ActivityLog updates with new event      │
└─────────────────────────────────────────┘
```

## Component Hierarchy

```
Layout (Main Container)
├── TopBar
├── Dashboard (Main Grid)
│   ├── CommandHistory Panel
│   │   ├── Search Input
│   │   ├── Command List
│   │   └── Statistics
│   ├── CodeBuddy Panel
│   │   ├── Avatar
│   │   ├── Chat Display
│   │   └── Input Controls
│   │       ├── Text Input
│   │       ├── Send Button
│   │       └── Microphone Button
│   ├── ActivityLog Panel
│   │   ├── Status Indicator
│   │   ├── Event Stream
│   │   └── Terminal Indicator
│   └── TasksControls Panel
│       ├── Quick Actions
│       │   ├── Open Chrome
│       │   ├── Open Code
│       │   ├── Set Alarm
│       │   └── Voice Command
│       ├── System Controls
│       │   ├── Volume Slider
│       │   ├── WiFi Status
│       │   ├── Brightness Info
│       │   └── Power Options
│       └── Permissions Panel
└── SciFiBackground
```

## API Endpoint Details

### Health Check
```
GET /
Response: {status: "online", service: "Dev OS Automation"}
```

### System Status
```
GET /system/status
Response: {
  volume: 50,
  brightness: 75,
  wifi: {connected: true, name: "Network-Name"},
  network: "Online",
  cpu_usage: 25.5,
  memory_usage: 45.2,
  disk_usage: 60.1
}
```

### Command History
```
GET /history
Response: {
  commands: [
    {id: "123", command: "open chrome", description: "App launched", timestamp: "2:30 PM"},
    ...
  ]
}
```

### Execute Command
```
POST /command
Request: {command: "open chrome"}
Response: {success: true, message: "Chrome launched"}
```

### WebSocket
```
WS /ws
- Accepts client connections
- Broadcasts activity events
- Auto-reconnection with backoff
```

## State Management Flow

```
Frontend State
├── input (CodeBuddy)
├── isLoading (CodeBuddy)
├── lastResponse (CodeBuddy)
├── logs (ActivityLog)
├── commands (CommandHistory)
├── systemStatus (TasksControls)
└── isListening (TasksControls)
    │
    └─► Updates trigger API calls
        └─► Backend processes requests
            └─► Response updates state
                └─► UI re-renders
```

## Error Handling Flow

```
Error Occurs in Component
        │
    Try-Catch Block
        │
    ├─ Network Error
    │  └─ Display: "System unavailable"
    │
    ├─ API Error
    │  └─ Display: Error message from backend
    │
    ├─ Voice Recognition Error
    │  └─ Display: "Voice recognition failed"
    │
    └─ Permission Denied
       └─ Display: "Permission denied: [reason]"
```

## Scrolling Architecture

```
Browser Window
└── Layout Container (overflow-hidden)
    └── Main Content (h-[calc(100vh-80px)], overflow-y-auto)
        └── Dashboard Grid (auto-rows-max)
            ├── CommandHistory (min-h-[400px])
            │   └── Internal List (overflow-y-auto)
            ├── CodeBuddy (min-h-[400px])
            ├── ActivityLog (min-h-[300px])
            │   └── Event Stream (overflow-y-auto)
            └── TasksControls (min-h-[300px])
                └── System Controls (overflow-y-auto)
```

## Security Layers

```
Frontend
  ├─ Token in localStorage
  ├─ Attached to headers automatically
  └─ Validated on each request

Backend
  ├─ CORS Middleware
  ├─ Token validation
  ├─ Guard Agent (permission checking)
  └─ Error handling (no sensitive info leakage)
```

---

**This architecture ensures real-time OS communication with proper error handling and user-friendly interface!**
