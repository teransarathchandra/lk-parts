-- Migration 001: Initial schema for lk-parts
-- Enable pg_trgm for part number search (GIN index on hyphenated part numbers)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('bike', 'car', 'van', '3wheeler')),
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  variant VARCHAR(100),
  year_from SMALLINT,
  year_to SMALLINT,
  slug VARCHAR(200) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BRANDS
-- ============================================================
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  is_oem BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS (inventory columns merged in — no join on product pages)
-- ============================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(300) NOT NULL,
  slug VARCHAR(300) UNIQUE NOT NULL,
  oem_part_number VARCHAR(100),
  aftermarket_part_number VARCHAR(100),
  brand_id UUID REFERENCES brands(id),
  description TEXT,
  technical_notes TEXT,
  sub_section VARCHAR(50) NOT NULL CHECK (sub_section IN (
    'engine', 'brakes', 'suspension', 'electrical', 'body',
    'interior', 'filters', 'lighting', 'wheels_tyres', 'transmission', 'cooling'
  )),
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  condition VARCHAR(20) DEFAULT 'new' CHECK (condition IN ('new', 'used', 'refurbished')),
  is_active BOOLEAN DEFAULT true,
  images JSONB DEFAULT '[]',
  -- Inventory columns
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  inventory_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_reserved_lte_quantity CHECK (reserved_quantity <= quantity)
);

-- ============================================================
-- VEHICLE FITMENTS (the core data moat)
-- Phase 1: only 'exact' and 'compatible'.
-- Absence of a record = fitment unknown.
-- ============================================================
CREATE TABLE vehicle_fitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  fitment_type VARCHAR(20) NOT NULL CHECK (fitment_type IN ('exact', 'compatible')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vehicle_id, product_id)
);

-- ============================================================
-- CUSTOMERS
-- Phone: 9-digit bare number, no leading zero, no country code (e.g., 771234567)
-- ============================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(9) UNIQUE NOT NULL,
  name VARCHAR(200),
  email VARCHAR(200),
  preferred_language VARCHAR(5) DEFAULT 'en',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  account_type VARCHAR(20) DEFAULT 'customer' CHECK (account_type IN ('customer', 'mechanic')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CUSTOMER GARAGES
-- ============================================================
CREATE TABLE customer_garages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id),
  nickname VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CARTS (server-side; survives Koko redirect round-trip)
-- Reservation is created when ORDER is placed, NOT when item is added.
-- ============================================================
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token VARCHAR(200) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  -- Phase 1: always null at insert; OrderService reads vehicle from cart.vehicle_id.
  -- Phase 2: per-item vehicle for mechanic multi-vehicle orders.
  vehicle_id UUID REFERENCES vehicles(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  UNIQUE(cart_id, product_id)
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  status VARCHAR(50) NOT NULL DEFAULT 'created' CHECK (status IN (
    'created', 'payment_initiated', 'paid', 'cod_confirmed',
    'processing', 'shipped', 'delivered', 'closed',
    'payment_failed', 'return_requested', 'return_approved',
    'refund_initiated', 'returned', 'cancelled'
  )),
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cod', 'koko', 'card')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'initiated', 'completed', 'failed', 'refunded'
  )),
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  delivery_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  -- Immutable snapshot of vehicle + fitment context at purchase time.
  -- Shape: { vehicle_id, vehicle_slug, fitment_type, oem_part_number, product_name, matched_at }
  -- Required (NOT NULL enforced at service layer) when fitment_type = 'exact'.
  fitment_snapshot JSONB,
  UNIQUE(order_id, product_id)
);

-- ============================================================
-- PAYMENT EVENTS (audit trail + idempotency)
-- ============================================================
CREATE TABLE payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('koko', 'payhere', 'cod')),
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'initiated', 'completed', 'failed', 'refunded', 'webhook_received', 'error'
  )),
  provider_reference VARCHAR(200),
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Fitment lookup (hot path: every catalog page filtered by vehicle)
CREATE INDEX idx_vehicle_fitments_vehicle_id ON vehicle_fitments(vehicle_id);
CREATE INDEX idx_vehicle_fitments_product_id ON vehicle_fitments(product_id);
CREATE INDEX idx_vehicle_fitments_composite ON vehicle_fitments(vehicle_id, product_id, fitment_type);

