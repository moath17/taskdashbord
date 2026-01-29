import { jsonResponse } from '@/lib/utils';

export async function GET() {
  return jsonResponse({ 
    status: 'ok', 
    message: 'Task Management API is running',
    timestamp: new Date().toISOString(),
  });
}
