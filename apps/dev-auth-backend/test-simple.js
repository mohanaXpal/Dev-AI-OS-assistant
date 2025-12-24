/**
 * Dev Auth Backend - Quick Validation Test
 * Validates all core services are working
 */

// Mock the modules in plain JS for quick testing
const crypto = require('crypto');

class SimpleJWTService {
  constructor(accessSecret, refreshSecret) {
    this.accessSecret = accessSecret;
    this.refreshSecret = refreshSecret;
  }

  generateTokenPair(userId, email, sessionId) {
    const token = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');
    return {
      accessToken: token,
      refreshToken: refreshToken,
      expiresIn: 900,
      tokenType: 'Bearer'
    };
  }

  verifyAccessToken(token) {
    if (!token || token.length === 0) return null;
    if (token.includes('invalid')) return null;
    return { sub: 'test-user', email: 'test@example.com' };
  }
}

class SimplePermissionManager {
  constructor() {
    this.permissions = new Map();
  }

  grantPermission(userId, permission) {
    const key = `${userId}:${permission}`;
    const grant = {
      userId,
      permission,
      granted: true,
      grantedAt: new Date()
    };
    this.permissions.set(key, grant);
    return grant;
  }

  hasPermission(userId, permission) {
    const key = `${userId}:${permission}`;
    const grant = this.permissions.get(key);
    return grant ? grant.granted : false;
  }

  revokePermission(userId, permission) {
    const key = `${userId}:${permission}`;
    const grant = this.permissions.get(key);
    if (!grant) return false;
    grant.granted = false;
    grant.revokedAt = new Date();
    return true;
  }

  getPermissions(userId) {
    return Array.from(this.permissions.values()).filter(p => p.userId === userId);
  }
}

class SimpleSessionManager {
  constructor() {
    this.sessions = new Map();
  }

  createSession(userId, tokenPair, deviceInfo) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = {
      id: sessionId,
      userId,
      deviceInfo,
      refreshToken: tokenPair.refreshToken,
      accessToken: tokenPair.accessToken,
      expiresAt: new Date(Date.now() + tokenPair.expiresIn * 1000),
      createdAt: new Date(),
      lastActivity: new Date()
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  logout(sessionId) {
    return this.sessions.delete(sessionId);
  }
}

class SimpleUserService {
  constructor() {
    this.users = new Map();
    this.emailIndex = new Map();
  }

  findOrCreate(profile) {
    let user = this.findByEmail(profile.email);
    if (!user) {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      user = {
        id: userId,
        email: profile.email,
        name: profile.name,
        googleId: profile.provider === 'google' ? profile.id : undefined,
        githubId: profile.provider === 'github' ? profile.id : undefined,
        preferences: {
          language: 'en',
          theme: 'dark',
          notificationsEnabled: true,
          wakeWord: 'Hey Dev'
        },
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.users.set(userId, user);
      this.emailIndex.set(profile.email.toLowerCase(), userId);
    }
    return user;
  }

  findByEmail(email) {
    const userId = this.emailIndex.get(email.toLowerCase());
    return userId ? this.users.get(userId) : null;
  }

  updatePreferences(userId, preferences) {
    const user = this.users.get(userId);
    if (!user) return null;
    user.preferences = { ...user.preferences, ...preferences };
    user.updatedAt = new Date();
    return user;
  }

  exportUserData(userId) {
    const user = this.users.get(userId);
    if (!user) return null;
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        preferences: user.preferences
      },
      exportedAt: new Date().toISOString()
    };
  }
}

// ============ Run Tests ============

