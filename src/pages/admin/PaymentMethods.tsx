import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Upload, QrCode, Building2, Wallet, RefreshCw } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAdminPaymentMethods } from '@/hooks/usePaymentMethods';
import { useAuth } from '@/contexts/AuthContext';
import { storageHelpers } from '@/lib/mongodb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { PaymentMethod } from '@/types';

const typeIcons = {
  qr_code: QrCode,
  bank_transfer: Building2,
  e_wallet: Wallet,
  other: Wallet,
};

const typeLabels = {
  qr_code: 'QR Code',
  bank_transfer: 'Bank Transfer',
  e_wallet: 'E-Wallet',
  other: 'Other',
};

const PaymentMethods: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    paymentMethods, 
    loading, 
    createPaymentMethod, 
    updatePaymentMethod, 
    deletePaymentMethod,
    refresh 
  } = useAdminPaymentMethods();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'qr_code' as 'qr_code' | 'bank_transfer' | 'e_wallet' | 'other',
    description: '',
    account_name: '',
    account_number: '',
    instructions: '',
    is_active: true,
    sort_order: 0,
  });
  const [qrImageFile, setQrImageFile] = useState<File | null>(null);
  const [qrImagePreview, setQrImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const handleOpenModal = (method?: PaymentMethod) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        name: method.name,
        type: method.type,
        description: method.description,
        account_name: method.account_name || '',
        account_number: method.account_number || '',
        instructions: method.instructions || '',
        is_active: method.is_active,
        sort_order: method.sort_order,
      });
      
      if (method.qr_image_id) {
        const imageUrl = storageHelpers.getFileView(method.qr_image_id);
        setQrImagePreview(imageUrl);
      } else {
        setQrImagePreview('');
      }
    } else {
      setEditingMethod(null);
      setFormData({
        name: '',
        type: 'qr_code',
        description: '',
        account_name: '',
        account_number: '',
        instructions: '',
        is_active: true,
        sort_order: paymentMethods.length,
      });
      setQrImagePreview('');
    }
    setQrImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      setQrImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingMethod) {
        await updatePaymentMethod(editingMethod.$id!, formData, qrImageFile || undefined);
      } else {
        await createPaymentMethod(formData, qrImageFile || undefined);
      }
      setIsModalOpen(false);
      setQrImageFile(null);
      setQrImagePreview('');
    } catch (err) {
      console.error('Error saving payment method:', err);
      alert(err instanceof Error ? err.message : 'Failed to save payment method');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (methodToDelete) {
      try {
        await deletePaymentMethod(methodToDelete.$id!);
        setDeleteConfirmOpen(false);
        setMethodToDelete(null);
      } catch (err) {
        console.error('Error deleting payment method:', err);
        alert(err instanceof Error ? err.message : 'Failed to delete payment method');
      }
    }
  };

  const confirmDelete = (method: PaymentMethod) => {
    setMethodToDelete(method);
    setDeleteConfirmOpen(true);
  };

  const handleImageError = (methodId: string) => {
    setImageErrors(prev => ({ ...prev, [methodId]: true }));
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminSidebar />

      <main className="lg:ml-64 min-h-screen">
        <div className="h-16 lg:hidden" />

        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Payment Methods</h1>
              <p className="text-slate-400 mt-1">Configure payment options for customers</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => refresh()}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => handleOpenModal()}
                className="bg-violet-500 hover:bg-violet-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          </div>

          {/* Payment Methods Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" className="text-violet-500" />
            </div>
          ) : paymentMethods.length === 0 ? (
            <EmptyState
              title="No payment methods"
              description="Add payment methods for customers to use."
              action={
                <Button onClick={() => handleOpenModal()} className="bg-violet-500 hover:bg-violet-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paymentMethods.map((method) => {
                const Icon = typeIcons[method.type];
                const hasImageError = imageErrors[method.$id!];
                const hasImage = method.qr_image_id && !hasImageError;
                
                return (
                  <div
                    key={method.$id}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center overflow-hidden">
                            {hasImage && method.qr_image_url ? (
                              <img
                                src={method.qr_image_url}
                                alt={method.name}
                                className="w-10 h-10 object-contain rounded"
                                onError={() => handleImageError(method.$id!)}
                                onLoad={() => console.log(`✅ Image loaded: ${method.name}`)}
                              />
                            ) : (
                              <Icon className="w-6 h-6 text-violet-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{method.name}</h3>
                            <span className="text-xs text-slate-500">{typeLabels[method.type]}</span>
                          </div>
                        </div>
                        {!method.is_active && (
                          <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-400 mt-4 line-clamp-2">{method.description}</p>

                      {(method.account_name || method.account_number) && (
                        <div className="mt-4 space-y-1 text-sm">
                          {method.account_name && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Account:</span>
                              <span className="text-slate-300">{method.account_name}</span>
                            </div>
                          )}
                          {method.account_number && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Number:</span>
                              <span className="text-slate-300 font-mono">{method.account_number}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {method.instructions && (
                        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-xs text-slate-400 line-clamp-2">{method.instructions}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-800">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-white"
                          onClick={() => handleOpenModal(method)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-400"
                          onClick={() => confirmDelete(method)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingMethod ? 'Update the payment method details below.' : 'Fill in the details to add a new payment method.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Method Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Touch 'n Go eWallet"
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="qr_code">QR Code</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="e_wallet">E-Wallet</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Pay using Touch 'n Go eWallet"
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_name">Account Name (Optional)</Label>
                <Input
                  id="account_name"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number (Optional)</Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  placeholder="e.g., 1234567890"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>

            {/* QR Code Image Upload */}
            {(formData.type === 'qr_code' || formData.type === 'e_wallet') && (
              <div className="space-y-2">
                <Label>QR Code Image</Label>
                <div className="flex items-center gap-4">
                  {qrImagePreview ? (
                    <div className="relative w-32 h-32">
                      <img
                        src={qrImagePreview}
                        alt="QR Preview"
                        className="w-full h-full object-contain rounded-lg border border-slate-700 bg-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setQrImagePreview('');
                          setQrImageFile(null);
                          // Don't try to set qr_image_id in formData since it doesn't exist
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 transition-colors bg-slate-900/50">
                      <Upload className="w-6 h-6 text-slate-500" />
                      <span className="text-xs text-slate-500 mt-1">Upload QR</span>
                      <span className="text-xs text-slate-600 mt-1">Max 2MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Upload a QR code image for this payment method (JPG, PNG, max 2MB)
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="instructions">Payment Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="e.g., Please upload receipt after payment"
                className="bg-slate-900 border-slate-700 text-white min-h-[80px]"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                min="0"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="bg-slate-900 border-slate-700 text-white"
              />
              <p className="text-xs text-slate-500">Lower numbers appear first in the list</p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-violet-500 hover:bg-violet-600 text-white"
              >
                {submitting ? 'Saving...' : editingMethod ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-slate-950 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete "{methodToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PaymentMethods;
