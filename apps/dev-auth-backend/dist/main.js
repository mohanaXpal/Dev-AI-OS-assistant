"use strict";
/**
 * Main Application Entry Point
 * Dev Auth Backend System
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = exports.PermissionManager = exports.SessionManager = exports.OAuthHandler = exports.JWTService = void 0;
exports.initializeServices = initializeServices;
exports.exampleLoginFlow = exampleLoginFlow;
const jwt_service_1 = require("./modules/auth/jwt.service");
Object.defineProperty(exports, "JWTService", { enumerable: true, get: function () { return jwt_service_1.JWTService; } });
const oauth_handler_1 = require("./modules/auth/oauth.handler");
Object.defineProperty(exports, "OAuthHandler", { enumerable: true, get: function () { return oauth_handler_1.OAuthHandler; } });
const session_manager_1 = require("./modules/session/session.manager");
Object.defineProperty(exports, "SessionManager", { enumerable: true, get: function () { return session_manager_1.SessionManager; } });
const permission_manager_1 = require("./modules/permission/permission.manager");
Object.defineProperty(exports, "PermissionManager", { enumerable: true, get: function () { return permission_manager_1.PermissionManager; } });
const user_service_1 = require("./modules/user/user.service");
Object.defineProperty(exports, "UserService", { enumerable: true, get: function () { return user_service_1.UserService; } });
// Load environment variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Initialize all services
 */
function initializeServices() {
    // Initialize JWT Service
    const jwtService = new jwt_service_1.JWTService(process.env.JWT_ACCESS_SECRET || 'dev-access-secret', process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret');
    // Initialize OAuth Handler
    const oauthHandler = new oauth_handler_1.OAuthHandler(process.env.GOOGLE_CLIENT_ID || 'google-client-id', process.env.GOOGLE_CLIENT_SECRET || 'google-client-secret', process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback', process.env.GITHUB_CLIENT_ID || 'github-client-id', process.env.GITHUB_CLIENT_SECRET || 'github-client-secret', process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/github/callback');
    // Initialize Session Manager
    const sessionManager = new session_manager_1.SessionManager();
    // Initialize Permission Manager
    const permissionManager = new permission_manager_1.PermissionManager();
    // Initialize User Service
    const userService = new user_service_1.UserService();
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
async function exampleLoginFlow() {
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
        const newTokenPair = services.jwtService.generateTokenPair(refreshPayload.sub, refreshPayload.email, refreshPayload.sessionId);
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
//# sourceMappingURL=main.js.map