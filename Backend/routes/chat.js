import express from "express"
import Thread from "../models/thread.js";
import getGemniAiAPiResponse from "../utils/gemniAi.js";
import auth from "../middleware/auth.js";


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
router.get("/thread", auth, async (req, res) => {
  try {
    const threads = await Thread.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(threads);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "failed to fetch threads" });
  }
});



router.get("/thread/:threadId", auth, async (req, res) => {
  const { threadId } = req.params;
  try {
    const thread = await Thread.findOne({ threadId, userId: req.user.id });
    if (!thread) {
      return res.status(404).json({ error: "thread not found" });
    }
    res.json(thread.messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Falied to fetch chat" });
  }
});


router.delete("/thread/:threadId", auth, async (req, res) => {
  const { threadId } = req.params;
  try {
    const deletedThread = await Thread.findOneAndDelete({ threadId, userId: req.user.id });
    if (!deletedThread) {
      return res.status(404).json({ error: "thread not found" });
    }
    res.status(200).json({ success: "Thread deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "failed to delete thread" });
  }
});


router.post("/chat", auth, async (req, res) => {
  const { threadId, message } = req.body;
  if (!threadId || !message) {
    return res.status(400).json({ error: "missing required fields" });
  }

  try {
    let thread = await Thread.findOne({ threadId, userId: req.user.id });
    if (!thread) {
      // create new threadId in db for this user
      thread = new Thread({
        threadId,
        userId: req.user.id,
        title: message,
        messages: [{ role: "user", content: message }]
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }
    const assistantReply = await getGemniAiAPiResponse(message);
    thread.messages.push({ role: "assistant", content: assistantReply });

    await thread.save();
    res.json({ reply: assistantReply });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "something went wrong" });
  }
});
 export default router;