import express, { Response } from 'express';
import { db } from '../models/database';
import { authenticate, requireRole } from '../middleware/auth';
import { generateId } from '../utils/uuid';
import { Proposal, AuthRequest } from '../types';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all proposals (Manager and Employees can view)
router.get('/', authenticate, async (req, res) => {
  await db.read();
  const proposals = db.data.proposals.map((proposal) => {
    const user = db.data.users.find((u) => u.id === proposal.createdBy);
    return {
      ...proposal,
      createdByName: user?.name || 'Unknown',
    };
  });
  res.json(proposals);
});

// Get single proposal
router.get('/:id', authenticate, async (req, res) => {
  await db.read();
  const proposal = db.data.proposals.find((p) => p.id === req.params.id);
  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }
  const user = db.data.users.find((u) => u.id === proposal.createdBy);
  res.json({
    ...proposal,
    createdByName: user?.name || 'Unknown',
  });
});

// Custom validator for optional URL (allows empty string)
const optionalUrl = (value: string) => {
  if (!value || value.trim() === '') return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

// Create proposal (Manager only)
router.post(
  '/',
  authenticate,
  requireRole('manager'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('type').isIn(['course', 'article', 'instruction', 'other']).withMessage('Invalid type'),
    body('imageUrl').optional().custom(optionalUrl).withMessage('Image URL must be a valid URL'),
    body('link').optional().custom(optionalUrl).withMessage('Link must be a valid URL'),
    body('isHighlighted').optional().isBoolean(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const { title, description, type, imageUrl, link, isHighlighted } = req.body;

    const proposal: Proposal = {
      id: generateId(),
      title,
      description,
      type,
      imageUrl: imageUrl && imageUrl.trim() !== '' ? imageUrl : undefined,
      link: link && link.trim() !== '' ? link : undefined,
      isHighlighted: isHighlighted || false,
      createdBy: req.user!.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.proposals.push(proposal);
    await db.write();
    res.status(201).json(proposal);
  }
);

// Update proposal (Manager only)
router.put(
  '/:id',
  authenticate,
  requireRole('manager'),
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('type').optional().isIn(['course', 'article', 'instruction', 'other']),
    body('imageUrl').optional().custom(optionalUrl),
    body('link').optional().custom(optionalUrl),
    body('isHighlighted').optional().isBoolean(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await db.read();
    const proposal = db.data.proposals.find((p) => p.id === req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const { title, description, type, imageUrl, link, isHighlighted } = req.body;

    if (title) proposal.title = title;
    if (description) proposal.description = description;
    if (type) proposal.type = type;
    if (imageUrl !== undefined) proposal.imageUrl = imageUrl || undefined;
    if (link !== undefined) proposal.link = link || undefined;
    if (isHighlighted !== undefined) proposal.isHighlighted = isHighlighted;
    proposal.updatedAt = new Date().toISOString();

    await db.write();
    res.json(proposal);
  }
);

// Delete proposal (Manager only)
router.delete('/:id', authenticate, requireRole('manager'), async (req, res) => {
  await db.read();
  const index = db.data.proposals.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  db.data.proposals.splice(index, 1);
  await db.write();
  res.json({ message: 'Proposal deleted successfully' });
});

export default router;

