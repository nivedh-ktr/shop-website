-- ============================================
-- Krishna Furniture Admin Dashboard
-- Supabase Database Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- (Dashboard > SQL Editor > New Query)
-- ============================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  discount_price NUMERIC,
  category TEXT NOT NULL DEFAULT 'Living Room',
  image_url TEXT DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (admin-only via middleware)
CREATE POLICY "Authenticated users can manage products"
  ON products FOR ALL
  USING (auth.role() = 'authenticated');

-- Allow public read access for storefront
CREATE POLICY "Public can read products"
  ON products FOR SELECT
  USING (true);


-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_email TEXT DEFAULT '',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending Coordination'
    CHECK (status IN ('Pending Coordination', 'Processing', 'Delivered', 'Cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage orders"
  ON orders FOR ALL
  USING (auth.role() = 'authenticated');


-- 3. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage customers"
  ON customers FOR ALL
  USING (auth.role() = 'authenticated');


-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

INSERT INTO products (title, price, discount_price, category, image_url, stock) VALUES
  ('Luxury Teak Sofa Set', 125000, 99000, 'Living Room', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', 8),
  ('Modern Dining Table', 85000, NULL, 'Dining', 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400', 12),
  ('Premium King Bed Frame', 145000, 129000, 'Bedroom', 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400', 5),
  ('Ergonomic Office Chair', 35000, 28000, 'Office', 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400', 20),
  ('Wooden Bookshelf', 42000, NULL, 'Living Room', 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400', 15);

INSERT INTO orders (order_id, client_name, client_email, subtotal, status) VALUES
  ('KF-4821', 'Ravi Shankar', 'ravi@example.com', 245000, 'Pending Coordination'),
  ('KF-4820', 'Priya Nair', 'priya@example.com', 129000, 'Processing'),
  ('KF-4819', 'Arun Kumar', 'arun@example.com', 85000, 'Delivered'),
  ('KF-4818', 'Meena Das', 'meena@example.com', 35000, 'Pending Coordination');

INSERT INTO customers (name, email, phone, total_orders) VALUES
  ('Ravi Shankar', 'ravi@example.com', '+91 98765 43210', 3),
  ('Priya Nair', 'priya@example.com', '+91 87654 32109', 1),
  ('Arun Kumar', 'arun@example.com', '+91 76543 21098', 2),
  ('Meena Das', 'meena@example.com', '+91 65432 10987', 1);
