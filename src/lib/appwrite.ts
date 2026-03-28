import { Client, Databases, Storage, Account, ID, Query } from 'appwrite';

// Appwrite Configuration
export const appwriteConfig = {
  endpoint: 'https://sgp.cloud.appwrite.io/v1',
  projectId: '69c6c201000691d22aef',
  databaseId: '69c6ccca003dbdc749e6',
  collections: {
    games: 'games',
    products: 'products',
    orders: 'orders',
    paymentMethods: 'payment_methods',
    admins: 'admins',
  },
  buckets: {
    storage: '69c6e03c001a2578e6bf',
  },
};

// Initialize Appwrite Client
export const client = new Client();
client.setEndpoint(appwriteConfig.endpoint);
client.setProject(appwriteConfig.projectId);

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);

// Database ID
const DATABASE_ID = appwriteConfig.databaseId;

//
// 🔐 Permission Helper (For Admin Operations)
//
const getPermissions = async () => {
  try {
    const user = await account.get();
    return [
      `read("user:${user.$id}")`,
      `write("user:${user.$id}")`,
      `update("user:${user.$id}")`,
      `delete("user:${user.$id}")`
    ];
  } catch (error) {
    throw new Error('You must be logged in to perform this action');
  }
};

//
// 🎮 Games Collection
//
export const gamesCollection = {
  list: async () => {
    try {
      return await databases.listDocuments(DATABASE_ID, appwriteConfig.collections.games);
    } catch (error) {
      console.error('Error listing games:', error);
      throw error;
    }
  },

  get: async (gameId: string) => {
    try {
      return await databases.getDocument(DATABASE_ID, appwriteConfig.collections.games, gameId);
    } catch (error) {
      console.error('Error getting game:', error);
      throw error;
    }
  },

  create: async (data: any) => {
    try {
      const permissions = await getPermissions();
      return await databases.createDocument(
        DATABASE_ID,
        appwriteConfig.collections.games,
        ID.unique(),
        data,
        permissions
      );
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  },

  update: async (gameId: string, data: any) => {
    try {
      const permissions = await getPermissions();
      return await databases.updateDocument(
        DATABASE_ID,
        appwriteConfig.collections.games,
        gameId,
        data,
        permissions
      );
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
      return await databases.deleteDocument(
        DATABASE_ID,
        appwriteConfig.collections.games,
        gameId
      );
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
      const queries = gameId ? [Query.equal('game_id', gameId)] : [];
      return await databases.listDocuments(DATABASE_ID, appwriteConfig.collections.products, queries);
    } catch (error) {
      console.error('Error listing products:', error);
      throw error;
    }
  },

  get: async (productId: string) => {
    try {
      return await databases.getDocument(DATABASE_ID, appwriteConfig.collections.products, productId);
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  },

  create: async (data: any) => {
    try {
      const permissions = await getPermissions();
      return await databases.createDocument(
        DATABASE_ID,
        appwriteConfig.collections.products,
        ID.unique(),
        data,
        permissions
      );
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  update: async (productId: string, data: any) => {
    try {
      const permissions = await getPermissions();
      return await databases.updateDocument(
        DATABASE_ID,
        appwriteConfig.collections.products,
        productId,
        data,
        permissions
      );
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
      return await databases.deleteDocument(
        DATABASE_ID,
        appwriteConfig.collections.products,
        productId
      );
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },
};

//
// 📦 Orders Collection - FIXED FOR PUBLIC ORDER CREATION
//
export const ordersCollection = {
  list: async (status?: string) => {
    try {
      const queries = status ? [Query.equal('status', status)] : [];
      return await databases.listDocuments(DATABASE_ID, appwriteConfig.collections.orders, queries);
    } catch (error) {
      console.error('Error listing orders:', error);
      throw error;
    }
  },

  get: async (orderId: string) => {
    try {
      return await databases.getDocument(DATABASE_ID, appwriteConfig.collections.orders, orderId);
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  },

  getByOrderNumber: async (orderNumber: string) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        appwriteConfig.collections.orders,
        [Query.equal('order_number', orderNumber)]
      );
      return response.documents[0];
    } catch (error) {
      console.error('Error getting order by number:', error);
      throw error;
    }
  },

  // PUBLIC ORDER CREATION - No authentication required
  create: async (data: any) => {
    try {
      // Use public permissions so anyone can create orders
      const permissions = [
        'read("any")',
        'write("any")',
        'update("any")',
        'delete("any")'
      ];
      
      return await databases.createDocument(
        DATABASE_ID,
        appwriteConfig.collections.orders,
        ID.unique(),
        data,
        permissions
      );
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // ADMIN UPDATE - Requires authentication
  update: async (orderId: string, data: any) => {
    try {
      const permissions = await getPermissions();
      return await databases.updateDocument(
        DATABASE_ID,
        appwriteConfig.collections.orders,
        orderId,
        data,
        permissions
      );
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // ADMIN DELETE - Requires authentication
  delete: async (orderId: string) => {
    try {
      if (!orderId || orderId.trim() === '') {
        throw new Error('Invalid order ID');
      }
      console.log('Deleting order with ID:', orderId);
      return await databases.deleteDocument(
        DATABASE_ID,
        appwriteConfig.collections.orders,
        orderId
      );
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  subscribe: (callback: (payload: any) => void) => {
    return client.subscribe(
      `databases.${DATABASE_ID}.collections.${appwriteConfig.collections.orders}.documents`,
      callback
    );
  },
};

//
// 💳 Payment Methods Collection
//
export const paymentMethodsCollection = {
  list: async (active?: boolean) => {
    try {
      const queries = active !== undefined ? [Query.equal('is_active', active)] : [];
      return await databases.listDocuments(DATABASE_ID, appwriteConfig.collections.paymentMethods, queries);
    } catch (error) {
      console.error('Error listing payment methods:', error);
      throw error;
    }
  },

  get: async (methodId: string) => {
    try {
      return await databases.getDocument(DATABASE_ID, appwriteConfig.collections.paymentMethods, methodId);
    } catch (error) {
      console.error('Error getting payment method:', error);
      throw error;
    }
  },

  create: async (data: any) => {
    try {
      const permissions = await getPermissions();
      return await databases.createDocument(
        DATABASE_ID,
        appwriteConfig.collections.paymentMethods,
        ID.unique(),
        data,
        permissions
      );
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  },

  update: async (methodId: string, data: any) => {
    try {
      const permissions = await getPermissions();
      return await databases.updateDocument(
        DATABASE_ID,
        appwriteConfig.collections.paymentMethods,
        methodId,
        data,
        permissions
      );
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
      return await databases.deleteDocument(
        DATABASE_ID,
        appwriteConfig.collections.paymentMethods,
        methodId
      );
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  },
};

//
// 📁 Storage Helpers
//
export const storageHelpers = {
  uploadFile: async (file: File, prefix?: string) => {
    try {
      const fileId = prefix ? `${prefix}_${ID.unique()}` : ID.unique();
      const result = await storage.createFile(appwriteConfig.buckets.storage, fileId, file);
      console.log('File uploaded:', result.$id);
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  getFileView: (fileId: string) => {
    try {
      const url = `https://sgp.cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.buckets.storage}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
      return url;
    } catch (error) {
      console.error('Error getting file view:', error);
      return '';
    }
  },

  getFilePreview: (fileId: string) => {
    return storageHelpers.getFileView(fileId);
  },

  deleteFile: async (fileId: string) => {
    try {
      return await storage.deleteFile(appwriteConfig.buckets.storage, fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },
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

export { ID, Query };