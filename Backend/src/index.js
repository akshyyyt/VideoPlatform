import dotenv from 'dotenv';
import express from 'express';
import connectDB from './database/index.js'
// import mongoose from 'mongoose';
// import { DB_NAME } from './constants.js'; // No Need Since I'm getting from DB Directory.

dotenv.config({
    path: './.env'
})

connectDB(); // Connected.






// First connecting here. Always using try catch or promise while connecting to DB.
// This is one approach but I will be doing this in database folder.

// const app = express()
// ;(async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`); // DB Connected

//         app.on('error', (err) => {
//             console.log("Error: ", err);
//             throw error;
//         }) // For any reason if express can't communicate with DB.

//         app.listen(process.env.PORT, () => {
//             console.log(`Listening on Port ${process.env.PORT}`)
//         })
//     }
//     catch {
//         console.error("ERROR: ", error);
//         throw error;
//     }
// })() // Doing this in IFFE didn't pollute anything outside.