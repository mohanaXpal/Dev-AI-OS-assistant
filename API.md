# API Documentation - DEV.OS

Complete API reference for all DEV.OS endpoints with request/response examples.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Command Execution](#command-execution)
4. [System Status](#system-status)
5. [File Management](#file-management)
6. [Application Management](#application-management)
7. [GitHub Integration](#github-integration)
8. [AI Processing](#ai-processing)
9. [User Management](#user-management)
10. [WebSocket Events](#websocket-events)
11. [Error Handling](#error-handling)

---

## Overview

### Base URLs

```
Development:
- API: http://localhost:3001/api
- WebSocket: ws://localhost:3001
- OS Automation: http://localhost:8000
- Frontend: http://localhost:3000

Production:
- API: https://api.dev-os.com/api
- WebSocket: wss://api.dev-os.com
- OS Automation: https://automation.dev-os.com
- Frontend: https://app.dev-os.com
```

### Authentication

All endpoints (except `/auth/*`) require:

```http
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

### Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": { },
  "message": "Operation successful",
  "timestamp": "2025-12-27T10:30:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "statusCode": 400
}
```

---

## Authentication

### 1. Google OAuth Login

Redirects user to Google consent screen.

```http
GET /api/auth/google
```

**Query Parameters:**
```
state: (optional) CSRF protection token
prompt: (optional) 'consent' to force consent screen
```

**Response:**
```
Redirects to: https://accounts.google.com/o/oauth2/v2/auth?...
```

---

### 2. Google OAuth Callback

Handles Google OAuth callback.

```http
GET /api/auth/google/callback?code=CODE&state=STATE
```

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `code` | string | Yes |
| `state` | string | Yes |

**Success Response (302 Redirect):**
```
Location: http://localhost:3000/dashboard?token=ACCESS_TOKEN&refresh=REFRESH_TOKEN
```

**Response Payload (before redirect):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_61b8d4e5f6a2b1c3d4e5f6a2",
      "email": "user@example.com",
      "name": "John Doe",
      "profile": "https://lh3.googleusercontent.com/...",
      "provider": "google"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

---

### 3. GitHub OAuth Login

Redirects user to GitHub consent screen.

```http
GET /api/auth/github
```

**Query Parameters:**
```
state: (optional) CSRF protection token
scope: (optional) comma-separated scopes
```

**Response:**
```
Redirects to: https://github.com/login/oauth/authorize?...
```

---

### 4. GitHub OAuth Callback

Handles GitHub OAuth callback.

```http
GET /api/auth/github/callback?code=CODE&state=STATE
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_61b8d4e5f6a2b1c3d4e5f6a2",
      "email": "user@github.com",
      "name": "John Doe",
      "profile": "https://avatars.githubusercontent.com/u/...",
      "githubUsername": "johndoe",
      "provider": "github"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600
  }
}
```

---

### 5. Refresh Access Token

Gets a new access token using refresh token.

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "INVALID_TOKEN",
  "message": "Refresh token has expired",
  "statusCode": 401
}
```

---

### 6. Logout

Invalidates current session.

```http
POST /api/auth/logout
Authorization: Bearer <ACCESS_TOKEN>
```

**Success Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Command Execution

### 1. Execute System Command

Execute a natural language or direct command on the system.

```http
POST /api/command/execute
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "command": "open calculator",
  "priority": "normal",
  "context": {
    "userId": "user_61b8d4e5f6a2b1c3d4e5f6a2",
    "timestamp": "2025-12-27T10:30:00Z"
  }
}
```

**Request Body:**
```json
{
  "command": "string (required) - Natural language command",
  "priority": "string (optional) - 'low' | 'normal' | 'high'",
  "context": {
    "userId": "string",
    "sessionId": "string",
    "timestamp": "string"
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "commandId": "cmd_61b8d4e5f6a2b1c3d4e5f6a2",
    "command": "open calculator",
    "action": "launch_app",
    "status": "executed",
    "result": {
      "app": "calculator",
      "pid": 12345,
      "windowTitle": "Calculator"
    },
    "executionTime": 245,
    "timestamp": "2025-12-27T10:30:00Z"
  },
  "message": "Calculator launched successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "COMMAND_FAILED",
  "message": "Failed to launch application",
  "statusCode": 500
}
```

---

### 2. Get Command History

Retrieve command execution history.

```http
GET /api/command/history?limit=20&offset=0&status=all
Authorization: Bearer <ACCESS_TOKEN>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Max results to return |
| `offset` | number | 0 | Pagination offset |
| `status` | string | 'all' | 'success' \| 'failed' \| 'all' |
| `sortBy` | string | 'timestamp' | Field to sort by |
| `order` | string | 'desc' | 'asc' \| 'desc' |

**Success Response:**
```json
{
  "success": true,
  "data": {
    "total": 156,
    "limit": 20,
    "offset": 0,
    "commands": [
      {
        "id": "cmd_61b8d4e5f6a2b1c3d4e5f6a2",
        "command": "open calculator",
        "action": "launch_app",
        "status": "success",
        "result": {
          "app": "calculator",
          "pid": 12345
        },
        "executionTime": 245,
        "timestamp": "2025-12-27T10:30:00Z"
      },
      {
        "id": "cmd_61b8d4e5f6a2b1c3d4e5f6a1",
        "command": "create file on desktop",
        "action": "create_file",
        "status": "success",
        "executionTime": 120,
        "timestamp": "2025-12-27T10:29:00Z"
      }
    ]
  }
}
```

---

### 3. Get Command Details

Get detailed information about a specific command.

```http
GET /api/command/{commandId}
Authorization: Bearer <ACCESS_TOKEN>
```

**Path Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `commandId` | string | Yes |

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "cmd_61b8d4e5f6a2b1c3d4e5f6a2",
    "userId": "user_61b8d4e5f6a2b1c3d4e5f6a2",
    "command": "open calculator and create a new file",
    "parsedActions": [
      {
        "type": "launch_app",
        "params": { "app": "calculator" }
      },
      {
        "type": "create_file",
        "params": { "path": "~/Desktop/newfile.txt" }
      }
    ],
    "status": "success",
    "results": [
      { "action": "launch_app", "status": "success", "data": {} },
      { "action": "create_file", "status": "success", "data": {} }
    ],
    "executionTime": 365,
    "timestamp": "2025-12-27T10:30:00Z"
  }
}
```

---

### 4. Cancel Command

Cancel an in-progress command.

```http
POST /api/command/{commandId}/cancel
Authorization: Bearer <ACCESS_TOKEN>
```

**Success Response:**
```json
{
  "success": true,
  "message": "Command cancelled successfully",
  "data": {
    "id": "cmd_61b8d4e5f6a2b1c3d4e5f6a2",
    "status": "cancelled"
  }
}
```

---

## System Status

### 1. Get System Status

Get real-time system metrics.

```http
GET /api/system/status
Authorization: Bearer <ACCESS_TOKEN>
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "system": {
      "platform": "win32",
      "arch": "x64",
      "hostname": "LAPTOP-USER",
      "uptime": 86400
    },
    "cpu": {
      "cores": 8,
      "usage": 45.2,
      "threads": 16
    },
    "memory": {
      "total": 17179869184,
      "used": 8589934592,
      "free": 8589934592,
      "usage": 50.0
    },
    "disk": {
      "total": 536870912000,
      "used": 268435456000,
      "free": 268435456000,
      "usage": 50.0
    },
    "network": {
      "ipv4": "192.168.1.100",
      "wifiStatus": "connected",
      "wifiName": "HomeNetwork",
      "connectivity": "online"
    },
    "battery": {
      "level": 92,
      "isCharging": true,
      "timeRemaining": "6:30"
    },
    "audio": {
      "volume": 75,
      "isMuted": false
    },
    "display": {
      "brightness": 80,
      "resolution": "1920x1080",
      "refreshRate": 60
    },
    "timestamp": "2025-12-27T10:30:00Z"
  }
}
```

---

### 2. Get Running Applications

List all currently running applications.

```http
GET /api/system/apps?includeSystemApps=false
Authorization: Bearer <ACCESS_TOKEN>
```

**Query Parameters:**
| Parameter | Type | Default |
|-----------|------|---------|
| `includeSystemApps` | boolean | false |
| `sortBy` | string | 'memory' |

**Success Response:**
```json
{
  "success": true,
  "data": {
    "total": 12,
    "apps": [
      {
        "name": "Chrome",
        "pid": 2345,
        "memory": 1073741824,
        "memoryPercent": 12.5,
        "cpu": 5.2,
        "status": "running",
        "path": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "icon": "C:\\...",
        "windowTitle": "Google Chrome"
      },
      {
        "name": "VS Code",
        "pid": 2346,
        "memory": 536870912,
        "memoryPercent": 6.2,
        "cpu": 2.1,
        "status": "running"
      }
    ]
  }
}
```

---

### 3. Launch Application

Launch an application by name or path.

```http
POST /api/system/apps/launch
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "app": "chrome",
  "args": [],
  "workingDirectory": null
}
```

**Request Body:**
```json
{
  "app": "string (required) - App name or full path",
  "args": "array (optional) - Command line arguments",
  "workingDirectory": "string (optional)"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "app": "chrome",
    "pid": 9876,
    "launched": true,
    "timestamp": "2025-12-27T10:30:00Z"
  }
}
```

---

### 4. Close Application

Close an application by name or PID.

```http
POST /api/system/apps/close
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "identifier": "chrome",
  "force": false
}
```

**Request Body:**
```json
{
  "identifier": "string (required) - App name or PID",
  "force": "boolean (optional) - Force close without saving"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Application closed successfully"
}
```

---

### 5. Set System Volume

Set system audio volume.

```http
POST /api/system/audio/volume
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "level": 75,
  "mute": false
}
```

**Request Body:**
```json
{
  "level": "number (optional) - 0-100",
  "mute": "boolean (optional)"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "volume": 75,
    "isMuted": false
  }
}
```

---

### 6. Set Display Brightness

Set display brightness level.

```http
POST /api/system/display/brightness
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "level": 80
}
```

**Request Body:**
```json
{
  "level": "number (required) - 0-100"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "brightness": 80
  }
}
```

---

## File Management

### 1. Create File

Create a new file with content.

```http
POST /api/files/create
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "path": "/Users/Desktop/newfile.txt",
  "content": "Hello, World!",
  "encoding": "utf-8"
}
```

**Request Body:**
```json
{
  "path": "string (required) - Full file path",
  "content": "string (optional) - File content",
  "encoding": "string (optional) - 'utf-8' | 'ascii'"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "path": "/Users/Desktop/newfile.txt",
    "size": 13,
    "created": "2025-12-27T10:30:00Z",
    "modified": "2025-12-27T10:30:00Z",
    "encoding": "utf-8"
  }
}
```

---

### 2. Read File

Read file contents.

```http
GET /api/files/read?path=/Users/Desktop/file.txt
Authorization: Bearer <ACCESS_TOKEN>
```

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `path` | string | Yes |
| `encoding` | string | No |
| `maxSize` | number | No |

**Success Response:**
```json
{
  "success": true,
  "data": {
    "path": "/Users/Desktop/file.txt",
    "size": 2048,
    "content": "File content here...",
    "encoding": "utf-8",
    "created": "2025-12-27T09:00:00Z",
    "modified": "2025-12-27T10:00:00Z"
  }
}
```

---

### 3. Update File

Append or overwrite file content.

```http
PUT /api/files/update
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "path": "/Users/Desktop/file.txt",
  "content": "Updated content",
  "mode": "overwrite"
}
```

**Request Body:**
```json
{
  "path": "string (required)",
  "content": "string (required)",
  "mode": "string - 'append' | 'overwrite'"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "path": "/Users/Desktop/file.txt",
    "size": 15,
    "modified": "2025-12-27T10:30:00Z"
  }
}
```

---

### 4. Delete File

Delete a file.

```http
DELETE /api/files/delete?path=/Users/Desktop/oldfile.txt
Authorization: Bearer <ACCESS_TOKEN>
```

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| `path` | string | Yes |

**Success Response:**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "path": "/Users/Desktop/oldfile.txt"
  }
}
```

