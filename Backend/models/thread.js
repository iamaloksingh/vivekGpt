import mongoose from "mongoose";
const MessageSchema = new mongoose.Schema({
  role:{
    type:String,
    enum:["user","assistant"],
    required:true
  },
  content :{
    type:String,
    required:true
  },
  timeStamp:{
    type:Date,
    default: Date.now
  }
});

const ThreadSchema= new mongoose.Schema({
  threadId:{
    type:String,
    required:true,
    unique:true
  },
  title:{
    type:String,
    default:"new chat"
  },
  messages: [MessageSchema],
},
 {
    timestamps: true,
  }
);
export default mongoose.model("Thread",ThreadSchema);