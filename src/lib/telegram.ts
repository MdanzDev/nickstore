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
  console.log('📱 Telegram Bot Token exists:', !!TELEGRAM_BOT_TOKEN);
  console.log('📱 Telegram Chat ID exists:', !!TELEGRAM_CHAT_ID);
  
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('⚠️ Telegram bot not configured. Skipping notification.');
    console.warn('TELEGRAM_BOT_TOKEN:', TELEGRAM_BOT_TOKEN ? '✓ Set' : '✗ Missing');
    console.warn('TELEGRAM_CHAT_ID:', TELEGRAM_CHAT_ID ? '✓ Set' : '✗ Missing');
    return false;
  }

  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `RM ${numericAmount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-MY', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
  
  console.log('📱 Sending to Telegram URL:', url.replace(TELEGRAM_BOT_TOKEN, '***HIDDEN***'));
  console.log('📱 Message length:', message.length);
  
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
    console.log('📱 Telegram API Response:', data);
    
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
    console.warn('⚠️ Telegram bot not configured.');
    console.warn('TELEGRAM_BOT_TOKEN:', TELEGRAM_BOT_TOKEN ? '✓ Set' : '✗ Missing');
    console.warn('TELEGRAM_CHAT_ID:', TELEGRAM_CHAT_ID ? '✓ Set' : '✗ Missing');
    return false;
  }

  const message = `
✅ *Test Notification* ✅

Your Telegram bot is configured correctly!
You will now receive order notifications here.

*Time:* ${new Date().toLocaleString()}
*Bot Token:* ${TELEGRAM_BOT_TOKEN.substring(0, 10)}... (hidden)
*Chat ID:* ${TELEGRAM_CHAT_ID}
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
    console.log('📱 Test response:', data);
    return data.ok;
  } catch (error) {
    console.error('❌ Failed to send test message:', error);
    return false;
  }
};
