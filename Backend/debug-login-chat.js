const base = 'http://localhost:9000';
const demo = async () => {
  try {
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'cookie-test@example.com', password: 'password123' }),
    });
    console.log('LOGIN status', loginRes.status);
    console.log('LOGIN headers', Array.from(loginRes.headers.entries()));
    const loginBody = await loginRes.text();
    console.log('LOGIN body', loginBody);
    const cookie = loginRes.headers.get('set-cookie');
    console.log('cookie', cookie);

    const chatRes = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie || '' },
      body: JSON.stringify({ threadId: 'debug-thread', message: 'hello world from login script' }),
    });
    console.log('CHAT status', chatRes.status);
    console.log('CHAT body', await chatRes.text());
  } catch (err) {
    console.error(err);
  }
};

demo();
