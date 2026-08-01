const base = 'http://localhost:9000';
const demo = async () => {
  try {
    const regRes = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'cookie-test@example.com', password: 'password123' }),
    });
    console.log('REGISTER status', regRes.status);
    console.log('REGISTER headers', Array.from(regRes.headers.entries()));
    const registerBody = await regRes.text();
    console.log('REGISTER body', registerBody);
    const cookie = regRes.headers.get('set-cookie');
    console.log('cookie', cookie);

    const chatRes = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie || '' },
      body: JSON.stringify({ threadId: 'debug-thread', message: 'hello world' }),
    });
    console.log('CHAT status', chatRes.status);
    console.log('CHAT body', await chatRes.text());
  } catch (err) {
    console.error(err);
  }
};

demo();
