import './Chat.css';
import { useContext, useState, useEffect } from 'react';
import { MyContext } from './MyContext';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

function Chat() {
    const { newChat, prevChats, reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);

    useEffect(() => {
        if (reply === null) {
            setLatestReply(null);
            return;
        }

        if (!prevChats?.length) return;

        const content = reply.split(' ');
        let idx = 0;
        const interval = setInterval(() => {
            setLatestReply(content.slice(0, idx + 1).join(' '));
            idx++;
            if (idx >= content.length) clearInterval(interval);
        }, 35);

        return () => clearInterval(interval);
    }, [prevChats, reply]);

    return (
        <>
            {newChat && (
                <div className="welcomeCard">
                    <h1>Start a new conversation</h1>
                    <p>Ask anything and I will help you turn it into a polished response.</p>
                </div>
            )}
            <div className="chats">
                {prevChats?.slice(0, -1).map((chat, idx) => (
                    <div className={chat.role === 'user' ? 'userDiv' : 'gptDiv'} key={idx}>
                        {chat.role === 'user' ? (
                            <p className="userMessage">{chat.content}</p>
                        ) : (
                            <div className="markdownBlock">
                                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{chat.content}</ReactMarkdown>
                            </div>
                        )}
                    </div>
                ))}

                {prevChats.length > 0 && (
                    <div className="gptDiv" key={latestReply === null ? 'non-typing' : 'typing'}>
                        <div className="markdownBlock">
                            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                {latestReply === null ? prevChats[prevChats.length - 1].content : latestReply}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Chat;