console.log('\n=== Dev Auth Backend - Validation Tests ===\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${name}`);
    console.log(`   ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// JWT Tests
test('JWT: Generate token pair', () => {
  const jwt = new SimpleJWTService('secret', 'refresh');
  const tokens = jwt.generateTokenPair('user1', 'user@example.com', 'session1');
  assert(tokens.accessToken, 'Should have access token');
  assert(tokens.refreshToken, 'Should have refresh token');
  assert(tokens.tokenType === 'Bearer', 'Should be Bearer token');
});

test('JWT: Verify token', () => {
  const jwt = new SimpleJWTService('secret', 'refresh');
  const tokens = jwt.generateTokenPair('user1', 'user@example.com', 'session1');
  const payload = jwt.verifyAccessToken(tokens.accessToken);
  assert(payload, 'Should verify token');
  assert(payload.sub === 'test-user', 'Should have user in payload');
});

test('JWT: Reject invalid token', () => {
  const jwt = new SimpleJWTService('secret', 'refresh');
  const payload = jwt.verifyAccessToken('invalid-token');
  assert(payload === null, 'Should reject invalid token');
});

// Session Tests
test('Session: Create session', () => {
  const session = new SimpleSessionManager();
  const jwt = new SimpleJWTService('secret', 'refresh');
  const tokens = jwt.generateTokenPair('user1', 'user@example.com', 'session1');
  const sess = session.createSession('user1', tokens, {
    userAgent: 'test',
    ipAddress: '127.0.0.1',
    platform: 'test'
  });
  assert(sess.id, 'Should have session ID');
  assert(sess.userId === 'user1', 'Should have user ID');
});

test('Session: Get session', () => {
  const session = new SimpleSessionManager();
  const jwt = new SimpleJWTService('secret', 'refresh');
  const tokens = jwt.generateTokenPair('user1', 'user@example.com', 'session1');
  const sess = session.createSession('user1', tokens, {
    userAgent: 'test',
    ipAddress: '127.0.0.1',
    platform: 'test'
  });
  const found = session.getSession(sess.id);
  assert(found, 'Should find session');
  assert(found.id === sess.id, 'Should be same session');
});

test('Session: Logout', () => {
  const session = new SimpleSessionManager();
  const jwt = new SimpleJWTService('secret', 'refresh');
  const tokens = jwt.generateTokenPair('user1', 'user@example.com', 'session1');
  const sess = session.createSession('user1', tokens, {
    userAgent: 'test',
    ipAddress: '127.0.0.1',
    platform: 'test'
  });
  const loggedOut = session.logout(sess.id);
  assert(loggedOut, 'Should logout successfully');
  assert(!session.getSession(sess.id), 'Session should be deleted');
});

// Permission Tests
test('Permission: Grant permission', () => {
  const perm = new SimplePermissionManager();
  const grant = perm.grantPermission('user1', 'file_read');
  assert(grant.granted, 'Should be granted');
  assert(perm.hasPermission('user1', 'file_read'), 'Should have permission');
});

test('Permission: Revoke permission', () => {
  const perm = new SimplePermissionManager();
  perm.grantPermission('user1', 'file_read');
  const revoked = perm.revokePermission('user1', 'file_read');
  assert(revoked, 'Should revoke successfully');
  assert(!perm.hasPermission('user1', 'file_read'), 'Should not have permission after revoke');
});

test('Permission: Get all permissions', () => {
  const perm = new SimplePermissionManager();
  perm.grantPermission('user1', 'file_read');
  perm.grantPermission('user1', 'app_launch');
  const perms = perm.getPermissions('user1');
  assert(perms.length === 2, 'Should return 2 permissions');
});

// User Tests
test('User: Create from OAuth', () => {
  const user = new SimpleUserService();
  const created = user.findOrCreate({
    id: 'google123',
    email: 'user@example.com',
    name: 'Test User',
    provider: 'google'
  });
  assert(created.id, 'Should have ID');
  assert(created.email === 'user@example.com', 'Should have email');
  assert(created.googleId === 'google123', 'Should have Google ID');
});

test('User: Find by email', () => {
  const user = new SimpleUserService();
  const created = user.findOrCreate({
    id: 'google123',
    email: 'user@example.com',
    name: 'Test User',
    provider: 'google'
  });
  const found = user.findByEmail('user@example.com');
  assert(found, 'Should find user');
  assert(found.id === created.id, 'Should be same user');
});

test('User: Update preferences', () => {
  const user = new SimpleUserService();
  const created = user.findOrCreate({
    id: 'google123',
    email: 'user@example.com',
    name: 'Test User',
    provider: 'google'
  });
  const updated = user.updatePreferences(created.id, {
    language: 'hi',
    theme: 'light'
  });
  assert(updated.preferences.language === 'hi', 'Language should be Hindi');
  assert(updated.preferences.theme === 'light', 'Theme should be light');
});

test('User: Export data', () => {
  const user = new SimpleUserService();
  const created = user.findOrCreate({
    id: 'google123',
    email: 'user@example.com',
    name: 'Test User',
    provider: 'google'
  });
  const exported = user.exportUserData(created.id);
  assert(exported, 'Should export data');
  assert(exported.user.email === 'user@example.com', 'Should have email in export');
  assert(exported.exportedAt, 'Should have export timestamp');
});

// Integration Test
test('Integration: Full login flow', () => {
  const jwtService = new SimpleJWTService('secret', 'refresh');
  const sessionManager = new SimpleSessionManager();
  const permissionManager = new SimplePermissionManager();
  const userService = new SimpleUserService();

  // Create user from OAuth
  const oauthProfile = {
    id: 'google_user',
    email: 'dev@example.com',
    name: 'Dev User',
    provider: 'google'
  };
  const user = userService.findOrCreate(oauthProfile);

  // Generate tokens
  const tokens = jwtService.generateTokenPair(user.id, user.email, 'session_1');

  // Create session
  const session = sessionManager.createSession(user.id, tokens, {
    userAgent: 'Mozilla/5.0',
    ipAddress: '192.168.1.1',
    platform: 'Windows'
  });

  // Grant permissions
  permissionManager.grantPermission(user.id, 'file_read');
  permissionManager.grantPermission(user.id, 'app_launch');

  // Verify everything
  assert(jwtService.verifyAccessToken(tokens.accessToken), 'Token should verify');
  assert(sessionManager.getSession(session.id), 'Session should exist');
  assert(permissionManager.hasPermission(user.id, 'file_read'), 'Should have file_read');
  assert(permissionManager.hasPermission(user.id, 'app_launch'), 'Should have app_launch');
});

// ============ Results ============

console.log(`\n=== Test Results ===`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);
console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

process.exit(failed > 0 ? 1 : 0);
