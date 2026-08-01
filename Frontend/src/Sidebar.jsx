import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import blackLogo from "../assets/blacklogo.png"; 
const server = import.meta.env.VITE_SERVER || window.location.origin;
function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,
    currentUser,
  } = useContext(MyContext);

  const getAllThreads = async () => {
    try {
      const response = await fetch(`${server}/api/thread`, {
        credentials: 'include',
      });
      const res = await response.json();
      const filteredData = res.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));
      setAllThreads(filteredData);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAllThreads();
  }, [currThreadId]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
  };

  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);

    try {
      const response = await fetch(`${server}/api/thread/${newThreadId}`, {
        credentials: 'include',
      });
      const res = await response.json();
      setPrevChats(res);
      setNewChat(false);
      setReply(null);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      await fetch(`${server}/api/thread/${threadId}`, {
        method: "DELETE",
        credentials: 'include',
      });
      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId),
      );

      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <section className="sidebar">
      <div>
        <button type="button" onClick={createNewChat} className="newChatButton">
          <img
            src={blackLogo}
            alt="gpt logo"
            className="logo"
          ></img>
          <span>
            <i className="fa-solid fa-pen-to-square"></i>
          </span>
        </button>

        <ul className="history">
          {allThreads?.length ? (
            allThreads.map((thread, idx) => (
              <li
                key={idx}
                onClick={() => changeThread(thread.threadId)}
                className={
                  thread.threadId === currThreadId ? "highlighted" : ""
                }
              >
                <span className="threadTitle">{thread.title}</span>
                <i
                  className="fa-solid fa-trash deleteThread"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteThread(thread.threadId);
                  }}
                ></i>
              </li>
            ))
          ) : (
            <p className="emptyState">
              No chats yet. Start one to build a history.
            </p>
          )}
        </ul>
      </div>

      <div className="sign">
        <p className="signName">{currentUser?.name || "Guest"}</p>
        <p className="signEmail">{currentUser?.email || "Ready to help"}</p>
      </div>
    </section>
  );
}

export default Sidebar;
