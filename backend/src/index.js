require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./database/db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const clientRoutes = require('./routes/clients');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Enerlight API rodando na porta ${PORT}`);
});
