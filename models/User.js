import mongoose from 'mongoose';

const { Schema } = mongoose;

const ROLES = ['parent', 'school_admin', 'security', 'system_admin'];

const userSchema = new Schema(
    {
        userType: {
            type: String,
            enum: ROLES,
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone is required'],
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false,
        },
        address: {
            type: String,
            default: '',
        },
        profileImage: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
        schoolId: {
            type: Schema.Types.ObjectId,
            ref: 'schools',
            required: false,
        },
        linkedStudents: {
            type: [String],
            default: undefined, // only set for parents
            validate: {
                validator: function (v) {
                    // Only allow if userType is parent; otherwise should be undefined
                    if (this.userType !== 'parent') return v === undefined || v === null;
                    return Array.isArray(v) && v.every((s) => typeof s === 'string');
                },
                message: 'linkedStudents must be an array of strings for parent users only',
            },
        },
        preferences: {
            notifications: {
                email: { type: Boolean, default: true },
                sms: { type: Boolean, default: true },
                push: { type: Boolean, default: true },
            },
            language: { type: String, default: 'en' },
        },
    },
    { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export const User = mongoose.model('User', userSchema);
export const USER_ROLES = ROLES;
