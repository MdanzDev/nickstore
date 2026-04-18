import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';

// MongoDB Atlas Configuration
export const mongodbConfig = {
  uri: 'mongodb+srv://Galangcouye:feridah4ever%40@cluster0.mongodb.net/?retryWrites=true&w=majority',
  databaseName: 'gaming_store',
  collections: {
    games: 'games',
    products: 'products',
    orders: 'orders',
    paymentMethods: 'payment_methods',
    admins: 'admins',
  },
};

// MongoDB Client
let client: MongoClient | null = null;
let db: any = null;

// Initialize MongoDB Connection
export const connectToDatabase = async () => {
  if (db) return db;
  
  try {
    // URL encode the password to handle special characters
    const uri = mongodbConfig.uri.replace('feridah4ever%40', encodeURIComponent('feridah4ever@'));
    
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    
    await client.connect();
    db = client.db(mongodbConfig.databaseName);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Create indexes for better performance
    await createIndexes();
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

// Create indexes for better query performance
const createIndexes = async () => {
  try {
    const db = await connectToDatabase();
    
    // Orders indexes
    await db.collection(mongodbConfig.collections.orders).createIndex({ order_number: 1 }, { unique: true });
    await db.collection(mongodbConfig.collections.orders).createIndex({ status: 1 });
    await db.collection(mongodbConfig.collections.orders).createIndex({ created_at: -1 });
    
    // Products indexes
    await db.collection(mongodbConfig.collections.products).createIndex({ game_id: 1 });
    
    // Payment methods indexes
    await db.collection(mongodbConfig.collections.paymentMethods).createIndex({ is_active: 1 });
    
    // Admins indexes
    await db.collection(mongodbConfig.collections.admins).createIndex({ email: 1 }, { unique: true });
    
    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

// Close MongoDB connection
export const closeDatabaseConnection = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
};

// Helper function to convert string ID to ObjectId
const toObjectId = (id: string) => {
  try {
    return new ObjectId(id);
  } catch (error) {
    throw new Error('Invalid ID format');
  }
};

// Helper function to transform MongoDB document (convert _id to id)
const transformDocument = (doc: any) => {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    id: _id.toString(),
    ...rest
  };
};

// Helper function to transform multiple documents
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
      console.log('Deleting game with ID:', gameId);
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
      console.log('Deleting product with ID:', productId);
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

  // PUBLIC ORDER CREATION
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

  // ADMIN UPDATE
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

  // ADMIN DELETE
  delete: async (orderId: string) => {
    try {
      if (!orderId || orderId.trim() === '') {
        throw new Error('Invalid order ID');
      }
      console.log('Deleting order with ID:', orderId);
      const db = await connectToDatabase();
      const result = await db.collection(mongodbConfig.collections.orders)
        .deleteOne({ _id: toObjectId(orderId) });
      return result;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  // Real-time updates using MongoDB Change Streams
  subscribe: (callback: (payload: any) => void) => {
    let changeStream: any = null;
    
    const setupChangeStream = async () => {
      try {
        const db = await connectToDatabase();
        changeStream = db.collection(mongodbConfig.collections.orders).watch();
        
        changeStream.on('change', (change: any) => {
          callback({
            event: change.operationType,
            payload: transformDocument(change.fullDocument)
          });
        });
        
        changeStream.on('error', (error: any) => {
          console.error('Change stream error:', error);
          // Attempt to reconnect after 5 seconds
          setTimeout(setupChangeStream, 5000);
        });
      } catch (error) {
        console.error('Error setting up change stream:', error);
      }
    };
    
    setupChangeStream();
    
    // Return unsubscribe function
    return () => {
      if (changeStream) {
        changeStream.close();
      }
    };
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
        .sort({ display_order: 1 })
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
      console.log('Deleting payment method with ID:', methodId);
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
  list: async () => {
    try {
      const db = await connectToDatabase();
      const admins = await db.collection(mongodbConfig.collections.admins)
        .find({})
        .toArray();
      return transformDocuments(admins);
    } catch (error) {
      console.error('Error listing admins:', error);
      throw error;
    }
  },

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

  create: async (data: any) => {
    try {
      const db = await connectToDatabase();
      const adminData = {
        ...data,
        email: data.email.toLowerCase(),
        created_at: new Date(),
        updated_at: new Date()
      };
      const result = await db.collection(mongodbConfig.collections.admins)
        .insertOne(adminData);
      return transformDocument({ _id: result.insertedId, ...adminData });
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  },
};

//
// 📁 Storage Helpers (Using GridFS or Base64)
// Since MongoDB Atlas doesn't have built-in file storage like Appwrite,
// we'll provide options for file handling
//
export const storageHelpers = {
  // Option 1: Store files as Base64 in MongoDB
  uploadFileAsBase64: async (file: File, prefix?: string) => {
    try {
      const db = await connectToDatabase();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const fileData = {
              filename: prefix ? `${prefix}_${file.name}` : file.name,
              mimeType: file.type,
              size: file.size,
              data: reader.result,
              uploaded_at: new Date()
            };
            
            const result = await db.collection('files').insertOne(fileData);
            resolve({
              $id: result.insertedId.toString(),
              ...fileData
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

  // Option 2: Get file URL for Base64 stored files
  getFileView: (fileId: string) => {
    try {
      // Return an API endpoint that will serve the file
      return `/api/files/${fileId}`;
    } catch (error) {
      console.error('Error getting file view:', error);
      return '';
    }
  },

  // Option 3: Delete file from MongoDB
  deleteFile: async (fileId: string) => {
    try {
      const db = await connectToDatabase();
      const result = await db.collection('files').deleteOne({ _id: toObjectId(fileId) });
      return result;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  // Option 4: Get file data for serving
  getFileData: async (fileId: string) => {
    try {
      const db = await connectToDatabase();
      const file = await db.collection('files').findOne({ _id: toObjectId(fileId) });
      return file;
    } catch (error) {
      console.error('Error getting file data:', error);
      throw error;
    }
  }
};

//
// 🔢 Generate Order Number
//
export const generateOrderNumber = () => {
  const prefix = 'ORD';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

//
// 🔐 Authentication Helpers (Using MongoDB for sessions/tokens)
//
export const authHelpers = {
  // Simple token generation
  generateToken: () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  },
  
  // Validate admin session
  validateAdminSession: async (token: string) => {
    try {
      const db = await connectToDatabase();
      const session = await db.collection('sessions').findOne({ 
        token,
        expires_at: { $gt: new Date() }
      });
      return session ? transformDocument(session) : null;
    } catch (error) {
      console.error('Error validating session:', error);
      return null;
    }
  },
  
  // Create admin session
  createAdminSession: async (adminId: string) => {
    try {
      const db = await connectToDatabase();
      const token = authHelpers.generateToken();
      const sessionData = {
        admin_id: adminId,
        token,
        created_at: new Date(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
      
      await db.collection('sessions').insertOne(sessionData);
      return token;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },
  
  // Delete session (logout)
  deleteSession: async (token: string) => {
    try {
      const db = await connectToDatabase();
      await db.collection('sessions').deleteOne({ token });
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }
};

// Export ObjectId for external use
export { ObjectId };

// Query helper for MongoDB
export const Query = {
  equal: (field: string, value: any) => ({ [field]: value }),
  notEqual: (field: string, value: any) => ({ [field]: { $ne: value } }),
  greaterThan: (field: string, value: any) => ({ [field]: { $gt: value } }),
  lessThan: (field: string, value: any) => ({ [field]: { $lt: value } }),
  search: (field: string, term: string) => ({ [field]: { $regex: term, $options: 'i' } }),
  orderAsc: (field: string) => ({ [field]: 1 }),
  orderDesc: (field: string) => ({ [field]: -1 }),
};

// Generate a unique ID (similar to Appwrite's ID.unique())
export const ID = {
  unique: () => new ObjectId().toString(),
  custom: (id: string) => id,
};
