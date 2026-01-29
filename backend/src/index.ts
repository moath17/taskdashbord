import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './models/database';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import planRoutes from './routes/plans';
import dashboardRoutes from './routes/dashboard';
import userRoutes from './routes/users';
import calendarRoutes from './routes/calendar';
import proposalsRoutes from './routes/proposals';
import weeklyUpdatesRoutes from './routes/weekly-updates';
import goalsRoutes from './routes/goals';
import kpisRoutes from './routes/kpis';
import analyticsRoutes from './analytics/analytics.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3100;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase().catch(console.error);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/proposals', proposalsRoutes);
app.use('/api/weekly-updates', weeklyUpdatesRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/kpis', kpisRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Task Management API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

