// src/lib/telegram.ts

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';

interface OrderData {
  order_number: string;
  game_name: string;
  product_name: string;
  total_amount: number | string;
  user_game_id: string;
  user_game_server?: string;
  user_nickname?: string;
  user_email?: string;
  user_phone?: string;
  payment_method_name: string;
  created_at: string;
}

export const sendTelegramNotification = async (order: OrderData): Promise<boolean> => {
  console.log('📱 Telegram: Starting to send notification...');
  console.log('📱 Bot Token exists:', !!TELEGRAM_BOT_TOKEN);
  console.log('📱 Chat ID exists:', !!TELEGRAM_CHAT_ID);
  
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('❌ Telegram bot not configured. Missing:', {
      token: TELEGRAM_BOT_TOKEN ? '✓' : '✗',
      chatId: TELEGRAM_CHAT_ID ? '✓' : '✗',
    });
    return false;
  }

  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `RM ${numericAmount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-MY', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const message = `
🛒 *NEW ORDER RECEIVED!* 🛒

📋 *Order Details*
━━━━━━━━━━━━━━━━
*Order #:* ${order.order_number}
*Game:* ${order.game_name}
*Product:* ${order.product_name}
*Amount:* ${formatCurrency(order.total_amount)}
*Payment:* ${order.payment_method_name}
*Date:* ${formatDate(order.created_at)}

👤 *Customer Details*
━━━━━━━━━━━━━━━━
*Game ID:* ${order.user_game_id}
${order.user_game_server ? `*Server:* ${order.user_game_server}\n` : ''}${order.user_nickname ? `*Nickname:* ${order.user_nickname}\n` : ''}${order.user_email ? `*Email:* ${order.user_email}\n` : ''}${order.user_phone ? `*Phone:* ${order.user_phone}\n` : ''}
🔗 *View Order:* https://nickstore.vercel.app/admin/orders
  `;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Telegram notification sent successfully');
      return true;
    } else {
      console.error('❌ Telegram API error:', data);
      console.error('Error description:', data.description);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to send Telegram notification:', error);
    return false;
  }
};

// Send a test message to verify configuration
export const sendTestTelegramMessage = async (): Promise<boolean> => {
  console.log('📱 Sending test Telegram message...');
  
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('❌ Telegram bot not configured');
    return false;
  }

  const message = `
✅ *Test Notification* ✅

Your Telegram bot is configured correctly!
You will now receive order notifications here.

*Time:* ${new Date().toLocaleString()}
  `;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Test message sent successfully');
      return true;
    } else {
      console.error('❌ Test message failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Test message error:', error);
    return false;
  }
};
