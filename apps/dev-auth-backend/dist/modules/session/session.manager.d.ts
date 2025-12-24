/**
 * Session Manager - User session lifecycle management
 * Requirements 2.1, 2.2, 2.5: Session management
 */
import { Session, DeviceInfo, TokenPair } from '../../common/interfaces';
export declare class SessionManager {
    private sessions;
    /**
     * Create a new session
     * Requirement 2.1: Implement createSession() with device info
     */
    createSession(userId: string, tokenPair: TokenPair, deviceInfo: DeviceInfo): Session;
    /**
     * Get session by ID
     * Requirement 2.1: Implement getSession()
     */
    getSession(sessionId: string): Session | null;
    /**
     * Update session last activity timestamp
     * Requirement 2.1: Implement updateActivity()
     */
    updateActivity(sessionId: string): boolean;
    /**
     * Logout - invalidate session
     * Requirement 2.2: Invalidate refresh token and clear session
     */
    logout(sessionId: string): boolean;
    /**
     * Get all sessions for a user
     */
    getUserSessions(userId: string): Session[];
    /**
     * Serialize session to JSON
     * Requirement 2.5: JSON encode/decode for secure storage
     */
    serializeSession(session: Session): string;
    /**
     * Deserialize session from JSON
     * Requirement 2.5: JSON encode/decode for secure storage
     */
    deserializeSession(json: string): Session | null;
    /**
     * Invalidate all sessions for a user
     */
    invalidateAllUserSessions(userId: string): number;
}
//# sourceMappingURL=session.manager.d.ts.map