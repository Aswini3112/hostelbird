import express from 'express';
import cors from 'cors';
import destinationsRouter from './routes/destinations.js';
import propertiesRouter from './routes/properties.js';
import bookingsRouter from './routes/bookings.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app  = express();
const PORT = process.env.PORT ?? 4000;

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

// ── Request logger (dev only) ─────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'HostelBird Build & Break API',
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
app.listen(PORT, () => {
  console.log(`\n🐦 HostelBird Build & Break API`);
  console.log(`   Listening on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});

export default app;
