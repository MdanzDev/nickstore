import { useState, useEffect, useCallback } from 'react';
import { productsCollection } from '@/lib/mongodb';
import { useAuth } from '@/contexts/AuthContext';
import type { Product } from '@/types';

export const useProducts = (gameId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productsCollection.list(gameId);
      setProducts(response.documents.map((doc: any) => doc as unknown as Product).filter((p: Product) => p.is_active));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getProduct = useCallback(async (productId: string) => {
    try {
      const doc = await productsCollection.get(productId);
      return doc as unknown as Product;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to fetch product');
    }
  }, []);

  return { products, loading, error, refresh: fetchProducts, getProduct };
};

export const useAdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchProducts = useCallback(async (gameId?: string) => {
    if (!isAuthenticated) {
      console.log('[Admin Products] Not authenticated, cannot fetch');
      setError('Please log in to view products');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('[Admin Products] Fetching ALL products...');
      
      const response = await productsCollection.list(gameId);
      console.log(`[Admin Products] Found ${response.documents?.length || 0} total products`);
      
      if (response.documents && response.documents.length > 0) {
        setProducts(response.documents.map((doc: any) => doc as unknown as Product));
      } else {
        setProducts([]);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('[Admin Products] Fetch error:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createProduct = useCallback(async (data: Omit<Product, '$id' | '$createdAt' | '$updatedAt'>) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to create a product');
    }

    try {
      setLoading(true);
      console.log('[Admin Products] Creating product:', data);
      
      const productData = {
        ...data,
        created_at: new Date().toISOString().slice(0, 19),
        updated_at: new Date().toISOString().slice(0, 19),
      };
      
      const newProduct = await productsCollection.create(productData);
      console.log('[Admin Products] Created product:', newProduct);
      
      await fetchProducts();
      return newProduct;
    } catch (err: any) {
      console.error('[Admin Products] Create error:', err);
      throw new Error(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchProducts]);

  const updateProduct = useCallback(async (productId: string, data: Partial<Product>) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to update a product');
    }

    try {
      setLoading(true);
      console.log('[Admin Products] Updating product:', productId, data);
      
      const updateData = {
        ...data,
        updated_at: new Date().toISOString().slice(0, 19),
      };
      
      const updated = await productsCollection.update(productId, updateData);
      console.log('[Admin Products] Updated product:', updated);
      
      await fetchProducts();
      return updated;
    } catch (err: any) {
      console.error('[Admin Products] Update error:', err);
      throw new Error(err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchProducts]);

  const deleteProduct = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to delete a product');
    }

    try {
      setLoading(true);
      console.log('[Admin Products] Deleting product:', productId);
      
      await productsCollection.delete(productId);
      console.log('[Admin Products] Product deleted successfully');
      
      await fetchProducts();
    } catch (err: any) {
      console.error('[Admin Products] Delete error:', err);
      throw new Error(err.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { 
    products, 
    loading, 
    error, 
    refresh: fetchProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct 
  };
};
