import fs from 'fs/promises';
import path from 'path';
import { Database } from '../types';

// For CommonJS (ts-node-dev)
const dbPath = path.join(__dirname, '../data/database.json');
const defaultData: Database = {
  users: [],
  annualGoals: [],
  mboGoals: [],
  kpis: [],
  tasks: [],
  comments: [],
  vacationPlans: [],
  trainingPlans: [],
  calendarEvents: [],
  proposals: [],
  weeklyUpdates: [],
};

let dbData: Database = defaultData;

async function loadDatabase(): Promise<Database> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    dbData = JSON.parse(data);
    
    // Ensure all required arrays exist (for backwards compatibility)
    if (!dbData.annualGoals) dbData.annualGoals = [];
    if (!dbData.mboGoals) dbData.mboGoals = [];
    if (!dbData.kpis) dbData.kpis = [];
    if (!dbData.calendarEvents) dbData.calendarEvents = [];
    if (!dbData.proposals) dbData.proposals = [];
    if (!dbData.weeklyUpdates) dbData.weeklyUpdates = [];
    
  } catch (error) {
    dbData = defaultData;
    await saveDatabase();
  }
  return dbData;
}

async function saveDatabase(): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(dbData, null, 2));
}

export const db = {
  async read(): Promise<Database> {
    dbData = await loadDatabase();
    return dbData;
  },
  async write(): Promise<void> {
    await saveDatabase();
  },
  get data(): Database {
    return dbData;
  },
  set data(value: Database) {
    dbData = value;
  },
};

export async function initDatabase() {
  await db.read();
}

