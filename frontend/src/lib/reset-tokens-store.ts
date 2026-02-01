/**
 * Password reset tokens - للاسترجاع عبر البريد الإلكتروني
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const RESET_FILE = path.join(DATA_DIR, 'reset-tokens.json');

export interface ResetToken {
  token: string;
  userId: string;
  email: string;
  expiresAt: string;
}

interface ResetData {
  tokens: ResetToken[];
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function load(): ResetData {
  ensureDir();
  try {
    const raw = fs.readFileSync(RESET_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { tokens: [] };
  }
}

function save(data: ResetData) {
  ensureDir();
  fs.writeFileSync(RESET_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function createResetToken(userId: string, email: string): ResetToken {
  const data = load();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
  const resetToken: ResetToken = { token, userId, email, expiresAt };
  data.tokens.push(resetToken);
  save(data);
  return resetToken;
}

export function getResetToken(token: string): ResetToken | null {
  const data = load();
  const t = data.tokens.find((x) => x.token === token);
  if (!t) return null;
  if (new Date(t.expiresAt) < new Date()) return null;
  return t;
}

export function deleteResetToken(token: string): boolean {
  const data = load();
  const idx = data.tokens.findIndex((x) => x.token === token);
  if (idx === -1) return false;
  data.tokens.splice(idx, 1);
  save(data);
  return true;
}
