import React from 'react';
import { Download, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
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

  const whatsappNumber = '60197661697';
  const whatsappMessage = `Hi, I'm inquiring about my order *${order.order_number}* for *${order.game_name}*.`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details</span>
            <StatusBadge status={order.status} />
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            View complete order information including game details, payment status, and user information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-sm text-slate-400">Order Number</p>
              <p className="text-lg font-semibold text-white font-mono">{order.order_number}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-sm text-slate-400">Order Date</p>
              <p className="text-lg font-semibold text-white">{formatDate(order.created_at)}</p>
            </div>
          </div>

          {/* Game Info */}
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-400 mb-3">Game Information</h4>
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
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-400 mb-3">User Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Game ID</p>
                <p className="text-white font-medium">{order.user_game_id}</p>
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
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-400 mb-3">Payment Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Payment Method</p>
                <p className="text-white font-medium">{order.payment_method_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Amount</p>
                <p className="text-xl font-bold text-violet-400">{formatCurrency(order.total_amount)}</p>
              </div>
            </div>
          </div>

          {/* Receipt Image */}
          {order.receipt_image_url && (
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-400 mb-3">Payment Receipt</h4>
              <div className="relative">
                <img
                  src={order.receipt_image_url}
                  alt="Payment Receipt"
                  className="max-w-full rounded-lg border border-slate-700"
                />
                <a
                  href={order.receipt_image_url}
                  download
                  className="absolute top-2 right-2"
                >
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </a>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {order.admin_notes && (
            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-400 mb-2">Admin Notes</h4>
              <p className="text-white">{order.admin_notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            {order.status === 'pending' && onUpdateStatus && (
              <>
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
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
                  className="flex-1"
                  onClick={() => {
                    onUpdateStatus(order.$id!, 'failed');
                    onClose();
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Mark as Failed
                </Button>
              </>
            )}
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" className="w-full gap-2 border-green-500 text-green-400 hover:bg-green-500/10">
                <MessageCircle className="w-4 h-4" />
                Contact Customer
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};