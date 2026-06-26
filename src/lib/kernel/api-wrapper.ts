import { NextRequest, NextResponse } from 'next/server';
import { kernel } from './ipc';
import type { ApiHandler, KernelRouteConfig } from './types';

function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type HandlerResult = Record<string, unknown> | { error: string };

function json(data: HandlerResult, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

function getUserId(request: NextRequest): string {
  const fromParams = request.nextUrl.searchParams.get('userId');
  if (fromParams) return fromParams;
  try { const body = request.clone(); return 'mindlife-user'; } catch { return 'mindlife-user'; }
}

export function withKernel(
  handler: ApiHandler,
  config: KernelRouteConfig
): ApiHandler {
  return async (request: NextRequest, context?: Record<string, unknown>) => {
    const start = performance.now();
    const requestId = generateRequestId();

    const { resource, action } = config;

    try {
      const result = await kernel.send({
        type: 'api',
        resource,
        action,
        userId: getUserId(request),
        params: {
          __requestId: requestId,
          __url: request.url,
          __method: request.method,
          ...config,
        },
      });

      if (!result.success && result.error === 'Permission denied') {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        );
      }
    } catch {
      // Continue to handler — kernel is advisory, not blocking
    }

    try {
      const response = await handler(request, context);
      return response;
    } catch (error: any) {
      const duration = performance.now() - start;
      console.error(`[KERNEL] ${resource}:${action} failed in ${duration.toFixed(0)}ms:`, error.message);
      return json({ error: error.message || 'Internal server error' }, 500);
    }
  };
}

export function withKernelCRUD(
  resource: string
): (handler: ApiHandler, action: string) => ApiHandler {
  return (handler: ApiHandler, action: string) =>
    withKernel(handler, { resource, action });
}

export { generateRequestId, json, getUserId };
