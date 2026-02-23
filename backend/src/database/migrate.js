require('dotenv').config();
const { pool } = require('./db');

const migration = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'vendedor' CHECK (role IN ('admin', 'vendedor', 'projetista')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  cost_price DECIMAL(12,2) DEFAULT 0,
  sale_price DECIMAL(12,2) DEFAULT 0,
  convention_price DECIMAL(12,2) DEFAULT 0,
  unit VARCHAR(10) DEFAULT 'PC',
  image_url TEXT DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) DEFAULT '',
  address TEXT DEFAULT '',
  neighborhood VARCHAR(255) DEFAULT '',
  city VARCHAR(255) DEFAULT '',
  state VARCHAR(2) DEFAULT '',
  phone VARCHAR(30) DEFAULT '',
  email VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number SERIAL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  subtotal DECIMAL(12,2) DEFAULT 0,
  freight DECIMAL(12,2) DEFAULT 0,
  tax_substitution DECIMAL(12,2) DEFAULT 0,
  total_discount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  validity_days INTEGER DEFAULT 7,
  payment_condition VARCHAR(100) DEFAULT 'A VISTA',
  payment_method VARCHAR(100) DEFAULT 'DEPOSITO',
  delivery_deadline VARCHAR(100) DEFAULT '',
  observations TEXT DEFAULT '',
  seller VARCHAR(255) DEFAULT '',
  status VARCHAR(20) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'aprovado', 'cancelado')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity DECIMAL(12,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0
);

-- Branding settings table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name VARCHAR(255) DEFAULT 'ENERLIGHT',
  subtitle VARCHAR(255) DEFAULT 'Sistema de Pedidos',
  logo_url TEXT DEFAULT '',
  primary_color VARCHAR(50) DEFAULT '38 92% 50%',
  sidebar_color VARCHAR(50) DEFAULT '220 25% 14%',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Create sequence for order numbers starting at 9200
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 9200;
ALTER TABLE orders ALTER COLUMN number SET DEFAULT nextval('order_number_seq');
`;

async function migrate() {
  try {
    console.log('🔧 Executando migração...');
    await pool.query(migration);
    
    // Create default admin user
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ('Admin Enerlight', 'admin@enerlight.com.br', $1, 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [hash]);

    // Seed products
    const products = [
      { code: '518', name: 'LED PLAFON RECUADO EMBUTIR', description: 'LUMINÁRIA LED PLAFON RECUADO EMBUTIR, POTENCIA 18W, FLUXO LUMINOSO 2.050 LM, COR 3.000K/4.000K, ÂNGULO 120°, IP 30, VIDA ÚTIL 25.000H, DIMENSÕES 200x200x80mm.', costPrice: 17.45, salePrice: 150, conventionPrice: 64.9 },
      { code: '897', name: 'LUMINÁRIA LINEAR E40 SOBREPOR 1M 3000K', description: 'LUMINÁRIA LINEAR E40, POTENCIA 27W, 220V, FLUXO LUMINOSO 3.700 LM, COR 3.000K, ACABAMENTO BRANCO, ÂNGULO 120°, IP 40, VIDA ÚTIL 30.000H, DIMENSÕES 1.000x60x80mm.', costPrice: 113.61, salePrice: 390, conventionPrice: 358.8 },
      { code: '896', name: 'LUMINÁRIA LINEAR E40 SOBREPOR 1,5M 3000K', description: 'LUMINÁRIA LINEAR E40, POTENCIA 27W, 220V, FLUXO LUMINOSO 3.700 LM, COR 3.000K, ACABAMENTO BRANCO, ÂNGULO 120°, IP 40, VIDA ÚTIL 30.000H, DIMENSÕES 1.500x60x80mm.', costPrice: 168.68, salePrice: 450, conventionPrice: 414 },
      { code: '506', name: 'LUMINÁRIA PENDENTE BR MANIA', description: 'LUMINÁRIA PENDENTE BR MANIA, POTENCIA 9W, FLUXO LUMINOSO 800 LM, COR 3.000K, ACABAMENTO BRANCO, ÂNGULO 60°, IP 20, ALUMINIO PRETO, VIDA ÚTIL 30.000H, DIMENSÕES Ø370x170mm.', costPrice: 87.78, salePrice: 240, conventionPrice: 139.9 },
      { code: '14', name: 'PETRO E 100 90°', description: 'Driver 100W, Fluxo Luminoso 13.380 lm, eficiência 194 lm/W, tensão 220V, cor 5000K, IP66, vida útil 100.000h, garantia 5 anos.', costPrice: 197.79, salePrice: 570, conventionPrice: 524.4 },
      { code: '16', name: 'PETRO E 150 90°', description: 'Driver 150W, Fluxo Luminoso 26.760 lm, eficiência 194 lm/W, tensão 220V, cor 5000K, vida útil 100.000h, garantia 5 anos.', costPrice: 349.17, salePrice: 850, conventionPrice: 782 },
      { code: '1508', name: 'LUMINÁRIA PÚBLICA 100W', description: 'Driver 100W, Fluxo Luminoso 12.200 lm, 220V, alumínio injetado, lente fotometria, vidro temperado, cor 5000K, IP66, vida útil 70.000h, garantia 5 anos. SEM SOQUETE.', costPrice: 195.78, salePrice: 620, conventionPrice: 570.4 },
      { code: '2154', name: 'LUMINÁRIA PÚBLICA 150W', description: 'Driver 150W, Fluxo Luminoso 21.000 lm, 220V, alumínio injetado, lente fotometria, vidro temperado, cor 5000K, IP66, vida útil 70.000h, garantia 5 anos. SEM SOQUETE.', costPrice: 0, salePrice: 790, conventionPrice: 726.8 },
    ];

    for (const p of products) {
      await pool.query(
        `INSERT INTO products (code, name, description, cost_price, sale_price, convention_price, unit)
         VALUES ($1, $2, $3, $4, $5, $6, 'PC')
         ON CONFLICT (code) DO NOTHING`,
        [p.code, p.name, p.description, p.costPrice, p.salePrice, p.conventionPrice]
      );
    }

    console.log('✅ Migração concluída!');
    console.log('👤 Admin criado: admin@enerlight.com.br / admin123');
    console.log('📦 8 produtos inseridos');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na migração:', err);
    process.exit(1);
  }
}

migrate();
