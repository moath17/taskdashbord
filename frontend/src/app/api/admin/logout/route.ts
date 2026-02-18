import { jsonResponse } from '@/lib/auth';
import { clearAdminCookie } from '@/lib/admin-auth';

export async function POST() {
  const response = jsonResponse({ message: 'Admin logged out' });
  return clearAdminCookie(response);
}
