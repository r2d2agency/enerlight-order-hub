require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./database/db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const clientRoutes = require('./routes/clients');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/uploads');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map(s => s.trim());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, origin || '*');
    }
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

// Auto-migrate and start
async function runMigrations() {
  const bcrypt = require('bcryptjs');
  try {
    console.log('🔧 Executando migração automática...');
    const migration = require('fs').readFileSync(require('path').join(__dirname, 'database', 'migration.sql'), 'utf8');
    await pool.query(migration);
  } catch (err) {
    // migration.sql may not exist, run inline
    console.log('📦 Executando migração inline...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'vendedor' CHECK (role IN ('admin', 'vendedor')),
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
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
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
        product_id UUID REFERENCES products(id) ON DELETE SET NULL,
        quantity DECIMAL(12,2) NOT NULL DEFAULT 1,
        unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
        discount DECIMAL(12,2) DEFAULT 0,
        total DECIMAL(12,2) NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        company_name VARCHAR(255) DEFAULT 'ENERLIGHT',
        subtitle VARCHAR(255) DEFAULT 'Sistema de Pedidos',
        logo_url TEXT DEFAULT '',
        primary_color VARCHAR(50) DEFAULT '38 92% 50%',
        sidebar_color VARCHAR(50) DEFAULT '220 25% 14%',
        updated_at TIMESTAMP DEFAULT NOW()
      );
      INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
      CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 9200;
      ALTER TABLE orders ALTER COLUMN number SET DEFAULT nextval('order_number_seq');
    `);
  }

  // Create or reset default admin password
  const bcryptLib = require('bcryptjs');
  const hash = await bcryptLib.hash('admin123', 10);
  await pool.query(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES ('Admin Enerlight', 'admin@enerlight.com.br', $1, 'admin')
    ON CONFLICT (email) DO UPDATE SET password_hash = $1
  `, [hash]);

  console.log('✅ Migração automática concluída!');
}

runMigrations()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Enerlight API rodando na porta ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Erro na migração:', err);
    process.exit(1);
  });
