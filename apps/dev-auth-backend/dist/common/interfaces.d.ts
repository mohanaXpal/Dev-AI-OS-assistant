/**
 * Core TypeScript Interfaces for Dev Auth Backend
 * Requirement 1.3: Define core TypeScript interfaces
 */
export interface User {
    id: string;
    email: string;
    name: string;
    googleId?: string;
    githubId?: string;
    preferences: UserPreferences;
    permissions: Permission[];
    createdAt: Date;
    updatedAt: Date;
}
export interface UserPreferences {
    language: 'en' | 'hi';
    theme: 'light' | 'dark';
    notificationsEnabled: boolean;
    wakeWord?: string;
}
export interface Permission {
    id: string;
    name: string;
    description: string;
    granted: boolean;
    grantedAt?: Date;
    revokedAt?: Date;
}
export interface Session {
    id: string;
    userId: string;
    deviceInfo: DeviceInfo;
    refreshToken: string;
    accessToken: string;
    expiresAt: Date;
    createdAt: Date;
    lastActivity: Date;
}
export interface DeviceInfo {
    userAgent: string;
    ipAddress: string;
    platform: string;
    deviceName?: string;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
}
export interface OAuthProfile {
    id: string;
    email: string;
    name: string;
    photo?: string;
    provider: 'google' | 'github';
}
export interface CommandLog {
    id: string;
    userId: string;
    command: string;
    intent: string;
    status: 'success' | 'failed' | 'pending';
    result?: any;
    timestamp: Date;
    executionTime?: number;
}
export interface PermissionGrant {
    userId: string;
    permission: string;
    granted: boolean;
    grantedAt?: Date;
}
export interface JWTPayload {
    sub: string;
    email: string;
    iat: number;
    exp: number;
}
export interface RefreshTokenPayload extends JWTPayload {
    sessionId: string;
}
//# sourceMappingURL=interfaces.d.ts.map