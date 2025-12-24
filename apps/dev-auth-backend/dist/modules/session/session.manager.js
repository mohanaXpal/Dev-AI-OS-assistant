"use strict";
/**
 * Session Manager - User session lifecycle management
 * Requirements 2.1, 2.2, 2.5: Session management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
class SessionManager {
    constructor() {
        this.sessions = new Map();
    }
    /**
     * Create a new session
     * Requirement 2.1: Implement createSession() with device info
     */
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
    /**
     * Get session by ID
     * Requirement 2.1: Implement getSession()
     */
    getSession(sessionId) {
        return this.sessions.get(sessionId) || null;
    }
    /**
     * Update session last activity timestamp
     * Requirement 2.1: Implement updateActivity()
     */
    updateActivity(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return false;
        }
        session.lastActivity = new Date();
        return true;
    }
    /**
     * Logout - invalidate session
     * Requirement 2.2: Invalidate refresh token and clear session
     */
    logout(sessionId) {
        return this.sessions.delete(sessionId);
    }
    /**
     * Get all sessions for a user
     */
    getUserSessions(userId) {
        return Array.from(this.sessions.values()).filter(s => s.userId === userId);
    }
    /**
     * Serialize session to JSON
     * Requirement 2.5: JSON encode/decode for secure storage
     */
    serializeSession(session) {
        return JSON.stringify({
            id: session.id,
            userId: session.userId,
            deviceInfo: session.deviceInfo,
            expiresAt: session.expiresAt.toISOString(),
            createdAt: session.createdAt.toISOString(),
            lastActivity: session.lastActivity.toISOString()
        });
    }
    /**
     * Deserialize session from JSON
     * Requirement 2.5: JSON encode/decode for secure storage
     */
    deserializeSession(json) {
        try {
            const data = JSON.parse(json);
            return {
                id: data.id,
                userId: data.userId,
                deviceInfo: data.deviceInfo,
                refreshToken: '', // Not stored in serialized form for security
                accessToken: '',
                expiresAt: new Date(data.expiresAt),
                createdAt: new Date(data.createdAt),
                lastActivity: new Date(data.lastActivity)
            };
        }
        catch {
            return null;
        }
    }
    /**
     * Invalidate all sessions for a user
     */
    invalidateAllUserSessions(userId) {
        const sessionsToDelete = Array.from(this.sessions.entries())
            .filter(([, session]) => session.userId === userId)
            .map(([id]) => id);
        sessionsToDelete.forEach(id => this.sessions.delete(id));
        return sessionsToDelete.length;
    }
}
exports.SessionManager = SessionManager;
//# sourceMappingURL=session.manager.js.map