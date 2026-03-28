import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, MessageCircle, Copy, ArrowLeft, Clock, RefreshCw, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useOrders } from '@/hooks/useOrders';

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const { getOrderByNumber } = useOrders();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const maxRetries = 10; // Increased for auto-refresh

  // Auto-refresh effect - checks for order status changes every 3 seconds
  useEffect(() => {
    if (!orderNumber) return;

    const interval = setInterval(async () => {
      if (orderNumber) {
        try {
          const freshOrder = await getOrderByNumber(orderNumber);
          if (freshOrder) {
            // Check if status changed
            if (order && freshOrder.status !== order.status) {
              console.log(`Order status changed from ${order.status} to ${freshOrder.status}`);
              setOrder(freshOrder);
              // If status changed to success, show confetti again
              if (freshOrder.status === 'success') {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
              }
            } else if (!order) {
              setOrder(freshOrder);
            }
          }
        } catch (err) {
          console.error('Auto-refresh error:', err);
        }
      }
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [orderNumber, getOrderByNumber, order]);

  useEffect(() => {
    // Trigger confetti effect only on success
    if (order?.status === 'success') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [order?.status]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) {
        setError('No order number provided');
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching order ${orderNumber} (attempt ${retryCount + 1})...`);
        const orderData = await getOrderByNumber(orderNumber);
        
        if (orderData) {
          console.log('Order found!', orderData);
          setOrder(orderData);
          setError(null);
          setLoading(false);
        } else if (retryCount < maxRetries) {
          const timer = setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000);
          return () => clearTimeout(timer);
        } else {
          setError('Order not found after multiple attempts');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        if (retryCount < maxRetries) {
          const timer = setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000);
          return () => clearTimeout(timer);
        } else {
          setError('Failed to fetch order details');
          setLoading(false);
        }
      }
    };

    fetchOrder();
  }, [orderNumber, getOrderByNumber, retryCount, maxRetries]);

  const handleRetry = () => {
    setRetryCount(0);
    setLoading(true);
    setError(null);
  };

  useEffect(() => {
    if (error && retryCount >= maxRetries) {
      const timer = setTimeout(() => {
        navigate('/games');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, navigate]);

  const copyOrderNumber = () => {
    if (order?.order_number) {
      navigator.clipboard.writeText(order.order_number);
      alert('Order number copied!');
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `RM ${numericAmount.toFixed(2)}`;
  };

  const whatsappNumber = '60137345871';
  const whatsappMessage = order 
    ? `Hi, I'm inquiring about my order *${order.order_number}* (Status: ${order.status}).`
    : `Hi, I just placed order *${orderNumber}*. Please process it ASAP.`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  // Status-based UI configuration
  const getStatusConfig = () => {
    switch (order?.status) {
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-emerald-500',
          bgColor: 'bg-emerald-500/20',
          title: 'Order Completed Successfully!',
          subtitle: 'Thank you for your purchase! Your order has been processed.',
          buttonVariant: 'bg-violet-500 hover:bg-violet-600',
          showConfetti: true,
        };
      case 'pending':
        return {
          icon: Clock,
          iconColor: 'text-amber-500',
          bgColor: 'bg-amber-500/20',
          title: 'Order Pending',
          subtitle: 'Your order is being processed. We\'ll update the status once payment is confirmed.',
          buttonVariant: 'bg-amber-500 hover:bg-amber-600',
          showConfetti: false,
        };
      case 'failed':
        return {
          icon: XCircle,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-500/20',
          title: 'Order Failed',
          subtitle: 'There was an issue with your order. Please contact us for assistance.',
          buttonVariant: 'bg-red-500 hover:bg-red-600',
          showConfetti: false,
        };
      default:
        return {
          icon: Clock,
          iconColor: 'text-slate-500',
          bgColor: 'bg-slate-500/20',
          title: 'Order Status Unknown',
          subtitle: 'Please contact support for assistance.',
          buttonVariant: 'bg-violet-500 hover:bg-violet-600',
          showConfetti: false,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center animate-pulse">
            <div className="w-20 h-20 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
            </div>
            <p className="text-slate-400 animate-pulse">Loading order details...</p>
            {retryCount > 0 && (
              <p className="text-slate-500 text-sm mt-2 animate-fade-in">
                Attempt {retryCount} of {maxRetries}...
              </p>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 animate-shake">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
            <p className="text-red-400 mb-2 animate-pulse">{error || 'Order not found'}</p>
            <p className="text-slate-500 text-sm mb-6">
              Your order has been placed but we're having trouble loading the details.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleRetry}
                className="bg-violet-500 hover:bg-violet-600 text-white transition-all duration-300 hover:scale-105"
              >
                <RefreshCw className="w-4 h-4 mr-2 animate-spin-slow" />
                Retry
              </Button>
              <Button
                onClick={() => navigate('/games')}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 transition-all duration-300"
              >
                Continue Shopping
              </Button>
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors duration-300"
              >
                Or contact admin on WhatsApp
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Confetti effect overlay - only on success */}
      {showConfetti && statusConfig.showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                  backgroundColor: ['#8b5cf6', '#ec489a', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)],
                  width: `${5 + Math.random() * 10}px`,
                  height: `${5 + Math.random() * 10}px`,
                  opacity: 0.7,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <Navbar />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Success Card with status-based styling */}
          <div className={`bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 text-center animate-slide-up`}>
            {/* Status Icon with bounce animation */}
            <div className={`w-24 h-24 rounded-full ${statusConfig.bgColor} flex items-center justify-center mx-auto mb-6 animate-bounce-in`}>
              <div className="relative">
                <StatusIcon className={`w-12 h-12 ${statusConfig.iconColor} ${order.status === 'pending' ? 'animate-pulse-slow' : 'animate-scale-pulse'}`} />
                {order.status === 'pending' && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 animate-ping" />
                )}
              </div>
            </div>
            
            <h1 className={`text-2xl md:text-3xl font-bold mb-3 animate-fade-in-up ${statusConfig.iconColor}`}>
              {statusConfig.title}
            </h1>
            <p className="text-slate-400 mb-6 animate-fade-in-up animation-delay-200">
              {statusConfig.subtitle}
            </p>

            {/* Status Badge with pulse animation */}
            <div className="inline-flex items-center gap-2 mb-6 animate-fade-in-up animation-delay-300">
              <StatusBadge status={order.status} />
              <span className="text-slate-500 text-sm animate-pulse-slow">
                {order.status === 'pending' && 'Waiting for payment confirmation'}
                {order.status === 'success' && 'Order completed successfully'}
                {order.status === 'failed' && 'Order failed - contact support'}
              </span>
            </div>

            {/* Auto-refresh indicator for pending orders */}
            {order.status === 'pending' && (
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 mb-4 animate-pulse-slow">
                <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
                <span className="text-xs text-amber-400">Auto-refreshing status...</span>
              </div>
            )}

            {/* Order Number with hover animation */}
            <div className="bg-slate-800/50 rounded-xl p-5 mb-6 transition-all duration-300 hover:bg-slate-800/70 hover:scale-[1.02] animate-fade-in-up animation-delay-400">
              <p className="text-slate-400 text-sm mb-2">Your Order Number</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-xl md:text-2xl font-bold text-violet-400 font-mono tracking-wider animate-glow">
                  {order.order_number}
                </p>
                <button
                  onClick={copyOrderNumber}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
                  title="Copy order number"
                >
                  <Copy className="w-5 h-5 text-slate-400 hover:text-violet-400 transition-colors" />
                </button>
              </div>
              <p className="text-slate-500 text-xs mt-2">
                Keep this number to track your order
              </p>
            </div>

            {/* Order Details */}
            <div className="bg-slate-800/50 rounded-xl p-5 mb-6 text-left animate-fade-in-up animation-delay-500">
              <h3 className="text-white font-semibold mb-4 pb-2 border-b border-slate-700">
                Order Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between transition-all duration-300 hover:translate-x-1">
                  <span className="text-slate-400">Game</span>
                  <span className="text-white font-medium">{order.game_name}</span>
                </div>
                <div className="flex justify-between transition-all duration-300 hover:translate-x-1">
                  <span className="text-slate-400">Product</span>
                  <span className="text-white font-medium">{order.product_name}</span>
                </div>
                <div className="flex justify-between transition-all duration-300 hover:translate-x-1">
                  <span className="text-slate-400">Quantity</span>
                  <span className="text-white font-medium">{order.quantity}</span>
                </div>
                <div className="flex justify-between transition-all duration-300 hover:translate-x-1">
                  <span className="text-slate-400">Game ID</span>
                  <span className="text-white font-mono text-sm">{order.user_game_id}</span>
                </div>
                {order.user_game_server && (
                  <div className="flex justify-between transition-all duration-300 hover:translate-x-1">
                    <span className="text-slate-400">Server</span>
                    <span className="text-white">{order.user_game_server}</span>
                  </div>
                )}
                {order.user_nickname && (
                  <div className="flex justify-between transition-all duration-300 hover:translate-x-1">
                    <span className="text-slate-400">Nickname</span>
                    <span className="text-white">{order.user_nickname}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-700 mt-2">
                  <span className="text-slate-400 font-semibold">Total Amount</span>
                  <span className={`text-xl font-bold ${order.status === 'success' ? 'text-emerald-400' : 'text-violet-400'} animate-glow`}>
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-slate-800/50 rounded-xl p-5 mb-6 text-left animate-fade-in-up animation-delay-600">
              <h3 className="text-white font-semibold mb-3">Payment Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Method</span>
                  <span className="text-white">{order.payment_method_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Order Date</span>
                  <span className="text-white">
                    {new Date(order.created_at).toLocaleString('en-MY', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {order.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Completed Date</span>
                    <span className="text-white">
                      {new Date(order.completed_at).toLocaleString('en-MY', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons with status-based styling */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in-up animation-delay-700">
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 transition-all duration-300 hover:scale-105"
              >
                <Button className="w-full border-green-500 text-green-400 hover:bg-green-500/10 bg-transparent transition-all duration-300">
                  <MessageCircle className="w-4 h-4 mr-2 animate-pulse" />
                  Contact Admin
                </Button>
              </a>
              <Button
                onClick={() => navigate(`/order-status/${order.order_number}`)}
                className={`flex-1 ${statusConfig.buttonVariant} text-white transition-all duration-300 hover:scale-105 active:scale-95`}
              >
                Track Order
              </Button>
            </div>

            {/* Continue Shopping link with hover animation */}
            <div className="pt-4 border-t border-slate-800 animate-fade-in-up animation-delay-800">
              <button
                onClick={() => navigate('/games')}
                className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:gap-3 group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center mt-6 animate-fade-in-up animation-delay-900">
            <p className="text-xs text-slate-500">
              A confirmation has been sent to your email.
              <br />
              Need help? Contact us on WhatsApp.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
