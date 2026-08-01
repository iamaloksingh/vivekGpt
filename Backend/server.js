import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import chatRoutes from "./routes/chat.js"
import authRoutes from "./routes/auth.js"

const app = express();
const port = process.env.PORT || 9080;

// security headers
app.use(helmet());

// logging
app.use(morgan(process.env.LOG_FORMAT || 'combined'));

// basic rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100 });
app.use(limiter);

app.use(express.json());
app.use(cookieParser());

// CORS configuration from env or default list
const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://vivekgptfrontend.onrender.com"
];
const allowedOrigins = (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : defaultOrigins).map(s => s.trim());

app.set('trust proxy', 1); // if behind a proxy (Render)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin?.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ['Set-Cookie'],
}));

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes)

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(port, () => {
  console.log(`server is running on ${port}`);

  connectDB();
});
const connectDB = async ()=>{
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connected  with Databases")
  } catch (error) {
    console.log("failed to connect with DB" ,error)
    
  }
}




// app.post("/test", async (req, res) => {
  
// });
