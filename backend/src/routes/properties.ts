import { Router, Request, Response } from 'express';
import { mockProperties, mockRooms } from '../data/mockData.js';

const router = Router();

// GET /api/properties?destination=bir
router.get('/', (req: Request, res: Response) => {
  let results = [...mockProperties];
  if (req.query['destination']) {
    results = results.filter(p => p.destinationSlug === req.query['destination']);
  }
  res.json({ success: true, data: results });
});

// GET /api/properties/slug/:slug  — must be before /:id
router.get('/slug/:slug', (req: Request, res: Response) => {
  const prop = mockProperties.find(p => p.slug === req.params['slug']);
  if (!prop) {
    res.status(404).json({
      success: false, status: 'notFound',
      message: `Property '${req.params['slug']}' not found.`,
    });
    return;
  }
  res.json({ success: true, data: prop });
});

// GET /api/properties/:id
router.get('/:id', (req: Request, res: Response) => {
  const prop = mockProperties.find(p => p.id === req.params['id']);
  if (!prop) {
    res.status(404).json({
      success: false, status: 'notFound',
      message: `Property '${req.params['id']}' not found.`,
    });
    return;
  }
  res.json({ success: true, data: prop });
});

// GET /api/properties/:id/rooms
router.get('/:id/rooms', (req: Request, res: Response) => {
  const rooms = mockRooms.filter(r => r.propertyId === req.params['id']);
  res.json({ success: true, data: rooms });
});

export default router;
