import mongoose, { Schema, Document } from 'mongoose';

export interface IPluginSettings extends Document {
    userId: mongoose.Types.ObjectId;
    pluginId: string; // 'github', 'google-cloud', etc.
    enabled: boolean;
    credentials: Map<string, string>; // apiKey, token, etc.
    lastUsed: Date;
    config: Map<string, any>;
}

const PluginSettingsSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pluginId: { type: String, required: true },
    enabled: { type: Boolean, default: false },
    credentials: { type: Map, of: String, default: {} },
    lastUsed: { type: Date, default: Date.now },
    config: { type: Map, of: Schema.Types.Mixed, default: {} }
});

// Ensure unique plugin per user
PluginSettingsSchema.index({ userId: 1, pluginId: 1 }, { unique: true });

export default mongoose.models.PluginSettings || mongoose.model<IPluginSettings>('PluginSettings', PluginSettingsSchema);
