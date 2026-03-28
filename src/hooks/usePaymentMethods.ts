import { useState, useEffect, useCallback } from 'react';
import { paymentMethodsCollection, storageHelpers, appwriteConfig } from '@/lib/appwrite';
import { useAuth } from '@/contexts/AuthContext';
import type { PaymentMethod } from '@/types';

// Public hook - only gets active payment methods
export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[Public] Fetching ACTIVE payment methods...');
      const response = await paymentMethodsCollection.list(true);
      
      const methodsWithImages = await Promise.all(
        response.documents.map(async (method: any) => {
          if (method.qr_image_id) {
            method.qr_image_url = storageHelpers.getFileView(method.qr_image_id);
          }
          return method;
        })
      );
      
      console.log(`[Public] Found ${methodsWithImages.length} active payment methods`);
      setPaymentMethods(methodsWithImages);
      setError(null);
    } catch (err: any) {
      console.error('[Public] Error:', err);
      setError(err.message || 'Failed to fetch payment methods');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return { paymentMethods, loading, error, refresh: fetchPaymentMethods };
};

// Admin hook - gets ALL payment methods
export const useAdminPaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchPaymentMethods = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('[Admin] Not authenticated, cannot fetch');
      setError('Please log in to view payment methods');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('[Admin] Fetching ALL payment methods...');
      
      const response = await fetch(
        `https://sgp.cloud.appwrite.io/v1/databases/${appwriteConfig.databaseId}/collections/payment_methods/documents`,
        {
          headers: {
            'X-Appwrite-Project': appwriteConfig.projectId,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = await response.json();
      console.log(`[Admin] Found ${data.documents?.length || 0} total payment methods`);
      
      if (data.documents && data.documents.length > 0) {
        const methodsWithImages = await Promise.all(
          data.documents.map(async (method: any) => {
            if (method.qr_image_id) {
              method.qr_image_url = storageHelpers.getFileView(method.qr_image_id);
            }
            return method;
          })
        );
        
        setPaymentMethods(methodsWithImages);
      } else {
        setPaymentMethods([]);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('[Admin] Fetch error:', err);
      setError(err.message || 'Failed to fetch payment methods');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createPaymentMethod = useCallback(async (data: any, imageFile?: File) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to create a payment method');
    }

    try {
      setLoading(true);
      let qr_image_id = '';
      
      if (imageFile) {
        try {
          console.log('[Admin] Uploading QR image...');
          const upload = await storageHelpers.uploadFile(imageFile, 'payment_qr');
          qr_image_id = upload.$id;
          console.log('[Admin] Uploaded with ID:', qr_image_id);
        } catch (uploadError: any) {
          throw new Error(`Failed to upload QR code: ${uploadError.message}`);
        }
      }
      
      const methodData = {
        name: data.name,
        type: data.type,
        description: data.description,
        account_name: data.account_name || '',
        account_number: data.account_number || '',
        qr_image_id: qr_image_id,
        instructions: data.instructions || '',
        is_active: data.is_active,
        sort_order: data.sort_order || 0,
      };
      
      const newMethod = await paymentMethodsCollection.create(methodData);
      console.log('[Admin] Created new payment method:', newMethod.name);
      
      await fetchPaymentMethods();
      return newMethod;
    } catch (err: any) {
      console.error('[Admin] Create error:', err);
      throw new Error(err.message || 'Failed to create payment method');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchPaymentMethods]);

  const updatePaymentMethod = useCallback(async (methodId: string, data: any, imageFile?: File) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to update a payment method');
    }

    try {
      setLoading(true);
      let qr_image_id = data.qr_image_id;
      
      if (imageFile) {
        try {
          const upload = await storageHelpers.uploadFile(imageFile, 'payment_qr');
          qr_image_id = upload.$id;
        } catch (uploadError: any) {
          throw new Error(`Failed to upload QR code: ${uploadError.message}`);
        }
      }
      
      const updateData = {
        name: data.name,
        type: data.type,
        description: data.description,
        account_name: data.account_name || '',
        account_number: data.account_number || '',
        qr_image_id: qr_image_id,
        instructions: data.instructions || '',
        is_active: data.is_active,
        sort_order: data.sort_order || 0,
      };
      
      const updated = await paymentMethodsCollection.update(methodId, updateData);
      await fetchPaymentMethods();
      return updated;
    } catch (err: any) {
      console.error('[Admin] Update error:', err);
      throw new Error(err.message || 'Failed to update payment method');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchPaymentMethods]);

  const deletePaymentMethod = useCallback(async (methodId: string) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to delete a payment method');
    }

    try {
      setLoading(true);
      console.log('[Admin] Deleting payment method:', methodId);
      
      // Validate the ID
      if (!methodId || methodId.trim() === '') {
        throw new Error('Invalid payment method ID');
      }
      
      await paymentMethodsCollection.delete(methodId);
      console.log('[Admin] Payment method deleted successfully');
      
      await fetchPaymentMethods();
    } catch (err: any) {
      console.error('[Admin] Delete error:', err);
      throw new Error(err.message || 'Failed to delete payment method');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchPaymentMethods]);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    refresh: fetchPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  };
};