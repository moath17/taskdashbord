import express, { Response } from 'express';
import { db } from '../models/database';
import { authenticate, requireRole } from '../middleware/auth';
import { AuthRequest } from '../types';
import { generateId } from '../utils/uuid';
import { hashPassword } from '../utils/auth';
import { User } from '../types';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Check if manager exists (Public endpoint for registration)
router.get('/check-manager', async (req, res) => {
  await db.read();
  const hasManager = db.data.users.some((user) => user.role === 'manager');
  res.json({ managerExists: hasManager });
});

// Get all users (Manager only)
router.get('/', authenticate, requireRole('manager'), async (req, res) => {
  await db.read();
  const users = db.data.users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  }));
  res.json(users);
});

// Get single user
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  await db.read();
  const user = db.data.users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Employees can only view their own profile
  if (req.user?.role === 'employee' && req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  });
});

// Create user (Manager only)
router.post(
  '/',
  authenticate,
  requireRole('manager'),
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role').isIn(['manager', 'employee']).withMessage('Role must be manager or employee'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = db.data.users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // If creating a manager, check if one already exists
    if (role === 'manager') {
      const existingManager = db.data.users.find((u) => u.role === 'manager');
      if (existingManager) {
        return res.status(400).json({ error: 'A manager already exists. Only one manager is allowed.' });
      }
    }

    const hashedPassword = await hashPassword(password);
    const user: User = {
      id: generateId(),
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date().toISOString(),
    };

    db.data.users.push(user);
    await db.write();

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    });
  }
);

// Update user (Manager only, but employees can update their own profile - except role)
router.put(
  '/:id',
  authenticate,
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('name').optional().trim().notEmpty(),
    body('role').optional().isIn(['manager', 'employee']),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const user = db.data.users.find((u) => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Employees can only update their own profile (without role)
    if (req.user?.role === 'employee' && req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Only manager can change roles
    if (req.body.role && req.user?.role !== 'manager') {
      return res.status(403).json({ error: 'Only managers can change user roles' });
    }

    // If changing to manager role, check if one already exists
    if (req.body.role === 'manager' && user.role !== 'manager') {
      const existingManager = db.data.users.find((u) => u.role === 'manager' && u.id !== user.id);
      if (existingManager) {
        return res.status(400).json({ error: 'A manager already exists. Only one manager is allowed.' });
      }
    }

    const { email, password, name, role } = req.body;

    if (email) {
      const existingUser = db.data.users.find((u) => u.email === email && u.id !== user.id);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      user.email = email;
    }
    if (password) {
      user.password = await hashPassword(password);
    }
    if (name) user.name = name;
    if (role && req.user?.role === 'manager') user.role = role;

    await db.write();

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    });
  }
);

// Delete user (Manager only, cannot delete self)
router.delete('/:id', authenticate, requireRole('manager'), async (req: AuthRequest, res) => {
  await db.read();
  const user = db.data.users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Cannot delete self
  if (req.user?.id === req.params.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  const index = db.data.users.findIndex((u) => u.id === req.params.id);
  db.data.users.splice(index, 1);
  await db.write();

  res.json({ message: 'User deleted successfully' });
});

export default router;
