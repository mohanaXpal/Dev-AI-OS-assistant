"use strict";
/**
 * JWT Service - Token generation and validation
 * Requirements 1.4, 2.1, 2.3, 2.4: JWT token management
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTService = void 0;
const jwt = __importStar(require("jsonwebtoken"));
class JWTService {
    constructor(accessTokenSecret, refreshTokenSecret) {
        this.accessTokenExpire = 15 * 60; // 15 minutes in seconds
        this.refreshTokenExpire = 7 * 24 * 60 * 60; // 7 days in seconds
        this.accessTokenSecret = accessTokenSecret;
        this.refreshTokenSecret = refreshTokenSecret;
    }
    /**
     * Generate access and refresh token pair
     * Requirement 1.4: Issue a JWT access token and refresh token
     */
    generateTokenPair(userId, email, sessionId) {
        const now = Math.floor(Date.now() / 1000);
        const accessPayload = {
            sub: userId,
            email,
            iat: now,
            exp: now + this.accessTokenExpire
        };
        const refreshPayload = {
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
    verifyAccessToken(token) {
        try {
            return jwt.verify(token, this.accessTokenSecret);
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Verify refresh token
     * Requirement 2.1: Accept a valid refresh token to issue a new access token
     */
    verifyRefreshToken(token) {
        try {
            return jwt.verify(token, this.refreshTokenSecret);
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Refresh token rotation - issue new tokens
     * Requirement 2.4: Rotate the refresh token for security
     */
    rotateRefreshToken(userId, email, sessionId) {
        return this.generateTokenPair(userId, email, sessionId);
    }
    /**
     * Decode token without verification (for inspection)
     */
    decodeToken(token) {
        return jwt.decode(token);
    }
    /**
     * Check if token is expired
     */
    isTokenExpired(token) {
        const decoded = this.decodeToken(token);
        if (!decoded || !decoded.exp) {
            return true;
        }
        return decoded.exp < Math.floor(Date.now() / 1000);
    }
}
exports.JWTService = JWTService;
//# sourceMappingURL=jwt.service.js.map