import './ChatWindow.css';
import Chat from './Chat.jsx';
import { MyContext } from './MyContext.jsx';
import { useContext, useEffect, useState } from 'react';
import { ScaleLoader } from 'react-spinners';
const server = import.meta.env.VITE_SERVER;
function ChatWindow() {
    const { prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat, theme, setTheme, currentUser, logout } = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceError, setVoiceError] = useState('');
    const [recognitionInstance, setRecognitionInstance] = useState(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.continuous = false;
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map((result) => result[0].transcript)
                .join(' ');
            setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        };
        recognition.onerror = () => {
            setVoiceError('Voice capture is unavailable right now.');
            setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);
        setRecognitionInstance(recognition);

        return () => recognition.stop();
    }, [setPrompt]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (event.target.closest('.profileMenu')) {
                return;
            }
            setIsOpen(false);
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const getReply = async (messageText = prompt) => {
        const currentPrompt = messageText.trim();
        if (!currentPrompt || loading) {
            return;
        }

        setLoading(true);
        setNewChat(false);
        setVoiceError('');
        setPrevChats((prev) => ([
            ...prev,
            { role: 'user', content: currentPrompt },
            { role: 'assistant', content: '' }
        ]));
        setReply(null);

        const options = {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: currentPrompt,
                threadId: currThreadId
            })
        };  

        try {
            const response = await fetch(`${server}/api/chat`, options);
            const res = await response.json();
            setReply(res.reply);
        } catch (err) {
            console.log(err);
            setVoiceError('The assistant is currently unavailable. Please try again.');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (reply !== null) {
            setPrevChats((prevChats) => {
                if (!prevChats || prevChats.length === 0) {
                    return [{ role: 'assistant', content: reply }];
                }
                const updated = [...prevChats];
                // replace the last placeholder assistant message with the actual reply
                updated[updated.length - 1] = { role: 'assistant', content: reply };
                return updated;
            });
        }

        setPrompt('');
    }, [reply]);

    const toggleVoiceInput = () => {
        if (!recognitionInstance) {
            setVoiceError('Speech recognition is not supported by this browser.');
            return;
        }

        if (isListening) {
            recognitionInstance.stop();
            setIsListening(false);
            return;
        }

        setVoiceError('');
        recognitionInstance.start();
        setIsListening(true);
    };

    return (
        <div className="chatWindow">
            <div className="navbar">
                <div className="brand">
                    <span>VivekGPT</span>
                    <i className="fa-solid fa-sparkles"></i>
                </div>
                <div className="profileMenu">
                    <div className="userIconDiv" onClick={() => setIsOpen((prev) => !prev)}>
                        <span className="userIcon">{currentUser?.name?.[0] || 'U'}</span>
                    </div>
                    {isOpen && (
                        <div className="dropDown">
                            <div className="dropDownItem" onClick={setTheme}>
                                <i className={theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
                                {theme === 'dark' ? ' Switch to light mode' : ' Switch to dark mode'}
                            </div>
                            <div className="dropDownItem">
                                <i className="fa-solid fa-gear"></i> Settings
                            </div>
                            <div className="dropDownItem" onClick={logout}>
                                <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Chat />

            <ScaleLoader color={theme === 'dark' ? '#fff' : '#2563eb'} loading={loading} />

            <div className="chatInput">
                <div className="inputBox">
                    <input
                        placeholder="Ask anything"
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        onKeyDown={(event) => (event.key === 'Enter' ? getReply(prompt) : '')}
                    />
                    <div className="inputActions">
                        <button type="button" className={`voiceButton ${isListening ? 'listening' : ''}`} onClick={toggleVoiceInput}>
                            <i className={isListening ? 'fa-solid fa-stop' : 'fa-solid fa-microphone'}></i>
                        </button>
                        <button type="button" className="sendButton" onClick={() => getReply(prompt)}>
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
                {voiceError ? <p className="info errorText">{voiceError}</p> : <p className="info">AlokGPT can make mistakes. Check important info and keep your prompts clear.</p>}
            </div>
        </div>
    );
}

export default ChatWindow;