-- ============================================
-- Supabase Schema Migration: Checkout & Admin Rebuild
-- ============================================
-- Run this SQL in your Supabase SQL Editor to apply 
-- the necessary schema upgrades for the new features.
-- ============================================

-- 1. ADD NEW COLUMNS TO ORDERS TABLE
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_address TEXT,
ADD COLUMN IF NOT EXISTS customer_notes TEXT,
ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'Pending Verification';

-- 2. UPDATE THE STATUS CHECK CONSTRAINT
-- Since we are moving to a new status pipeline, we will remove the old constraint on 'status'
-- (if you want to drop the old status column entirely later, you can, but we'll leave it for backward compatibility)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add check constraint for the new 'order_status' column
ALTER TABLE orders 
ADD CONSTRAINT orders_order_status_check 
CHECK (order_status IN (
  'Pending Verification', 
  'Processing / In Workshop', 
  'Out for Delivery', 
  'Delivered & Completed', 
  'Cancelled'
));

-- 3. CREATE THE ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_purchase NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (Admins) full access to order_items
CREATE POLICY "Authenticated users can manage order items"
  ON order_items FOR ALL
  USING (auth.role() = 'authenticated');

-- Allow anon users (Checkout) to insert order_items
CREATE POLICY "Anon users can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Allow anon users (Checkout) to insert orders
CREATE POLICY "Anon users can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- IMPORTANT: Supabase caches the schema for the API. 
-- After running this, go to Dashboard -> Project Settings -> API -> click "Reload" or "Clear cache" 
-- so PostgREST immediately recognizes the new 'order_items' table and the new columns in 'orders'.
