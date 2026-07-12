import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js"
const app = express();
const port = process.env.PORT || 9080;
app.use(express.json());
app.use(cors());
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
