import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, MessageCircle, Copy, ArrowLeft, Clock } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { order } = location.state || {};

  useEffect(() => {
    // If no order data, redirect to games page after a short delay
    if (!order) {
      const timer = setTimeout(() => {
        navigate('/games');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [order, navigate]);

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
    ? `Hi, I just placed order *${order.order_number}*. Please process it ASAP.`
    : 'Hi, I need assistance with my order.';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  // Show loading state while redirecting
  if (!order) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Clock className="w-8 h-8 text-violet-400" />
            </div>
            <p className="text-slate-400">Loading order details...</p>
            <p className="text-slate-500 text-sm mt-2">Redirecting in a moment</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Success Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Order Placed Successfully!
            </h1>
            <p className="text-slate-400 mb-6">
              Your order has been submitted and is being processed.
            </p>

            {/* Order Status Badge */}
            <div className="inline-flex items-center gap-2 mb-6">
              <StatusBadge status="pending" />
              <span className="text-slate-500 text-sm">Waiting for payment confirmation</span>
            </div>

            {/* Order Number */}
            <div className="bg-slate-800/50 rounded-xl p-5 mb-6">
              <p className="text-slate-400 text-sm mb-2">Your Order Number</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-xl md:text-2xl font-bold text-violet-400 font-mono tracking-wider">
                  {order.order_number}
                </p>
                <button
                  onClick={copyOrderNumber}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Copy order number"
                >
                  <Copy className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <p className="text-slate-500 text-xs mt-2">
                Keep this number to track your order
              </p>
            </div>

            {/* Order Details */}
            <div className="bg-slate-800/50 rounded-xl p-5 mb-6 text-left">
              <h3 className="text-white font-semibold mb-4 pb-2 border-b border-slate-700">
                Order Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Game</span>
                  <span className="text-white font-medium">{order.game_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Product</span>
                  <span className="text-white font-medium">{order.product_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quantity</span>
                  <span className="text-white font-medium">{order.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Game ID</span>
                  <span className="text-white font-mono text-sm">{order.user_game_id}</span>
                </div>
                {order.user_game_server && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Server</span>
                    <span className="text-white">{order.user_game_server}</span>
                  </div>
                )}
                {order.user_nickname && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nickname</span>
                    <span className="text-white">{order.user_nickname}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-700 mt-2">
                  <span className="text-slate-400 font-semibold">Total Amount</span>
                  <span className="text-xl font-bold text-violet-400">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-slate-800/50 rounded-xl p-5 mb-6 text-left">
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
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1"
              >
                <Button className="w-full border-green-500 text-green-400 hover:bg-green-500/10 bg-transparent">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Admin
                </Button>
              </a>
              <Button
                onClick={() => navigate(`/order-status/${order.order_number}`)}
                className="flex-1 bg-violet-500 hover:bg-violet-600 text-white"
              >
                Track Order
              </Button>
            </div>

            {/* Continue Shopping */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => navigate('/games')}
                className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center mt-6">
            <p className="text-xs text-slate-500">
              A confirmation email has been sent to your email address.
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
