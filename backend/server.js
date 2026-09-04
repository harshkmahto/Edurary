import config  from './config/config.js';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.routes.js'; 
import bookRouter from './routes/book.routes.js';
import courseRouter from './routes/course.routes.js';
import analyticsRouter from './routes/analytics.routes.js';
import supportRouter from './routes/support.routes.js';

const app = express();

app.use(cors({
  origin: config.CLIENT_URL, 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

app.use('/user', userRouter);
app.use('/book', bookRouter); 
app.use('/course', courseRouter);  
app.use('/analytics', analyticsRouter); 
app.use('/support', supportRouter);

connectDB();

export default app;