-- Part number search (pg_trgm GIN — required for ILIKE on hyphenated part numbers)
CREATE INDEX idx_products_oem_trgm ON products USING gin(oem_part_number gin_trgm_ops);
CREATE INDEX idx_products_aftermarket_trgm ON products USING gin(aftermarket_part_number gin_trgm_ops);
-- Product name search (tsvector fine for natural language names)
CREATE INDEX idx_products_name_fts ON products USING gin(to_tsvector('english', name));

-- Order lookups
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Cart session lookup (hot path: every cart operation)
CREATE INDEX idx_carts_session_token ON carts(session_token);
CREATE INDEX idx_carts_customer_id ON carts(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_carts_expires_at ON carts(expires_at);

-- Garage
CREATE INDEX idx_customer_garages_customer_id ON customer_garages(customer_id);

-- Slug lookups (product page SSG)
CREATE UNIQUE INDEX idx_products_slug ON products(slug);
CREATE UNIQUE INDEX idx_vehicles_slug ON vehicles(slug);

-- Payment events reconciliation
CREATE INDEX idx_payment_events_order_id ON payment_events(order_id);
CREATE INDEX idx_payment_events_provider_ref ON payment_events(provider_reference)
  WHERE provider_reference IS NOT NULL;

-- Low-stock alert query (admin dashboard)
CREATE INDEX idx_products_low_stock ON products(quantity, low_stock_threshold)
  WHERE is_active = true;

-- Vehicle taxonomy (selector)
CREATE INDEX idx_vehicles_type ON vehicles(type) WHERE is_active = true;
CREATE INDEX idx_vehicles_brand ON vehicles(brand) WHERE is_active = true;

-- ============================================================
-- SEED: starter LK vehicle taxonomy (20 most common vehicles)
-- ============================================================
INSERT INTO vehicles (type, brand, model, variant, year_from, year_to, slug) VALUES
  ('bike', 'Honda', 'CB150R', 'EX', 2019, 2022, 'bike-honda-cb150r-ex'),
  ('bike', 'Honda', 'CB150R', 'Street Fire', 2015, 2018, 'bike-honda-cb150r-street-fire'),
  ('bike', 'Honda', 'CB400', 'Super Four', 1992, 1998, 'bike-honda-cb400-super-four'),
  ('bike', 'Honda', 'Hornet', '600cc', 2002, 2006, 'bike-honda-hornet-600cc'),
  ('bike', 'Yamaha', 'FZ-S', 'V2.0', 2014, 2016, 'bike-yamaha-fz-s-v2'),
  ('bike', 'Yamaha', 'FZ-S', 'V3.0', 2019, 2022, 'bike-yamaha-fz-s-v3'),
  ('bike', 'Yamaha', 'R15', 'V3', 2018, 2022, 'bike-yamaha-r15-v3'),
  ('bike', 'Bajaj', 'Pulsar', '150 NS', 2015, 2020, 'bike-bajaj-pulsar-150ns'),
  ('bike', 'Bajaj', 'Pulsar', '220F', 2010, 2020, 'bike-bajaj-pulsar-220f'),
  ('bike', 'TVS', 'Apache', 'RTR 160 4V', 2018, 2022, 'bike-tvs-apache-rtr160-4v'),
  ('bike', 'Suzuki', 'Gixxer', '150', 2015, 2022, 'bike-suzuki-gixxer-150'),
  ('bike', 'Hero', 'Splendor', 'Plus', 2010, 2022, 'bike-hero-splendor-plus'),
  ('car', 'Toyota', 'Corolla', '141 E150', 2007, 2013, 'car-toyota-corolla-141'),
  ('car', 'Toyota', 'Corolla', '121', 2000, 2006, 'car-toyota-corolla-121'),
  ('car', 'Toyota', 'Axio', 'NZE141', 2006, 2012, 'car-toyota-axio-nze141'),
  ('car', 'Toyota', 'Prius', 'NHW20', 2003, 2009, 'car-toyota-prius-nhw20'),
  ('car', 'Honda', 'Civic', 'EK3', 1996, 2000, 'car-honda-civic-ek3'),
  ('car', 'Honda', 'Fit', 'GD1', 2001, 2007, 'car-honda-fit-gd1'),
  ('car', 'Suzuki', 'Alto', 'LXI', 2013, 2019, 'car-suzuki-alto-lxi'),
  ('car', 'Nissan', 'Sunny', 'FB15', 2000, 2006, 'car-nissan-sunny-fb15');

-- ============================================================
-- TRIGGERS: update updated_at automatically
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
