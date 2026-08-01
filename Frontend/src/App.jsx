import './App.css';
import Sidebar from './Sidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import { MyContext } from './MyContext.jsx';
import { useEffect, useState } from 'react';
import { v1 as uuidv1 } from 'uuid';
const server = import.meta.env.VITE_SERVER || window.location.origin;

function App() {
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(() => uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('alokgpt-theme') || 'dark');
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('alokgpt-current-user')));
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem('alokgpt-current-user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('alokgpt-theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${server}/api/auth/me`, {
          credentials: 'include',
        });
        if (!response.ok) {
          localStorage.removeItem('alokgpt-current-user');
          setCurrentUser(null);
          setIsAuthenticated(false);
          return;
        }
        const data = await response.json();
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('alokgpt-current-user', JSON.stringify(data.user));
      } catch (err) {
        localStorage.removeItem('alokgpt-current-user');
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleAuthSubmit = (event) => {
    event.preventDefault();
    // Call backend auth endpoints
    if (authMode === 'register') {
      fetch(`${server}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: authForm.name.trim(), email: authForm.email.trim().toLowerCase(), password: authForm.password })
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.error) {
            setAuthError(data.error);
            return;
          }
          localStorage.setItem('alokgpt-current-user', JSON.stringify(data.user));
          setCurrentUser(data.user);
          setIsAuthenticated(true);
          setAuthError('');
        })
        .catch((err) => setAuthError('Registration failed'));
      return;
    }

    // login
    fetch(`${server}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authForm.email.trim().toLowerCase(), password: authForm.password })
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setAuthError(data.error);
          return;
        }
        localStorage.setItem('alokgpt-current-user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setAuthError('');
      })
      .catch(() => setAuthError('Login failed'));
  };

  const logout = () => {
    fetch(`${server}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      localStorage.removeItem('alokgpt-current-user');
      setCurrentUser(null);
      setIsAuthenticated(false);
      setAuthForm({ name: '', email: '', password: '' });
    });
  };

  const providerValues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    newChat,
    setNewChat,
    prevChats,
    setPrevChats,
    allThreads,
    setAllThreads,
    theme,
    setTheme: toggleTheme,
    currentUser,
    logout
  };

  if (!isAuthenticated) {
    return (
      <div className="app authShell" data-theme={theme}>
        <div className="authCard">
          <div className="authHeader">
            <div>
              <p className="authEyebrow">Welcome back </p>
              <h1>{authMode === 'login' ? 'Sign in to continue' : 'Create your account'}</h1>
            </div>
            <button type="button" className="themeToggle" onClick={toggleTheme}>
              {theme === 'dark' ? '🌕' : '🌙'}
            </button>
          </div>

          <form className="authForm" onSubmit={handleAuthSubmit}>
            {authMode === 'register' && (
              <div className="authField">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Alok Singh"
                  value={authForm.name}
                  onChange={(event) => setAuthForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </div>
            )}

            <div className="authField">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="alok@gmail.com"
                value={authForm.email}
                onChange={(event) => setAuthForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>

            <div className="authField">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="********"
                value={authForm.password}
                onChange={(event) => setAuthForm((prev) => ({ ...prev, password: event.target.value }))}
              />
            </div>

            {authError && <p className="authError">{authError}</p>}

            <button type="submit" className="authButton">
              {authMode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>

          <p className="authSwitch">
            {authMode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
            <button type="button" className="ghostButton" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
          <p className="authHint">Use any email and password to demo the experience instantly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app" data-theme={theme}>
      <MyContext.Provider value={providerValues}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  );
}

export default App;