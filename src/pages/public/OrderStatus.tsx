import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageCircle, Clock, CheckCircle, XCircle, ArrowLeft, Copy } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const OrderStatus: React.FC = () => {
  const navigate = useNavigate();
  const { orders, loading, refresh } = useOrders();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.game_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_phone?.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCloseDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const copyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString('en-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return 'RM 0.00';
    return `RM ${numericAmount.toFixed(2)}`;
  };

  const whatsappNumber = '60197661697';
  const whatsappMessage = selectedOrder
    ? `Hi, I'm inquiring about my order *${selectedOrder.order_number}* (Status: ${selectedOrder.status}).`
    : '';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  // Get status counts
  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    success: orders.filter(o => o.status === 'success').length,
    failed: orders.filter(o => o.status === 'failed').length,
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="pt-8 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-4">Order Status</h1>
            <p className="text-slate-400">
              View and track all your orders. Use the search to find specific orders.
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-8 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  placeholder="Search by order number, game name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-6 bg-slate-900/50 border-slate-800 text-white rounded-xl"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-slate-900/50 border-slate-800 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  <SelectItem value="all">All ({statusCounts.all})</SelectItem>
                  <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                  <SelectItem value="success">Success ({statusCounts.success})</SelectItem>
                  <SelectItem value="failed">Failed ({statusCounts.failed})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Clear Search Button */}
            {searchTerm && (
              <div className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="text-slate-400 hover:text-white"
                >
                  Clear search
                </Button>
              </div>
            )}
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" className="text-violet-500" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              title="No orders found"
              description={searchTerm ? "No orders match your search criteria." : "You haven't placed any orders yet."}
              icon={<Clock className="w-8 h-8 text-slate-400" />}
              action={
                !searchTerm && (
                  <Button 
                    onClick={() => navigate('/games')} 
                    className="bg-violet-500 hover:bg-violet-600"
                  >
                    Browse Games
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map((order) => (
                <Card 
                  key={order.$id} 
                  className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                  onClick={() => handleViewOrder(order)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Left side - Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm text-slate-400">Order #:</span>
                          <span className="text-white font-mono font-medium">{order.order_number}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyOrderNumber(order.order_number);
                            }}
                            className="p-1 hover:bg-slate-800 rounded transition-colors"
                          >
                            {copied ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-slate-500">Game</p>
                            <p className="text-white font-medium">{order.game_name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Product</p>
                            <p className="text-white">{order.product_name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Date</p>
                            <p className="text-slate-300 text-sm">{formatDate(order.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Status and Amount */}
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Total Amount</p>
                          <p className="text-lg font-bold text-violet-400">{formatCurrency(order.total_amount)}</p>
                        </div>
                        <div>
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Order Details</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseDetails}
                  className="text-slate-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Order Number */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Order Number</p>
                    <p className="text-lg font-semibold text-white font-mono">{selectedOrder.order_number}</p>
                  </div>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Game Information</p>
                  <p className="text-white font-medium">{selectedOrder.game_name}</p>
                  <p className="text-slate-300 text-sm mt-1">{selectedOrder.product_name}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Payment</p>
                  <p className="text-white font-medium">{selectedOrder.payment_method_name}</p>
                  <p className="text-2xl font-bold text-violet-400 mt-1">{formatCurrency(selectedOrder.total_amount)}</p>
                </div>
              </div>

              {/* User Details */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-3">User Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Game ID</p>
                    <p className="text-white">{selectedOrder.user_game_id}</p>
                  </div>
                  {selectedOrder.user_game_server && (
                    <div>
                      <p className="text-xs text-slate-500">Server</p>
                      <p className="text-white">{selectedOrder.user_game_server}</p>
                    </div>
                  )}
                  {selectedOrder.user_nickname && (
                    <div>
                      <p className="text-xs text-slate-500">Nickname</p>
                      <p className="text-white">{selectedOrder.user_nickname}</p>
                    </div>
                  )}
                  {selectedOrder.user_email && (
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="text-white">{selectedOrder.user_email}</p>
                    </div>
                  )}
                  {selectedOrder.user_phone && (
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="text-white">{selectedOrder.user_phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400">Order Date</p>
                  <p className="text-white">{formatDate(selectedOrder.created_at)}</p>
                </div>
                {selectedOrder.completed_at && selectedOrder.completed_at !== '' && (
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-sm text-slate-400">Completed Date</p>
                    <p className="text-white">{formatDate(selectedOrder.completed_at)}</p>
                  </div>
                )}
              </div>

              {/* Receipt */}
              {selectedOrder.receipt_image_url && (
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-3">Payment Receipt</p>
                  <img
                    src={selectedOrder.receipt_image_url}
                    alt="Payment Receipt"
                    className="max-w-full rounded-lg border border-slate-700"
                  />
                </div>
              )}

              {/* Admin Notes */}
              {selectedOrder.admin_notes && (
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-2">Admin Notes</p>
                  <p className="text-white">{selectedOrder.admin_notes}</p>
                </div>
              )}

              {/* Status Message */}
              {selectedOrder.status === 'pending' && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-amber-400 font-medium">Order Pending</p>
                      <p className="text-amber-300/70 text-sm mt-1">
                        Your order is being processed. We'll update the status once payment is confirmed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedOrder.status === 'success' && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-emerald-400 font-medium">Order Completed</p>
                      <p className="text-emerald-300/70 text-sm mt-1">
                        Your order has been completed successfully. Thank you for your purchase!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedOrder.status === 'failed' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-medium">Order Failed</p>
                      <p className="text-red-300/70 text-sm mt-1">
                        There was an issue with your order. Please contact us for assistance.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full border-green-500 text-green-400 hover:bg-green-500/10 py-6"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contact Admin on WhatsApp
                  </Button>
                </a>
                <Button
                  onClick={() => navigate('/games')}
                  className="flex-1 bg-violet-500 hover:bg-violet-600 text-white py-6"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Browse More Games
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OrderStatus;