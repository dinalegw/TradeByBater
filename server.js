require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const https = require('https');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'tradebybater-secret-key';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || 'gpt-3.5-turbo';

const bannedTerms = [
  'scam',
  'fraud',
  'drugs',
  'weapon',
  'porn',
  'illegal',
  'hack',
  'sell account',
  'fake',
  'money laundering'
];

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 80,
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const listingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'TradeByBater_Landing.html')));
app.get('/TradeByBater_Landing.html', (req, res) => res.sendFile(path.join(__dirname, 'TradeByBater_Landing.html')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(apiLimiter);

function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (error) {
    return { users: [], listings: [], trades: [] };
  }
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function openAiRequest(path, body) {
  return new Promise((resolve, reject) => {
    if (!OPENAI_API_KEY) {
      return reject(new Error('OpenAI API key is not configured. Set OPENAI_API_KEY in .env.'));
    }

    const payload = JSON.stringify(body);
    const req = https.request(
      {
        hostname: 'api.openai.com',
        path,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data || '{}');
            if (res.statusCode < 200 || res.statusCode >= 300) {
              const errorMessage = parsed.error?.message || `OpenAI API error ${res.statusCode}`;
              return reject(new Error(errorMessage));
            }
            resolve(parsed);
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function getAiReply(message) {
  const systemPrompt = `You are TradeByBater's AI assistant. Answer clearly and help users with the Nigerian barter marketplace. When possible, use local examples and keep responses short, friendly, and practical.`;

  const response = await openAiRequest('/v1/chat/completions', {
    model: AI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    temperature: 0.8,
    max_tokens: 512
  });

  const reply = response?.choices?.[0]?.message?.content;
  if (!reply) {
    throw new Error('AI returned an empty response.');
  }
  return reply.trim();
}

function sanitizeString(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function validateString(field, value, min = 1, max = 500) {
  const text = sanitizeString(value);
  if (!text) {
    return `${field} is required.`;
  }
  if (text.length < min) {
    return `${field} must be at least ${min} characters.`;
  }
  if (text.length > max) {
    return `${field} must be at most ${max} characters.`;
  }
  return null;
}

function containsBannedText(value) {
  if (!value || typeof value !== 'string') {
    return false;
  }
  const normalized = value.toLowerCase();
  return bannedTerms.some((term) => normalized.includes(term));
}

function createToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function getCurrentUser(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const db = readDb();
    return db.users.find((user) => user.id === payload.id) || null;
  } catch (error) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (user.role === 'banned') {
    return res.status(403).json({ error: 'Account banned' });
  }
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  const user = getCurrentUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  req.user = user;
  next();
}

const categories = [
  'Tech & Gadgets',
  'Skills & Services',
  'Fashion',
  'Home & Furniture',
  'Food & Agriculture',
  'Education',
  'Transport & Autos',
  'Creative Arts'
];

app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.post('/api/ai', async (req, res) => {
  const message = sanitizeString(req.body.message || '');
  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const reply = await getAiReply(message);
    res.json({ reply });
  } catch (error) {
    console.error('AI request failed:', error);
    const warning = OPENAI_API_KEY ? 'AI service returned an error.' : 'AI is not configured. Please set OPENAI_API_KEY in .env.';
    res.status(500).json({ error: warning });
  }
});

app.get('/api/listings', (req, res) => {
  const db = readDb();
  const user = getCurrentUser(req);
  const adminMode = user && user.role === 'admin' && req.query.status === 'all';
  if (adminMode) {
    return res.json(db.listings);
  }
  const approvedListings = db.listings.filter((listing) => listing.status === 'approved');
  res.json(approvedListings);
});

app.post('/api/listings', listingLimiter, requireAuth, (req, res) => {
  const title = sanitizeString(req.body.title);
  const description = sanitizeString(req.body.description || '');
  const category = sanitizeString(req.body.category);
  const wants = sanitizeString(req.body.wants);
  const location = sanitizeString(req.body.location || 'Nigeria');

  const errors = [
    validateString('Title', title, 5, 120),
    validateString('Category', category, 3, 60),
    validateString('What you want', wants, 5, 220),
    validateString('Location', location, 2, 80)
  ].filter(Boolean);

  if (errors.length) {
    return res.status(400).json({ error: errors[0] });
  }

  if (containsBannedText(`${title} ${description} ${wants}`)) {
    return res.status(400).json({ error: 'Listing contains prohibited content.' });
  }

  const db = readDb();
  const listing = {
    id: uuidv4(),
    title,
    description,
    category,
    wants,
    location,
    ownerId: req.user.id,
    ownerName: req.user.fullName || req.user.username,
    status: 'pending',
    flags: 0,
    reports: [],
    createdAt: new Date().toISOString()
  };

  db.listings.unshift(listing);
  writeDb(db);
  res.status(201).json(listing);
});

app.post('/api/listings/:id/report', authLimiter, requireAuth, (req, res) => {
  const reason = sanitizeString(req.body.reason || 'Inappropriate content');
  const db = readDb();
  const listing = db.listings.find((item) => item.id === req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  if (listing.ownerId === req.user.id) {
    return res.status(400).json({ error: 'You cannot report your own listing.' });
  }

  listing.flags = (listing.flags || 0) + 1;
  listing.reports = listing.reports || [];
  listing.reports.unshift({
    id: uuidv4(),
    reporterId: req.user.id,
    reporterName: req.user.fullName || req.user.username,
    reason: reason || 'Reported content',
    createdAt: new Date().toISOString()
  });

  if (listing.flags >= 3 && listing.status === 'approved') {
    listing.status = 'pending';
  }

  writeDb(db);
  res.json({ message: 'Report received.', flags: listing.flags });
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
  const username = sanitizeString(req.body.username || '').toLowerCase();
  const fullName = sanitizeString(req.body.fullName || '');
  const password = req.body.password;

  if (!username || !fullName || !password) {
    return res.status(400).json({ error: 'Full name, username, and password are required.' });
  }

  if (containsBannedText(`${username} ${fullName}`)) {
    return res.status(400).json({ error: 'Invalid registration details.' });
  }

  const db = readDb();
  if (db.users.some((user) => user.username === username)) {
    return res.status(409).json({ error: 'Username already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: uuidv4(),
    username,
    fullName,
    passwordHash,
    role: 'user',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);

  const token = createToken(newUser);
  res.status(201).json({ token, user: { id: newUser.id, username: newUser.username, fullName: newUser.fullName, role: newUser.role } });
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const username = sanitizeString(req.body.username || '').toLowerCase();
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const db = readDb();
  const user = db.users.find((item) => item.username === username);
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  if (user.role === 'banned') {
    return res.status(403).json({ error: 'Account banned.' });
  }

  const token = createToken(user);
  res.json({ token, user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role } });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const { id, username, fullName, role } = req.user;
  res.json({ id, username, fullName, role });
});

app.post('/api/trades', listingLimiter, requireAuth, (req, res) => {
  const listingId = sanitizeString(req.body.listingId || '');
  const message = sanitizeString(req.body.message || '');

  if (!listingId || !message) {
    return res.status(400).json({ error: 'Listing ID and message are required.' });
  }

  const db = readDb();
  const listing = db.listings.find((item) => item.id === listingId && item.status === 'approved');
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found or not approved yet.' });
  }

  if (listing.ownerId === req.user.id) {
    return res.status(400).json({ error: 'You cannot request a trade on your own listing.' });
  }

  const trade = {
    id: uuidv4(),
    listingId,
    buyerId: req.user.id,
    buyerName: req.user.fullName || req.user.username,
    sellerId: listing.ownerId,
    sellerName: listing.ownerName,
    listingTitle: listing.title,
    message,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.trades.unshift(trade);
  writeDb(db);
  res.status(201).json(trade);
});

app.get('/api/trades', requireAuth, (req, res) => {
  const db = readDb();
  const trades = db.trades.filter((trade) => trade.buyerId === req.user.id || trade.sellerId === req.user.id);
  res.json(trades);
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const db = readDb();
  res.json({
    users: db.users.length,
    listings: db.listings.length,
    trades: db.trades.length,
    pendingListings: db.listings.filter((listing) => listing.status === 'pending').length,
    rejectedListings: db.listings.filter((listing) => listing.status === 'rejected').length
  });
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  const db = readDb();
  const users = db.users.map(({ passwordHash, ...user }) => user);
  res.json(users);
});

app.get('/api/admin/listings', requireAdmin, (req, res) => {
  const db = readDb();
  res.json(db.listings);
});

app.post('/api/admin/listings/:id/approve', requireAdmin, (req, res) => {
  const db = readDb();
  const listing = db.listings.find((item) => item.id === req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found.' });
  }
  listing.status = 'approved';
  writeDb(db);
  res.json(listing);
});

app.post('/api/admin/listings/:id/reject', requireAdmin, (req, res) => {
  const db = readDb();
  const listing = db.listings.find((item) => item.id === req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found.' });
  }
  listing.status = 'rejected';
  writeDb(db);
  res.json(listing);
});

app.post('/api/admin/listings/:id/ban', requireAdmin, (req, res) => {
  const db = readDb();
  const listing = db.listings.find((item) => item.id === req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found.' });
  }

  const user = db.users.find((item) => item.id === listing.ownerId);
  if (!user) {
    return res.status(404).json({ error: 'Listing owner not found.' });
  }
  if (user.role === 'admin') {
    return res.status(400).json({ error: 'Cannot ban an admin account.' });
  }

  user.role = 'banned';
  db.listings.forEach((item) => {
    if (item.ownerId === user.id) {
      item.status = 'rejected';
    }
  });

  writeDb(db);
  res.json({ message: 'User banned and associated listings rejected.' });
});

app.post('/api/admin/users/:id/ban', requireAdmin, (req, res) => {
  const db = readDb();
  const user = db.users.find((item) => item.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  if (user.role === 'admin') {
    return res.status(400).json({ error: 'Cannot ban an admin account.' });
  }
  user.role = 'banned';
  writeDb(db);
  res.json({ message: 'User banned.' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'TradeByBater_Landing.html'));
});

app.get('/app.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

app.get('/app', (req, res) => {
  res.redirect('/app.html');
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`TradeByBater server running on http://localhost:${PORT}`);
});
