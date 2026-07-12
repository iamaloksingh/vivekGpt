import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js"
const app = express();
const port = process.env.PORT || 9080;
app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  "https://vivekgptfrontend.onrender.com"
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use("/api",chatRoutes)
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