---

### 5. Copy File

Copy a file to a new location.

```http
POST /api/files/copy
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "source": "/Users/Documents/original.txt",
  "destination": "/Users/Desktop/copy.txt",
  "overwrite": false
}
```

**Request Body:**
```json
{
  "source": "string (required)",
  "destination": "string (required)",
  "overwrite": "boolean (optional)"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "source": "/Users/Documents/original.txt",
    "destination": "/Users/Desktop/copy.txt",
    "size": 2048
  }
}
```

---

### 6. Search Files

Search for files matching criteria.

```http
GET /api/files/search?query=*.txt&location=/Users/Documents&recursive=true
Authorization: Bearer <ACCESS_TOKEN>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search pattern (*.txt) |
| `location` | string | Search directory |
| `recursive` | boolean | Search subdirectories |
| `limit` | number | Max results (default: 100) |

**Success Response:**
```json
{
  "success": true,
  "data": {
    "query": "*.txt",
    "location": "/Users/Documents",
    "total": 12,
    "results": [
      {
        "path": "/Users/Documents/notes.txt",
        "size": 2048,
        "created": "2025-12-27T09:00:00Z",
        "modified": "2025-12-27T10:00:00Z"
      }
    ]
  }
}
```

---

### 7. Get Directory Contents

List files in a directory.

```http
GET /api/files/list?path=/Users/Documents&includeHidden=false
Authorization: Bearer <ACCESS_TOKEN>
```

**Query Parameters:**
| Parameter | Type |
|-----------|------|
| `path` | string |
| `includeHidden` | boolean |
| `sortBy` | string |

**Success Response:**
```json
{
  "success": true,
  "data": {
    "path": "/Users/Documents",
    "total": 15,
    "items": [
      {
        "name": "notes.txt",
        "path": "/Users/Documents/notes.txt",
        "type": "file",
        "size": 2048,
        "modified": "2025-12-27T10:00:00Z"
      },
      {
        "name": "Projects",
        "path": "/Users/Documents/Projects",
        "type": "directory",
        "itemCount": 5,
        "modified": "2025-12-27T09:00:00Z"
      }
    ]
  }
}
```

---

## Application Management

### 1. Get Installed Applications

List all installed applications.

```http
GET /api/apps/installed?search=chrome
Authorization: Bearer <ACCESS_TOKEN>
```

**Query Parameters:**
| Parameter | Type |
|-----------|------|
| `search` | string |
| `category` | string |

**Success Response:**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "apps": [
      {
        "name": "Google Chrome",
        "displayName": "Chrome",
        "version": "120.0.0.0",
        "publisher": "Google Inc.",
        "installLocation": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "icon": "C:\\...",
        "category": "Browsers"
      }
    ]
  }
}
```

