import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'; // Authentication
import bcrypt from 'bcrypt'; // Used for hashing password

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true // Good when we will be searching.
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true // Good when we will be searching.
    },
    avatar: {
        type: String, // Will be using from cloudinary
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video',
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required.'],
    },
    refreshToken: {
        type: String,

    }
}, {timestamps: true})

// Just before saving used.
userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) return next(); // Fixed the issue.

    this.password = await bcrypt.hash(this.password, 10); // What to crypt and how many rounds.
    next();
}) // But this will always run, even if we don't change the password.

// We have tp check the pass
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password);
}

// Session
userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id: this.id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id: this.id,
        },
        process.env.REFRESN_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        } 
    )
} 

export const User = mongoose.model('User', userSchema);