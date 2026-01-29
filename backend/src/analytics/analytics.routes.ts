// Analytics Routes - Read-Only API Endpoints
// This module provides decision support ONLY - no data modification

import { Router, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { authenticate } from '../middleware/auth';
import {
  getAllGoalsRisk,
  getAnalyticsDashboard,
  getUserWorkloadAnalysis,
  analyzeGoalRisk
} from './analytics.service';
import { db } from '../models/database';

const router = Router();

// Check if analytics is enabled
const isAnalyticsEnabled = (): boolean => {
  // Default to true if not set
  return process.env.ENABLE_SMART_ANALYTICS !== 'false';
};

// Middleware to check feature flag
const analyticsGuard = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!isAnalyticsEnabled()) {
    res.status(403).json({
      error: 'Smart Analytics module is disabled',
      message: 'Set ENABLE_SMART_ANALYTICS=true to enable this feature'
    });
    return;
  }
  next();
};

// ============================================
// GET /api/analytics/status
// Check if analytics module is enabled
// ============================================
router.get('/status', (req, res) => {
  res.json({
    enabled: isAnalyticsEnabled(),
    version: '1.0.0',
    features: ['risk-analysis', 'predictions', 'workload-analysis']
  });
});

// ============================================
// GET /api/analytics/dashboard
// Get comprehensive analytics dashboard data
// ============================================
router.get('/dashboard', authenticate, analyticsGuard, async (req: AuthRequest, res: Response) => {
  try {
    const dashboard = await getAnalyticsDashboard();
    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching analytics dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch analytics dashboard' });
  }
});

// ============================================
// GET /api/analytics/goals-risk
// Get risk analysis for all goals
// ============================================
router.get('/goals-risk', authenticate, analyticsGuard, async (req: AuthRequest, res: Response) => {
  try {
    const risks = await getAllGoalsRisk();
    res.json(risks);
  } catch (error) {
    console.error('Error fetching goals risk:', error);
    res.status(500).json({ error: 'Failed to fetch goals risk analysis' });
  }
});

// ============================================
// GET /api/analytics/goals-risk/:goalId
// Get risk analysis for a specific goal
// ============================================
router.get('/goals-risk/:goalId', authenticate, analyticsGuard, async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;
    const data = await db.read();

    // Find the goal (check both annual and MBO)
    const annualGoal = data.annualGoals.find(g => g.id === goalId);
    const mboGoal = data.mboGoals.find(g => g.id === goalId);

    if (!annualGoal && !mboGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const goal = annualGoal || mboGoal!;
    const goalType = annualGoal ? 'annual' : 'mbo';
    
    const riskAnalysis = await analyzeGoalRisk(goal, goalType);
    res.json(riskAnalysis);
  } catch (error) {
    console.error('Error fetching goal risk:', error);
    res.status(500).json({ error: 'Failed to fetch goal risk analysis' });
  }
});

// ============================================
// GET /api/analytics/workload
// Get workload analysis for all users
// ============================================
router.get('/workload', authenticate, analyticsGuard, async (req: AuthRequest, res: Response) => {
  try {
    // Only managers can see all users' workload
    if (req.user?.role !== 'manager') {
      return res.status(403).json({ error: 'Only managers can view workload analysis' });
    }

    const workloadAnalysis = await getUserWorkloadAnalysis();
    res.json(workloadAnalysis);
  } catch (error) {
    console.error('Error fetching workload analysis:', error);
    res.status(500).json({ error: 'Failed to fetch workload analysis' });
  }
});

// ============================================
// GET /api/analytics/high-risk
// Get only high-risk goals for quick overview
// ============================================
router.get('/high-risk', authenticate, analyticsGuard, async (req: AuthRequest, res: Response) => {
  try {
    const allRisks = await getAllGoalsRisk();
    const highRisks = allRisks.filter(r => r.riskLevel === 'HIGH');
    
    res.json({
      count: highRisks.length,
      goals: highRisks
    });
  } catch (error) {
    console.error('Error fetching high-risk goals:', error);
    res.status(500).json({ error: 'Failed to fetch high-risk goals' });
  }
});

// ============================================
// GET /api/analytics/predictions
// Get completion predictions for all goals
// ============================================
router.get('/predictions', authenticate, analyticsGuard, async (req: AuthRequest, res: Response) => {
  try {
    const allRisks = await getAllGoalsRisk();
    
    const predictions = allRisks.map(r => ({
      goalId: r.goalId,
      goalTitle: r.goalTitle,
      goalType: r.goalType,
      completionProbability: r.prediction.completionProbability,
      expectedCompletionDate: r.prediction.expectedCompletionDate,
      isOnTrack: r.prediction.isOnTrack,
      currentProgress: Math.round(r.factors.progressRatio * 100),
      daysRemaining: r.timeline.daysRemaining
    }));

    res.json(predictions);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

export default router;