---

## GitHub Integration

### 1. Get GitHub Repositories

List user's GitHub repositories.

```http
GET /api/github/repos?type=owner&sort=updated
Authorization: Bearer <ACCESS_TOKEN>
```

**Query Parameters:**
| Parameter | Type | Options |
|-----------|------|---------|
| `type` | string | 'owner' \| 'public' \| 'private' \| 'all' |
| `sort` | string | 'updated' \| 'created' \| 'pushed' |
| `direction` | string | 'asc' \| 'desc' |
| `limit` | number | default: 30 |

**Success Response:**
```json
{
  "success": true,
  "data": {
    "total": 8,
    "repos": [
      {
        "id": 123456789,
        "name": "my-project",
        "fullName": "username/my-project",
        "description": "Amazing project",
        "url": "https://github.com/username/my-project",
        "language": "TypeScript",
        "stars": 25,
        "forks": 5,
        "private": false,
        "updated": "2025-12-27T10:30:00Z"
      }
    ]
  }
}
```

---

### 2. Create GitHub Repository

Create a new GitHub repository.

```http
POST /api/github/repos/create
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "name": "new-project",
  "description": "My new project",
  "private": false,
  "autoInit": true
}
```

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "private": "boolean (optional)",
  "autoInit": "boolean (optional)"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": 123456789,
    "name": "new-project",
    "fullName": "username/new-project",
    "url": "https://github.com/username/new-project",
    "cloneUrl": "https://github.com/username/new-project.git"
  }
}
```

---

### 3. Push Code to Repository

Push files to GitHub repository.

```http
POST /api/github/repos/push
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "repository": "my-project",
  "branch": "main",
  "message": "Auto-generated code update",
  "files": [
    {
      "path": "src/app.ts",
      "content": "export const app = ...",
      "mode": "100644"
    }
  ]
}
```

**Request Body:**
```json
{
  "repository": "string (required)",
  "branch": "string (required)",
  "message": "string (required)",
  "files": "array (required)",
  "author": {
    "name": "string (optional)",
    "email": "string (optional)"
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "sha": "a1b2c3d4e5f6",
    "message": "Auto-generated code update",
    "author": "dev-os-bot",
    "timestamp": "2025-12-27T10:30:00Z",
    "url": "https://github.com/user/repo/commit/a1b2c3d4e5f6"
  }
}
```

---

### 4. Get Repository Content

Get file content from repository.

```http
GET /api/github/repos/{owner}/{repo}/content/{path}
Authorization: Bearer <ACCESS_TOKEN>
```

**Path Parameters:**
| Parameter | Description |
|-----------|-------------|
| `owner` | Repository owner |
| `repo` | Repository name |
| `path` | File path in repo |

**Success Response:**
```json
{
  "success": true,
  "data": {
    "name": "README.md",
    "path": "README.md",
    "type": "file",
    "size": 5120,
    "content": "# My Project\n...",
    "sha": "abc123def456",
    "htmlUrl": "https://github.com/.../README.md"
  }
}
```

---

## AI Processing

### 1. Process Natural Language Command

Process and execute natural language commands.

```http
POST /api/ai/process
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "input": "open calculator and create a new file on desktop",
  "context": {
    "userId": "user_61b8d4e5f6a2b1c3d4e5f6a2",
    "previousActions": [],
    "systemState": {}
  },
  "executeImmediately": false
}
```

**Request Body:**
```json
{
  "input": "string (required) - Natural language input",
  "context": "object (optional)",
  "executeImmediately": "boolean (optional) - Execute without confirmation"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "understanding": "User wants to launch calculator app and create a file on desktop",
    "actions": [
      {
        "type": "launch_app",
        "confidence": 0.99,
        "params": {
          "app": "calculator"
        }
      },
      {
        "type": "create_file",
        "confidence": 0.95,
        "params": {
          "path": "~/Desktop/newfile.txt",
          "content": ""
        }
      }
    ],
    "overallConfidence": 0.97,
    "warnings": [],
    "requiresConfirmation": false
  }
}
```

---

### 2. Get AI Suggestions

Get AI suggestions based on user activity.

```http
GET /api/ai/suggestions?context=file_operations&limit=5
Authorization: Bearer <ACCESS_TOKEN>
```

**Query Parameters:**
| Parameter | Type |
|-----------|------|
| `context` | string |
| `limit` | number |

**Success Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "title": "Backup your Documents folder",
        "description": "You haven't backed up in 7 days",
        "action": "copy /Users/Documents /Users/Backups/Documents",
        "confidence": 0.85
      }
    ]
  }
}
```

