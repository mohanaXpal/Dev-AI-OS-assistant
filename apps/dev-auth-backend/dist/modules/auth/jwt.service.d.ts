/**
 * JWT Service - Token generation and validation
 * Requirements 1.4, 2.1, 2.3, 2.4: JWT token management
 */
import { TokenPair, JWTPayload, RefreshTokenPayload } from '../../common/interfaces';
export declare class JWTService {
    private readonly accessTokenSecret;
    private readonly refreshTokenSecret;
    private readonly accessTokenExpire;
    private readonly refreshTokenExpire;
    constructor(accessTokenSecret: string, refreshTokenSecret: string);
    /**
     * Generate access and refresh token pair
     * Requirement 1.4: Issue a JWT access token and refresh token
     */
    generateTokenPair(userId: string, email: string, sessionId: string): TokenPair;
    /**
     * Verify access token
     * Requirement 2.3: Verify JWT signature and expiration on every protected endpoint
     */
    verifyAccessToken(token: string): JWTPayload | null;
    /**
     * Verify refresh token
     * Requirement 2.1: Accept a valid refresh token to issue a new access token
     */
    verifyRefreshToken(token: string): RefreshTokenPayload | null;
    /**
     * Refresh token rotation - issue new tokens
     * Requirement 2.4: Rotate the refresh token for security
     */
    rotateRefreshToken(userId: string, email: string, sessionId: string): TokenPair;
    /**
     * Decode token without verification (for inspection)
     */
    decodeToken(token: string): any;
    /**
     * Check if token is expired
     */
    isTokenExpired(token: string): boolean;
}
//# sourceMappingURL=jwt.service.d.ts.map