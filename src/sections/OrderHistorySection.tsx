import { useState } from 'react';
import { Package, Calendar, Trash2, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Order } from '@/types';

interface OrderHistorySectionProps {
  orders: Order[];
  onClear: () => void;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'bg-yellow-500/20 text-yellow-500',
    label: 'Pending',
  },
  completed: {
    icon: CheckCircle,
    color: 'bg-green-500/20 text-green-500',
    label: 'Completed',
  },
  failed: {
    icon: XCircle,
    color: 'bg-red-500/20 text-red-500',
    label: 'Failed',
  },
};

function OrderCard({ order }: { order: Order }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = statusConfig[order.status];

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-0">
        {/* Order Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-5 flex items-center justify-between hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-bold">Order #{order.id.toString().slice(-6)}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {order.date}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-black text-primary">
                RM {order.total.toFixed(2)}
              </p>
              <Badge className={`${status.color} text-xs`}>
                <status.icon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Order Details */}
        {isExpanded && (
          <div className="px-5 pb-5 border-t border-border">
            <div className="pt-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Items ({order.items.length})
              </p>
              {order.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
                >
                  <span className="text-sm text-muted-foreground w-6">
                    {idx + 1}.
                  </span>
                  <img
                    src={item.icon}
                    alt={item.game}
                    className="w-10 h-10 rounded-lg object-contain bg-card p-1"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        item.game
                      )}&background=7c3aed&color=fff&size=100&length=2`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.game}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.denom}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      RM {item.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID: {item.userId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function OrderHistorySection({ orders, onClear }: OrderHistorySectionProps) {
  const isEmpty = orders.length === 0;

  return (
    <section className="pt-20 lg:pt-24 pb-16 animate-fadeIn">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2">My Orders</h1>
            <p className="text-muted-foreground">
              View and track your purchase history
            </p>
          </div>
          {!isEmpty && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Order History?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All your order history will be
                    permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onClear}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear History
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Orders List */}
        {isEmpty ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here
            </p>
            <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Browse Games
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
