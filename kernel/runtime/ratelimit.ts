export class RateLimiter {
  private limits = new Map<string, { maxRequests: number; windowMs: number }>();
  private counters = new Map<string, { count: number; resetAt: number }>();

  setLimit(key: string, maxRequests: number, windowMs = 60000): void {
    this.limits.set(key, { maxRequests, windowMs });
  }

  check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const config = this.limits.get(key);
    if (!config) return { allowed: true, remaining: Infinity, resetAt: 0 };

    const now = Date.now();
    let counter = this.counters.get(key);

    if (!counter || now > counter.resetAt) {
      counter = { count: 0, resetAt: now + config.windowMs };
      this.counters.set(key, counter);
    }

    counter.count++;
    const remaining = Math.max(0, config.maxRequests - counter.count);

    return {
      allowed: counter.count <= config.maxRequests,
      remaining,
      resetAt: counter.resetAt,
    };
  }

  getRemaining(key: string): number {
    const config = this.limits.get(key);
    if (!config) return Infinity;
    const counter = this.counters.get(key);
    if (!counter || Date.now() > counter.resetAt) return config.maxRequests;
    return Math.max(0, config.maxRequests - counter.count);
  }

  reset(key: string): void {
    this.counters.delete(key);
  }

  resetAll(): void {
    this.counters.clear();
  }
}

export const rateLimiter = new RateLimiter();
