import dotenv from 'dotenv';
import connectDB from './database/index.js'
import app from './app.js';
// import express from 'express';
// import mongoose from 'mongoose';
// import { DB_NAME } from './constants.js'; // No Need Since I'm getting from DB Directory.

dotenv.config({
    path: './.env'
})

connectDB() // Connected.
    .then(() => {
        app.on('error', (err) => {
            console.error('Server communication error:', err);
            process.exit(1);
        })
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server running on port ${process.env.PORT}`)
        })
    })

 


// First connecting here. Always using try catch or promise while connecting to DB.
// This is one approach but I will be doing this in database folder.

// const app = express()
// ;(async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`); // DB Connected

//         app.on('error', (err) => {
//             console.error("Error: ", err);
//             throw err;
//         }) // For any reason if express can't communicate with DB.

//         app.listen(process.env.PORT, () => {
//             console.log(`Listening on Port ${process.env.PORT}`)
//         })
//     }
//     catch (error) {
//         console.error("ERROR: ", error);
//         throw error;
//     }
// })() // Doing this in IFFE didn't pollute anything outside.