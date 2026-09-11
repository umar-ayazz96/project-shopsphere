-- =========================================================
-- ShopSphere - Relational schema (PostgreSQL / AWS RDS)
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- USERS ----------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(30),
    role            VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- ADDRESSES ----------
CREATE TABLE addresses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label           VARCHAR(50) DEFAULT 'home',
    line1           VARCHAR(255) NOT NULL,
    line2           VARCHAR(255),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100),
    postal_code     VARCHAR(20) NOT NULL,
    country         VARCHAR(100) NOT NULL,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- CATEGORIES ----------
CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(120) NOT NULL,
    slug            VARCHAR(140) UNIQUE NOT NULL,
    description     TEXT,
    parent_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- PRODUCTS ----------
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku             VARCHAR(64) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(280) UNIQUE NOT NULL,
    description     TEXT,
    price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    discount_price  NUMERIC(10,2) CHECK (discount_price >= 0),
    stock_quantity  INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    brand           VARCHAR(120),
    image_url       VARCHAR(500),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    avg_rating      NUMERIC(2,1) NOT NULL DEFAULT 0,
    review_count    INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name_trgm ON products USING GIN (to_tsvector('english', name));
CREATE INDEX idx_products_active ON products(is_active);

-- ---------- PRODUCT IMAGES (gallery) ----------
CREATE TABLE product_images (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url       VARCHAR(500) NOT NULL,
    alt_text        VARCHAR(255),
    display_order   INTEGER NOT NULL DEFAULT 0
);

-- ---------- CART ----------
CREATE TABLE cart_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- ---------- ORDERS ----------
CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number        VARCHAR(30) UNIQUE NOT NULL,
    user_id             UUID NOT NULL REFERENCES users(id),
    status              VARCHAR(30) NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled')),
    subtotal            NUMERIC(10,2) NOT NULL,
    shipping_fee        NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax_amount          NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(10,2) NOT NULL,
    shipping_address_id UUID REFERENCES addresses(id),
    payment_method      VARCHAR(30) NOT NULL DEFAULT 'card',
    payment_status      VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','refunded')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ---------- ORDER ITEMS ----------
CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id),
    product_name    VARCHAR(255) NOT NULL,
    unit_price      NUMERIC(10,2) NOT NULL,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    subtotal        NUMERIC(10,2) NOT NULL
);

-- ---------- REVIEWS ----------
CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title           VARCHAR(150),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(product_id, user_id)
);

-- ---------- WISHLIST ----------
CREATE TABLE wishlists (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- ---------- Trigger: keep updated_at fresh ----------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
