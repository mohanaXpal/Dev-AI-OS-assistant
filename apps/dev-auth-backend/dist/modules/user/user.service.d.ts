/**
 * User Service - User management and storage
 * Requirements 4.1, 4.2: User data storage and management
 */
import { User, UserPreferences, OAuthProfile } from '../../common/interfaces';
export declare class UserService {
    private users;
    private emailIndex;
    /**
     * Find user by ID
     * Requirement 8.1: Implement findById()
     */
    findById(userId: string): User | null;
    /**
     * Find user by email
     * Requirement 8.1: Implement findByEmail()
     */
    findByEmail(email: string): User | null;
    /**
     * Find or create user from OAuth profile
     * Requirement 8.1: Implement findOrCreate()
     */
    findOrCreate(profile: OAuthProfile): User;
    /**
     * Update user preferences
     * Requirement 8.1: Implement updatePreferences() with immediate persistence
     */
    updatePreferences(userId: string, preferences: Partial<UserPreferences>): User | null;
    /**
     * Update user data
     */
    update(userId: string, updates: Partial<User>): User | null;
    /**
     * Log command execution
     * Requirement 4.2: Log the command with timestamp, status, and user ID
     */
    logCommand(userId: string, command: string, intent: string, status: string): void;
    /**
     * Export user data
     * Requirement 4.4: Generate a complete export of their data
     */
    exportUserData(userId: string): object | null;
    /**
     * Delete user
     * Requirement 4.5: Remove all user data
     */
    deleteUser(userId: string): boolean;
    /**
     * Serialize user to JSON
     */
    serializeUser(user: User): string;
}
//# sourceMappingURL=user.service.d.ts.map