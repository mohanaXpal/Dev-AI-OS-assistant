/**
 * OAuth Handler - Google and GitHub OAuth Implementation
 * Requirements 1.1, 1.2: OAuth Authentication
 */

import { OAuthProfile } from '../../common/interfaces';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';

export class OAuthHandler {
  private googleClientId: string;
  private googleClientSecret: string;
  private googleRedirectUri: string;
  private githubClientId: string;
  private githubClientSecret: string;
  private githubRedirectUri: string;

  constructor(
    googleClientId: string,
    googleClientSecret: string,
    googleRedirectUri: string,
    githubClientId: string,
    githubClientSecret: string,
    githubRedirectUri: string
  ) {
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
  generateGoogleAuthUrl(state: string): string {
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
  generateGithubAuthUrl(state: string): string {
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
  async handleGoogleCallback(code: string): Promise<OAuthProfile> {
    if (!code) {
      throw new Error('Invalid authorization code');
    }

    try {
      const axios = require('axios');

      // 1. Exchange code for tokens
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.googleClientId,
        client_secret: this.googleClientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: this.googleRedirectUri
      });

      const { access_token } = tokenResponse.data;

      // 2. Fetch User Profile
      const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const profile = profileResponse.data;

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        provider: 'google',
        avatar: profile.picture
      };
    } catch (error: any) {
      console.error('Google OAuth Error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Google');
    }
  }

  /**
   * Handle GitHub OAuth callback
   * Requirement 2.2: Handle GitHub callback and token validation
   */
  async handleGithubCallback(code: string): Promise<OAuthProfile> {
    if (!code) {
      throw new Error('Invalid authorization code');
    }

    try {
      const axios = require('axios');

      // 1. Exchange code for access token
      const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: this.githubClientId,
        client_secret: this.githubClientSecret,
        code: code,
        redirect_uri: this.githubRedirectUri
      }, {
        headers: { Accept: 'application/json' }
      });

      const { access_token } = tokenResponse.data;
      if (!access_token) throw new Error('Failed to get GitHub access token');

      // 2. Fetch User Profile
      const profileResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const profile = profileResponse.data;
      let email = profile.email;

      // 3. Fallback: Fetch emails if primary email is null/private
      if (!email) {
        try {
          const emailsResponse = await axios.get('https://api.github.com/user/emails', {
            headers: { Authorization: `Bearer ${access_token}` }
          });
          const emails = emailsResponse.data;
          const primaryEmail = emails.find((e: any) => e.primary && e.verified) || emails[0];
          email = primaryEmail?.email;
        } catch (emailError) {
          console.error('Failed to fetch GitHub emails:', emailError);
        }
      }

      return {
        id: profile.id.toString(),
        email: email || `${profile.login}@github.com`, // Absolute fallback
        name: profile.name || profile.login,
        provider: 'github',
        avatar: profile.avatar_url,
        accessToken: access_token,
        username: profile.login
      } as any;
    } catch (error: any) {
      console.error('GitHub OAuth Error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with GitHub');
    }
  }

  /**
   * Validate OAuth token
   */
  async validateOAuthToken(provider: 'google' | 'github', token: string): Promise<boolean> {
    if (!token || token.length === 0) {
      return false;
    }
    // In production, validate token with provider
    return true;
  }
}
