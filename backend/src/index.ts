import express from 'express';
import cors from 'cors';
import destinationsRouter from './routes/destinations.js';
import propertiesRouter  from './routes/properties.js';
import bookingsRouter    from './routes/bookings.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app  = express();
const PORT = Number(process.env.PORT ?? 4000);

// ── CORS ──────────────────────────────────────────────────────────────────
// Read allowed origins from env — supports both local dev and Vercel prod
const rawOrigins = process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://localhost:4173';
const allowedOrigins = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any vercel.app subdomain automatically
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Middleware ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// Request logger
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'HostelBird Build & Break API',
    version: '1.0.0',
    environment: process.env.NODE_ENV ?? 'development',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/destinations', destinationsRouter);
app.use('/api/properties',   propertiesRouter);
app.use('/api/bookings',     bookingsRouter);

// ── Error handlers ────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🐦 HostelBird Build & Break API`);
  console.log(`   Environment : ${process.env.NODE_ENV ?? 'development'}`);
  console.log(`   Listening   : http://0.0.0.0:${PORT}`);
  console.log(`   Health      : http://0.0.0.0:${PORT}/health`);
  console.log(`   CORS allow  : ${allowedOrigins.join(', ')}\n`);
});

export default app;
