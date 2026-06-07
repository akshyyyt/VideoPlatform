import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';
import express from 'express';

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`); // DB Connected.
        // we got a object.
        console.log(`MongoDB Connected!! DB HOST - ${connectionInstance.connection.host}`) // DB for host, production, test are different so ok...
    } catch (error){
        console.log("MONGODB Connection Failed", error);
        process.exit(1); // Comes from node.js, didn't need to import this. process exit 1 means that a program or script terminated abruptly.
    }
}

export default connectDB;