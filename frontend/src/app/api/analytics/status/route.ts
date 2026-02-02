import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/utils';

// Get analytics module status
export async function GET(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/15cdbcca-ca79-4c98-8d4a-d1a85d74555c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics/status/route.ts:GET_START',message:'Status API called',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    requireAuth(request);
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/15cdbcca-ca79-4c98-8d4a-d1a85d74555c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics/status/route.ts:SUCCESS',message:'Status returned successfully',data:{enabled:true},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Analytics is always enabled for this version
    return jsonResponse({
      enabled: true,
      version: '1.0.0',
      features: ['risk-analysis', 'predictions', 'workload-analysis', 'velocity-metrics'],
    });
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/15cdbcca-ca79-4c98-8d4a-d1a85d74555c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics/status/route.ts:ERROR',message:'Status API error',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (error.message === 'Unauthorized') return errorResponse('Unauthorized', 401);
    console.error('Get analytics status error:', error);
    return errorResponse('Failed to get analytics status', 500);
  }
}
