/**
 * قاعدة بيانات محلية كاملة - للتطوير والتشغيل المحلي بدون Supabase
 * Full local database for on-premises deployment without Supabase
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'local-db.json');

interface DbData {
  tasks: any[];
  annualGoals: any[];
  mboGoals: any[];
  kpis: any[];
  vacationPlans: any[];
  trainingPlans: any[];
  comments: any[];
  calendarEvents: any[];
  proposals: any[];
  weeklyUpdates: any[];
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function load(): DbData {
  ensureDir();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {
      tasks: [],
      annualGoals: [],
      mboGoals: [],
      kpis: [],
      vacationPlans: [],
      trainingPlans: [],
      comments: [],
      calendarEvents: [],
      proposals: [],
      weeklyUpdates: [],
    };
  }
}

function save(data: DbData) {
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

export const localDb = {
  // Tasks
  tasks: {
    async create(data: any) {
      const db = load();
      const task = { id: generateId(), ...data, createdAt: now(), updatedAt: now() };
      db.tasks.push(task);
      save(db);
      return task;
    },
    async getByOrganization(orgId: string) {
      return load().tasks.filter(t => t.organizationId === orgId);
    },
    async getById(id: string) {
      return load().tasks.find(t => t.id === id) || null;
    },
    async update(id: string, data: any) {
      const db = load();
      const idx = db.tasks.findIndex(t => t.id === id);
      if (idx === -1) return null;
      db.tasks[idx] = { ...db.tasks[idx], ...data, updatedAt: now() };
      save(db);
      return db.tasks[idx];
    },
    async delete(id: string) {
      const db = load();
      db.tasks = db.tasks.filter(t => t.id !== id);
      save(db);
    },
  },

  // Annual Goals
  annualGoals: {
    async create(data: any) {
      const db = load();
      const goal = { id: generateId(), ...data, createdAt: now(), updatedAt: now() };
      db.annualGoals.push(goal);
      save(db);
      return goal;
    },
    async getByOrganization(orgId: string) {
      return load().annualGoals.filter(g => g.organizationId === orgId);
    },
    async getById(id: string) {
      return load().annualGoals.find(g => g.id === id) || null;
    },
    async update(id: string, data: any) {
      const db = load();
      const idx = db.annualGoals.findIndex(g => g.id === id);
      if (idx === -1) return null;
      db.annualGoals[idx] = { ...db.annualGoals[idx], ...data, updatedAt: now() };
      save(db);
      return db.annualGoals[idx];
    },
    async delete(id: string) {
      const db = load();
      db.annualGoals = db.annualGoals.filter(g => g.id !== id);
      save(db);
    },
  },

  // MBO Goals
  mboGoals: {
    async create(data: any) {
      const db = load();
      const goal = { id: generateId(), ...data, createdAt: now(), updatedAt: now() };
      db.mboGoals.push(goal);
      save(db);
      return goal;
    },
    async getByOrganization(orgId: string) {
      return load().mboGoals.filter(g => g.organizationId === orgId);
    },
    async getById(id: string) {
      return load().mboGoals.find(g => g.id === id) || null;
    },
    async getByAnnualGoal(annualGoalId: string) {
      return load().mboGoals.filter(g => g.annualGoalId === annualGoalId);
    },
    async update(id: string, data: any) {
      const db = load();
      const idx = db.mboGoals.findIndex(g => g.id === id);
      if (idx === -1) return null;
      db.mboGoals[idx] = { ...db.mboGoals[idx], ...data, updatedAt: now() };
      save(db);
      return db.mboGoals[idx];
    },
    async delete(id: string) {
      const db = load();
      db.mboGoals = db.mboGoals.filter(g => g.id !== id);
      save(db);
    },
  },

  // KPIs
  kpis: {
    async create(data: any) {
      const db = load();
      const kpi = { id: generateId(), ...data, createdAt: now(), updatedAt: now() };
      db.kpis.push(kpi);
      save(db);
      return kpi;
    },
    async getByOrganization(orgId: string) {
      return load().kpis.filter(k => k.organizationId === orgId);
    },
    async getById(id: string) {
      return load().kpis.find(k => k.id === id) || null;
    },
    async update(id: string, data: any) {
      const db = load();
      const idx = db.kpis.findIndex(k => k.id === id);
      if (idx === -1) return null;
      db.kpis[idx] = { ...db.kpis[idx], ...data, updatedAt: now() };
      save(db);
      return db.kpis[idx];
    },
    async delete(id: string) {
      const db = load();
      db.kpis = db.kpis.filter(k => k.id !== id);
      save(db);
    },
  },

  // Vacation Plans
  vacationPlans: {
    async create(data: any) {
      const db = load();
      const plan = { id: generateId(), ...data, createdAt: now(), updatedAt: now() };
      db.vacationPlans.push(plan);
      save(db);
      return plan;
    },
    async getByOrganization(orgId: string) {
      return load().vacationPlans.filter(p => p.organizationId === orgId);
    },
    async getById(id: string) {
      return load().vacationPlans.find(p => p.id === id) || null;
    },
    async update(id: string, data: any) {
      const db = load();
      const idx = db.vacationPlans.findIndex(p => p.id === id);
      if (idx === -1) return null;
      db.vacationPlans[idx] = { ...db.vacationPlans[idx], ...data, updatedAt: now() };
      save(db);
      return db.vacationPlans[idx];
    },
    async delete(id: string) {
      const db = load();
      db.vacationPlans = db.vacationPlans.filter(p => p.id !== id);
      save(db);
    },
  },

  // Training Plans
  trainingPlans: {
    async create(data: any) {
      const db = load();
      const plan = { id: generateId(), ...data, createdAt: now(), updatedAt: now() };
      db.trainingPlans.push(plan);
      save(db);
      return plan;
    },
    async getByOrganization(orgId: string) {
      return load().trainingPlans.filter(p => p.organizationId === orgId);
    },
    async getById(id: string) {
      return load().trainingPlans.find(p => p.id === id) || null;
    },
    async update(id: string, data: any) {
      const db = load();
      const idx = db.trainingPlans.findIndex(p => p.id === id);
      if (idx === -1) return null;
      db.trainingPlans[idx] = { ...db.trainingPlans[idx], ...data, updatedAt: now() };
      save(db);
      return db.trainingPlans[idx];
    },
    async delete(id: string) {
      const db = load();
      db.trainingPlans = db.trainingPlans.filter(p => p.id !== id);
      save(db);
    },
  },

  // Comments
  comments: {
    async create(data: any) {
      const db = load();
      const comment = { id: generateId(), ...data, createdAt: now() };
      db.comments.push(comment);
      save(db);
      return comment;
    },
    async getByTask(taskId: string) {
      return load().comments.filter(c => c.taskId === taskId);
    },
    async getByVacationPlan(planId: string) {
      return load().comments.filter(c => c.vacationPlanId === planId);
    },
    async getByTrainingPlan(planId: string) {
      return load().comments.filter(c => c.trainingPlanId === planId);
    },
    async deleteByTask(taskId: string) {
      const db = load();
      db.comments = db.comments.filter(c => c.taskId !== taskId);
      save(db);
    },
  },

  // Calendar Events
  calendarEvents: {
    async create(data: any) {
      const db = load();
      const event = { id: generateId(), ...data, createdAt: now(), updatedAt: now() };
      db.calendarEvents.push(event);
      save(db);
      return event;
    },
    async getByOrganization(orgId: string) {
      return load().calendarEvents.filter(e => e.organizationId === orgId);
    },
    async getById(id: string) {
      return load().calendarEvents.find(e => e.id === id) || null;
    },
    async update(id: string, data: any) {
      const db = load();
      const idx = db.calendarEvents.findIndex(e => e.id === id);
      if (idx === -1) return null;
      db.calendarEvents[idx] = { ...db.calendarEvents[idx], ...data, updatedAt: now() };
      save(db);
      return db.calendarEvents[idx];
    },
    async delete(id: string) {
      const db = load();
      db.calendarEvents = db.calendarEvents.filter(e => e.id !== id);
      save(db);
    },
  },

  // Proposals
  proposals: {
    async create(data: any) {
      const db = load();
      const proposal = { id: generateId(), ...data, createdAt: now(), updatedAt: now() };
      db.proposals.push(proposal);
      save(db);
      return proposal;
    },
    async getByOrganization(orgId: string) {
      return load().proposals.filter(p => p.organizationId === orgId);
    },
    async getById(id: string) {
      return load().proposals.find(p => p.id === id) || null;
    },
    async update(id: string, data: any) {
      const db = load();
      const idx = db.proposals.findIndex(p => p.id === id);
      if (idx === -1) return null;
      db.proposals[idx] = { ...db.proposals[idx], ...data, updatedAt: now() };
      save(db);
      return db.proposals[idx];
    },
    async delete(id: string) {
      const db = load();
      db.proposals = db.proposals.filter(p => p.id !== id);
      save(db);
    },
  },

  // Weekly Updates
  weeklyUpdates: {
    async create(data: any) {
      const db = load();
      const update = { id: generateId(), ...data, createdAt: now(), updatedAt: now() };
      db.weeklyUpdates.push(update);
      save(db);
      return update;
    },
    async getByOrganization(orgId: string) {
      return load().weeklyUpdates.filter(u => u.organizationId === orgId).sort((a, b) => 
        new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime()
      );
    },
    async getById(id: string) {
      return load().weeklyUpdates.find(u => u.id === id) || null;
    },
    async update(id: string, data: any) {
      const db = load();
      const idx = db.weeklyUpdates.findIndex(u => u.id === id);
      if (idx === -1) return null;
      db.weeklyUpdates[idx] = { ...db.weeklyUpdates[idx], ...data, updatedAt: now() };
      save(db);
      return db.weeklyUpdates[idx];
    },
    async delete(id: string) {
      const db = load();
      db.weeklyUpdates = db.weeklyUpdates.filter(u => u.id !== id);
      save(db);
    },
  },

  // Users (proxy to local-auth-db for consistency)
  users: {
    async getByOrganization(orgId: string) {
      const { localAuthDb } = await import('./local-auth-db');
      return localAuthDb.users.getByOrganization(orgId);
    },
    async getById(id: string) {
      const { localAuthDb } = await import('./local-auth-db');
      return localAuthDb.users.getById(id);
    },
    async update(id: string, data: Partial<{ email: string; password: string; name: string; role: string }>) {
      const { localAuthDb } = await import('./local-auth-db');
      return localAuthDb.users.update(id, data);
    },
    async delete(id: string) {
      const { localAuthDb } = await import('./local-auth-db');
      return localAuthDb.users.delete(id);
    },
  },
};

export default localDb;
