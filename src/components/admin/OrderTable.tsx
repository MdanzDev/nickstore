import React from 'react';
import { Eye, CheckCircle, XCircle, Clock, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Order, OrderStatus } from '@/types';

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  onViewOrder: (order: Order) => void;
  onUpdateStatus?: (orderId: string, status: OrderStatus) => void;
  showActions?: boolean;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  loading,
  onViewOrder,
  onUpdateStatus,
  showActions = true,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 animate-fade-in-up">
        <div className="relative">
          <LoadingSpinner size="lg" className="text-violet-500" />
          <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/20" />
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="animate-fade-in-up">
        <EmptyState
          title="No orders found"
          description="There are no orders to display at the moment."
          icon={<Clock className="w-8 h-8 text-slate-400" />}
        />
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-MY', {
      day: '2-digit',
      month: 'short',
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

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400">Order #</TableHead>
            <TableHead className="text-slate-400">Game</TableHead>
            <TableHead className="text-slate-400">Product</TableHead>
            <TableHead className="text-slate-400">Amount</TableHead>
            <TableHead className="text-slate-400">Status</TableHead>
            <TableHead className="text-slate-400">Date</TableHead>
            {showActions && <TableHead className="text-slate-400 text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, index) => (
            <TableRow 
              key={order.$id} 
              className="border-slate-800 hover:bg-slate-800/30 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell className="font-medium text-white font-mono text-sm">
                {order.order_number}
              </TableCell>
              <TableCell className="text-slate-300">{order.game_name}</TableCell>
              <TableCell className="text-slate-300">{order.product_name}</TableCell>
              <TableCell className="text-white font-medium">
                {formatCurrency(order.total_amount)}
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-slate-400 text-sm">{formatDate(order.created_at)}</TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 hover:scale-110"
                      onClick={() => onViewOrder(order)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {order.status === 'pending' && onUpdateStatus && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-300 hover:scale-110"
                          onClick={() => onUpdateStatus(order.$id!, 'success')}
                          title="Mark as Success"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 hover:scale-110"
                          onClick={() => onUpdateStatus(order.$id!, 'failed')}
                          title="Mark as Failed"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
