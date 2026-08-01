import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const SALT_ROUNDS = 10;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set. Using insecure default secret for development. Set JWT_SECRET in .env for production.');
}

const isDevelopment = process.env.NODE_ENV === 'development';
const useSecureCookie = !isDevelopment;
const cookieOptions = {
  httpOnly: true,
  secure: useSecureCookie,
  sameSite: useSecureCookie ? 'none' : 'lax',
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  path: '/',
};

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ name, email: email.toLowerCase(), passwordHash });
    await user.save();
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.cookie('token', token, cookieOptions);
    return res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.cookie('token', token, cookieOptions);
    return res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions);
  return res.json({ success: true });
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load user' });
  }
});

export default router;
