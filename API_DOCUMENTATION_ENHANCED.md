# 📡 API Documentation

```
    ╔═══════════════════════════════════════════════════════════════╗
    ║                    API REFERENCE                              ║
    ║                                                               ║
    ║        Complete REST API Documentation & Examples             ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
```

## 📑 API Overview

```
API ENDPOINTS STRUCTURE:
═════════════════════════════════════════════════════════════════════

Base URL: https://api.dev-ai-os.dev/api

Authentication Resources
└─ /auth
   ├─ POST   /login                    User Login
   ├─ POST   /logout                   User Logout
   ├─ POST   /register                 User Registration
   ├─ POST   /refresh-token            Refresh JWT
   └─ GET    /profile                  Get User Profile

Voice Processing
└─ /voice
   ├─ POST   /process                  Process Voice Input
   ├─ POST   /recognize                Speech Recognition
   ├─ GET    /models                   Available Voice Models
   └─ POST   /synthesize               Text-to-Speech

AI Engine
└─ /ai
   ├─ POST   /intent                   Recognize Intent
   ├─ POST   /task                     Execute Task
   ├─ GET    /models                   List Models
   └─ POST   /context                  Set Context

OS Automation
└─ /os
   ├─ POST   /execute                  Execute Command
   ├─ POST   /file                     File Operations
   ├─ GET    /status                   System Status
   └─ GET    /metrics                  System Metrics

User Management
└─ /users
   ├─ GET    /me                       Current User
   ├─ PUT    /me                       Update Profile
   ├─ GET    /:id                      Get User
   └─ DELETE /:id                      Delete User
```

## 🔐 Authentication Endpoints

### 1. User Login

```
POST /api/auth/login

REQUEST:
┌────────────────────────────────────────┐
│ Content-Type: application/json         │
│                                        │
│ {                                      │
│   "email": "user@example.com",        │
│   "password": "secure_password",      │
│   "rememberMe": true                  │
│ }                                      │
└────────────────────────────────────────┘

RESPONSE (200 OK):
┌────────────────────────────────────────┐
│ {                                      │
│   "status": "success",                │
│   "data": {                           │
│     "user": {                         │
│       "id": "user_123",              │
│       "email": "user@example.com",   │
│       "name": "John Doe",            │
│       "role": "user"                 │
│     },                                │
│     "tokens": {                       │
│       "access": "eyJhbGc...",        │
│       "refresh": "eyJhbGc...",       │
│       "expires_in": 3600             │
│     }                                 │
│   }                                   │
│ }                                      │
└────────────────────────────────────────┘
```

### 2. User Registration

```
POST /api/auth/register

REQUEST:
{
  "email": "newuser@example.com",
  "password": "secure_password",
  "confirmPassword": "secure_password",
  "name": "Jane Doe",
  "agree_to_terms": true
}

RESPONSE (201 Created):
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user_id": "user_456",
    "email": "newuser@example.com"
  }
}
```

### 3. Refresh Token

```
POST /api/auth/refresh-token

REQUEST HEADERS:
Authorization: Bearer {refresh_token}

RESPONSE (200 OK):
{
  "access_token": "new_jwt_token",
  "expires_in": 3600
}
```

### 4. Get User Profile

```
GET /api/auth/profile

REQUEST HEADERS:
Authorization: Bearer {access_token}

RESPONSE (200 OK):
{
  "status": "success",
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-12-27T10:30:00Z"
  }
}
```

---

## 🎤 Voice Processing Endpoints

### 1. Process Voice Input

```
POST /api/voice/process

REQUEST:
Content-Type: multipart/form-data

┌────────────────────────────────────────┐
│ Form Fields:                           │
│ ├─ audio_file: (binary WAV/MP3)       │
│ ├─ language: "en-US"                  │
│ ├─ context: {                         │
│ │   "user_id": "user_123",           │
│ │   "workspace": "/home/user/dev"    │
│ │ }                                   │
│ └─ format: "json" | "stream"         │
└────────────────────────────────────────┘

RESPONSE (200 OK):
{
  "status": "success",
  "transcription": "Run build and test",
  "confidence": 0.98,
  "language": "en-US",
  "duration_ms": 2300
}
```

### 2. Speech Recognition & Intent

```
POST /api/voice/recognize

REQUEST:
{
  "audio_data": "base64_encoded_audio",
  "language": "en-US",
  "user_context": {
    "current_directory": "/home/user/projects/app",
    "os_type": "windows"
  }
}

RESPONSE (200 OK):
{
  "status": "success",
  "transcription": "deploy to production",
  "intent": {
    "action": "deploy",
    "target": "production",
    "confidence": 0.95
  },
  "entities": [
    {
      "type": "environment",
      "value": "production",
      "confidence": 0.98
    }
  ],
  "execution_plan": {
    "steps": [
      "Build application",
      "Run tests",
      "Deploy to Azure"
    ]
  }
}
```

### 3. List Voice Models

