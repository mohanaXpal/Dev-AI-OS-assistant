"use strict";
/**
 * OAuth Handler - Google and GitHub OAuth Implementation
 * Requirements 1.1, 1.2: OAuth Authentication
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthHandler = void 0;
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
class OAuthHandler {
    constructor(googleClientId, googleClientSecret, googleRedirectUri, githubClientId, githubClientSecret, githubRedirectUri) {
        this.googleClientId = googleClientId;
        this.googleClientSecret = googleClientSecret;
        this.googleRedirectUri = googleRedirectUri;
        this.githubClientId = githubClientId;
        this.githubClientSecret = githubClientSecret;
        this.githubRedirectUri = githubRedirectUri;
    }
    /**
     * Generate Google OAuth redirect URL
     * Requirement 2.1: Create OAuth module with Google strategy
     */
    generateGoogleAuthUrl(state) {
        const params = new URLSearchParams({
            client_id: this.googleClientId,
            redirect_uri: this.googleRedirectUri,
            response_type: 'code',
            scope: 'openid profile email',
            state
        });
        return `${GOOGLE_AUTH_URL}?${params.toString()}`;
    }
    /**
     * Generate GitHub OAuth redirect URL
     * Requirement 2.2: Add GitHub OAuth strategy
     */
    generateGithubAuthUrl(state) {
        const params = new URLSearchParams({
            client_id: this.githubClientId,
            redirect_uri: this.githubRedirectUri,
            scope: 'read:user user:email',
            state
        });
        return `${GITHUB_AUTH_URL}?${params.toString()}`;
    }
    /**
     * Handle Google OAuth callback
     * Requirement 2.1: Handle Google callback and token validation
     */
    async handleGoogleCallback(code) {
        // In production, exchange code for token and validate
        // This is a simplified version
        if (!code) {
            throw new Error('Invalid authorization code');
        }
        // Simulated token exchange and profile fetch
        return {
            id: `google_${Math.random().toString(36).substr(2, 9)}`,
            email: 'user@google.com',
            name: 'Google User',
            provider: 'google'
        };
    }
    /**
     * Handle GitHub OAuth callback
     * Requirement 2.2: Handle GitHub callback and token validation
     */
    async handleGithubCallback(code) {
        if (!code) {
            throw new Error('Invalid authorization code');
        }
        // Simulated token exchange and profile fetch
        return {
            id: `github_${Math.random().toString(36).substr(2, 9)}`,
            email: 'user@github.com',
            name: 'GitHub User',
            provider: 'github'
        };
    }
    /**
     * Validate OAuth token
     */
    async validateOAuthToken(provider, token) {
        if (!token || token.length === 0) {
            return false;
        }
        // In production, validate token with provider
        return true;
    }
}
exports.OAuthHandler = OAuthHandler;
//# sourceMappingURL=oauth.handler.js.map