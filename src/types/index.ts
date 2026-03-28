export interface Game {
  $id?: string;
  name: string;
  description: string;
  image_id: string;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  $id?: string;
  game_id: string;
  game_name?: string;
  name: string;
  denomination: string;
  price: number;
  original_price?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
// In your types/index.ts
export interface Order {
  $id?: string;
  order_number: string;
  game_id: string;
  game_name: string;
  product_id: string;
  product_name: string;
  price: number | string;
  quantity: number | string;
  total_amount: number | string;
  user_game_id: string;
  user_game_server: string;
  user_nickname: string;
  user_email: string;
  user_phone: string;
  payment_method_id: string;
  payment_method_name: string;
  receipt_image_id?: string;
  receipt_image_url?: string;
  status: OrderStatus;
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export interface PaymentMethod {
  $id?: string;
  name: string;
  type: 'qr_code' | 'bank_transfer' | 'e_wallet' | 'other';
  description: string;
  account_name?: string;
  account_number?: string;
  qr_image_id?: string;
  qr_image_url?: string;
  instructions?: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUser {
  $id?: string;
  username: string;
  email: string;
  role: 'admin' | 'super_admin';
  created_at?: string;
}

export interface CartItem {
  game: Game;
  product: Product;
  quantity: number;
}

export interface OrderFormData {
  gameId: string;
  productId: string;
  userGameId: string;
  userGameServer?: string;
  userNickname?: string;
  userEmail?: string;
  userPhone?: string;
  paymentMethodId: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  todayOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  recentOrders: Order[];
}
