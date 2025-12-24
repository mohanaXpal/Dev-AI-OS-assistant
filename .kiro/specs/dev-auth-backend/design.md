# Design Document: Dev Auth Backend System

## Overview

The Auth Backend System is a Node.js/NestJS server providing OAuth authentication, JWT session management, permission control, and real-time communication for the Dev AI Assistant. It serves as the secure gateway between the web dashboard, desktop app, and cloud services, with MongoDB for data persistence.

## Architecture

```mermaid
graph TB
    subgraph "Clients"
        WEB[Web Dashboard]
        DSK[Desktop App]
    end
    
    subgraph "Auth Backend"
        subgraph "API Layer"
            REST[REST API]
            WS[WebSocket Server]
            GW[API Gateway]
        end
        
        subgraph "Auth Module"
            OA[OAuth Handler]
            JWT[JWT Service]
            SM[Session Manager]
        end
        
        subgraph "Permission Module"
            PM[Permission Manager]
            PV[Permission Validator]
        end
        
        subgraph "Data Module"
            US[User Service]
            CL[Command Logger]
            PS[Preference Service]
        end
        
        subgraph "Security"
            RL[Rate Limiter]
            CORS[CORS Handler]
            ENC[Encryption Service]
        end
    end
    
    subgraph "External"
        GOOGLE[Google OAuth]
        GITHUB[GitHub OAuth]
        MONGO[(MongoDB)]
    end
    
    WEB --> GW
    DSK --> GW
    GW --> REST & WS
    REST --> OA & PM & US
    WS --> SM
    OA --> GOOGLE & GITHUB
    OA --> JWT
    JWT --> SM
    PM --> PV
    US --> MONGO
    CL --> MONGO
    PS --> MONGO
    GW --> RL & CORS


## Components and Interfaces

### 1. OAuth Handler

Manages OAuth flows for Google and GitHub.

```typescript
interface OAuthConfig {
  provider: 'google' | 'github';
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scopes: string[];
}

interface OAuthResult {
  success: boolean;
  user?: OAuthUser;
  error?: string;
}

interface OAuthUser {
  providerId: string;
  provider: string;
  email: string;
  name: string;
  avatar?: string;
}

interface OAuthHandler {
  getAuthorizationUrl(provider: 'google' | 'github', state: string): string;
  handleCallback(provider: string, code: string, state: string): Promise<OAuthResult>;
  validateToken(provider: string, token: string): Promise<boolean>;
}
```

### 2. JWT Service

Handles JWT token generation and validation.

```typescript
interface JWTConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry: string;  // e.g., '15m'
  refreshTokenExpiry: string; // e.g., '7d'
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface TokenPayload {
  userId: string;
  email: string;
  permissions: string[];
  iat: number;
  exp: number;
}

interface JWTService {
  generateTokenPair(user: User): TokenPair;
  verifyAccessToken(token: string): TokenPayload | null;
  verifyRefreshToken(token: string): TokenPayload | null;
  rotateRefreshToken(oldRefreshToken: string): TokenPair | null;
  invalidateRefreshToken(token: string): Promise<void>;
}
```

### 3. Session Manager

Manages user sessions and WebSocket connections.

```typescript
interface Session {
  sessionId: string;
  userId: string;
  refreshToken: string;
  deviceInfo: DeviceInfo;
  createdAt: Date;
  lastActivityAt: Date;
  isActive: boolean;
}

interface DeviceInfo {
  type: 'web' | 'desktop';
  userAgent: string;
  ip: string;
}

interface SessionData {
  userId: string;
  permissions: string[];
  preferences: UserPreferences;
}

interface SessionManager {
  createSession(userId: string, deviceInfo: DeviceInfo): Promise<Session>;
  getSession(sessionId: string): Promise<Session | null>;
  updateActivity(sessionId: string): Promise<void>;
  invalidateSession(sessionId: string): Promise<void>;
  invalidateAllSessions(userId: string): Promise<void>;
  serializeSession(session: Session): string;
  deserializeSession(data: string): Session;
}
```

### 4. Permission Manager

Handles permission grants and revocations.

```typescript
interface Permission {
  id: string;
  category: string;
  action: string;
  scope: string;
  description: string;
}

interface PermissionGrant {
  permissionId: string;
  grantedAt: Date;
  grantedBy: 'user' | 'admin';
}

interface PermissionProfile {
  userId: string;
  grants: PermissionGrant[];
  updatedAt: Date;
}

