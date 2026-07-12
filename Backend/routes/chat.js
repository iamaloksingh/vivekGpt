import express from "express"
import Thread from "../models/thread.js";
import getGemniAiAPiResponse from "../utils/gemniAi.js";


 const  router  = express.Router();
 // test
 router.post("/test",async(req,res)=>{
      try {
        const  thread = new Thread({
          threadId:"xyz",
          title :"testing new thread"
        });
        const response = await thread.save();
        res.send(response)
      } catch (error) {
        console.log(error)
        res.status(500).json({error :"failed to saved in DB"})
      }
 })


 //get all  threads
 router.get("/thread",async(req,res)=>{
  try {
    const  threads  = await Thread.find({}).sort({updateAt: -1}) ;
    res.json(threads)
  } catch (error) {
    console.log(error);
    res.status(500).json({error: "failed to fetch threads"})
    
  }
 })



 router.get("/thread/:threadId",async(req,res)=>{
  const {threadId} = req.params;
  try {
     const  thread = await Thread.findOne({threadId});
     if(!thread){
       return res.status(404).json({error : "thread not found"})
     }
     res.json(thread.messages)
  } catch (error) {
    console.log(error);
    res.status(500).json({error:"Falied to fetch chat"})
    
  }
 })


 router.delete("/thread/:threadId",async(req,res)=>{
  const {threadId} = req.params;
  try {
      const deletedThread = await Thread.findOneAndDelete({threadId});
      if(!deletedThread){
       return res.status(404).json({error:"thread not found"});
      }
      res.status(200).json({success: "Thread deleted successfully"});
  } catch (error) {
    console.log(error);
    res.status(500).json({error: "failed to delete thread"})
    
  }
 })


 router.post("/chat",async(req,res)=>{
  const {threadId, message}= req.body;
  if(!threadId || !message){
     return res.status(404).json({error:"missing required fields"});
  }

  try {
      let thread = await Thread.findOne({ threadId });
    if(!thread){
      //create new threadId in db
       thread = new Thread({
        threadId,
        title:message,
        messages:[{role:"user", content:message}]
      });
    }else{
      thread.messages.push({role:"user", content:message});
    }
    const assistantReply = await getGemniAiAPiResponse(message);
    thread.messages.push({role:"assistant",content:assistantReply});
  
    await thread.save();
    res.json({reply:assistantReply})

    
  } catch (error) {
    console.log(error)
    res.status(500).json({error:"something went wrong"})
    
  }
 })
 export default router;