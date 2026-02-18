import { jsonResponse, clearAuthCookie } from '@/lib/auth';

export async function POST() {
  const response = jsonResponse({ message: 'Logged out' });
  return clearAuthCookie(response);
}
