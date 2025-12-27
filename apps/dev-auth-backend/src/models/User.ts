import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
    githubToken?: string;
    githubUsername?: string;
    preferences: {
        theme: string;
        voiceName: string;
        notifications: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    googleId: { type: String, required: false, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String },
    githubToken: { type: String },
    githubUsername: { type: String },
    preferences: {
        theme: { type: String, default: 'dark' },
        voiceName: { type: String, default: 'Dev' },
        notifications: { type: Boolean, default: true },
    },
}, {
    timestamps: true,
});

export default mongoose.model<IUser>('User', UserSchema);
