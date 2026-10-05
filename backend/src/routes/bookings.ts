import { Router, Request, Response } from 'express';
import { validateBookingPayload } from '../utils/validation.js';
import { mockRooms } from '../data/mockData.js';
import { randomUUID } from 'node:crypto';

const router = Router();

// POST /api/bookings/validate
router.post('/validate', (req: Request, res: Response) => {
  const result = validateBookingPayload(req.body as Record<string, unknown>);
  if (!result.valid) {
    res.status(400).json({
      success: false, status: 'error',
      message: 'Booking validation failed.',
      errors:  result.errors,
    });
    return;
  }
  res.json({ success: true, data: { valid: true } });
});

// POST /api/bookings
router.post('/', (req: Request, res: Response) => {
  const body = req.body as Record<string, unknown>;
  const validation = validateBookingPayload(body);
  if (!validation.valid) {
    res.status(400).json({
      success: false, status: 'error',
      message: 'Invalid booking data.',
      errors:  validation.errors,
    });
    return;
  }

  const propertyId        = body['propertyId'] as string;
  const roomId            = body['roomId'] as string;
  const dates             = body['dates'] as { checkIn: string; checkOut: string };
  const guests            = body['guests'] as { adults: number; children: number };
  const birdCoinsApplied  = (body['birdCoinsApplied'] as number) ?? 0;

  const room = mockRooms.find(r => r.id === roomId && r.propertyId === propertyId);
  if (!room) {
    res.status(404).json({ success: false, status: 'notFound', message: 'Room not found.' });
    return;
  }
  if (room.availableBeds === 0) {
    res.status(409).json({ success: false, status: 'error', message: 'This room is sold out.' });
    return;
  }
  if (guests.adults > room.capacity) {
    res.status(400).json({ success: false, status: 'error', message: `Room capacity is ${room.capacity} guests.` });
    return;
  }

  const checkIn  = new Date(dates.checkIn  + 'T00:00:00');
  const checkOut = new Date(dates.checkOut + 'T00:00:00');
  const nights   = Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
  const subtotal    = room.price * nights;
  const gstRate     = room.price > 7500 ? 0.18 : 0.12;
  const taxes       = Math.round(subtotal * gstRate);
  const discount    = (room.originalPrice - room.price) * nights;
  const safeCoins   = Math.min(birdCoinsApplied, Math.floor(subtotal * 0.1 * 10));
  const coinsValue  = Math.max(0, Math.floor(safeCoins / 10));
  const total       = Math.max(0, subtotal + taxes - coinsValue);

  res.status(201).json({
    success: true,
    data: {
      id:         randomUUID(),
      propertyId, roomId,
      checkIn:    dates.checkIn,
      checkOut:   dates.checkOut,
      guests, subtotal, taxes, discount,
      birdCoins:  safeCoins,
      total,
      status:     'confirmed',
      createdAt:  new Date().toISOString(),
    },
  });
});

export default router;
