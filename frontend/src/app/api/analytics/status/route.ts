import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get analytics module status
export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
    
    // Analytics is always enabled for this version
    return jsonResponse({
      enabled: true,
      version: '1.0.0',
      features: ['risk-analysis', 'predictions', 'workload-analysis', 'velocity-metrics'],
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get analytics status error:', error);
    return errorResponse('Failed to get analytics status', 500);
  }
}
