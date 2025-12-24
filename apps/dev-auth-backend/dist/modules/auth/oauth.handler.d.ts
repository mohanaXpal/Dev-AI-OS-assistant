/**
 * OAuth Handler - Google and GitHub OAuth Implementation
 * Requirements 1.1, 1.2: OAuth Authentication
 */
import { OAuthProfile } from '../../common/interfaces';
export declare class OAuthHandler {
    private googleClientId;
    private googleClientSecret;
    private googleRedirectUri;
    private githubClientId;
    private githubClientSecret;
    private githubRedirectUri;
    constructor(googleClientId: string, googleClientSecret: string, googleRedirectUri: string, githubClientId: string, githubClientSecret: string, githubRedirectUri: string);
    /**
     * Generate Google OAuth redirect URL
     * Requirement 2.1: Create OAuth module with Google strategy
     */
    generateGoogleAuthUrl(state: string): string;
    /**
     * Generate GitHub OAuth redirect URL
     * Requirement 2.2: Add GitHub OAuth strategy
     */
    generateGithubAuthUrl(state: string): string;
    /**
     * Handle Google OAuth callback
     * Requirement 2.1: Handle Google callback and token validation
     */
    handleGoogleCallback(code: string): Promise<OAuthProfile>;
    /**
     * Handle GitHub OAuth callback
     * Requirement 2.2: Handle GitHub callback and token validation
     */
    handleGithubCallback(code: string): Promise<OAuthProfile>;
    /**
     * Validate OAuth token
     */
    validateOAuthToken(provider: 'google' | 'github', token: string): Promise<boolean>;
}
//# sourceMappingURL=oauth.handler.d.ts.map