/**
 * JWT Service - Token generation and validation
 * Requirements 1.4, 2.1, 2.3, 2.4: JWT token management
 */

import * as jwt from 'jsonwebtoken';
import { TokenPair, JWTPayload, RefreshTokenPayload } from '../../common/interfaces';

export class JWTService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpire: number = 15 * 60; // 15 minutes in seconds
  private readonly refreshTokenExpire: number = 7 * 24 * 60 * 60; // 7 days in seconds

  constructor(accessTokenSecret: string, refreshTokenSecret: string) {
    this.accessTokenSecret = accessTokenSecret;
    this.refreshTokenSecret = refreshTokenSecret;
  }

  /**
   * Generate access and refresh token pair
   * Requirement 1.4: Issue a JWT access token and refresh token
   */
  generateTokenPair(userId: string, email: string, sessionId: string): TokenPair {
    const now = Math.floor(Date.now() / 1000);

    const accessPayload: JWTPayload = {
      sub: userId,
      email,
      iat: now,
      exp: now + this.accessTokenExpire
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: userId,
      email,
      sessionId,
      iat: now,
      exp: now + this.refreshTokenExpire
    };

    const accessToken = jwt.sign(accessPayload, this.accessTokenSecret);
    const refreshToken = jwt.sign(refreshPayload, this.refreshTokenSecret);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenExpire,
      tokenType: 'Bearer'
    };
  }

  /**
   * Verify access token
   * Requirement 2.3: Verify JWT signature and expiration on every protected endpoint
   */
  verifyAccessToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.accessTokenSecret) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token
   * Requirement 2.1: Accept a valid refresh token to issue a new access token
   */
  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as RefreshTokenPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh token rotation - issue new tokens
   * Requirement 2.4: Rotate the refresh token for security
   */
  rotateRefreshToken(userId: string, email: string, sessionId: string): TokenPair {
    return this.generateTokenPair(userId, email, sessionId);
  }

  /**
   * Decode token without verification (for inspection)
   */
  decodeToken(token: string): any {
    return jwt.decode(token);
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    return decoded.exp < Math.floor(Date.now() / 1000);
  }
}