interface PermissionManager {
  grantPermission(userId: string, permissionId: string): Promise<void>;
  revokePermission(userId: string, permissionId: string): Promise<void>;
  getPermissions(userId: string): Promise<Permission[]>;
  hasPermission(userId: string, permissionId: string): Promise<boolean>;
  requestPermission(userId: string, permissionId: string): Promise<void>;
  getAvailablePermissions(): Permission[];
}
```

### 5. User Service

Manages user data and preferences.

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  providerId: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

interface UserPreferences {
  language: 'en' | 'hi';
  voiceEnabled: boolean;
  wakeWord: string;
  theme: 'light' | 'dark' | 'system';
}

interface UserService {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findOrCreate(oauthUser: OAuthUser): Promise<User>;
  updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<User>;
  exportUserData(userId: string): Promise<UserDataExport>;
  deleteUser(userId: string): Promise<void>;
}

interface UserDataExport {
  user: User;
  permissions: Permission[];
  commandHistory: CommandLog[];
  exportedAt: Date;
}
```

### 6. Command Logger

Logs all executed commands for history and auditing.

```typescript
interface CommandLog {
  id: string;
  userId: string;
  command: string;
  intent: string;
  status: 'success' | 'failed' | 'cancelled';
  result?: any;
  error?: string;
  timestamp: Date;
  duration: number;
}

interface CommandQuery {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  page: number;
  pageSize: number;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface CommandLogger {
  log(entry: Omit<CommandLog, 'id'>): Promise<CommandLog>;
  query(query: CommandQuery): Promise<PaginatedResult<CommandLog>>;
  getById(id: string): Promise<CommandLog | null>;
}
```

### 7. WebSocket Server

Handles real-time communication.

```typescript
interface WSMessage {
  type: string;
  payload: any;
  timestamp: Date;
}

interface WSClient {
  clientId: string;
  userId: string;
  deviceType: 'web' | 'desktop';
  socket: WebSocket;
  connectedAt: Date;
}

interface MessageQueue {
  userId: string;
  messages: WSMessage[];
}

interface WebSocketServer {
  handleConnection(socket: WebSocket, userId: string, deviceType: string): void;
  handleDisconnection(clientId: string): void;
  broadcast(userId: string, message: WSMessage): void;
  sendToClient(clientId: string, message: WSMessage): void;
  queueMessage(userId: string, message: WSMessage): void;
  deliverQueuedMessages(userId: string): void;
  serializeMessage(message: WSMessage): string;
  deserializeMessage(data: string): WSMessage;
}
```

### 8. Security Services

Rate limiting, CORS, and encryption.

```typescript
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimiter {
  check(key: string): { allowed: boolean; remaining: number; resetAt: Date };
  reset(key: string): void;
}

interface CORSConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
}

interface EncryptionService {
  encrypt(data: string): string;
  decrypt(ciphertext: string): string;
  hash(data: string): string;
  verify(data: string, hash: string): boolean;
}

interface RequestLogger {
  log(request: any, response: any): void;
  sanitize(data: any): any;  // Remove sensitive fields
}
```

## Data Models

### MongoDB Schemas