---

## User Management

### 1. Get Current User Profile

Get logged-in user's profile information.

```http
GET /api/user/profile
Authorization: Bearer <ACCESS_TOKEN>
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_61b8d4e5f6a2b1c3d4e5f6a2",
    "email": "user@example.com",
    "name": "John Doe",
    "profile": "https://...",
    "provider": "google",
    "providers": ["google", "github"],
    "created": "2025-12-27T00:00:00Z",
    "lastLogin": "2025-12-27T10:30:00Z",
    "preferences": {
      "theme": "dark",
      "language": "en"
    }
  }
}
```

---

### 2. Update User Profile

Update user preferences and settings.

```http
PUT /api/user/profile
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "preferences": {
    "theme": "dark",
    "language": "en",
    "notifications": true
  }
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

## WebSocket Events

### Connection

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Command Events

```javascript
// Listen for command execution
socket.on('command:executed', (data) => {
  console.log('Command:', data.command);
  console.log('Status:', data.status);
  console.log('Result:', data.result);
});

// Listen for command errors
socket.on('command:error', (data) => {
  console.log('Error:', data.message);
});
```

### System Events

```javascript
// System status update
socket.on('system:status_updated', (status) => {
  console.log('CPU:', status.cpu.usage);
  console.log('Memory:', status.memory.usage);
});

