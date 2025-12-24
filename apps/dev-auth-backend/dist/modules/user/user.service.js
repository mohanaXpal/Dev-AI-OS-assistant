"use strict";
/**
 * User Service - User management and storage
 * Requirements 4.1, 4.2: User data storage and management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
class UserService {
    constructor() {
        this.users = new Map();
        this.emailIndex = new Map(); // email -> userId
    }
    /**
     * Find user by ID
     * Requirement 8.1: Implement findById()
     */
    findById(userId) {
        return this.users.get(userId) || null;
    }
    /**
     * Find user by email
     * Requirement 8.1: Implement findByEmail()
     */
    findByEmail(email) {
        const userId = this.emailIndex.get(email.toLowerCase());
        if (!userId)
            return null;
        return this.users.get(userId) || null;
    }
    /**
     * Find or create user from OAuth profile
     * Requirement 8.1: Implement findOrCreate()
     */
    findOrCreate(profile) {
        // Check if user exists by email
        let user = this.findByEmail(profile.email);
        if (!user) {
            // Create new user
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
        else {
            // Update OAuth ID if provider matches
            if (profile.provider === 'google' && !user.googleId) {
                user.googleId = profile.id;
            }
            if (profile.provider === 'github' && !user.githubId) {
                user.githubId = profile.id;
            }
            user.updatedAt = new Date();
        }
        return user;
    }
    /**
     * Update user preferences
     * Requirement 8.1: Implement updatePreferences() with immediate persistence
     */
    updatePreferences(userId, preferences) {
        const user = this.findById(userId);
        if (!user)
            return null;
        user.preferences = {
            ...user.preferences,
            ...preferences
        };
        user.updatedAt = new Date();
        return user;
    }
    /**
     * Update user data
     */
    update(userId, updates) {
        const user = this.findById(userId);
        if (!user)
            return null;
        Object.assign(user, updates, { updatedAt: new Date() });
        return user;
    }
    /**
     * Log command execution
     * Requirement 4.2: Log the command with timestamp, status, and user ID
     */
    logCommand(userId, command, intent, status) {
        const user = this.findById(userId);
        if (!user)
            return;
        // In production, this would be stored in MongoDB CommandLog collection
        console.log(`[CommandLog] ${userId}: ${command} (${intent}) - ${status}`);
    }
    /**
     * Export user data
     * Requirement 4.4: Generate a complete export of their data
     */
    exportUserData(userId) {
        const user = this.findById(userId);
        if (!user)
            return null;
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                preferences: user.preferences,
                permissions: user.permissions,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            exportedAt: new Date().toISOString()
        };
    }
    /**
     * Delete user
     * Requirement 4.5: Remove all user data
     */
    deleteUser(userId) {
        const user = this.findById(userId);
        if (!user)
            return false;
        this.emailIndex.delete(user.email.toLowerCase());
        return this.users.delete(userId);
    }
    /**
     * Serialize user to JSON
     */
    serializeUser(user) {
        return JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            preferences: user.preferences,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString()
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map