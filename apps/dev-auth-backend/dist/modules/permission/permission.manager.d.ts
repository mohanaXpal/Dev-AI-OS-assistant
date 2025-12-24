/**
 * Permission Manager - User permission grants and revocations
 * Requirements 3.1-3.4: Permission management
 */
import { PermissionGrant } from '../../common/interfaces';
export declare class PermissionManager {
    private permissions;
    private permissionChangeListeners;
    /**
     * Grant a permission to user
     * Requirement 3.2: Store the grant in the user's permission profile
     */
    grantPermission(userId: string, permission: string): PermissionGrant;
    /**
     * Revoke a permission from user
     * Requirement 3.3: Remove the grant and notify connected clients
     */
    revokePermission(userId: string, permission: string): boolean;
    /**
     * Query all permissions for a user
     * Requirement 3.4: Return the user's complete permission set
     */
    getPermissions(userId: string): PermissionGrant[];
    /**
     * Check if user has permission
     * Requirement 3.1: Validate the action against user's permission whitelist
     */
    hasPermission(userId: string, permission: string): boolean;
    /**
     * Get granted permissions
     */
    getGrantedPermissions(userId: string): string[];
    /**
     * Register listener for permission changes
     */
    onPermissionChange(userId: string, listener: Function): void;
    /**
     * Notify listeners of permission changes
     */
    private notifyListeners;
    /**
     * Serialize permissions to JSON
     */
    serializePermissions(userId: string): string;
    /**
     * Deserialize permissions from JSON
     */
    deserializePermissions(json: string): PermissionGrant[];
}
//# sourceMappingURL=permission.manager.d.ts.map