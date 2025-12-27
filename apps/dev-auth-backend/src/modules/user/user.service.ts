/**
 * User Service - User management and storage (MongoDB)
 * Requirements 4.1, 4.2: User data storage and management
 */

import UserMongoose, { IUser } from '../../models/User';
import CommandLogMongoose, { ICommandLog } from '../../models/CommandLog';
import { User, UserPreferences, OAuthProfile } from '../../common/interfaces';

export class UserService {

  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<IUser | null> {
    return await UserMongoose.findOne({ _id: userId }) || UserMongoose.findOne({ googleId: userId });
  }

  /**
   * Alias for findById (Used in main.ts)
   */
  async getUserById(userId: string): Promise<IUser | null> {
    return this.findById(userId);
  }

  /**
   * Update User
   */
  async updateUser(userId: string, data: Partial<IUser>): Promise<IUser | null> {
    return await UserMongoose.findByIdAndUpdate(userId, data, { new: true });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return await UserMongoose.findOne({ email });
  }

  /**
   * Find or create user from OAuth profile
   */
  async findOrCreate(profile: OAuthProfile): Promise<IUser> {
    // Check if user exists by email
    let user = await this.findByEmail(profile.email);

    if (!user) {
      console.log(`👤 Creating new user for: ${profile.email}`);
      // Create new user
      user = new UserMongoose({
        name: profile.name,
        email: profile.email,
        googleId: profile.provider === 'google' ? profile.id : undefined,
        avatar: profile.avatar,
        preferences: {
          theme: 'dark',
          voiceName: 'Dev',
          notifications: true
        }
      });
      await user.save();
    } else {
      // Update existing user
      let updated = false;
      if (profile.provider === 'google' && !user.googleId) {
        user.googleId = profile.id;
        updated = true;
      }
      if (profile.avatar && user.avatar !== profile.avatar) {
        user.avatar = profile.avatar;
        updated = true;
      }

      if (updated) await user.save();
    }

    return user;
  }

  /**
   * Log command execution to MongoDB
   */
  async logCommand(userId: string, command: string, intent: string, status: 'success' | 'failed' | 'pending', result?: any): Promise<void> {
    try {
      await CommandLogMongoose.create({
        userId,
        command,
        intent,
        status,
        result
      });
      console.log(`📝 Logged command for ${userId}: ${command}`);
    } catch (error) {
      console.error('Failed to log command:', error);
    }
  }

  /**
   * Get command history for a user
   */
  async getCommandHistory(userId: string, limit: number = 10): Promise<ICommandLog[]> {
    try {
      return await CommandLogMongoose.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('Failed to get command history:', error);
      return [];
    }
  }

  /**
   * Export user data
   */
  async exportUserData(userId: string): Promise<object | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    const logs = await CommandLogMongoose.find({ userId }).sort({ createdAt: -1 }).limit(100);

    return {
      user: user.toObject(),
      logs: logs,
      exportedAt: new Date().toISOString()
    };
  }

  async clearCommandHistory(userId: string): Promise<void> {
    await CommandLogMongoose.deleteMany({ userId });
  }
}

export const userService = new UserService();
