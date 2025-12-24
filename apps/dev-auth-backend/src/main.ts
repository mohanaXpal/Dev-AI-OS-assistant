/**
 * Main Application Entry Point
 * Dev Auth Backend System
 */

import { JWTService } from './modules/auth/jwt.service';
import { OAuthHandler } from './modules/auth/oauth.handler';
import { SessionManager } from './modules/session/session.manager';
import { PermissionManager } from './modules/permission/permission.manager';
import { UserService } from './modules/user/user.service';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

/**
 * Initialize all services
 */
export function initializeServices() {
  // Initialize JWT Service
  const jwtService = new JWTService(
    process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret'
  );

  // Initialize OAuth Handler
  const oauthHandler = new OAuthHandler(
    process.env.GOOGLE_CLIENT_ID || 'google-client-id',
    process.env.GOOGLE_CLIENT_SECRET || 'google-client-secret',
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
    process.env.GITHUB_CLIENT_ID || 'github-client-id',
    process.env.GITHUB_CLIENT_SECRET || 'github-client-secret',
    process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/github/callback'
  );

  // Initialize Session Manager
  const sessionManager = new SessionManager();

  // Initialize Permission Manager
  const permissionManager = new PermissionManager();

  // Initialize User Service
  const userService = new UserService();

  return {
    jwtService,
    oauthHandler,
    sessionManager,
    permissionManager,
    userService
  };
}

/**
 * Example workflow: User login flow
 */
export async function exampleLoginFlow() {
  const services = initializeServices();

  console.log('=== Dev Auth Backend Example Flow ===\n');

  // Step 1: OAuth - User authenticates with Google
  console.log('Step 1: User initiates Google OAuth login');
  const googleAuthUrl = services.oauthHandler.generateGoogleAuthUrl('state-123');
  console.log('Google Auth URL:', googleAuthUrl, '\n');

  // Step 2: Handle OAuth callback
  console.log('Step 2: Handle Google OAuth callback');
  const oauthProfile = await services.oauthHandler.handleGoogleCallback('auth-code-123');
  console.log('OAuth Profile:', oauthProfile, '\n');

  // Step 3: Create or find user
  console.log('Step 3: Create or find user from OAuth profile');
  const user = services.userService.findOrCreate(oauthProfile);
  console.log('User created:', user.id, user.email, '\n');

  // Step 4: Generate tokens
  console.log('Step 4: Generate JWT token pair');
  const tokenPair = services.jwtService.generateTokenPair(user.id, user.email, 'session-1');
  console.log('Access Token:', tokenPair.accessToken.substring(0, 20) + '...');
  console.log('Refresh Token:', tokenPair.refreshToken.substring(0, 20) + '...\n');

  // Step 5: Create session
  console.log('Step 5: Create session');
  const session = services.sessionManager.createSession(user.id, tokenPair, {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    ipAddress: '192.168.1.100',
    platform: 'Windows',
    deviceName: 'Desktop PC'
  });
  console.log('Session created:', session.id, '\n');

  // Step 6: Grant permissions
  console.log('Step 6: Grant permissions to user');
  services.permissionManager.grantPermission(user.id, 'file_read');
  services.permissionManager.grantPermission(user.id, 'app_launch');
  console.log('Permissions granted:', services.permissionManager.getGrantedPermissions(user.id), '\n');

  // Step 7: Verify token
  console.log('Step 7: Verify access token');
  const payload = services.jwtService.verifyAccessToken(tokenPair.accessToken);
  console.log('Token verified for user:', payload?.email, '\n');

  // Step 8: Refresh token
  console.log('Step 8: Refresh token using refresh token');
  const refreshPayload = services.jwtService.verifyRefreshToken(tokenPair.refreshToken);
  if (refreshPayload) {
    const newTokenPair = services.jwtService.generateTokenPair(
      refreshPayload.sub,
      refreshPayload.email,
      refreshPayload.sessionId
    );
    console.log('New access token issued:', newTokenPair.accessToken.substring(0, 20) + '...\n');
  }

  // Step 9: Update user preferences
  console.log('Step 9: Update user preferences');
  services.userService.updatePreferences(user.id, {
    language: 'hi',
    theme: 'dark'
  });
  const updatedUser = services.userService.findById(user.id);
  console.log('User preferences updated:', updatedUser?.preferences, '\n');

  // Step 10: Export user data
  console.log('Step 10: Export user data');
  const exportedData = services.userService.exportUserData(user.id);
  console.log('User data exported:', JSON.stringify(exportedData, null, 2), '\n');

  console.log('=== Example Flow Complete ===');
}

// Run example if this is the main module
if (require.main === module) {
  exampleLoginFlow().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

export { JWTService, OAuthHandler, SessionManager, PermissionManager, UserService };
