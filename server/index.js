const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const uri = 'mongodb+srv://Galangcouye:feridah4ever%40@cluster0.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);
const dbName = 'gaming_store';

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}

connectDB();

// Helper function
const toObjectId = (id) => {
  try {
    return new ObjectId(id);
  } catch {
    return id;
  }
};

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simple authentication (replace with real auth)
    if (email === 'admin@example.com' && password === 'admin123') {
      res.json({ 
        success: true, 
        user: { id: 'admin1', email, name: 'Admin' }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Games endpoints
app.get('/api/games', async (req, res) => {
  try {
    const games = await db.collection('games').find({}).toArray();
    res.json({ documents: games.map(doc => ({ ...doc, $id: doc._id.toString() })) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/games', async (req, res) => {
  try {
    const data = { ...req.body, created_at: new Date(), updated_at: new Date() };
    const result = await db.collection('games').insertOne(data);
    res.json({ ...data, $id: result.insertedId.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/games/:id', async (req, res) => {
  try {
    const data = { ...req.body, updated_at: new Date() };
    await db.collection('games').updateOne(
      { _id: toObjectId(req.params.id) },
      { $set: data }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/games/:id', async (req, res) => {
  try {
    await db.collection('games').deleteOne({ _id: toObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Products endpoints
app.get('/api/products', async (req, res) => {
  try {
    const { game_id } = req.query;
    const query = game_id ? { game_id } : {};
    const products = await db.collection('products').find(query).toArray();
    res.json({ documents: products.map(doc => ({ ...doc, $id: doc._id.toString() })) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const data = { ...req.body, created_at: new Date(), updated_at: new Date() };
    const result = await db.collection('products').insertOne(data);
    res.json({ ...data, $id: result.insertedId.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const data = { ...req.body, updated_at: new Date() };
    await db.collection('products').updateOne(
      { _id: toObjectId(req.params.id) },
      { $set: data }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await db.collection('products').deleteOne({ _id: toObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Orders endpoints
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.collection('orders').find({}).sort({ created_at: -1 }).toArray();
    res.json({ documents: orders.map(doc => ({ ...doc, $id: doc._id.toString() })) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const data = { ...req.body, created_at: new Date(), updated_at: new Date() };
    const result = await db.collection('orders').insertOne(data);
    res.json({ ...data, $id: result.insertedId.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const data = { ...req.body, updated_at: new Date() };
    await db.collection('orders').updateOne(
      { _id: toObjectId(req.params.id) },
      { $set: data }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    await db.collection('orders').deleteOne({ _id: toObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payment Methods endpoints
app.get('/api/payment-methods', async (req, res) => {
  try {
    const methods = await db.collection('payment_methods').find({}).toArray();
    res.json({ documents: methods.map(doc => ({ ...doc, $id: doc._id.toString() })) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payment-methods', async (req, res) => {
  try {
    const data = { ...req.body, created_at: new Date(), updated_at: new Date() };
    const result = await db.collection('payment_methods').insertOne(data);
    res.json({ ...data, $id: result.insertedId.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/payment-methods/:id', async (req, res) => {
  try {
    const data = { ...req.body, updated_at: new Date() };
    await db.collection('payment_methods').updateOne(
      { _id: toObjectId(req.params.id) },
      { $set: data }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/payment-methods/:id', async (req, res) => {
  try {
    await db.collection('payment_methods').deleteOne({ _id: toObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
