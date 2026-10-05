import { Router } from 'express';
import { mockProperties, mockRooms } from '../data/mockData.js';

const router = Router();

// GET /api/properties?destination=bir
router.get('/', (req, res) => {
  let results = [...mockProperties];
  if (req.query.destination) {
    results = results.filter(p => p.destinationSlug === req.query.destination);
  }
  if (results.length === 0) {
    return res.json({ success: true, data: [], status: 'empty' });
  }
  res.json({ success: true, data: results });
});

// GET /api/properties/slug/:slug
router.get('/slug/:slug', (req, res) => {
  const prop = mockProperties.find(p => p.slug === req.params.slug);
  if (!prop) {
    return res.status(404).json({
      success: false, status: 'notFound',
      message: `Property '${req.params.slug}' not found.`,
    });
  }
  res.json({ success: true, data: prop });
});

// GET /api/properties/:id
router.get('/:id', (req, res) => {
  const prop = mockProperties.find(p => p.id === req.params.id);
  if (!prop) {
    return res.status(404).json({
      success: false, status: 'notFound',
      message: `Property '${req.params.id}' not found.`,
    });
  }
  res.json({ success: true, data: prop });
});

// GET /api/properties/:id/rooms
router.get('/:id/rooms', (req, res) => {
  const rooms = mockRooms.filter(r => r.propertyId === req.params.id);
  if (rooms.length === 0) {
    return res.json({ success: true, data: [], status: 'empty' });
  }
  res.json({ success: true, data: rooms });
});

export default router;
