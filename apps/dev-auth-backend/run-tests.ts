#!/usr/bin/env node

/**
 * Simple test runner for dev-auth-backend
 */

import { JWTService } from './src/modules/auth/jwt.service';
import { SessionManager } from './src/modules/session/session.manager';
import { PermissionManager } from './src/modules/permission/permission.manager';
import { UserService } from './src/modules/user/user.service';
import { OAuthHandler } from './src/modules/auth/oauth.handler';

console.log('\n=== Dev Auth Backend - Property Test Suite ===\n');

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function test(name: string, fn: () => void) {
  testsRun++;
  try {
    fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error: any) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    testsFailed++;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

// ============ Tests ============

test('JWT Service: Generate valid token pair', () => {
  const jwtService = new JWTService('secret-access', 'secret-refresh');
  const tokenPair = jwtService.generateTokenPair('user-123', 'user@example.com', 'session-1');

  assert(tokenPair.accessToken, 'Access token should exist');
  assert(tokenPair.refreshToken, 'Refresh token should exist');
  assert(tokenPair.tokenType === 'Bearer', 'Token type should be Bearer');
  assert(tokenPair.expiresIn > 0, 'Expires in should be positive');
});

test('JWT Service: Verify access token', () => {
  const jwtService = new JWTService('secret-access', 'secret-refresh');
  const tokenPair = jwtService.generateTokenPair('user-123', 'user@example.com', 'session-1');
  const payload = jwtService.verifyAccessToken(tokenPair.accessToken);

  assert(payload !== null, 'Payload should be valid');
  assert(payload!.sub === 'user-123', 'Subject should match user ID');
  assert(payload!.email === 'user@example.com', 'Email should match');
});

test('JWT Service: Reject invalid token', () => {
  const jwtService = new JWTService('secret-access', 'secret-refresh');
  const payload = jwtService.verifyAccessToken('invalid-token');

  assert(payload === null, 'Invalid token should return null');
});

test('JWT Service: Token rotation', () => {
  const jwtService = new JWTService('secret-access', 'secret-refresh');
  const tokenPair1 = jwtService.generateTokenPair('user-123', 'user@example.com', 'session-1');
  const tokenPair2 = jwtService.rotateRefreshToken('user-123', 'user@example.com', 'session-1');

  assert(tokenPair1.refreshToken !== tokenPair2.refreshToken, 'Refresh tokens should be different');
  assert(tokenPair2.accessToken, 'New access token should be issued');
});

test('Session Manager: Create session', () => {
  const sessionManager = new SessionManager();
  const jwtService = new JWTService('secret-access', 'secret-refresh');
  const tokenPair = jwtService.generateTokenPair('user-123', 'user@example.com', 'session-1');

  const session = sessionManager.createSession('user-123', tokenPair, {
    userAgent: 'Mozilla/5.0',
    ipAddress: '192.168.1.1',
    platform: 'Windows'
  });

  assert(session.id, 'Session should have ID');
  assert(session.userId === 'user-123', 'Session should have user ID');
});

test('Session Manager: Get session', () => {
  const sessionManager = new SessionManager();
  const jwtService = new JWTService('secret-access', 'secret-refresh');
  const tokenPair = jwtService.generateTokenPair('user-123', 'user@example.com', 'session-1');
  const session = sessionManager.createSession('user-123', tokenPair, {
    userAgent: 'Mozilla/5.0',
    ipAddress: '192.168.1.1',
    platform: 'Windows'
  });

  const retrieved = sessionManager.getSession(session.id);
  assert(retrieved !== null, 'Session should be retrievable');
  assert(retrieved!.id === session.id, 'Session ID should match');
});

test('Session Manager: Logout invalidates session', () => {
  const sessionManager = new SessionManager();
  const jwtService = new JWTService('secret-access', 'secret-refresh');
  const tokenPair = jwtService.generateTokenPair('user-123', 'user@example.com', 'session-1');
  const session = sessionManager.createSession('user-123', tokenPair, {
    userAgent: 'Mozilla/5.0',
    ipAddress: '192.168.1.1',
    platform: 'Windows'
  });

  const logoutSuccess = sessionManager.logout(session.id);
  assert(logoutSuccess === true, 'Logout should succeed');

  const retrieved = sessionManager.getSession(session.id);
  assert(retrieved === null, 'Session should be deleted after logout');
});

test('Session Manager: Serialize/deserialize session', () => {
  const sessionManager = new SessionManager();
  const jwtService = new JWTService('secret-access', 'secret-refresh');
  const tokenPair = jwtService.generateTokenPair('user-123', 'user@example.com', 'session-1');
  const session = sessionManager.createSession('user-123', tokenPair, {
    userAgent: 'Mozilla/5.0',
    ipAddress: '192.168.1.1',
    platform: 'Windows'
  });

  const serialized = sessionManager.serializeSession(session);
  assert(typeof serialized === 'string', 'Serialized session should be string');

  const deserialized = sessionManager.deserializeSession(serialized);
  assert(deserialized !== null, 'Should deserialize successfully');
  assert(deserialized!.id === session.id, 'Deserialized session ID should match');
});

test('Permission Manager: Grant permission', () => {
  const permissionManager = new PermissionManager();
  const grant = permissionManager.grantPermission('user-123', 'file_read');

  assert(grant.granted === true, 'Permission should be granted');
  assert(grant.grantedAt !== undefined, 'Should have grant timestamp');
  assert(permissionManager.hasPermission('user-123', 'file_read'), 'Should have permission');
});

test('Permission Manager: Revoke permission', () => {
  const permissionManager = new PermissionManager();
  permissionManager.grantPermission('user-123', 'file_read');
  const revokeSuccess = permissionManager.revokePermission('user-123', 'file_read');

  assert(revokeSuccess === true, 'Revoke should succeed');
  assert(!permissionManager.hasPermission('user-123', 'file_read'), 'Permission should be revoked');
});

test('Permission Manager: Get all permissions', () => {
  const permissionManager = new PermissionManager();
  permissionManager.grantPermission('user-123', 'file_read');
  permissionManager.grantPermission('user-123', 'app_launch');

  const perms = permissionManager.getPermissions('user-123');
  assert(perms.length === 2, 'Should return 2 permissions');
});

test('User Service: Create user from OAuth', () => {
  const userService = new UserService();
  const profile = {
    id: 'google_123',
    email: 'user@example.com',
    name: 'Test User',
    provider: 'google' as const
  };

  const user = userService.findOrCreate(profile);
  assert(user.id, 'User should have ID');
  assert(user.email === 'user@example.com', 'Email should match');
  assert(user.googleId === 'google_123', 'Google ID should be stored');
});

test('User Service: Find user by email', () => {
  const userService = new UserService();
  const profile = {
    id: 'google_123',
    email: 'user@example.com',
    name: 'Test User',
    provider: 'google' as const
  };

  const created = userService.findOrCreate(profile);
  const found = userService.findByEmail('user@example.com');

  assert(found !== null, 'User should be found');
  assert(found!.id === created.id, 'Found user ID should match');
});

test('User Service: Update preferences', () => {
  const userService = new UserService();
  const profile = {
    id: 'google_123',
    email: 'user@example.com',
    name: 'Test User',
    provider: 'google' as const
  };

  const user = userService.findOrCreate(profile);
  const updated = userService.updatePreferences(user.id, {
    language: 'hi',
    theme: 'light'
  });

  assert(updated !== null, 'Update should succeed');
  assert(updated!.preferences.language === 'hi', 'Language should be Hindi');
  assert(updated!.preferences.theme === 'light', 'Theme should be light');
});

test('User Service: Export user data', () => {
  const userService = new UserService();
  const profile = {
    id: 'google_123',
    email: 'user@example.com',
    name: 'Test User',
    provider: 'google' as const
  };

  const user = userService.findOrCreate(profile);
  const exported = userService.exportUserData(user.id);

  assert(exported !== null, 'Export should succeed');
  assert((exported as any).user.email === 'user@example.com', 'Exported data should have email');
  assert((exported as any).exportedAt, 'Should have export timestamp');
});

test('OAuth Handler: Generate Google auth URL', () => {
  const oauthHandler = new OAuthHandler(
    'google-id',
    'google-secret',
    'http://localhost:3000/auth/google/callback',
    'github-id',
    'github-secret',
    'http://localhost:3000/auth/github/callback'
  );

  const url = oauthHandler.generateGoogleAuthUrl('state-123');
  assert(url.includes('state=state-123'), 'URL should contain state');
  assert(url.includes('client_id=google-id'), 'URL should contain client ID');
  assert(url.includes('response_type=code'), 'URL should have response type');
});

test('OAuth Handler: Generate GitHub auth URL', () => {
  const oauthHandler = new OAuthHandler(
    'google-id',
    'google-secret',
    'http://localhost:3000/auth/google/callback',
    'github-id',
    'github-secret',
    'http://localhost:3000/auth/github/callback'
  );

  const url = oauthHandler.generateGithubAuthUrl('state-456');
  assert(url.includes('state=state-456'), 'URL should contain state');
  assert(url.includes('client_id=github-id'), 'URL should contain client ID');
  assert(url.includes('scope=read:user+user:email'), 'URL should have scope');
});

// ============ Results ============

console.log(`\n=== Test Results ===`);
console.log(`Total: ${testsRun}`);
console.log(`✅ Passed: ${testsPassed}`);
if (testsFailed > 0) {
  console.log(`❌ Failed: ${testsFailed}`);
}
console.log(`Success Rate: ${((testsPassed / testsRun) * 100).toFixed(1)}%\n`);

process.exit(testsFailed > 0 ? 1 : 0);
