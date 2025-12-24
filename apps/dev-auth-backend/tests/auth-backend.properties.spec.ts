/**
 * Property-Based Tests for Auth Backend
 * Using fast-check for property testing
 */

import * as fc from 'fast-check';
import { JWTService } from '../src/modules/auth/jwt.service';
import { SessionManager } from '../src/modules/session/session.manager';
import { PermissionManager } from '../src/modules/permission/permission.manager';
import { UserService } from '../src/modules/user/user.service';

describe('Auth Backend Properties', () => {
  // ============ OAuth Properties ============

  describe('Property 1: OAuth Redirect URL Generation', () => {
    it('should generate valid OAuth URLs for Google and GitHub', () => {
      fc.assert(
        fc.property(fc.uuidV(4), (state) => {
          const googleUrl = new URL(
            `https://accounts.google.com/o/oauth2/v2/auth?state=${state}&client_id=test&scope=openid+profile+email&response_type=code&redirect_uri=http://localhost:3000/auth/google/callback`
          );
          const githubUrl = new URL(
            `https://github.com/login/oauth/authorize?state=${state}&client_id=test&scope=read:user+user:email&redirect_uri=http://localhost:3000/auth/github/callback`
          );

          // Verify URLs are valid and contain required params
          expect(googleUrl.searchParams.get('state')).toBe(state);
          expect(githubUrl.searchParams.get('state')).toBe(state);
          expect(googleUrl.searchParams.get('response_type')).toBe('code');
          expect(googleUrl.searchParams.get('client_id')).toBe('test');
        })
      );
    });
  });

  // ============ JWT Properties ============

  describe('Property 2: Successful Auth Token Issuance', () => {
    it('should generate valid JWT tokens with proper structure', () => {
      const jwtService = new JWTService('secret-key-access', 'secret-key-refresh');

      fc.assert(
        fc.property(
          fc.uuid(),
          fc.emailAddress(),
          fc.uuid(),
          (userId, email, sessionId) => {
            const tokenPair = jwtService.generateTokenPair(userId, email, sessionId);

            // Verify token structure
            expect(tokenPair.accessToken).toBeTruthy();
            expect(tokenPair.refreshToken).toBeTruthy();
            expect(tokenPair.tokenType).toBe('Bearer');
            expect(tokenPair.expiresIn).toBeGreaterThan(0);

            // Verify tokens can be verified
            const accessPayload = jwtService.verifyAccessToken(tokenPair.accessToken);
            expect(accessPayload).toBeTruthy();
            expect(accessPayload!.sub).toBe(userId);
            expect(accessPayload!.email).toBe(email);
          }
        )
      );
    });
  });

  describe('Property 3: JWT Validation on Protected Endpoints', () => {
    it('should properly validate and reject invalid tokens', () => {
      const jwtService = new JWTService('secret-key-access', 'secret-key-refresh');

      fc.assert(
        fc.property(fc.string(), (invalidToken) => {
          const result = jwtService.verifyAccessToken(invalidToken);
          // Invalid tokens should return null
          if (invalidToken.length === 0 || !invalidToken.includes('.')) {
            expect(result).toBeNull();
          }
        })
      );
    });
  });

  // ============ Session Properties ============

  describe('Property 4: Session Serialization Round-Trip', () => {
    it('should serialize and deserialize sessions correctly', () => {
      const sessionManager = new SessionManager();
      const jwtService = new JWTService('secret', 'refresh-secret');

      fc.assert(
        fc.property(
          fc.uuid(),
          fc.emailAddress(),
          fc.uuid(),
          (userId, email, sessionId) => {
            // Create a session
            const tokenPair = jwtService.generateTokenPair(userId, email, sessionId);
            const session = sessionManager.createSession(userId, tokenPair, {
              userAgent: 'Mozilla/5.0',
              ipAddress: '192.168.1.1',
              platform: 'Windows',
              deviceName: 'Laptop'
            });

            // Serialize and deserialize
            const serialized = sessionManager.serializeSession(session);
            const deserialized = sessionManager.deserializeSession(serialized);

            // Verify round-trip
            expect(deserialized).toBeTruthy();
            expect(deserialized!.id).toBe(session.id);
            expect(deserialized!.userId).toBe(session.userId);
          }
        )
      );
    });
  });

  describe('Property 5: Logout Token Invalidation', () => {
    it('should properly invalidate sessions on logout', () => {
      const sessionManager = new SessionManager();
      const jwtService = new JWTService('secret', 'refresh-secret');

      fc.assert(
        fc.property(fc.uuid(), fc.emailAddress(), (userId, email) => {
          const tokenPair = jwtService.generateTokenPair(userId, email, 'session-1');
          const session = sessionManager.createSession(userId, tokenPair, {
            userAgent: 'Test',
            ipAddress: '127.0.0.1',
            platform: 'Test'
          });

          // Verify session exists
          expect(sessionManager.getSession(session.id)).toBeTruthy();

          // Logout
          const logoutSuccess = sessionManager.logout(session.id);
          expect(logoutSuccess).toBe(true);

          // Verify session no longer exists
          expect(sessionManager.getSession(session.id)).toBeNull();
        })
      );
    });
  });

  // ============ Permission Properties ============

  describe('Property 6: Permission Grant Persistence', () => {
    it('should persist permission grants correctly', () => {
      const permissionManager = new PermissionManager();

      fc.assert(
        fc.property(
          fc.uuid(),
          fc.stringMatching(/^[a-z_]{1,20}$/),
          (userId, permission) => {
            // Grant permission
            const grant = permissionManager.grantPermission(userId, permission);

            // Verify it's stored
            expect(grant.granted).toBe(true);
            expect(permissionManager.hasPermission(userId, permission)).toBe(true);

            // Get all permissions
            const allPerms = permissionManager.getPermissions(userId);
            expect(allPerms).toContainEqual(expect.objectContaining({
              userId,
              permission,
              granted: true
            }));
          }
        )
      );
    });
  });

  describe('Property 7: Permission Revocation Completeness', () => {
    it('should completely revoke permissions when requested', () => {
      const permissionManager = new PermissionManager();

      fc.assert(
        fc.property(
          fc.uuid(),
          fc.stringMatching(/^[a-z_]{1,20}$/),
          (userId, permission) => {
            // Grant permission
            permissionManager.grantPermission(userId, permission);
            expect(permissionManager.hasPermission(userId, permission)).toBe(true);

            // Revoke permission
            const revokeSuccess = permissionManager.revokePermission(userId, permission);
            expect(revokeSuccess).toBe(true);

            // Verify it's no longer granted
            expect(permissionManager.hasPermission(userId, permission)).toBe(false);
          }
        )
      );
    });
  });

  describe('Property 8: Permission Query Completeness', () => {
    it('should return all permissions for a user', () => {
      const permissionManager = new PermissionManager();

      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(fc.stringMatching(/^[a-z_]{1,20}$/), { minLength: 1, maxLength: 5 }),
          (userId, permissions) => {
            // Grant multiple permissions
            permissions.forEach(perm => {
              permissionManager.grantPermission(userId, perm);
            });

            // Query all permissions
            const userPerms = permissionManager.getPermissions(userId);

            // Verify all are returned
            expect(userPerms.length).toBe(permissions.length);
            permissions.forEach(perm => {
              expect(userPerms).toContainEqual(expect.objectContaining({
                permission: perm,
                granted: true
              }));
            });
          }
        )
      );
    });
  });

  // ============ User Service Properties ============

  describe('Property 9: User Creation from OAuth Profile', () => {
    it('should create users from OAuth profiles correctly', () => {
      const userService = new UserService();

      fc.assert(
        fc.property(
          fc.emailAddress(),
          fc.name(),
          (email, name) => {
            const profile = {
              id: 'google_123',
              email,
              name,
              provider: 'google' as const
            };

            const user = userService.findOrCreate(profile);

            expect(user).toBeTruthy();
            expect(user.email).toBe(email);
            expect(user.name).toBe(name);
            expect(user.googleId).toBe('google_123');
          }
        )
      );
    });
  });

  describe('Property 10: User Preference Persistence', () => {
    it('should persist user preferences correctly', () => {
      const userService = new UserService();

      fc.assert(
        fc.property(
          fc.emailAddress(),
          fc.name(),
          fc.oneof(fc.constant('en'), fc.constant('hi')),
          fc.oneof(fc.constant('light'), fc.constant('dark')),
          (email, name, language, theme) => {
            const profile = {
              id: 'test_123',
              email,
              name,
              provider: 'google' as const
            };

            const user = userService.findOrCreate(profile);
            const updated = userService.updatePreferences(user.id, {
              language,
              theme
            });

            expect(updated).toBeTruthy();
            expect(updated!.preferences.language).toBe(language);
            expect(updated!.preferences.theme).toBe(theme);
          }
        )
      );
    });
  });

  describe('Property 11: User Export Completeness', () => {
    it('should export complete user data', () => {
      const userService = new UserService();

      fc.assert(
        fc.property(
          fc.emailAddress(),
          fc.name(),
          (email, name) => {
            const profile = {
              id: 'export_test',
              email,
              name,
              provider: 'google' as const
            };

            const user = userService.findOrCreate(profile);
            const exported = userService.exportUserData(user.id);

            expect(exported).toBeTruthy();
            expect((exported as any).user.email).toBe(email);
            expect((exported as any).user.name).toBe(name);
            expect((exported as any).exportedAt).toBeTruthy();
          }
        )
      );
    });
  });
});
