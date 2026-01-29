import { db } from '@/lib/database';
import { jsonResponse } from '@/lib/utils';

export async function GET() {
  await db.read();
  const hasManager = db.data.users.some((user) => user.role === 'manager');
  return jsonResponse({ managerExists: hasManager });
}
