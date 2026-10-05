import { Router, Request, Response } from 'express';
import { mockDestinations } from '../data/mockData.js';

const router = Router();

// GET /api/destinations
router.get('/', (_req: Request, res: Response) => {
  const available = mockDestinations.filter(d => d.available);
  res.json({ success: true, data: available });
});

// GET /api/destinations/:slug
router.get('/:slug', (req: Request, res: Response) => {
  const dest = mockDestinations.find(d => d.slug === req.params['slug']);
  if (!dest) {
    res.status(404).json({
      success: false,
      status:  'notFound',
      message: `Destination '${req.params['slug']}' not found.`,
    });
    return;
  }
  res.json({ success: true, data: dest });
});

export default router;
