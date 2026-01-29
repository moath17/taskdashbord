import express, { Response } from 'express';
import { db } from '../models/database';
import { authenticate, requireRole } from '../middleware/auth';
import { generateId } from '../utils/uuid';
import { KPI, AuthRequest } from '../types';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all KPIs
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  await db.read();
  
  const kpis = db.data.kpis.map(kpi => {
    const annualGoal = db.data.annualGoals.find(g => g.id === kpi.annualGoalId);
    const mboGoal = kpi.mboGoalId ? db.data.mboGoals.find(g => g.id === kpi.mboGoalId) : null;
    
    // Calculate achievement percentage
    const achievementPercentage = kpi.targetValue > 0 
      ? Math.round((kpi.currentValue / kpi.targetValue) * 100 * 100) / 100
      : 0;
    
    return {
      ...kpi,
      annualGoalTitle: annualGoal?.title || 'Unknown',
      mboGoalTitle: mboGoal?.title || null,
      achievementPercentage,
    };
  });
  
  res.json(kpis);
});

// Get KPI by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  await db.read();
  
  const kpi = db.data.kpis.find(k => k.id === req.params.id);
  if (!kpi) {
    return res.status(404).json({ error: 'KPI not found' });
  }
  
  const annualGoal = db.data.annualGoals.find(g => g.id === kpi.annualGoalId);
  const mboGoal = kpi.mboGoalId ? db.data.mboGoals.find(g => g.id === kpi.mboGoalId) : null;
  const achievementPercentage = kpi.targetValue > 0 
    ? Math.round((kpi.currentValue / kpi.targetValue) * 100 * 100) / 100
    : 0;
  
  res.json({
    ...kpi,
    annualGoalTitle: annualGoal?.title || 'Unknown',
    mboGoalTitle: mboGoal?.title || null,
    achievementPercentage,
  });
});

// Get KPIs by Annual Goal
router.get('/annual/:annualGoalId', authenticate, async (req: AuthRequest, res: Response) => {
  await db.read();
  
  const kpis = db.data.kpis
    .filter(k => k.annualGoalId === req.params.annualGoalId)
    .map(kpi => {
      const achievementPercentage = kpi.targetValue > 0 
        ? Math.round((kpi.currentValue / kpi.targetValue) * 100 * 100) / 100
        : 0;
      return { ...kpi, achievementPercentage };
    });
  
  res.json(kpis);
});

// Create KPI (Manager only)
router.post(
  '/',
  authenticate,
  requireRole('manager'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    body('annualGoalId').notEmpty().withMessage('Annual Goal is required'),
    body('mboGoalId').optional().trim(),
    body('unit').trim().notEmpty().withMessage('Unit is required'),
    body('targetValue').isFloat({ min: 0 }).withMessage('Target value must be a positive number'),
    body('currentValue').optional().isFloat({ min: 0 }),
    body('formula').optional().trim(),
    body('frequency').isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid frequency'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const { title, description, annualGoalId, mboGoalId, unit, targetValue, currentValue, formula, frequency } = req.body;

    // Verify annual goal exists
    const annualGoal = db.data.annualGoals.find(g => g.id === annualGoalId);
    if (!annualGoal) {
      return res.status(400).json({ error: 'Annual goal not found' });
    }

    // Verify MBO goal if provided
    if (mboGoalId) {
      const mboGoal = db.data.mboGoals.find(g => g.id === mboGoalId);
      if (!mboGoal) {
        return res.status(400).json({ error: 'MBO goal not found' });
      }
      if (mboGoal.annualGoalId !== annualGoalId) {
        return res.status(400).json({ error: 'MBO goal must belong to the selected Annual Goal' });
      }
    }

    const kpi: KPI = {
      id: generateId(),
      title,
      description: description || '',
      annualGoalId,
      mboGoalId: mboGoalId || undefined,
      unit,
      targetValue: parseFloat(targetValue),
      currentValue: currentValue ? parseFloat(currentValue) : 0,
      formula: formula || '',
      frequency,
      createdBy: req.user!.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.kpis.push(kpi);
    await db.write();
    
    const achievementPercentage = kpi.targetValue > 0 
      ? Math.round((kpi.currentValue / kpi.targetValue) * 100 * 100) / 100
      : 0;
    
    res.status(201).json({ ...kpi, achievementPercentage });
  }
);

// Update KPI (Manager only)
router.put(
  '/:id',
  authenticate,
  requireRole('manager'),
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('unit').optional().trim().notEmpty(),
    body('targetValue').optional().isFloat({ min: 0 }),
    body('currentValue').optional().isFloat({ min: 0 }),
    body('formula').optional().trim(),
    body('frequency').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const kpi = db.data.kpis.find(k => k.id === req.params.id);
    if (!kpi) {
      return res.status(404).json({ error: 'KPI not found' });
    }

    const { title, description, unit, targetValue, currentValue, formula, frequency } = req.body;
    
    if (title) kpi.title = title;
    if (description !== undefined) kpi.description = description;
    if (unit) kpi.unit = unit;
    if (targetValue !== undefined) kpi.targetValue = parseFloat(targetValue);
    if (currentValue !== undefined) kpi.currentValue = parseFloat(currentValue);
    if (formula !== undefined) kpi.formula = formula;
    if (frequency) kpi.frequency = frequency;
    kpi.updatedAt = new Date().toISOString();

    await db.write();
    
    const achievementPercentage = kpi.targetValue > 0 
      ? Math.round((kpi.currentValue / kpi.targetValue) * 100 * 100) / 100
      : 0;
    
    res.json({ ...kpi, achievementPercentage });
  }
);

// Update KPI current value only (for tracking progress)
router.patch(
  '/:id/value',
  authenticate,
  [
    body('currentValue').isFloat({ min: 0 }).withMessage('Current value must be a positive number'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const kpi = db.data.kpis.find(k => k.id === req.params.id);
    if (!kpi) {
      return res.status(404).json({ error: 'KPI not found' });
    }

    kpi.currentValue = parseFloat(req.body.currentValue);
    kpi.updatedAt = new Date().toISOString();

    await db.write();
    
    const achievementPercentage = kpi.targetValue > 0 
      ? Math.round((kpi.currentValue / kpi.targetValue) * 100 * 100) / 100
      : 0;
    
    res.json({ ...kpi, achievementPercentage });
  }
);

// Delete KPI (Manager only)
router.delete('/:id', authenticate, requireRole('manager'), async (req: AuthRequest, res: Response) => {
  await db.read();
  
  const index = db.data.kpis.findIndex(k => k.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'KPI not found' });
  }

  db.data.kpis.splice(index, 1);
  await db.write();
  res.json({ message: 'KPI deleted successfully' });
});

export default router;