// Application launch
socket.on('app:launched', (app) => {
  console.log('App:', app.name);
});

// File operation
socket.on('file:operation', (operation) => {
  console.log('Type:', operation.type);
  console.log('Path:', operation.path);
});
```

### Emit Commands

```javascript
socket.emit('command:execute', {
  command: 'open chrome',
  priority: 'high'
}, (response) => {
  console.log('Response:', response);
});
```

---

## Error Handling

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `INVALID_REQUEST` | 400 | Invalid request parameters |
| `COMMAND_FAILED` | 500 | Command execution failed |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `EXTERNAL_SERVICE_ERROR` | 503 | External service unavailable |

### Error Response Format

```json
{
  "success": false,
  "error": "INVALID_REQUEST",
  "message": "Command field is required",
  "statusCode": 400,
  "details": {
    "field": "command",
    "issue": "missing_required_field"
  },
  "timestamp": "2025-12-27T10:30:00Z"
}
```

### Error Handling Example

```javascript
fetch('/api/command/execute', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ command: 'open calc' })
})
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('Success:', data.data);
    } else {
      console.error('Error:', data.error, data.message);
    }
  })
  .catch(error => console.error('Network error:', error));
```

---

## Rate Limiting

API endpoints have rate limits:

- **Authentication endpoints**: 5 requests per minute per IP
- **Command execution**: 30 requests per minute per user
- **File operations**: 50 requests per minute per user
- **System status**: 100 requests per minute per user

Rate limit headers:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1703678400
```

---

**Last Updated**: December 27, 2025
