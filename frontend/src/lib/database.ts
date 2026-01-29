import { Database } from './types';

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

// In-memory database for serverless environment
let dbData: Database = { ...defaultData };

// Initialize with some data if empty (for demo purposes)
function ensureInitialized() {
  // Data persists in memory during the same serverless instance
  // but resets when the instance is recycled
  return dbData;
}

export const db = {
  async read(): Promise<Database> {
    return ensureInitialized();
  },
  async write(): Promise<void> {
    // In serverless, data is kept in memory
    // For production, you'd want to use a real database
  },
  get data(): Database {
    return ensureInitialized();
  },
  set data(value: Database) {
    dbData = value;
  },
};

export async function initDatabase() {
  await db.read();
}
