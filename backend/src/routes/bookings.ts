import { Router } from 'express';
import { validateBookingPayload } from '../utils/validation.js';
import { mockRooms, mockProperties } from '../data/mockData.js';
import { randomUUID } from 'crypto';

const router = Router();

// POST /api/bookings/validate
router.post('/validate', (req, res) => {
  const result = validateBookingPayload(req.body);
  if (!result.valid) {
    return res.status(400).json({
      success: false,
      status: 'error',
      message: 'Booking validation failed.',
      errors: result.errors,
    });
  }
  res.json({ success: true, data: { valid: true } });
});

// POST /api/bookings
router.post('/', (req, res) => {
  const validation = validateBookingPayload(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      status: 'error',
      message: 'Invalid booking data.',
      errors: validation.errors,
    });
  }

  const { propertyId, roomId, dates, guests, birdCoinsApplied = 0 } = req.body;

  const room = mockRooms.find(r => r.id === roomId && r.propertyId === propertyId);
  if (!room) {
    return res.status(404).json({
      success: false, status: 'notFound',
      message: 'Room not found for this property.',
    });
  }

  if (room.availableBeds === 0) {
    return res.status(409).json({
      success: false, status: 'error',
      message: 'This room is sold out.',
    });
  }

  if (guests.adults > room.capacity) {
    return res.status(400).json({
      success: false, status: 'error',
      message: `Room capacity is ${room.capacity} guests.`,
    });
  }

  // Calculate nights
  const checkIn  = new Date(dates.checkIn + 'T00:00:00');
  const checkOut = new Date(dates.checkOut + 'T00:00:00');
  const nights   = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  const subtotal     = room.price * nights;
  const gstRate      = room.price > 7500 ? 0.18 : 0.12;
  const taxes        = Math.round(subtotal * gstRate);
  const discount     = (room.originalPrice - room.price) * nights;
  const safeCoins    = Math.min(birdCoinsApplied, Math.floor(subtotal * 0.1 * 10));
  const coinsValue   = Math.max(0, Math.floor(safeCoins / 10));
  const total        = Math.max(0, subtotal + taxes - coinsValue);

  const booking = {
    id: randomUUID(),
    propertyId,
    roomId,
    checkIn: dates.checkIn,
    checkOut: dates.checkOut,
    guests,
    basePrice: room.price,
    taxes,
    discount,
    birdCoins: safeCoins,
    total,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  res.status(201).json({ success: true, data: booking });
});

export default router;
