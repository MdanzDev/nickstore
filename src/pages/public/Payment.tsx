import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Upload, MessageCircle, CheckCircle } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { PaymentMethodCard } from '@/components/public/PaymentMethodCard';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useCreateOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { game, product, userDetails } = location.state || {};
  const { paymentMethods, loading: methodsLoading } = usePaymentMethods();
  const { createOrder, loading: creatingOrder } = useCreateOrder();

  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if no game/product
  useEffect(() => {
    if (!game || !product) {
      navigate('/games');
    }
  }, [game, product, navigate]);

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    if (isSubmitting) return;
    
    setError('');
    setIsSubmitting(true);

    const orderData = {
      game_id: game.$id,
      game_name: game.name,
      product_id: product.$id,
      product_name: product.name,
      denomination: product.denomination,
      price: product.price,
      quantity: 1,
      total_amount: product.price,
      user_game_id: userDetails.userGameId,
      user_game_server: userDetails.userGameServer || '',
      user_nickname: userDetails.userNickname || '',
      user_email: userDetails.userEmail || '',
      user_phone: userDetails.userPhone || '',
      payment_method_id: selectedMethod.$id,
      payment_method_name: selectedMethod.name,
    };

    try {
      const result = await createOrder(orderData, receiptFile || undefined);
      if (result && result.orderNumber) {
        // Use window.location for Android PWA to avoid white screen
        // This forces a full page navigation instead of client-side routing
        window.location.href = `/order-success?order=${result.orderNumber}`;
      } else {
        throw new Error('Order creation failed');
      }
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.message || 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappNumber = '60137345871';
  const whatsappMessage = 'Hi, I need assistance with my order.';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  if (!game || !product) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="pt-8 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Progress */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-violet-400 font-medium">Details</span>
            </div>
            <div className="flex-1 h-0.5 bg-violet-500" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-medium">
                2
              </div>
              <span className="text-violet-400 font-medium">Payment</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 text-sm font-medium">
                3
              </div>
              <span className="text-slate-500">Complete</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Select Payment Method</h2>
                
                {methodsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" className="text-violet-500" />
                  </div>
                ) : paymentMethods.length === 0 ? (
                  <EmptyState
                    title="No payment methods"
                    description="Payment methods are currently unavailable."
                  />
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <PaymentMethodCard
                        key={method.$id}
                        method={method}
                        isSelected={selectedMethod?.$id === method.$id}
                        onSelect={() => setSelectedMethod(method)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* QR Code Display */}
              {selectedMethod?.qr_image_url && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Scan to Pay</h3>
                  <div className="flex flex-col items-center">
                    <img
                      src={selectedMethod.qr_image_url}
                      alt="Payment QR Code"
                      className="w-64 h-64 object-contain rounded-xl border border-slate-700"
                      onError={(e) => {
                        console.error('QR image failed to load');
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <p className="text-slate-400 text-sm mt-4 text-center">
                      Scan the QR code with your {selectedMethod.name} app to complete payment
                    </p>
                  </div>
                </div>
              )}

              {/* Receipt Upload */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Upload Payment Receipt</h3>
                
                {receiptPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={receiptPreview}
                      alt="Receipt Preview"
                      className="max-w-full max-h-64 rounded-xl border border-slate-700"
                    />
                    <button
                      onClick={() => {
                        setReceiptPreview('');
                        setReceiptFile(null);
                      }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-white"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-violet-500 transition-colors">
                    <Upload className="w-10 h-10 text-slate-500 mb-2" />
                    <span className="text-slate-400">Click to upload receipt</span>
                    <span className="text-slate-500 text-sm mt-1">JPG, PNG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!selectedMethod || creatingOrder || isSubmitting}
                className="w-full bg-violet-500 hover:bg-violet-600 text-white py-6"
              >
                {(creatingOrder || isSubmitting) ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Order
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Game</span>
                    <span className="text-white">{game.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Product</span>
                    <span className="text-white">{product.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Denomination</span>
                    <span className="text-white">{product.denomination}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Game ID</span>
                    <span className="text-white">{userDetails.userGameId}</span>
                  </div>
                  {userDetails.userGameServer && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Server</span>
                      <span className="text-white">{userDetails.userGameServer}</span>
                    </div>
                  )}
                  {userDetails.userNickname && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Nickname</span>
                      <span className="text-white">{userDetails.userNickname}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total</span>
                    <span className="text-2xl font-bold text-violet-400">
                      RM {product.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {selectedMethod && (
                  <div className="mt-4 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                    <p className="text-sm text-violet-300">
                      Payment Method: <span className="font-medium">{selectedMethod.name}</span>
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate-800">
                  <a 
                    href={whatsappLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-slate-500 hover:text-violet-400 transition-colors flex items-center justify-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    Need help? Contact us on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Payment;
