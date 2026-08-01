-- NickStore Unified Schema Migration
-- Merges storefront profiles/orders with bot users/wallets/transactions
-- Run in Supabase SQL Editor

-- 1. Ensure users table has all columns from profiles
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Migrate profiles data into users (skip users that already exist by id)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    INSERT INTO users (id, username, email, phone, role, created_at, updated_at)
    SELECT p.id, p.name, p.email, p.phone, COALESCE(p.role, 'customer'), p.created_at, now()
    FROM profiles p
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      email = COALESCE(users.email, EXCLUDED.email),
      phone = COALESCE(users.phone, EXCLUDED.phone),
      role = CASE WHEN users.role = 'admin' THEN users.role ELSE EXCLUDED.role END,
      updated_at = now();
  END IF;
END $$;

-- 3. Create wallets for all users that don't have one
INSERT INTO wallets (user_id, balance_myr, balance_idr)
SELECT u.id, 0, 0
FROM users u
LEFT JOIN wallets w ON w.user_id = u.id
WHERE w.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 4. Migrate profiles.balance into wallets
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    UPDATE wallets w
    SET balance_myr = COALESCE(p.balance, 0),
        updated_at = now()
    FROM profiles p
    WHERE w.user_id = p.id;
  END IF;
END $$;

-- 5. Create deposits table for tracking v2 deposits
CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  kryznet_deposit_id TEXT UNIQUE NOT NULL,
  amount_myr NUMERIC(12,2) NOT NULL,
  amount_idr NUMERIC(14,2) NOT NULL,
  payment_method TEXT DEFAULT 'qris',
  qr_string TEXT,
  checkout_url TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Success', 'Expired', 'Failed')),
  expired_at TIMESTAMPTZ,
  credited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Add indexes
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_kryznet_id ON deposits(kryznet_deposit_id);
CREATE INDEX IF NOT EXISTS idx_users_telegram ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);