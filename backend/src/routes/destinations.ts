import { Router } from 'express';
import { mockDestinations } from '../data/mockData.js';

const router = Router();

// GET /api/destinations
router.get('/', (_req, res) => {
  const available = mockDestinations.filter(d => d.available);
  res.json({ success: true, data: available });
});

// GET /api/destinations/:slug
router.get('/:slug', (req, res) => {
  const dest = mockDestinations.find(d => d.slug === req.params.slug);
  if (!dest) {
    return res.status(404).json({
      success: false,
      status: 'notFound',
      message: `Destination '${req.params.slug}' not found.`,
    });
  }
  res.json({ success: true, data: dest });
});

export default router;