```typescript
// User Schema
interface UserDocument {
  _id: ObjectId;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  providerId: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

// Permission Profile Schema
interface PermissionProfileDocument {
  _id: ObjectId;
  userId: ObjectId;
  grants: PermissionGrant[];
  updatedAt: Date;
}

// Session Schema
interface SessionDocument {
  _id: ObjectId;
  userId: ObjectId;
  refreshToken: string;
  deviceInfo: DeviceInfo;
  createdAt: Date;
  lastActivityAt: Date;
  isActive: boolean;
}

// Command Log Schema
interface CommandLogDocument {
  _id: ObjectId;
  userId: ObjectId;
  command: string;
  intent: string;
  status: string;
  result?: any;
  error?: string;
  timestamp: Date;
  duration: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: OAuth Redirect URL Generation
*For any* OAuth provider (Google or GitHub), the generated authorization URL SHALL contain the correct client ID, callback URL, and requested scopes.
**Validates: Requirements 1.1, 1.2**

### Property 2: Successful Auth Token Issuance
*For any* successful OAuth authentication, the system SHALL issue both a valid JWT access token and a refresh token.
**Validates: Requirements 1.4**

### Property 3: Failed Auth Error Response
*For any* failed OAuth authentication, the system SHALL return an error response with appropriate message and NOT issue any tokens.
**Validates: Requirements 1.5**

### Property 4: Refresh Token Rotation
*For any* valid refresh token used to obtain a new access token, the system SHALL issue a new refresh token AND invalidate the old one.
**Validates: Requirements 2.1, 2.4**

### Property 5: Logout Token Invalidation
*For any* logout request, the associated refresh token SHALL be invalidated and subsequent use SHALL be rejected.
**Validates: Requirements 2.2**

### Property 6: JWT Validation on Protected Endpoints
*For any* request to a protected endpoint, the system SHALL verify the JWT signature and expiration BEFORE processing the request.
**Validates: Requirements 2.3**

### Property 7: Session Serialization Round-Trip
*For any* Session object, serializing to JSON and deserializing back SHALL produce an equivalent Session with all fields preserved.
**Validates: Requirements 2.5**

### Property 8: Permission Grant Persistence
*For any* permission grant, after storing, querying the user's permissions SHALL include the granted permission.
**Validates: Requirements 3.2**

### Property 9: Permission Revocation Completeness
*For any* permission revocation, after removal, querying the user's permissions SHALL NOT include the revoked permission.
**Validates: Requirements 3.3**

### Property 10: Permission Query Completeness
*For any* user with granted permissions, querying permissions SHALL return ALL granted permissions, not a subset.
**Validates: Requirements 3.4**

### Property 11: Preference Persistence
*For any* preference update, after storing, retrieving the user's preferences SHALL reflect the updated values.
**Validates: Requirements 4.1**

### Property 12: Command Log Entry Completeness
*For any* logged command, the entry SHALL contain userId, timestamp, status, and command text.
**Validates: Requirements 4.2**

### Property 13: Command History Date Range Filtering
*For any* command history query with date range, all returned entries SHALL have timestamps within the specified range.
**Validates: Requirements 4.3**

### Property 14: User Data Export Completeness
*For any* data export request, the export SHALL include user profile, all permissions, and complete command history.
**Validates: Requirements 4.4**

### Property 15: Permission Change Broadcast
*For any* permission change (grant or revoke), all connected WebSocket clients for that user SHALL receive a notification.
**Validates: Requirements 5.2**

### Property 16: Message Queue Delivery
*For any* messages queued during disconnection, upon reconnection all queued messages SHALL be delivered in order.
**Validates: Requirements 5.4**

### Property 17: WebSocket Message Format
*For any* WebSocket message, the serialized format SHALL be valid JSON containing type, payload, and timestamp fields.
**Validates: Requirements 5.5**

### Property 18: Unauthenticated Request Rejection
*For any* request to a protected endpoint without valid authentication, the system SHALL return 401 Unauthorized.
**Validates: Requirements 6.1**

### Property 19: Rate Limit Enforcement
*For any* client exceeding the configured rate limit, subsequent requests SHALL receive 429 Too Many Requests until the window resets.
**Validates: Requirements 6.2**

### Property 20: Sensitive Data Exclusion from Logs
*For any* API request log entry, sensitive fields (tokens, passwords, secrets) SHALL NOT appear in the log.
**Validates: Requirements 6.4**

### Property 21: CORS Origin Validation
*For any* request from a non-whitelisted origin, the system SHALL reject the request with appropriate CORS error.
**Validates: Requirements 6.5**

## Error Handling

| Error Type | HTTP Status | Handling Strategy |
|------------|-------------|-------------------|
| Invalid OAuth code | 401 | Return error, redirect to login |
| Expired access token | 401 | Client should use refresh token |
| Invalid refresh token | 401 | Force re-authentication |
| Permission denied | 403 | Return missing permission info |
| User not found | 404 | Return appropriate message |
| Rate limit exceeded | 429 | Return retry-after header |
| Database error | 500 | Log error, return generic message |
| WebSocket error | - | Attempt reconnection, queue messages |

## Testing Strategy

### Property-Based Testing Library
- **TypeScript**: fast-check

### Unit Tests
- JWT token generation and validation
- OAuth URL construction
- Permission matching logic
- Rate limit calculations
- Message serialization

### Property-Based Tests
Each correctness property above will be implemented as a property-based test using fast-check:
- Generate random valid inputs (users, permissions, tokens, messages)
- Verify the property holds across 100+ iterations
- Tag each test with: `**Feature: dev-auth-backend, Property {N}: {description}**`

### Integration Tests
- Full OAuth flow with mock providers
- Session lifecycle management
- Permission grant/revoke flows
- WebSocket connection and messaging
- Rate limiting behavior
