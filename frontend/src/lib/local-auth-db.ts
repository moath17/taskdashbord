/**
 * قاعدة بيانات محلية للتطوير - تعمل عند عدم إعداد Supabase
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const AUTH_FILE = path.join(DATA_DIR, 'local-auth.json');

interface Org {
  id: string;
  name: string;
}

interface User {
  id: string;
  organizationId: string;
  email: string;
  password: string;
  name: string;
  role: string;
  ownerAlsoAdmin?: boolean;
}

interface AuthData {
  organizations: Org[];
  users: User[];
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadData(): AuthData {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(AUTH_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { organizations: [], users: [] };
  }
}

function saveData(data: AuthData) {
  ensureDataDir();
  fs.writeFileSync(AUTH_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId() {
  return crypto.randomUUID();
}

export const localAuthDb = {
  organizations: {
    async create(data: { name: string }) {
      const auth = loadData();
      const org: Org = {
        id: generateId(),
        name: data.name,
      };
      auth.organizations.push(org);
      saveData(auth);
      return org;
    },
    async getById(id: string) {
      const auth = loadData();
      return auth.organizations.find((o) => o.id === id) || null;
    },
  },
  users: {
    async create(data: {
      organizationId: string;
      email: string;
      password: string;
      name: string;
      role: string;
    }) {
      const auth = loadData();
      const user: User = {
        id: generateId(),
        organizationId: data.organizationId,
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
      };
      auth.users.push(user);
      saveData(auth);
      return user;
    },
    async getByEmail(email: string) {
      const auth = loadData();
      return auth.users.filter((u) => u.email.toLowerCase() === email.toLowerCase());
    },
    async getById(id: string) {
      const auth = loadData();
      return auth.users.find((u) => u.id === id) || null;
    },
    async getByOrganization(organizationId: string) {
      const auth = loadData();
      return auth.users.filter((u) => u.organizationId === organizationId);
    },
    async update(id: string, data: Partial<{ email: string; password: string; name: string; role: string; ownerAlsoAdmin: boolean }>) {
      const auth = loadData();
      const idx = auth.users.findIndex((u) => u.id === id);
      if (idx === -1) return null;
      auth.users[idx] = { ...auth.users[idx], ...data };
      saveData(auth);
      return auth.users[idx];
    },
    async delete(id: string) {
      const auth = loadData();
      auth.users = auth.users.filter((u) => u.id !== id);
      saveData(auth);
    },
  },
};

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && url !== '' && key !== '');
}
