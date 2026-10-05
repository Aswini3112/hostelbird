import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptionsDelegate } from 'cors';
import destinationsRouter from './routes/destinations.js';
import propertiesRouter   from './routes/properties.js';
import bookingsRouter     from './routes/bookings.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app  = express();
const PORT = Number(process.env['PORT'] ?? 4000);

// ── CORS ──────────────────────────────────────────────────────────────────
const rawOrigins  = process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:5173,http://localhost:4173';
const allowedOrigins = rawOrigins.split(',').map((o: string) => o.trim()).filter(Boolean);

const corsOptions: CorsOptionsDelegate = (req, callback) => {
  const origin = (req as Request).headers['origin'] as string | undefined;
  // No origin header (curl / Postman / server-to-server) → allow
  if (!origin) return callback(null, { origin: true });
  // Explicitly listed origin → allow
  if (allowedOrigins.includes(origin)) return callback(null, { origin: true });
  // Any Vercel preview / production URL → allow
  if (origin.endsWith('.vercel.app')) return callback(null, { origin: true });
  // Block everything else
  callback(new Error(`CORS: origin ${origin} not permitted`));
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));   // pre-flight

// ── Middleware ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  if (process.env['NODE_ENV'] !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status:      'ok',
    service:     'HostelBird Build & Break API',
    version:     '1.0.0',
    environment: process.env['NODE_ENV'] ?? 'development',
    timestamp:   new Date().toISOString(),
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
  console.log('\n🐦 HostelBird Build & Break API');
  console.log(`   Environment : ${process.env['NODE_ENV'] ?? 'development'}`);
  console.log(`   Listening   : http://0.0.0.0:${PORT}`);
  console.log(`   Health      : http://0.0.0.0:${PORT}/health`);
  console.log(`   CORS allow  : ${allowedOrigins.join(', ')}\n`);
});

export default app;