```
GET /api/voice/models

RESPONSE (200 OK):
{
  "status": "success",
  "models": [
    {
      "id": "stt_google_cloud",
      "name": "Google Cloud Speech-to-Text",
      "type": "speech_to_text",
      "languages": ["en-US", "en-GB", "es-ES", "fr-FR"],
      "latency_ms": 500,
      "accuracy": 0.95
    },
    {
      "id": "tts_elevenlabs",
      "name": "ElevenLabs Text-to-Speech",
      "type": "text_to_speech",
      "voices": 29,
      "languages": ["en-US", "es-ES", "fr-FR", "de-DE"],
      "quality": "high"
    }
  ]
}
```

---

## 🧠 AI Engine Endpoints

### 1. Recognize Intent

```
POST /api/ai/intent

REQUEST:
{
  "input": "Can you compile the project and run tests?",
  "input_type": "text",
  "model": "gpt-4",
  "context": {
    "project_type": "nodejs",
    "language": "typescript"
  }
}

RESPONSE (200 OK):
{
  "status": "success",
  "intent": {
    "primary": "execute_commands",
    "secondary": ["build", "test"],
    "confidence": 0.96
  },
  "extracted_commands": [
    {
      "command": "npm run build",
      "description": "Compile TypeScript project",
      "priority": 1
    },
    {
      "command": "npm run test",
      "description": "Run test suite",
      "priority": 2
    }
  ],
  "parameters": {
    "parallelizable": true,
    "timeout_ms": 300000,
    "requires_confirmation": false
  }
}
```

### 2. Execute Task

```
POST /api/ai/task

REQUEST:
{
  "task_id": "task_789",
  "task_name": "deploy_to_staging",
  "parameters": {
    "environment": "staging",
    "version": "1.2.3",
    "skip_tests": false
  },
  "timeout": 600000
}

RESPONSE (200 OK):
{
  "status": "success",
  "task": {
    "id": "task_789",
    "status": "executing",
    "progress": 0,
    "started_at": "2024-12-27T10:30:00Z"
  },
  "execution_id": "exec_999"
}

# Get real-time updates via WebSocket
WebSocket Connection: wss://api.dev-ai-os.dev/socket
Message: {
  "type": "task_progress",
  "execution_id": "exec_999",
  "progress": 45,
  "message": "Running tests..."
}
```

### 3. List Available Models

```
GET /api/ai/models

RESPONSE (200 OK):
{
  "status": "success",
  "models": {
    "large": [
      {
        "id": "gpt-4",
        "provider": "openai",
        "max_tokens": 8192,
        "cost_per_1k_tokens": {
          "input": 0.03,
          "output": 0.06
        }
      }
    ],
    "medium": [
      {
        "id": "gpt-3.5-turbo",
        "provider": "openai",
        "max_tokens": 4096,
        "cost_per_1k_tokens": {
          "input": 0.0015,
          "output": 0.002
        }
      }
    ],
    "fast": [
      {
        "id": "gpt-3.5-turbo-instruct",
        "provider": "openai"
      }
    ]
  }
}
```

---

## 🖥️ OS Automation Endpoints

### 1. Execute Command

```
POST /api/os/execute

REQUEST:
{
  "command": "npm run dev",
  "cwd": "C:\\Users\\username\\projects\\myapp",
  "timeout": 30000,
  "shell": true,
  "env_vars": {
    "NODE_ENV": "development"
  }
}

RESPONSE (200 OK):
{
  "status": "success",
  "execution": {
    "command": "npm run dev",
    "pid": 12345,
    "status": "running",
    "started_at": "2024-12-27T10:30:00Z"
  },
  "stream_url": "wss://api.dev-ai-os.dev/exec/stream/12345"
}
```

### 2. File Operations

```
POST /api/os/file

REQUEST - CREATE FILE:
{
  "operation": "create",
  "path": "C:\\Users\\username\\newfile.txt",
  "content": "Hello World",
  "encoding": "utf-8"
}

REQUEST - READ FILE:
{
  "operation": "read",
  "path": "C:\\Users\\username\\file.txt"
}

REQUEST - DELETE FILE:
{
  "operation": "delete",
  "path": "C:\\Users\\username\\file.txt",
  "force": true
}

RESPONSE (200 OK):
{
  "status": "success",
  "operation": "create",
  "file": {
    "path": "C:\\Users\\username\\newfile.txt",
    "size_bytes": 11,
    "created_at": "2024-12-27T10:30:00Z"
  }
}
```

### 3. System Status

```
GET /api/os/status

RESPONSE (200 OK):
{
  "status": "success",
  "system": {
    "os": "Windows 11",
    "cpu": {
      "cores": 8,
      "usage_percent": 45.5,
      "model": "Intel i7-12700K"
    },
    "memory": {
      "total_gb": 16,
      "used_gb": 8.5,
      "available_gb": 7.5,
      "usage_percent": 53.1
    },
    "disk": {
      "total_gb": 512,
      "used_gb": 350,
      "available_gb": 162,
      "usage_percent": 68.4
    },
    "network": {
      "interfaces": ["Ethernet", "WiFi"],
      "active": "WiFi"
    }
  },
  "processes": [
    {
      "name": "node.exe",
      "pid": 12345,
      "cpu_percent": 15.2,
      "memory_mb": 450
    }
  ]
}
```

