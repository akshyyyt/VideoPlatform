import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Middlewares. 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true // Learn about it.
}))
app.use(express.json({limit: '16kb'})); // Parses into json.
app.use(express.urlencoded({extended: true, limit: '16kb'})); // Parses info from URL, extended true help to parses nested complex object.  
app.use(cookieParser()); // CRUD and access users cookie.

app.use(express.static('public')); // Store assets in our server.

// Routes import
import userRouter from './routes/user.route.js';

// Route declaration
app.use('/api/v1/users', userRouter);

export default app;