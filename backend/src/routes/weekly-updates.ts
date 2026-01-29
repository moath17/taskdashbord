import express, { Response } from 'express';
import { db } from '../models/database';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { generateId } from '../utils/uuid';
import { WeeklyUpdate } from '../types';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all weekly updates (Manager only)
router.get('/', authenticate, requireRole('manager'), async (req: AuthRequest, res: Response) => {
  await db.read();
  const updates = db.data.weeklyUpdates
    .map((update) => {
      const user = db.data.users.find((u) => u.id === update.createdBy);
      return {
        ...update,
        createdByName: user?.name || 'Unknown',
      };
    })
    .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());
  res.json(updates);
});

// Get single weekly update (Manager only)
router.get('/:id', authenticate, requireRole('manager'), async (req: AuthRequest, res: Response) => {
  await db.read();
  const update = db.data.weeklyUpdates.find((u) => u.id === req.params.id);
  if (!update) {
    return res.status(404).json({ error: 'Weekly update not found' });
  }
  const user = db.data.users.find((u) => u.id === update.createdBy);
  res.json({
    ...update,
    createdByName: user?.name || 'Unknown',
  });
});

// Create weekly update (Manager only)
router.post(
  '/',
  authenticate,
  requireRole('manager'),
  [
    body('weekStartDate').isISO8601().withMessage('Week start date must be a valid date'),
    body('weekEndDate').isISO8601().withMessage('Week end date must be a valid date'),
    body('importantTasks').isArray().withMessage('Important tasks must be an array'),
    body('summary').trim().notEmpty().withMessage('Summary is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const { weekStartDate, weekEndDate, importantTasks, summary } = req.body;

    const start = new Date(weekStartDate);
    const end = new Date(weekEndDate);
    if (end < start) {
      return res.status(400).json({ error: 'Week end date cannot be before week start date' });
    }

    const update: WeeklyUpdate = {
      id: generateId(),
      weekStartDate,
      weekEndDate,
      importantTasks: importantTasks || [],
      summary,
      createdBy: req.user!.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.weeklyUpdates.push(update);
    await db.write();
    res.status(201).json(update);
  }
);

// Update weekly update (Manager only)
router.put(
  '/:id',
  authenticate,
  requireRole('manager'),
  [
    body('weekStartDate').optional().isISO8601(),
    body('weekEndDate').optional().isISO8601(),
    body('importantTasks').optional().isArray(),
    body('summary').optional().trim().notEmpty(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const update = db.data.weeklyUpdates.find((u) => u.id === req.params.id);
    if (!update) {
      return res.status(404).json({ error: 'Weekly update not found' });
    }

    const { weekStartDate, weekEndDate, importantTasks, summary } = req.body;

    if (weekStartDate && weekEndDate) {
      const start = new Date(weekStartDate);
      const end = new Date(weekEndDate);
      if (end < start) {
        return res.status(400).json({ error: 'Week end date cannot be before week start date' });
      }
    }

    if (weekStartDate) update.weekStartDate = weekStartDate;
    if (weekEndDate) update.weekEndDate = weekEndDate;
    if (importantTasks) update.importantTasks = importantTasks;
    if (summary) update.summary = summary;
    update.updatedAt = new Date().toISOString();

    await db.write();
    res.json(update);
  }
);

// Delete weekly update (Manager only)
router.delete('/:id', authenticate, requireRole('manager'), async (req: AuthRequest, res: Response) => {
  await db.read();
  const index = db.data.weeklyUpdates.findIndex((u) => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Weekly update not found' });
  }

  db.data.weeklyUpdates.splice(index, 1);
  await db.write();
  res.json({ message: 'Weekly update deleted successfully' });
});

export default router;

