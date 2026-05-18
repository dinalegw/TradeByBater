const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

function getCurrentUser(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.replace('Bearer ', '');
  const db = readDb();
  return db.users.find((user) => user.token === token) || null;
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

app.get('/api/listings', (req, res) => {
  const db = readDb();
  res.json(db.listings);
});

app.post('/api/listings', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { title, description, category, wants, location } = req.body;
  if (!title || !category || !wants) {
    return res.status(400).json({ error: 'Title, category, and wants are required' });
  }

  const db = readDb();
  const listing = {
    id: uuidv4(),
    title,
    description: description || '',
    category,
    wants,
    location: location || 'Nigeria',
    ownerId: user.id,
    ownerName: user.fullName || user.username,
    createdAt: new Date().toISOString()
  };

  db.listings.unshift(listing);
  writeDb(db);
  res.status(201).json(listing);
});

app.post('/api/auth/register', (req, res) => {
  const { username, password, fullName } = req.body;
  if (!username || !password || !fullName) {
    return res.status(400).json({ error: 'Full name, username, and password are required' });
  }

  const db = readDb();
  if (db.users.some((user) => user.username === username)) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const newUser = {
    id: uuidv4(),
    username,
    password,
    fullName,
    role: 'user',
    token: uuidv4(),
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);
  res.status(201).json({ token: newUser.token, user: { id: newUser.id, username: newUser.username, fullName: newUser.fullName, role: newUser.role } });
});

function requireAdmin(req, res, next) {
  const user = getCurrentUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const db = readDb();
  res.json({
    users: db.users.length,
    listings: db.listings.length,
    trades: db.trades.length,
    latestListings: db.listings.slice(0, 20),
    latestTrades: db.trades.slice(0, 20)
  });
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  const db = readDb();
  const users = db.users.map(({ password, ...user }) => user);
  res.json(users);
});

app.get('/api/admin/listings', requireAdmin, (req, res) => {
  const db = readDb();
  res.json(db.listings);
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDb();
  const user = db.users.find((item) => item.username === username && item.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ token: user.token, user: { id: user.id, username: user.username, fullName: user.fullName } });
});

app.get('/api/auth/me', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  res.json({ id: user.id, username: user.username, fullName: user.fullName });
});

app.post('/api/trades', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { listingId, message } = req.body;
  if (!listingId || !message) {
    return res.status(400).json({ error: 'Listing ID and message are required' });
  }

  const db = readDb();
  const listing = db.listings.find((item) => item.id === listingId);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  const trade = {
    id: uuidv4(),
    listingId,
    buyerId: user.id,
    buyerName: user.fullName || user.username,
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

app.get('/api/trades', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const db = readDb();
  const trades = db.trades.filter((trade) => trade.buyerId === user.id || trade.sellerId === user.id);
  res.json(trades);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'TradeByBater_Landing.html'));
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
