/**
 * MongoDB Mongoose Schemas
 * Requirement 1.2: Configure MongoDB connection
 */
export declare const UserSchema: any;
export declare const SessionSchema: any;
export declare const PermissionSchema: any;
export declare const CommandLogSchema: any;
export declare function connectMongoDB(uri: string): any;
export declare function getModels(mongoose: any): {
    User: any;
    Session: any;
    Permission: any;
    CommandLog: any;
};
//# sourceMappingURL=schemas.d.ts.map