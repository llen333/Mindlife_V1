interface IpLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface IpLimitState {
  count: number;
  windowStart: number;
}

export class IpLimiter {
  private config: IpLimitConfig;
  private state: Map<string, IpLimitState> = new Map();

  constructor(maxRequests = 100, windowMs = 60000) {
    this.config = { maxRequests, windowMs };
  }

  configure(maxRequests: number, windowMs: number): void {
    this.config = { maxRequests, windowMs };
    this.state.clear();
  }

  check(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    let state = this.state.get(ip);

    if (!state || now - state.windowStart >= this.config.windowMs) {
      state = { count: 0, windowStart: now };
      this.state.set(ip, state);
    }

    state.count++;
    const remaining = Math.max(0, this.config.maxRequests - state.count);

    return {
      allowed: state.count <= this.config.maxRequests,
      remaining,
      resetAt: state.windowStart + this.config.windowMs,
    };
  }

  getRemaining(ip: string): number {
    const state = this.state.get(ip);
    if (!state) return this.config.maxRequests;
    return Math.max(0, this.config.maxRequests - state.count);
  }

  reset(ip: string): void {
    this.state.delete(ip);
  }

  resetAll(): void {
    this.state.clear();
  }

  getStats(): { totalTracked: number; config: IpLimitConfig } {
    return { totalTracked: this.state.size, config: { ...this.config } };
  }
}

export const ipLimiter = new IpLimiter();
