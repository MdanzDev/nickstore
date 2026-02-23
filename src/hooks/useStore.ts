import { useState, useEffect, useCallback } from 'react';
import type { CartItem, Order } from '@/types';

const WHATSAPP_NUMBER = '60197661697';

interface StoreState {
  cart: CartItem[];
  history: Order[];
  theme: 'dark' | 'light';
}

const initialState: StoreState = {
  cart: [],
  history: [],
  theme: 'dark',
};

export function useStore() {
  const [state, setState] = useState<StoreState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('nickstore-cart');
    const savedHistory = localStorage.getItem('nickstore-history');
    const savedTheme = localStorage.getItem('nickstore-theme') as 'dark' | 'light';
    
    setState({
      cart: savedCart ? JSON.parse(savedCart) : [],
      history: savedHistory ? JSON.parse(savedHistory) : [],
      theme: savedTheme || 'dark',
    });
    setIsLoaded(true);
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('nickstore-cart', JSON.stringify(state.cart));
      localStorage.setItem('nickstore-history', JSON.stringify(state.history));
      localStorage.setItem('nickstore-theme', state.theme);
    }
  }, [state, isLoaded]);

  const addToCart = useCallback((item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: Date.now(),
    };
    setState(prev => ({
      ...prev,
      cart: [...prev.cart, newItem],
    }));
    return newItem.id;
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.filter(item => item.id !== id),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setState(prev => ({
      ...prev,
      cart: [],
    }));
  }, []);

  const getCartTotal = useCallback(() => {
    return state.cart.reduce((total, item) => total + item.price, 0);
  }, [state.cart]);

  const checkout = useCallback(() => {
    if (state.cart.length === 0) return;

    const total = getCartTotal();
    const newOrder: Order = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      items: [...state.cart],
      total,
      status: 'pending',
    };

    // Generate WhatsApp message
    let message = `*NICKSTORE ORDER*\n`;
    message += `═══════════════════\n\n`;
    
    state.cart.forEach((item, idx) => {
      message += `*${idx + 1}. ${item.game}*\n`;
      message += `   📦 ${item.denom}\n`;
      message += `   👤 ID: ${item.userId}${item.zoneId ? ` (${item.zoneId})` : ''}\n`;
      message += `   💰 RM ${item.price.toFixed(2)}\n\n`;
    });
    
    message += `═══════════════════\n`;
    message += `*TOTAL: RM ${total.toFixed(2)}*\n\n`;
    message += `Payment: Bank Transfer / E-Wallet\n`;
    message += `Date: ${new Date().toLocaleString('en-MY')}`;

    // Save order and clear cart
    setState(prev => ({
      ...prev,
      history: [newOrder, ...prev.history],
      cart: [],
    }));

    // Open WhatsApp
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');

    return newOrder.id;
  }, [state.cart, getCartTotal]);

  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      history: [],
    }));
  }, []);

  const setTheme = useCallback((theme: 'dark' | 'light') => {
    setState(prev => ({
      ...prev,
      theme,
    }));
  }, []);

  return {
    cart: state.cart,
    history: state.history,
    theme: state.theme,
    cartCount: state.cart.length,
    cartTotal: getCartTotal(),
    isLoaded,
    addToCart,
    removeFromCart,
    clearCart,
    checkout,
    clearHistory,
    setTheme,
  };
}
