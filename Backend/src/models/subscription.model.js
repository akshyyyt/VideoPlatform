import mongoose from 'mongoose';

const subscriptionSchema = mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId, // consumer 
        ref: "User"
    },
    channel: {
        type: mongooose.Schema.Types.ObjectId, // creator
        ref: 'User'
    },
}, { timestamps: true });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);