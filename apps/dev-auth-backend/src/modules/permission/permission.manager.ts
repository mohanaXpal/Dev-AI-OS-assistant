/**
 * Permission Manager - User permission grants and revocations
 * Requirements 3.1-3.4: Permission management
 */

import { PermissionGrant } from '../../common/interfaces';

export class PermissionManager {
  private permissions: Map<string, PermissionGrant> = new Map();
  private permissionChangeListeners: Map<string, Function[]> = new Map(); // userId -> listeners

  /**
   * Grant a permission to user
   * Requirement 3.2: Store the grant in the user's permission profile
   */
  grantPermission(userId: string, permission: string): PermissionGrant {
    const key = `${userId}:${permission}`;

    const grant: PermissionGrant = {
      userId,
      permission,
      granted: true,
      grantedAt: new Date()
    };

    this.permissions.set(key, grant);

    // Notify listeners
    this.notifyListeners(userId, {
      type: 'permission_granted',
      permission,
      timestamp: grant.grantedAt
    });

    return grant;
  }

  /**
   * Revoke a permission from user
   * Requirement 3.3: Remove the grant and notify connected clients
   */
  revokePermission(userId: string, permission: string): boolean {
    const key = `${userId}:${permission}`;
    const grant = this.permissions.get(key);

    if (!grant) {
      return false;
    }

    grant.granted = false;
    grant.revokedAt = new Date();
    this.permissions.set(key, grant);

    // Notify listeners
    this.notifyListeners(userId, {
      type: 'permission_revoked',
      permission,
      timestamp: grant.revokedAt
    });

    return true;
  }

  /**
   * Query all permissions for a user
   * Requirement 3.4: Return the user's complete permission set
   */
  getPermissions(userId: string): PermissionGrant[] {
    return Array.from(this.permissions.values()).filter(p => p.userId === userId);
  }

  /**
   * Check if user has permission
   * Requirement 3.1: Validate the action against user's permission whitelist
   */
  hasPermission(userId: string, permission: string): boolean {
    const key = `${userId}:${permission}`;
    const grant = this.permissions.get(key);
    return grant ? grant.granted : false;
  }

  /**
   * Get granted permissions
   */
  getGrantedPermissions(userId: string): string[] {
    return this.getPermissions(userId)
      .filter(p => p.granted)
      .map(p => p.permission);
  }

  /**
   * Register listener for permission changes
   */
  onPermissionChange(userId: string, listener: Function): void {
    if (!this.permissionChangeListeners.has(userId)) {
      this.permissionChangeListeners.set(userId, []);
    }
    this.permissionChangeListeners.get(userId)!.push(listener);
  }

  /**
   * Notify listeners of permission changes
   */
  private notifyListeners(userId: string, event: any): void {
    const listeners = this.permissionChangeListeners.get(userId) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error notifying permission listener:', error);
      }
    });
  }

  /**
   * Serialize permissions to JSON
   */
  serializePermissions(userId: string): string {
    const userPerms = this.getPermissions(userId);
    return JSON.stringify(userPerms);
  }

  /**
   * Deserialize permissions from JSON
   */
  deserializePermissions(json: string): PermissionGrant[] {
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  }
}
