"use strict";
/**
 * MongoDB Mongoose Schemas
 * Requirement 1.2: Configure MongoDB connection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandLogSchema = exports.PermissionSchema = exports.SessionSchema = exports.UserSchema = void 0;
exports.connectMongoDB = connectMongoDB;
exports.getModels = getModels;
const mongoose = require('mongoose');
exports.UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    googleId: String,
    githubId: String,
    preferences: {
        language: { type: String, enum: ['en', 'hi'], default: 'en' },
        theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
        notificationsEnabled: { type: Boolean, default: true },
        wakeWord: { type: String, default: 'Hey Dev' }
    },
    permissions: [{
            name: String,
            description: String,
            granted: Boolean,
            grantedAt: Date,
            revokedAt: Date
        }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'users', timestamps: true });
exports.SessionSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    deviceInfo: {
        userAgent: String,
        ipAddress: String,
        platform: String,
        deviceName: String
    },
    refreshToken: { type: String, required: true, index: true },
    accessToken: String,
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now }
}, { collection: 'sessions', timestamps: true });
exports.PermissionSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    permission: { type: String, required: true },
    granted: { type: Boolean, default: false },
    grantedAt: Date,
    revokedAt: Date,
    createdAt: { type: Date, default: Date.now }
}, { collection: 'permissions', timestamps: true });
exports.CommandLogSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    command: { type: String, required: true },
    intent: String,
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
    result: mongoose.Schema.Types.Mixed,
    executionTime: Number,
    timestamp: { type: Date, default: Date.now, index: true }
}, { collection: 'commandLogs', timestamps: false });
function connectMongoDB(uri) {
    return mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}
function getModels(mongoose) {
    return {
        User: mongoose.model('User', exports.UserSchema),
        Session: mongoose.model('Session', exports.SessionSchema),
        Permission: mongoose.model('Permission', exports.PermissionSchema),
        CommandLog: mongoose.model('CommandLog', exports.CommandLogSchema)
    };
}
//# sourceMappingURL=schemas.js.map