import { Schema, model, Document } from 'mongoose';

export interface IContact extends Document {
    name: string;
    email: string;
    message: string;
    status: 'pending' | 'resolved';
    createdAt: Date;
}

const contactSchema = new Schema<IContact>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

export const Contact = model<IContact>('Contact', contactSchema);
