import React from 'react';
import { Download, MessageCircle, CheckCircle, XCircle, Copy, Calendar, User, CreditCard, Gamepad2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Order, OrderStatus } from '@/types';

interface OrderDetailModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, status: OrderStatus) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  open,
  onClose,
  onUpdateStatus,
}) => {
  if (!order) return null;

  const [copied, setCopied] = React.useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-MY', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return 'RM 0.00';
    return `RM ${numericAmount.toFixed(2)}`;
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappNumber = '60197661697';
  const whatsappMessage = `Hi, I'm inquiring about my order *${order.order_number}* for *${order.game_name}*.`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-800 text-white animate-slide-up">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Order Details
            </DialogTitle>
            <StatusBadge status={order.status} />
          </div>
          <DialogDescription className="text-slate-400">
            View complete order information including game details, payment status, and user information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info with Copy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-5 transition-all duration-300 hover:bg-slate-800/70">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-400">Order Number</p>
                <button
                  onClick={copyOrderNumber}
                  className="p-1 hover:bg-slate-700 rounded-lg transition-all duration-300 hover:scale-110"
                  title="Copy order number"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
              <p className="text-lg font-semibold text-white font-mono tracking-wider">
                {order.order_number}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-5 transition-all duration-300 hover:bg-slate-800/70">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <p className="text-sm text-slate-400">Order Date</p>
              </div>
              <p className="text-lg font-semibold text-white">{formatDate(order.created_at)}</p>
            </div>
          </div>

          {/* Game Info */}
          <div className="bg-slate-800/50 rounded-xl p-5 transition-all duration-300 hover:bg-slate-800/70">
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="w-5 h-5 text-violet-400" />
              <h4 className="text-sm font-medium text-white">Game Information</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Game</p>
                <p className="text-white font-medium">{order.game_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Product</p>
                <p className="text-white font-medium">{order.product_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Price</p>
                <p className="text-white font-medium">{formatCurrency(order.price)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Quantity</p>
                <p className="text-white font-medium">{order.quantity}</p>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="bg-slate-800/50 rounded-xl p-5 transition-all duration-300 hover:bg-slate-800/70">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-fuchsia-400" />
              <h4 className="text-sm font-medium text-white">User Details</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Game ID</p>
                <p className="text-white font-medium font-mono text-sm">{order.user_game_id}</p>
              </div>
              {order.user_game_server && (
                <div>
                  <p className="text-sm text-slate-500">Server</p>
                  <p className="text-white font-medium">{order.user_game_server}</p>
                </div>
              )}
              {order.user_nickname && (
                <div>
                  <p className="text-sm text-slate-500">Nickname</p>
                  <p className="text-white font-medium">{order.user_nickname}</p>
                </div>
              )}
              {order.user_email && (
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="text-white font-medium">{order.user_email}</p>
                </div>
              )}
              {order.user_phone && (
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="text-white font-medium">{order.user_phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-slate-800/50 rounded-xl p-5 transition-all duration-300 hover:bg-slate-800/70">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-medium text-white">Payment Information</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Payment Method</p>
                <p className="text-white font-medium">{order.payment_method_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Amount</p>
                <p className="text-2xl font-bold text-violet-400">{formatCurrency(order.total_amount)}</p>
              </div>
            </div>
          </div>

          {/* Receipt Image */}
          {order.receipt_image_url && (
            <div className="bg-slate-800/50 rounded-xl p-5 transition-all duration-300 hover:bg-slate-800/70">
              <h4 className="text-sm font-medium text-white mb-3">Payment Receipt</h4>
              <div className="relative group">
                <img
                  src={order.receipt_image_url}
                  alt="Payment Receipt"
                  className="max-w-full rounded-lg border border-slate-700 transition-all duration-300 group-hover:shadow-xl"
                />
                <a
                  href={order.receipt_image_url}
                  download
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Button variant="secondary" size="sm" className="gap-2 bg-slate-800/90 hover:bg-slate-700">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </a>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {order.admin_notes && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
              <h4 className="text-sm font-medium text-amber-400 mb-2">Admin Notes</h4>
              <p className="text-white text-sm">{order.admin_notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800">
            {order.status === 'pending' && onUpdateStatus && (
              <div className="flex gap-3 flex-1">
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    onUpdateStatus(order.$id!, 'success');
                    onClose();
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Success
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    onUpdateStatus(order.$id!, 'failed');
                    onClose();
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Mark as Failed
                </Button>
              </div>
            )}
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button 
                variant="outline" 
                className="w-full gap-2 border-green-500 text-green-400 hover:bg-green-500/10 transition-all duration-300 hover:scale-105 group"
              >
                <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
                Contact Customer
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
