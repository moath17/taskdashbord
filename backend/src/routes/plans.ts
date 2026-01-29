import express, { Request, Response } from 'express';
import { db } from '../models/database';
import { generateId } from '../utils/uuid';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { VacationPlan, TrainingPlan } from '../types';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// ============ Vacation Plans ============

// Get all vacation plans
router.get('/vacations', authenticate, async (req: AuthRequest, res: Response) => {
  await db.read();
  let plans = [...db.data.vacationPlans];

  // Apply role-based filtering
  if (req.user?.role === 'employee') {
    plans = plans.filter((p) => p.userId === req.user!.id);
  }

  const plansWithUsers = plans.map((plan) => {
    const user = db.data.users.find((u) => u.id === plan.userId);
    return {
      ...plan,
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
    };
  });

  res.json(plansWithUsers);
});

// Get single vacation plan
router.get('/vacations/:id', authenticate, async (req: AuthRequest, res: Response) => {
  await db.read();
  const plan = db.data.vacationPlans.find((p) => p.id === req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Vacation plan not found' });
  }

  if (req.user?.role === 'employee' && plan.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const user = db.data.users.find((u) => u.id === plan.userId);
  const comments = db.data.comments.filter((c) => c.vacationPlanId === plan.id);
  const commentsWithUsers = comments.map((comment) => {
    const commentUser = db.data.users.find((u) => u.id === comment.userId);
    return {
      ...comment,
      user: commentUser ? { id: commentUser.id, name: commentUser.name } : null,
    };
  });

  res.json({
    ...plan,
    user: user ? { id: user.id, name: user.name, email: user.email } : null,
    comments: commentsWithUsers,
  });
});

// Create vacation plan
router.post(
  '/vacations',
  authenticate,
  [
    body('type').isIn(['Annual', 'Sick', 'Other']),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('notes').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const { type, startDate, endDate, notes } = req.body;

    const plan: VacationPlan = {
      id: generateId(),
      userId: req.user!.id,
      type,
      startDate,
      endDate,
      notes: notes || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.vacationPlans.push(plan);
    await db.write();

    res.status(201).json(plan);
  }
);

// Update vacation plan status (admin, manager)
router.put(
  '/vacations/:id/status',
  authenticate,
  requireRole('manager'),
  [body('status').isIn(['pending', 'approved', 'rejected'])],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const planIndex = db.data.vacationPlans.findIndex((p) => p.id === req.params.id);
    if (planIndex === -1) {
      return res.status(404).json({ error: 'Vacation plan not found' });
    }

    db.data.vacationPlans[planIndex].status = req.body.status;
    db.data.vacationPlans[planIndex].updatedAt = new Date().toISOString();
    await db.write();

    res.json(db.data.vacationPlans[planIndex]);
  }
);

// Add comment to vacation plan
router.post(
  '/vacations/:id/comments',
  authenticate,
  [body('content').trim().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const plan = db.data.vacationPlans.find((p) => p.id === req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Vacation plan not found' });
    }

    const comment = {
      id: generateId(),
      vacationPlanId: req.params.id,
      userId: req.user!.id,
      content: req.body.content,
      createdAt: new Date().toISOString(),
    };

    db.data.comments.push(comment);
    await db.write();

    const user = db.data.users.find((u) => u.id === req.user!.id);
    res.status(201).json({
      ...comment,
      user: user ? { id: user.id, name: user.name } : null,
    });
  }
);

// ============ Training Plans ============

// Get all training plans
router.get('/trainings', authenticate, async (req: AuthRequest, res: Response) => {
  await db.read();
  let plans = [...db.data.trainingPlans];

  if (req.user?.role === 'employee') {
    plans = plans.filter((p) => p.userId === req.user!.id);
  }

  const plansWithUsers = plans.map((plan) => {
    const user = db.data.users.find((u) => u.id === plan.userId);
    return {
      ...plan,
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
    };
  });

  res.json(plansWithUsers);
});

// Get single training plan
router.get('/trainings/:id', authenticate, async (req: AuthRequest, res: Response) => {
  await db.read();
  const plan = db.data.trainingPlans.find((p) => p.id === req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Training plan not found' });
  }

  if (req.user?.role === 'employee' && plan.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const user = db.data.users.find((u) => u.id === plan.userId);
  const comments = db.data.comments.filter((c) => c.trainingPlanId === plan.id);
  const commentsWithUsers = comments.map((comment) => {
    const commentUser = db.data.users.find((u) => u.id === comment.userId);
    return {
      ...comment,
      user: commentUser ? { id: commentUser.id, name: commentUser.name } : null,
    };
  });

  res.json({
    ...plan,
    user: user ? { id: user.id, name: user.name, email: user.email } : null,
    comments: commentsWithUsers,
  });
});

// Create training plan
router.post(
  '/trainings',
  authenticate,
  [
    body('courseName').trim().notEmpty(),
    body('platform').trim().notEmpty(),
    body('duration').optional().trim(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('notes').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const { courseName, platform, duration, startDate, endDate, notes } = req.body;

    const plan: TrainingPlan = {
      id: generateId(),
      userId: req.user!.id,
      courseName,
      platform,
      duration,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      notes: notes || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.trainingPlans.push(plan);
    await db.write();

    res.status(201).json(plan);
  }
);

// Update training plan status (admin, manager)
router.put(
  '/trainings/:id/status',
  authenticate,
  requireRole('manager'),
  [body('status').isIn(['pending', 'approved', 'rejected'])],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const planIndex = db.data.trainingPlans.findIndex((p) => p.id === req.params.id);
    if (planIndex === -1) {
      return res.status(404).json({ error: 'Training plan not found' });
    }

    db.data.trainingPlans[planIndex].status = req.body.status;
    db.data.trainingPlans[planIndex].updatedAt = new Date().toISOString();
    await db.write();

    res.json(db.data.trainingPlans[planIndex]);
  }
);

// Add comment to training plan
router.post(
  '/trainings/:id/comments',
  authenticate,
  [body('content').trim().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const plan = db.data.trainingPlans.find((p) => p.id === req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Training plan not found' });
    }

    const comment = {
      id: generateId(),
      trainingPlanId: req.params.id,
      userId: req.user!.id,
      content: req.body.content,
      createdAt: new Date().toISOString(),
    };

    db.data.comments.push(comment);
    await db.write();

    const user = db.data.users.find((u) => u.id === req.user!.id);
    res.status(201).json({
      ...comment,
      user: user ? { id: user.id, name: user.name } : null,
    });
  }
);

export default router;

