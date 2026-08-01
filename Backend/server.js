import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import chatRoutes from "./routes/chat.js"
import authRoutes from "./routes/auth.js"
const app = express();
const port = process.env.PORT || 9080;
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://vivekgptfrontend.onrender.com"
];
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
// debug routes removed for production simplicity
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
