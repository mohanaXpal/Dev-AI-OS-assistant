/**
 * Main Application Entry Point
 * Dev Auth Backend System
 */
import { JWTService } from './modules/auth/jwt.service';
import { OAuthHandler } from './modules/auth/oauth.handler';
import { SessionManager } from './modules/session/session.manager';
import { PermissionManager } from './modules/permission/permission.manager';
import { UserService } from './modules/user/user.service';
/**
 * Initialize all services
 */
export declare function initializeServices(): {
    jwtService: JWTService;
    oauthHandler: OAuthHandler;
    sessionManager: SessionManager;
    permissionManager: PermissionManager;
    userService: UserService;
};
/**
 * Example workflow: User login flow
 */
export declare function exampleLoginFlow(): Promise<void>;
export { JWTService, OAuthHandler, SessionManager, PermissionManager, UserService };
//# sourceMappingURL=main.d.ts.map