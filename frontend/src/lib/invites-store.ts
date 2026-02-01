/**
 * Invitation tokens for first-time password setup
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const INVITES_FILE = path.join(DATA_DIR, 'invites.json');

export interface Invitation {
  token: string;
  userId: string;
  email: string;
  name: string;
  organizationId: string;
  expiresAt: string;
}

interface InvitesData {
  invitations: Invitation[];
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function load(): InvitesData {
  ensureDir();
  try {
    const raw = fs.readFileSync(INVITES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { invitations: [] };
  }
}

function save(data: InvitesData) {
  ensureDir();
  fs.writeFileSync(INVITES_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function createInvitation(params: Omit<Invitation, 'expiresAt'>): Invitation {
  const data = load();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
  const invitation: Invitation = { ...params, expiresAt };
  data.invitations.push(invitation);
  save(data);
  return invitation;
}

export function getInvitationByToken(token: string): Invitation | null {
  const data = load();
  const inv = data.invitations.find((i) => i.token === token);
  if (!inv) return null;
  if (new Date(inv.expiresAt) < new Date()) return null;
  return inv;
}

export function getInvitationByEmail(email: string): Invitation | null {
  const data = load();
  return data.invitations.find((i) => i.email.toLowerCase() === email.toLowerCase()) || null;
}

export function deleteInvitation(token: string): boolean {
  const data = load();
  const idx = data.invitations.findIndex((i) => i.token === token);
  if (idx === -1) return false;
  data.invitations.splice(idx, 1);
  save(data);
  return true;
}

export function deleteInvitationByUserId(userId: string): boolean {
  const data = load();
  const idx = data.invitations.findIndex((i) => i.userId === userId);
  if (idx === -1) return false;
  data.invitations.splice(idx, 1);
  save(data);
  return true;
}
