import express, { Response } from 'express';
import { db } from '../models/database';
import { generateId } from '../utils/uuid';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { Task, TaskStatus, TaskPriority } from '../types';
import { body, validationResult, query } from 'express-validator';

const router = express.Router();

// Get all tasks (with filters)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  await db.read();
  let tasks = [...db.data.tasks];

  // Apply role-based filtering
  if (req.user?.role === 'employee') {
    tasks = tasks.filter((t) => t.assignedTo === req.user!.id);
  }

  // Apply filters
  const { assignedTo, status, priority, search, annualGoalId, mboGoalId } = req.query;
  if (assignedTo) {
    tasks = tasks.filter((t) => t.assignedTo === assignedTo);
  }
  if (status) {
    tasks = tasks.filter((t) => t.status === status);
  }
  if (priority) {
    tasks = tasks.filter((t) => t.priority === priority);
  }
  if (annualGoalId) {
    tasks = tasks.filter((t) => t.annualGoalId === annualGoalId);
  }
  if (mboGoalId) {
    tasks = tasks.filter((t) => t.mboGoalId === mboGoalId);
  }
  if (search) {
    const searchLower = (search as string).toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower)
    );
  }

  // Populate user and goal info
  const tasksWithInfo = tasks.map((task) => {
    const user = db.data.users.find((u) => u.id === task.assignedTo);
    const annualGoal = db.data.annualGoals.find((g) => g.id === task.annualGoalId);
    const mboGoal = db.data.mboGoals.find((g) => g.id === task.mboGoalId);
    return {
      ...task,
      assignedUser: user ? { id: user.id, name: user.name, email: user.email } : null,
      annualGoal: annualGoal ? { id: annualGoal.id, title: annualGoal.title } : null,
      mboGoal: mboGoal ? { id: mboGoal.id, title: mboGoal.title } : null,
    };
  });

  res.json(tasksWithInfo);
});

// Get single task
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  await db.read();
  const task = db.data.tasks.find((t) => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Check permissions
  if (req.user?.role === 'employee' && task.assignedTo !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const user = db.data.users.find((u) => u.id === task.assignedTo);
  const comments = db.data.comments.filter((c) => c.taskId === task.id);
  const commentsWithUsers = comments.map((comment) => {
    const commentUser = db.data.users.find((u) => u.id === comment.userId);
    return {
      ...comment,
      user: commentUser ? { id: commentUser.id, name: commentUser.name } : null,
    };
  });

  res.json({
    ...task,
    assignedUser: user ? { id: user.id, name: user.name, email: user.email } : null,
    comments: commentsWithUsers,
  });
});

// Create task (Manager only)
router.post(
  '/',
  authenticate,
  requireRole('manager'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('assignedTo').notEmpty().withMessage('Assigned employee is required'),
    body('annualGoalId').notEmpty().withMessage('Annual Goal is required'),
    body('mboGoalId').notEmpty().withMessage('MBO Goal is required'),
    body('startDate').isISO8601().withMessage('Start date is required'),
    body('dueDate').isISO8601().withMessage('Due date is required'),
    body('priority').isIn(['High', 'Medium', 'Low']).withMessage('Priority is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const { title, description, assignedTo, annualGoalId, mboGoalId, startDate, dueDate, priority } = req.body;

    // Verify assigned user exists
    const assignedUser = db.data.users.find((u) => u.id === assignedTo);
    if (!assignedUser) {
      return res.status(400).json({ error: 'Assigned user not found' });
    }

    // Verify annual goal exists
    const annualGoal = db.data.annualGoals.find((g) => g.id === annualGoalId);
    if (!annualGoal) {
      return res.status(400).json({ error: 'Annual Goal not found' });
    }

    // Verify MBO goal exists and belongs to the annual goal
    const mboGoal = db.data.mboGoals.find((g) => g.id === mboGoalId);
    if (!mboGoal) {
      return res.status(400).json({ error: 'MBO Goal not found' });
    }
    if (mboGoal.annualGoalId !== annualGoalId) {
      return res.status(400).json({ error: 'MBO Goal must belong to the selected Annual Goal' });
    }

    const task: Task = {
      id: generateId(),
      title,
      description,
      assignedTo,
      annualGoalId,
      mboGoalId,
      startDate,
      dueDate,
      status: 'New',
      priority: priority as TaskPriority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user!.id,
    };

    db.data.tasks.push(task);
    await db.write();

    res.status(201).json(task);
  }
);

// Update task
router.put(
  '/:id',
  authenticate,
  [body('status').optional().isIn(['New', 'In Progress', 'Completed', 'Delayed'])],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const taskIndex = db.data.tasks.findIndex((t) => t.id === req.params.id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = db.data.tasks[taskIndex];

    // Check permissions - employees can only update their own tasks
    if (req.user?.role === 'employee' && task.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Update fields
    const { title, description, assignedTo, startDate, dueDate, status, priority } = req.body;
    if (title) task.title = title;
    if (description) task.description = description;
    if (assignedTo) {
      const assignedUser = db.data.users.find((u) => u.id === assignedTo);
      if (!assignedUser) {
        return res.status(400).json({ error: 'Assigned user not found' });
      }
      task.assignedTo = assignedTo;
    }
    if (startDate) task.startDate = startDate;
    if (dueDate) task.dueDate = dueDate;
    if (status) task.status = status as TaskStatus;
    if (priority) task.priority = priority as TaskPriority;
    task.updatedAt = new Date().toISOString();

    db.data.tasks[taskIndex] = task;
    await db.write();

    res.json(task);
  }
);

// Delete task (manager only)
router.delete('/:id', authenticate, requireRole('manager'), async (req: AuthRequest, res: Response) => {
  await db.read();
  const taskIndex = db.data.tasks.findIndex((t) => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Delete related comments
  db.data.comments = db.data.comments.filter((c) => c.taskId !== req.params.id);

  db.data.tasks.splice(taskIndex, 1);
  await db.write();

  res.json({ message: 'Task deleted' });
});

// Add comment to task
router.post(
  '/:id/comments',
  authenticate,
  [body('content').trim().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const task = db.data.tasks.find((t) => t.id === req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions
    if (req.user?.role === 'employee' && task.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const comment = {
      id: generateId(),
      taskId: req.params.id,
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

