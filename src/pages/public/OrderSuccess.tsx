import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, MessageCircle, Copy, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Button } from '@/components/ui/button';

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { order } = location.state || {};

  useEffect(() => {
    // If no order data, redirect to games page
    if (!order) {
      navigate('/games');
    }
  }, [order, navigate]);

  const copyOrderNumber = () => {
    if (order?.order_number) {
      navigator.clipboard.writeText(order.order_number);
      alert('Order number copied!');
    }
  };

  const whatsappNumber = '60137345871';
  const whatsappMessage = order 
    ? `Hi, I just placed order *${order.order_number}*. Please process it ASAP.`
    : 'Hi, I need assistance with my order.';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  if (!order) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Success Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Order Placed Successfully!
            </h1>
            <p className="text-slate-400 mb-6">
              Your order has been submitted and is being processed.
            </p>

            {/* Order Number */}
            <div className="bg-slate-800/50 rounded-xl p-5 mb-6">
              <p className="text-slate-400 text-sm mb-2">Your Order Number</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-2xl font-bold text-violet-400 font-mono">
                  {order.order_number}
                </p>
                <button
                  onClick={copyOrderNumber}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-slate-800/50 rounded-xl p-5 mb-6 text-left">
              <h3 className="text-white font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Game</span>
                  <span className="text-white">{order.game_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Product</span>
                  <span className="text-white">{order.product_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quantity</span>
                  <span className="text-white">{order.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Amount</span>
                  <span className="text-violet-400 font-bold">
                    RM {typeof order.total_amount === 'string' ? parseFloat(order.total_amount).toFixed(2) : order.total_amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Method</span>
                  <span className="text-white">{order.payment_method_name}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1">
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

            <div className="mt-6 pt-6 border-t border-slate-800">
              <button
                onClick={() => navigate('/games')}
                className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
