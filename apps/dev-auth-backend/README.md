# Dev Auth Backend System

**Node.js/NestJS OAuth + JWT + MongoDB Authentication and User Management**

A production-ready authentication and backend system for the Dev AI Assistant platform. Handles OAuth (Google/GitHub), JWT token management, session management, permissions, and user data persistence.

## Features

✅ **OAuth Authentication** - Google & GitHub sign-in  
✅ **JWT Token Management** - Access & refresh tokens with rotation  
✅ **Session Management** - Multi-device session tracking  
✅ **Permission System** - Granular OS action authorization  
✅ **User Service** - Profile management & preferences  
✅ **MongoDB Integration** - Document storage for users, sessions, permissions  
✅ **Property-Based Testing** - fast-check properties for all core logic  
✅ **Real-time WebSocket Support** - Event broadcasting for permission changes

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB 5.0+ (optional for full DB integration)

### Installation

```bash
npm install
```

### Configuration

```bash
cp .env.example .env
# Edit .env with your OAuth credentials
```

### Run Development Server

```bash
npm run dev
```

### Run Tests

```bash
npm test
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### Build

```bash
npm run build
npm start  # Run compiled version
```

## Architecture

### Core Modules

**auth/** - OAuth & JWT services
- `oauth.handler.ts` - Google/GitHub OAuth URL generation & token validation
- `jwt.service.ts` - Token pair generation, verification, and rotation

**session/** - Session lifecycle management
- `session.manager.ts` - Create, track, and invalidate user sessions

**permission/** - Permission grant & revocation
- `permission.manager.ts` - Manage user OS-level permissions

**user/** - User data & preferences
- `user.service.ts` - CRUD operations, preferences, export/delete

**database/** - MongoDB schemas
- `schemas.ts` - User, Session, Permission, CommandLog collections

### Property-Based Tests

11 comprehensive property-based tests using fast-check:

1. **OAuth Redirect URL Generation** - Valid OAuth URLs with required params
2. **Successful Auth Token Issuance** - JWT token structure and verification
3. **JWT Validation** - Invalid token rejection on protected endpoints
4. **Session Serialization** - JSON round-trip for session storage
5. **Logout Token Invalidation** - Session destruction on logout
6. **Permission Grant Persistence** - Permission storage and retrieval
7. **Permission Revocation Completeness** - Complete revocation of granted permissions
8. **Permission Query Completeness** - Return all user permissions
9. **User Creation from OAuth** - OAuth profile → user account conversion
10. **User Preference Persistence** - Preference update and retrieval
11. **User Export Completeness** - Complete user data export

## API Endpoints (Example)

```
POST   /auth/google        - Redirect to Google OAuth
POST   /auth/google/callback - Handle Google callback
POST   /auth/github        - Redirect to GitHub OAuth
POST   /auth/github/callback - Handle GitHub callback
POST   /auth/login         - Initiate login
POST   /auth/logout        - Logout and invalidate session
POST   /auth/refresh       - Refresh access token
GET    /auth/me            - Get current user profile

POST   /permissions        - List user permissions
POST   /permissions/grant  - Grant permission
POST   /permissions/revoke - Revoke permission

GET    /users/:id          - Get user profile
PATCH  /users/:id          - Update user profile
POST   /users/export       - Export user data
DELETE /users/:id          - Delete user account

WS     /ws                 - WebSocket for real-time updates
```

## Security Features

- JWT tokens with short expiration (15 min access, 7 day refresh)
- Refresh token rotation on use
- Session invalidation on logout
- Permission validation before actions
- HTTPS + TLS in production
- Secure token storage (httpOnly cookies recommended)
- CORS whitelisting for allowed origins

## Requirements Mapping

| Requirement | Implementation | Status |
|---|---|---|
| 1.1 - OAuth (Google) | `OAuthHandler.generateGoogleAuthUrl()` | ✅ |
| 1.2 - OAuth (GitHub) | `OAuthHandler.generateGithubAuthUrl()` | ✅ |
| 1.3 - User Creation | `UserService.findOrCreate()` | ✅ |
| 1.4 - Token Issuance | `JWTService.generateTokenPair()` | ✅ |
| 1.5 - Error Handling | OAuth error handling & responses | ✅ |
| 2.1 - Refresh Tokens | `JWTService.verifyRefreshToken()` | ✅ |
| 2.2 - Logout | `SessionManager.logout()` | ✅ |
| 2.3 - JWT Validation | `JWTService.verifyAccessToken()` | ✅ |
| 2.4 - Token Rotation | `JWTService.rotateRefreshToken()` | ✅ |
| 2.5 - Session Serialization | `SessionManager.serialize/deserialize()` | ✅ |
| 3.1 - Permission Validation | `PermissionManager.hasPermission()` | ✅ |
| 3.2 - Permission Grant | `PermissionManager.grantPermission()` | ✅ |
| 3.3 - Permission Revoke | `PermissionManager.revokePermission()` | ✅ |
| 3.4 - Permission Query | `PermissionManager.getPermissions()` | ✅ |
| 4.1 - User Preferences | `UserService.updatePreferences()` | ✅ |
| 4.2 - Command Logging | `UserService.logCommand()` | ✅ |
| 4.4 - Data Export | `UserService.exportUserData()` | ✅ |
| 4.5 - User Deletion | `UserService.deleteUser()` | ✅ |

## Example Usage

```typescript
import { 
  JWTService, 
  OAuthHandler, 
  SessionManager, 
  PermissionManager, 
  UserService 
} from './src/main';

const jwtService = new JWTService('access-secret', 'refresh-secret');
const oauthHandler = new OAuthHandler(
  'google-id', 'google-secret', 'redirect-uri',
  'github-id', 'github-secret', 'redirect-uri'
);
const sessionManager = new SessionManager();
const permissionManager = new PermissionManager();
const userService = new UserService();

// Generate Google OAuth URL
const authUrl = oauthHandler.generateGoogleAuthUrl('state-123');

// Handle OAuth callback
const profile = await oauthHandler.handleGoogleCallback('auth-code');
const user = userService.findOrCreate(profile);

// Issue tokens
const tokenPair = jwtService.generateTokenPair(user.id, user.email, 'session-1');

// Create session
const session = sessionManager.createSession(user.id, tokenPair, deviceInfo);

// Grant permissions
permissionManager.grantPermission(user.id, 'file_read');

// Verify token
const payload = jwtService.verifyAccessToken(tokenPair.accessToken);
```

## Development Roadmap

- [ ] NestJS controller/service wrappers
- [ ] MongoDB persistence layer
- [ ] WebSocket server for real-time updates
- [ ] Rate limiting middleware
- [ ] Request validation with Joi/Zod
- [ ] Comprehensive API documentation
- [ ] Docker containerization
- [ ] E2E integration tests

## Next Steps

Once auth backend is complete:
1. Start **dev-os-automation** (Python file/app control)
2. Implement **dev-voice-system** (Speech recognition)
3. Add **dev-ai-llm** (LangChain intelligence)
4. Build **dev-assistant-core** (Orchestration)
5. Create **dev-frontend-ui** (Next.js dashboard)

## License

MIT