---

## 📊 API Response Structures

### Standard Success Response

```json
{
  "status": "success",
  "code": 200,
  "timestamp": "2024-12-27T10:30:00Z",
  "request_id": "req_abc123",
  "data": {
    // Response specific data
  }
}
```

### Standard Error Response

```json
{
  "status": "error",
  "code": 400,
  "timestamp": "2024-12-27T10:30:00Z",
  "request_id": "req_abc123",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

## 🔄 HTTP Status Codes

```
┌────────────────────────────────────────────────────────┐
│                 STATUS CODE REFERENCE                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│ 2XX SUCCESS                                           │
│ ├─ 200 OK                 Request succeeded          │
│ ├─ 201 Created           Resource created            │
│ ├─ 202 Accepted          Request accepted            │
│ └─ 204 No Content        No response body            │
│                                                        │
│ 4XX CLIENT ERRORS                                    │
│ ├─ 400 Bad Request       Invalid parameters          │
│ ├─ 401 Unauthorized      Authentication required     │
│ ├─ 403 Forbidden         Permission denied           │
│ └─ 404 Not Found         Resource not found          │
│                                                        │
│ 5XX SERVER ERRORS                                    │
│ ├─ 500 Internal Error    Unexpected error            │
│ ├─ 502 Bad Gateway       Upstream service failed     │
│ ├─ 503 Unavailable       Service temporarily down    │
│ └─ 504 Timeout           Request timed out           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🔑 Authentication

### Bearer Token Authentication

```
REQUEST HEADER:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

TOKEN STRUCTURE:
┌────────────────────────────────────────┐
│ Header                                 │
├────────────────────────────────────────┤
│ {                                      │
│   "alg": "HS256",                     │
│   "typ": "JWT"                        │
│ }                                      │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Payload                                │
├────────────────────────────────────────┤
│ {                                      │
│   "sub": "user_123",                  │
│   "email": "user@example.com",        │
│   "role": "user",                     │
│   "iat": 1609459200,                  │
│   "exp": 1609462800                   │
│ }                                      │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Signature                              │
├────────────────────────────────────────┤
│ HMACSHA256(                            │
│   base64UrlEncode(header) + "." +     │
│   base64UrlEncode(payload),           │
│   secret                              │
│ )                                      │
└────────────────────────────────────────┘
```

---

## 📚 API Testing Examples

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Process voice
curl -X POST http://localhost:5000/api/voice/process \
  -H "Authorization: Bearer $TOKEN" \
  -F "audio_file=@voice.wav"

# Execute command
curl -X POST http://localhost:5000/api/os/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"command":"npm run build"}'
```

### Using Thunder Client (VS Code)

```
1. Install Thunder Client extension
2. Create new request
3. Set method: POST
4. Set URL: http://localhost:5000/api/auth/login
5. Set Body: 
   {
     "email": "user@example.com",
     "password": "password"
   }
6. Click Send
```

### Using JavaScript/Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login
const response = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password'
});

const token = response.data.data.tokens.access;

// Set token for future requests
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Make authenticated request
const voiceResponse = await api.post('/voice/process', {
  language: 'en-US'
}, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## ⚡ Rate Limiting

```
┌──────────────────────────────────────────────────────┐
│            RATE LIMIT POLICY                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Default: 1000 requests per 15 minutes per IP       │
│                                                      │
│ Response Headers:                                   │
│ ├─ X-RateLimit-Limit: 1000                         │
│ ├─ X-RateLimit-Remaining: 999                      │
│ ├─ X-RateLimit-Reset: 1703686260                   │
│ └─ Retry-After: 60 (if limited)                    │
│                                                      │
│ Tier-based Limits:                                 │
│ ├─ Free: 100 req/15min                            │
│ ├─ Pro: 5000 req/15min                            │
│ └─ Enterprise: Unlimited                           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🔄 Pagination

```json
REQUEST:
GET /api/users?page=2&limit=20&sort=-created_at

RESPONSE:
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total_items": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": true,
    "next_url": "/api/users?page=3&limit=20",
    "prev_url": "/api/users?page=1&limit=20"
  }
}
```

---

## 🚀 WebSocket Connections

```
ESTABLISHING CONNECTION:

const ws = new WebSocket('wss://api.dev-ai-os.dev/socket');

ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'tasks',
    token: 'jwt_token'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Message:', data);
};

AVAILABLE CHANNELS:
├─ tasks                  Task execution updates
├─ system                System status updates
├─ notifications         User notifications
└─ voice                Voice processing status
```

---

<div align="center">

**📖 API Documentation Complete!**

For more examples, visit: https://docs.dev-ai-os.dev/api

</div>
