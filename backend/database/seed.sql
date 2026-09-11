-- =========================================================
-- ShopSphere - sample seed data
-- Default admin password: Admin@12345  (bcrypt hash below)
-- Default customer password: Customer@12345
-- =========================================================

INSERT INTO users (id, email, password_hash, first_name, last_name, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@shopsphere.com',
   '$2b$10$C6UzMDM.H6dfI/f/IKcEeOZK8v5V2p8s2XwG7f1E3Q8U8k1x6i7Xy', 'Store', 'Admin', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'jane.doe@example.com',
   '$2b$10$WgY8fY0m1z8vqjK2m0m2COeQjv3s2sHnE2Sd8k5aA1B0R7cT9jHy6', 'Jane', 'Doe', 'customer');

INSERT INTO categories (id, name, slug, description) VALUES
  ('aaaaaaa1-0000-0000-0000-000000000001', 'Electronics', 'electronics', 'Phones, laptops, gadgets and accessories'),
  ('aaaaaaa1-0000-0000-0000-000000000002', 'Home & Kitchen', 'home-kitchen', 'Appliances and household essentials'),
  ('aaaaaaa1-0000-0000-0000-000000000003', 'Fashion', 'fashion', 'Clothing, shoes and accessories'),
  ('aaaaaaa1-0000-0000-0000-000000000004', 'Sports & Outdoors', 'sports-outdoors', 'Fitness gear and outdoor equipment');

INSERT INTO products (id, sku, name, slug, description, price, discount_price, stock_quantity, category_id, brand, image_url, avg_rating, review_count) VALUES
  ('bbbbbbb1-0000-0000-0000-000000000001', 'ELEC-0001', 'Wireless Noise-Cancelling Headphones',
   'wireless-noise-cancelling-headphones',
   'Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.',
   199.99, 149.99, 120, 'aaaaaaa1-0000-0000-0000-000000000001', 'SoundPeak',
   'https://picsum.photos/seed/headphones/600/600', 4.5, 128),

  ('bbbbbbb1-0000-0000-0000-000000000002', 'ELEC-0002', '4K Ultra HD Smart TV 55"',
   '4k-ultra-hd-smart-tv-55',
   'Crisp 4K display with built-in streaming apps and voice remote.',
   549.00, NULL, 40, 'aaaaaaa1-0000-0000-0000-000000000001', 'VisionMax',
   'https://picsum.photos/seed/tv55/600/600', 4.2, 64),

  ('bbbbbbb1-0000-0000-0000-000000000003', 'HOME-0001', 'Stainless Steel Air Fryer 6L',
   'stainless-steel-air-fryer-6l',
   'Large capacity air fryer with 8 preset cooking modes and digital touchscreen.',
   89.99, 69.99, 200, 'aaaaaaa1-0000-0000-0000-000000000002', 'KitchenPro',
   'https://picsum.photos/seed/airfryer/600/600', 4.7, 342),

  ('bbbbbbb1-0000-0000-0000-000000000004', 'FASH-0001', 'Men''s Classic Leather Jacket',
   'mens-classic-leather-jacket',
   'Genuine leather jacket with quilted lining, available in multiple sizes.',
   149.50, NULL, 75, 'aaaaaaa1-0000-0000-0000-000000000003', 'UrbanEdge',
   'https://picsum.photos/seed/jacket/600/600', 4.3, 51),

  ('bbbbbbb1-0000-0000-0000-000000000005', 'SPRT-0001', 'Adjustable Dumbbell Set (5-25kg)',
   'adjustable-dumbbell-set-5-25kg',
   'Space-saving adjustable dumbbells, pair, ideal for home workouts.',
   129.00, 109.00, 60, 'aaaaaaa1-0000-0000-0000-000000000004', 'FlexFit',
   'https://picsum.photos/seed/dumbbell/600/600', 4.6, 97),

  ('bbbbbbb1-0000-0000-0000-000000000006', 'ELEC-0003', 'Mechanical Gaming Keyboard RGB',
   'mechanical-gaming-keyboard-rgb',
   'Hot-swappable mechanical switches with per-key RGB lighting.',
   79.99, NULL, 150, 'aaaaaaa1-0000-0000-0000-000000000001', 'KeyForge',
   'https://picsum.photos/seed/keyboard/600/600', 4.4, 210);

INSERT INTO product_images (product_id, image_url, alt_text, display_order) VALUES
  ('bbbbbbb1-0000-0000-0000-000000000001', 'https://picsum.photos/seed/headphones2/600/600', 'Headphones side view', 1),
  ('bbbbbbb1-0000-0000-0000-000000000001', 'https://picsum.photos/seed/headphones3/600/600', 'Headphones case', 2),
  ('bbbbbbb1-0000-0000-0000-000000000003', 'https://picsum.photos/seed/airfryer2/600/600', 'Air fryer open basket', 1);

INSERT INTO addresses (id, user_id, label, line1, city, state, postal_code, country, is_default) VALUES
  ('ccccccc1-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
   'home', '221B Baker Street', 'London', NULL, 'NW1 6XE', 'United Kingdom', TRUE);

INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES
  ('bbbbbbb1-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 5,
   'Excellent sound quality', 'Battery lasts forever and the ANC blocks out my commute noise completely.');
