export interface Game {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  logo: string;
  banner?: string;
  description?: string;
  products: Product[];
  hasDetails: boolean;
  minPrice: number;
  isNew?: boolean;
  isPopular?: boolean;
  isVoucher?: boolean;
}

export interface Product {
  id: string;
  label: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  type: string;
  isBestSeller?: boolean;
  bonus?: string;
  icon?: string;
}

export interface CartItem {
  id: number;
  game: string;
  gameSlug: string;
  denom: string;
  price: number;
  userId: string;
  zoneId?: string;
  icon: string;
  productId: string;
}

export interface Order {
  id: number;
  date: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'failed';
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export type ViewType = 'store' | 'product' | 'reseller' | 'history';
