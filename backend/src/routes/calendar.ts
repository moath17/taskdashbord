import express, { Response } from 'express';
import { db } from '../models/database';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { generateId } from '../utils/uuid';
import { CalendarEvent } from '../types';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all calendar events
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  await db.read();
  const events = db.data.calendarEvents.map((event) => {
    const user = db.data.users.find((u) => u.id === event.createdBy);
    return {
      ...event,
      createdByName: user?.name || 'Unknown',
    };
  });
  res.json(events);
});

// Get single calendar event
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  await db.read();
  const event = db.data.calendarEvents.find((e) => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  const user = db.data.users.find((u) => u.id === event.createdBy);
  res.json({
    ...event,
    createdByName: user?.name || 'Unknown',
  });
});

// Create calendar event (Manager only)
router.post(
  '/',
  authenticate,
  requireRole('manager'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('type').isIn(['holiday', 'training']).withMessage('Type must be holiday or training'),
    body('startDate').isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').isISO8601().withMessage('End date must be a valid date'),
    body('description').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const { title, type, startDate, endDate, description } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({ error: 'End date cannot be before start date' });
    }

    const event: CalendarEvent = {
      id: generateId(),
      title,
      type,
      startDate,
      endDate,
      description: description || '',
      createdBy: req.user!.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.calendarEvents.push(event);
    await db.write();
    res.status(201).json(event);
  }
);

// Update calendar event (Manager only)
router.put(
  '/:id',
  authenticate,
  requireRole('manager'),
  [
    body('title').optional().trim().notEmpty(),
    body('type').optional().isIn(['holiday', 'training']),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('description').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const event = db.data.calendarEvents.find((e) => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { title, type, startDate, endDate, description } = req.body;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        return res.status(400).json({ error: 'End date cannot be before start date' });
      }
    }

    if (title) event.title = title;
    if (type) event.type = type;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (description !== undefined) event.description = description;
    event.updatedAt = new Date().toISOString();

    await db.write();
    res.json(event);
  }
);

// Delete calendar event (Manager only)
router.delete('/:id', authenticate, requireRole('manager'), async (req: AuthRequest, res: Response) => {
  await db.read();
  const index = db.data.calendarEvents.findIndex((e) => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  db.data.calendarEvents.splice(index, 1);
  await db.write();
  res.json({ message: 'Event deleted successfully' });
});

export default router;

