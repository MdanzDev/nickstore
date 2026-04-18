import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';

// MongoDB Atlas Configuration
export const mongodbConfig = {
  uri: import.meta.env.VITE_MONGODB_URI || 'mongodb+srv://Galangcouye:feridah4ever%40@cluster0.mongodb.net/?retryWrites=true&w=majority',
  databaseName: import.meta.env.VITE_MONGODB_DB || 'gaming_store',
  projectId: 'mongodb-atlas',
  databaseId: 'gaming_store',
  collections: {
    games: 'games',
    products: 'products',
    orders: 'orders',
    paymentMethods: 'payment_methods',
    admins: 'admins',
  },
  buckets: {
    storage: 'files',
  },
};

// For backward compatibility
export const appwriteConfig = mongodbConfig;

// MongoDB Client
let client: MongoClient | null = null;
let db: any = null;

// Initialize MongoDB Connection
export const connectToDatabase = async () => {
  if (db) return db;
  
  try {
    const uri = mongodbConfig.uri.replace('feridah4ever%40', encodeURIComponent('feridah4ever@'));
    
    client = new MongoClient(uri);
    
    await client.connect();
    db = client.db(mongodbConfig.databaseName);
    console.log('✅ Connected to MongoDB Atlas');
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

// Helper functions
const toObjectId = (id: string) => {
  try {
    return new ObjectId(id);
  } catch (error) {
    throw new Error('Invalid ID format');
  }
};

const transformDocument = (doc: any) => {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    $id: _id.toString(),
    id: _id.toString(),
    ...rest
  };
};

const transformDocuments = (docs: any[]) => {
  return docs.map(transformDocument);
};

//
// 🎮 Games Collection
//
export const gamesCollection = {
  list: async () => {
    try {
      const db = await connectToDatabase();
      const games = await db.collection(mongodbConfig.collections.games)
        .find({})
        .sort({ created_at: -1 })
        .toArray();
      return { documents: transformDocuments(games), total: games.length };
    } catch (error) {
      console.error('Error listing games:', error);
      throw error;
    }
  },

  get: async (gameId: string) => {
    try {
      const db = await connectToDatabase();
      const game = await db.collection(mongodbConfig.collections.games)
        .findOne({ _id: toObjectId(gameId) });
      return transformDocument(game);
    } catch (error) {
      console.error('Error getting game:', error);
      throw error;
    }
  },

  create: async (data: any) => {
    try {
      const db = await connectToDatabase();
      const gameData = {
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      };
      const result = await db.collection(mongodbConfig.collections.games)
        .insertOne(gameData);
      return transformDocument({ _id: result.insertedId, ...gameData });
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  },

  update: async (gameId: string, data: any) => {
    try {
      const db = await connectToDatabase();
      const updateData = {
        ...data,
        updated_at: new Date()
      };
      const result = await db.collection(mongodbConfig.collections.games)
        .findOneAndUpdate(
          { _id: toObjectId(gameId) },
          { $set: updateData },
          { returnDocument: 'after' }
        );
      return transformDocument(result);
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  },

  delete: async (gameId: string) => {
    try {
      if (!gameId || gameId.trim() === '') {
        throw new Error('Invalid game ID');
      }
      const db = await connectToDatabase();
      const result = await db.collection(mongodbConfig.collections.games)
        .deleteOne({ _id: toObjectId(gameId) });
      return result;
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  },
};

//
// 🛒 Products Collection
//
export const productsCollection = {
  list: async (gameId?: string) => {
    try {
      const db = await connectToDatabase();
      const query: any = {};
      if (gameId) {
        query.game_id = gameId;
      }
      const products = await db.collection(mongodbConfig.collections.products)
        .find(query)
        .sort({ created_at: -1 })
        .toArray();
      return { documents: transformDocuments(products), total: products.length };
    } catch (error) {
      console.error('Error listing products:', error);
      throw error;
    }
  },

  get: async (productId: string) => {
    try {
      const db = await connectToDatabase();
      const product = await db.collection(mongodbConfig.collections.products)
        .findOne({ _id: toObjectId(productId) });
      return transformDocument(product);
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  },

  create: async (data: any) => {
    try {
      const db = await connectToDatabase();
      const productData = {
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      };
      const result = await db.collection(mongodbConfig.collections.products)
        .insertOne(productData);
      return transformDocument({ _id: result.insertedId, ...productData });
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  update: async (productId: string, data: any) => {
    try {
      const db = await connectToDatabase();
      const updateData = {
        ...data,
        updated_at: new Date()
      };
      const result = await db.collection(mongodbConfig.collections.products)
        .findOneAndUpdate(
          { _id: toObjectId(productId) },
          { $set: updateData },
          { returnDocument: 'after' }
        );
      return transformDocument(result);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  delete: async (productId: string) => {
    try {
      if (!productId || productId.trim() === '') {
        throw new Error('Invalid product ID');
      }
      const db = await connectToDatabase();
      const result = await db.collection(mongodbConfig.collections.products)
        .deleteOne({ _id: toObjectId(productId) });
      return result;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },
};

//
// 📦 Orders Collection
//
export const ordersCollection = {
  list: async (status?: string) => {
    try {
      const db = await connectToDatabase();
      const query: any = {};
      if (status) {
        query.status = status;
      }
      const orders = await db.collection(mongodbConfig.collections.orders)
        .find(query)
        .sort({ created_at: -1 })
        .toArray();
      return { documents: transformDocuments(orders), total: orders.length };
    } catch (error) {
      console.error('Error listing orders:', error);
      throw error;
    }
  },

  get: async (orderId: string) => {
    try {
      const db = await connectToDatabase();
      const order = await db.collection(mongodbConfig.collections.orders)
        .findOne({ _id: toObjectId(orderId) });
      return transformDocument(order);
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  },

  getByOrderNumber: async (orderNumber: string) => {
    try {
      const db = await connectToDatabase();
      const order = await db.collection(mongodbConfig.collections.orders)
        .findOne({ order_number: orderNumber });
      return transformDocument(order);
    } catch (error) {
      console.error('Error getting order by number:', error);
      throw error;
    }
  },

  create: async (data: any) => {
    try {
      const db = await connectToDatabase();
      const orderData = {
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
        status: data.status || 'pending'
      };
      const result = await db.collection(mongodbConfig.collections.orders)
        .insertOne(orderData);
      return transformDocument({ _id: result.insertedId, ...orderData });
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  update: async (orderId: string, data: any) => {
    try {
      const db = await connectToDatabase();
      const updateData = {
        ...data,
        updated_at: new Date()
      };
      const result = await db.collection(mongodbConfig.collections.orders)
        .findOneAndUpdate(
          { _id: toObjectId(orderId) },
          { $set: updateData },
          { returnDocument: 'after' }
        );
      return transformDocument(result);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  delete: async (orderId: string) => {
    try {
      if (!orderId || orderId.trim() === '') {
        throw new Error('Invalid order ID');
      }
      const db = await connectToDatabase();
      const result = await db.collection(mongodbConfig.collections.orders)
        .deleteOne({ _id: toObjectId(orderId) });
      return result;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  subscribe: (callback: (payload: any) => void) => {
    return () => {}; // Placeholder for real-time updates
  },
};

//
// 💳 Payment Methods Collection
//
export const paymentMethodsCollection = {
  list: async (active?: boolean) => {
    try {
      const db = await connectToDatabase();
      const query: any = {};
      if (active !== undefined) {
        query.is_active = active;
      }
      const methods = await db.collection(mongodbConfig.collections.paymentMethods)
        .find(query)
        .sort({ sort_order: 1 })
        .toArray();
      return { documents: transformDocuments(methods), total: methods.length };
    } catch (error) {
      console.error('Error listing payment methods:', error);
      throw error;
    }
  },

  get: async (methodId: string) => {
    try {
      const db = await connectToDatabase();
      const method = await db.collection(mongodbConfig.collections.paymentMethods)
        .findOne({ _id: toObjectId(methodId) });
      return transformDocument(method);
    } catch (error) {
      console.error('Error getting payment method:', error);
      throw error;
    }
  },

  create: async (data: any) => {
    try {
      const db = await connectToDatabase();
      const methodData = {
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      };
      const result = await db.collection(mongodbConfig.collections.paymentMethods)
        .insertOne(methodData);
      return transformDocument({ _id: result.insertedId, ...methodData });
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  },

  update: async (methodId: string, data: any) => {
    try {
      const db = await connectToDatabase();
      const updateData = {
        ...data,
        updated_at: new Date()
      };
      const result = await db.collection(mongodbConfig.collections.paymentMethods)
        .findOneAndUpdate(
          { _id: toObjectId(methodId) },
          { $set: updateData },
          { returnDocument: 'after' }
        );
      return transformDocument(result);
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  },

  delete: async (methodId: string) => {
    try {
      if (!methodId || methodId.trim() === '') {
        throw new Error('Invalid payment method ID');
      }
      const db = await connectToDatabase();
      const result = await db.collection(mongodbConfig.collections.paymentMethods)
        .deleteOne({ _id: toObjectId(methodId) });
      return result;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  },
};

//
// 👤 Admins Collection
//
export const adminsCollection = {
  getByEmail: async (email: string) => {
    try {
      const db = await connectToDatabase();
      const admin = await db.collection(mongodbConfig.collections.admins)
        .findOne({ email: email.toLowerCase() });
      return transformDocument(admin);
    } catch (error) {
      console.error('Error getting admin:', error);
      throw error;
    }
  },
};

//
// 📁 Storage Helpers
//
export const storageHelpers = {
  uploadFile: async (file: File, prefix?: string): Promise<any> => {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const fileId = prefix ? `${prefix}_${Date.now()}` : `file_${Date.now()}`;
            resolve({
              $id: fileId,
              name: file.name,
              size: file.size,
              type: file.type,
              data: reader.result
            });
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  getFileView: (fileId: string): string => {
    return `/api/files/${fileId}`;
  },

  getFilePreview: (fileId: string): string => {
    return `/api/files/${fileId}`;
  },

  deleteFile: async (fileId: string): Promise<any> => {
    console.log('Delete file:', fileId);
    return { success: true };
  },
};

//
// 🔢 Generate Order Number
//
export const generateOrderNumber = (): string => {
  const prefix = 'ORD';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Mock account for authentication
export const account = {
  get: async () => {
    const session = localStorage.getItem('adminSession');
    if (session) {
      return JSON.parse(session);
    }
    throw new Error('No session found');
  },
  
  createEmailPasswordSession: async (email: string, password: string) => {
    // Simple admin check - replace with real authentication
    if (email === 'admin@example.com' && password === 'admin123') {
      const user = { $id: 'admin1', email, name: 'Admin' };
      localStorage.setItem('adminSession', JSON.stringify(user));
      return user;
    }
    throw new Error('Invalid credentials');
  },
  
  deleteSession: async (sessionId: string) => {
    localStorage.removeItem('adminSession');
    return { success: true };
  },
};

export { ObjectId };

// Utility exports for compatibility
export const ID = {
  unique: () => new ObjectId().toString(),
};

export const Query = {
  equal: (field: string, value: any) => ({ [field]: value }),
};
