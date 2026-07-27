-- NickStore & Telegram Bot Unified Supabase Schema
-- Run this in your Supabase SQL Editor

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE,
  username TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  telegram_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  balance_myr NUMERIC(12,2) DEFAULT 0.00,
  balance_idr NUMERIC(14,2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Wallet Audit Ledger
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('credit', 'debit')),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'MYR',
  reason TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  provider_id TEXT,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Validating', 'Processing', 'Success', 'Failed', 'Cancelled', 'Refunded')),
  game_user_id TEXT,
  zone_id TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Provider Orders Audit Log
CREATE TABLE IF NOT EXISTS provider_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_transaction_id TEXT REFERENCES transactions(reference_id) ON DELETE CASCADE,
  provider_order_id TEXT,
  provider TEXT DEFAULT 'Kryz-Net',
  status TEXT DEFAULT 'Processing',
  request_payload JSONB,
  response_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Products Catalog Cache
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT,
  brand TEXT,
  provider_product_id TEXT,
  price_myr NUMERIC(12,2),
  price_idr NUMERIC(14,2),
  status TEXT DEFAULT 'active',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. OTP Verification Table
CREATE TABLE IF NOT EXISTS otp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  purpose TEXT DEFAULT 'REGISTER',
  attempts INT DEFAULT 0,
  expiry TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Stateful Telegram Bot Sessions
CREATE TABLE IF NOT EXISTS bot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  state TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ NOT NULL
);

-- 9. System Logs
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT CHECK (level IN ('INFO', 'WARNING', 'ERROR')),
  service TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_reference_id ON transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_provider_orders_provider_id ON provider_orders(provider_order_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- 10. Atomic Bot Order Creation with FOR UPDATE balance locking & audit ledger (R2 & R3)
CREATE OR REPLACE FUNCTION create_bot_order_atomic(
  p_user_id UUID DEFAULT NULL,
  p_telegram_id BIGINT DEFAULT NULL,
  p_product_id TEXT DEFAULT '',
  p_player_id TEXT DEFAULT '',
  p_zone_id TEXT DEFAULT '',
  p_amount NUMERIC DEFAULT 0,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := p_user_id;
  v_wallet_id UUID;
  v_balance NUMERIC(12,2);
  v_ref_id TEXT := p_reference_id;
  v_tx_id UUID;
  v_new_balance NUMERIC(12,2);
BEGIN
  -- 1. Resolve user_id if not provided directly
  IF v_user_id IS NULL AND p_telegram_id IS NOT NULL THEN
    SELECT id INTO v_user_id FROM users WHERE telegram_id = p_telegram_id LIMIT 1;
  END IF;

  -- 2. Reject if user does not exist or user_id is NULL
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'USER_NOT_FOUND',
      'message', 'Pengguna tidak dijumpai. Sila mendaftar terlebih dahulu.'
    );
  END IF;

  -- 3. Generate reference_id if not provided
  IF v_ref_id IS NULL OR v_ref_id = '' THEN
    v_ref_id := 'TX-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 9000 + 1000)::text, 4, '0');
  END IF;

  -- 4. Lock wallet row FOR UPDATE & check balance
  SELECT id, balance_myr INTO v_wallet_id, v_balance
  FROM wallets
  WHERE user_id = v_user_id
  FOR UPDATE;

    IF v_wallet_id IS NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'WALLET_NOT_FOUND',
        'message', 'Dompet pengguna tidak dijumpai.'
      );
    END IF;

    IF v_balance < p_amount THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'INSUFFICIENT_BALANCE',
        'message', 'Baki wallet anda tidak mencukupi untuk pesanan ini.'
      );
    END IF;

    -- Deduct balance atomically
    v_new_balance := v_balance - p_amount;
    UPDATE wallets
    SET balance_myr = v_new_balance,
        updated_at = now()
    WHERE id = v_wallet_id;

    -- Create audit record in wallet_transactions
    INSERT INTO wallet_transactions (
      user_id,
      type,
      amount,
      currency,
      reason,
      reference_id
    ) VALUES (
      v_user_id,
      'debit',
      p_amount,
      'MYR',
      'Top-Up Order ' || v_ref_id,
      v_ref_id
    );

  -- 5. Create record in transactions
  INSERT INTO transactions (
    reference_id,
    user_id,
    product_id,
    amount,
    status,
    game_user_id,
    zone_id
  ) VALUES (
    v_ref_id,
    v_user_id,
    p_product_id,
    p_amount,
    'Processing',
    p_player_id,
    p_zone_id
  )
  RETURNING id INTO v_tx_id;

  -- 5. Create initial audit record in provider_orders
  INSERT INTO provider_orders (
    internal_transaction_id,
    provider,
    status,
    request_payload
  ) VALUES (
    v_ref_id,
    'Kryz-Net',
    'Processing',
    jsonb_build_object('product_id', p_product_id, 'player_id', p_player_id, 'zone_id', p_zone_id)
  );

  RETURN jsonb_build_object(
    'success', true,
    'reference_id', v_ref_id,
    'transaction_id', v_tx_id,
    'user_id', v_user_id,
    'amount', p_amount
  );
END;
$$;

