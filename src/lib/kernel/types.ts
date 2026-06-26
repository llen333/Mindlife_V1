import type { NextRequest } from 'next/server';

export interface KernelRequest {
  id: string;
  type: 'api' | 'internal' | 'event';
  action: string;
  resource: string;
  userId?: string;
  params: Record<string, unknown>;
  body?: unknown;
  timestamp: number;
}

export interface KernelResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  metrics?: {
    durationMs: number;
    resource: string;
    action: string;
  };
}

export type ApiHandler = (request: NextRequest, context?: Record<string, unknown>) => Promise<Response>;

export interface KernelRouteConfig {
  resource: string;
  action: string;
  requiredPermission?: string;
  allowAnonymous?: boolean;
  rateLimit?: number;
}

export interface KernelEvent {
  type: string;
  resource: string;
  action: string;
  userId?: string;
  durationMs: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

export interface KernelStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageDurationMs: number;
  uptime: number;
  eventsEmitted: number;
}
