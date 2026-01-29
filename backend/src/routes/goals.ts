import express, { Response } from 'express';
import { db } from '../models/database';
import { authenticate, requireRole } from '../middleware/auth';
import { generateId } from '../utils/uuid';
import { AnnualGoal, MBOGoal, AuthRequest } from '../types';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// ==================== ANNUAL GOALS ====================

// Get all annual goals (Manager sees all, Employee sees only their own)
router.get('/annual', authenticate, async (req: AuthRequest, res: Response) => {
  await db.read();
  
  let goals = db.data.annualGoals;
  
  // Employees only see their own goals
  if (req.user?.role === 'employee') {
    goals = goals.filter(g => g.userId === req.user?.id);
  }
  
  // Add user info to each goal
  const goalsWithUser = goals.map(goal => {
    const user = db.data.users.find(u => u.id === goal.userId);
    return {
      ...goal,
      userName: user?.name || 'Unknown',
    };
  });
  
  res.json(goalsWithUser);
});

// Get annual goals for a specific employee
router.get('/annual/user/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  await db.read();
  
  // Employees can only see their own goals
  if (req.user?.role === 'employee' && req.user.id !== req.params.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const goals = db.data.annualGoals.filter(g => g.userId === req.params.userId);
  res.json(goals);
});

// Create annual goal (Manager only)
router.post(
  '/annual',
  authenticate,
  requireRole('manager'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    body('year').isInt({ min: 2020, max: 2100 }).withMessage('Valid year is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const { title, description, year } = req.body;

    const goal: AnnualGoal = {
      id: generateId(),
      title,
      description: description || '',
      year,
      userId: req.user!.id, // Use the manager's ID
      createdBy: req.user!.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.annualGoals.push(goal);
    await db.write();
    res.status(201).json(goal);
  }
);

// Update annual goal (Manager only)
router.put(
  '/annual/:id',
  authenticate,
  requireRole('manager'),
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('year').optional().isInt({ min: 2020, max: 2100 }),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const goal = db.data.annualGoals.find(g => g.id === req.params.id);
    if (!goal) {
      return res.status(404).json({ error: 'Annual goal not found' });
    }

    const { title, description, year } = req.body;
    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (year) goal.year = year;
    goal.updatedAt = new Date().toISOString();

    await db.write();
    res.json(goal);
  }
);

// Delete annual goal (Manager only)
router.delete('/annual/:id', authenticate, requireRole('manager'), async (req: AuthRequest, res: Response) => {
  await db.read();
  
  const index = db.data.annualGoals.findIndex(g => g.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Annual goal not found' });
  }

  // Check if there are MBO goals linked to this annual goal
  const linkedMBOGoals = db.data.mboGoals.filter(m => m.annualGoalId === req.params.id);
  if (linkedMBOGoals.length > 0) {
    return res.status(400).json({ 
      error: 'Cannot delete: This annual goal has linked MBO goals. Delete them first.' 
    });
  }

  db.data.annualGoals.splice(index, 1);
  await db.write();
  res.json({ message: 'Annual goal deleted successfully' });
});

// ==================== MBO GOALS ====================

// Get all MBO goals
router.get('/mbo', authenticate, async (req: AuthRequest, res: Response) => {
  await db.read();
  
  let goals = db.data.mboGoals;
  
  // Employees only see their own goals
  if (req.user?.role === 'employee') {
    goals = goals.filter(g => g.userId === req.user?.id);
  }
  
  // Add user and annual goal info
  const goalsWithInfo = goals.map(goal => {
    const user = db.data.users.find(u => u.id === goal.userId);
    const annualGoal = db.data.annualGoals.find(ag => ag.id === goal.annualGoalId);
    return {
      ...goal,
      userName: user?.name || 'Unknown',
      annualGoalTitle: annualGoal?.title || 'Unknown',
    };
  });
  
  res.json(goalsWithInfo);
});

// Get MBO goals by annual goal ID
router.get('/mbo/annual/:annualGoalId', authenticate, async (req: AuthRequest, res: Response) => {
  await db.read();
  
  const annualGoal = db.data.annualGoals.find(g => g.id === req.params.annualGoalId);
  if (!annualGoal) {
    return res.status(404).json({ error: 'Annual goal not found' });
  }
  
  // Employees can only see their own goals
  if (req.user?.role === 'employee' && annualGoal.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const mboGoals = db.data.mboGoals.filter(g => g.annualGoalId === req.params.annualGoalId);
  res.json(mboGoals);
});

// Get MBO goals for a specific employee
router.get('/mbo/user/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  await db.read();
  
  // Employees can only see their own goals
  if (req.user?.role === 'employee' && req.user.id !== req.params.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const goals = db.data.mboGoals.filter(g => g.userId === req.params.userId);
  res.json(goals);
});

// Create MBO goal (Manager only)
router.post(
  '/mbo',
  authenticate,
  requireRole('manager'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    body('annualGoalId').notEmpty().withMessage('Annual Goal ID is required'),
    body('userId').optional().trim(),
    body('targetValue').optional().trim(),
    body('currentValue').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const { title, description, annualGoalId, userId, targetValue, currentValue } = req.body;

    // Verify annual goal exists
    const annualGoal = db.data.annualGoals.find(g => g.id === annualGoalId);
    if (!annualGoal) {
      return res.status(400).json({ error: 'Annual goal not found' });
    }

    // Verify user exists if provided
    if (userId) {
      const user = db.data.users.find(u => u.id === userId);
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }
    }

    const goal: MBOGoal = {
      id: generateId(),
      title,
      description: description || '',
      annualGoalId,
      userId: userId || annualGoal.userId, // Use provided userId or inherit from annual goal
      targetValue: targetValue || '',
      currentValue: currentValue || '',
      createdBy: req.user!.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.mboGoals.push(goal);
    await db.write();
    
    // Return with user name
    const goalUser = db.data.users.find(u => u.id === goal.userId);
    res.status(201).json({
      ...goal,
      userName: goalUser?.name || 'Unknown',
    });
  }
);

// Update MBO goal (Manager only)
router.put(
  '/mbo/:id',
  authenticate,
  requireRole('manager'),
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('targetValue').optional().trim(),
    body('currentValue').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const goal = db.data.mboGoals.find(g => g.id === req.params.id);
    if (!goal) {
      return res.status(404).json({ error: 'MBO goal not found' });
    }

    const { title, description, targetValue, currentValue } = req.body;
    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (targetValue !== undefined) goal.targetValue = targetValue;
    if (currentValue !== undefined) goal.currentValue = currentValue;
    goal.updatedAt = new Date().toISOString();

    await db.write();
    res.json(goal);
  }
);

// Delete MBO goal (Manager only)
router.delete('/mbo/:id', authenticate, requireRole('manager'), async (req: AuthRequest, res: Response) => {
  await db.read();
  
  const index = db.data.mboGoals.findIndex(g => g.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'MBO goal not found' });
  }

  // Check if there are tasks linked to this MBO goal
  const linkedTasks = db.data.tasks.filter(t => t.mboGoalId === req.params.id);
  if (linkedTasks.length > 0) {
    return res.status(400).json({ 
      error: 'Cannot delete: This MBO goal has linked tasks. Delete or reassign them first.' 
    });
  }

  db.data.mboGoals.splice(index, 1);
  await db.write();
  res.json({ message: 'MBO goal deleted successfully' });
});

export default router;

