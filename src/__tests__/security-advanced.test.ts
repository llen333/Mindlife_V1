import { describe, it, expect, afterEach } from 'vitest';
import { IpLimiter } from '../../kernel/security/ip-limiter';
import { SecurityMonitor } from '../../kernel/security/monitor';
import { moduleTokenManager } from '../../kernel/security/tokens';

describe('IP Limiter', () => {
  const limiter = new IpLimiter();

  afterEach(() => limiter.resetAll());

  it('should allow requests within limit', () => {
    const r1 = limiter.check('192.168.1.1');
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(99);
  });

  it('should block requests over limit', () => {
    const strict = new IpLimiter(2, 60000);
    strict.check('10.0.0.1');
    strict.check('10.0.0.1');
    const r3 = strict.check('10.0.0.1');
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it('should track different IPs independently', () => {
    limiter.check('ip-a');
    limiter.check('ip-a');
    const rA = limiter.check('ip-a');
    expect(rA.remaining).toBe(97);
    const rB = limiter.check('ip-b');
    expect(rB.remaining).toBe(99);
  });

  it('should return correct remaining count', () => {
    const lim = new IpLimiter(5, 60000);
    expect(lim.getRemaining('test-ip')).toBe(5);
    lim.check('test-ip');
    lim.check('test-ip');
    expect(lim.getRemaining('test-ip')).toBe(3);
  });

  it('should reset a specific IP', () => {
    const lim = new IpLimiter(3, 60000);
    lim.check('ip');
    lim.check('ip');
    lim.check('ip');
    expect(lim.check('ip').allowed).toBe(false);
    lim.reset('ip');
    expect(lim.check('ip').allowed).toBe(true);
  });

  it('should reset all IPs', () => {
    limiter.check('x');
    limiter.check('y');
    limiter.resetAll();
    expect(limiter.getRemaining('x')).toBe(100);
    expect(limiter.getRemaining('y')).toBe(100);
  });

  it('should reconfigure and reset', () => {
    limiter.configure(10, 30000);
    const stats = limiter.getStats();
    expect(stats.config.maxRequests).toBe(10);
    expect(stats.config.windowMs).toBe(30000);
  });
});

describe('SecurityMonitor', () => {
  it('should have default config', () => {
    const monitor = new SecurityMonitor();
    const config = monitor.getConfig();
    expect(config.deniedThreshold).toBe(10);
    expect(config.tokenFailThreshold).toBe(5);
    expect(config.checkIntervalMs).toBe(60000);
  });

  it('should accept config overrides', () => {
    const monitor = new SecurityMonitor({ deniedThreshold: 5, checkIntervalMs: 30000 });
    expect(monitor.getConfig().deniedThreshold).toBe(5);
    expect(monitor.getConfig().checkIntervalMs).toBe(30000);
  });

  it('should start and stop', () => {
    const monitor = new SecurityMonitor({ checkIntervalMs: 60000 });
    monitor.start();
    const running = (monitor as any).intervalId;
    expect(running).not.toBeNull();
    monitor.stop();
    expect((monitor as any).intervalId).toBeNull();
  });

  it('should not start twice', () => {
    const monitor = new SecurityMonitor({ checkIntervalMs: 60000 });
    monitor.start();
    const id1 = (monitor as any).intervalId;
    monitor.start();
    expect((monitor as any).intervalId).toBe(id1);
    monitor.stop();
  });

  it('should update config and restart when running', () => {
    const monitor = new SecurityMonitor({ checkIntervalMs: 60000 });
    monitor.start();
    monitor.updateConfig({ deniedThreshold: 3, checkIntervalMs: 30000 });
    expect(monitor.getConfig().deniedThreshold).toBe(3);
    expect(monitor.getConfig().checkIntervalMs).toBe(30000);
    monitor.stop();
  });

  it('should return empty alerts initially', () => {
    const monitor = new SecurityMonitor();
    expect(monitor.getAlerts()).toEqual([]);
  });
});

describe('ModuleTokenManager — HMAC upgrade', () => {
  let token: string;

  it('should generate token with HMAC hash', async () => {
    const result = await moduleTokenManager.generate({
      moduleId: 'test-hmac-module',
      name: 'HMAC Test',
      permissions: ['sys.fs.read'],
    });
    token = result.token;
    expect(token).toMatch(/^mrt_/);
    expect(result.info.moduleId).toBe('test-hmac-module');
  });

  it('should validate token with HMAC', async () => {
    const info = await moduleTokenManager.validate(token);
    expect(info).not.toBeNull();
    expect(info!.moduleId).toBe('test-hmac-module');
  });

  it('should reject invalid token', async () => {
    const info = await moduleTokenManager.validate('mrt_invalid_token');
    expect(info).toBeNull();
  });

  it('should check permissions', async () => {
    const hasRead = await moduleTokenManager.hasPermission(token, 'sys.fs.read');
    expect(hasRead).toBe(true);
    const hasWrite = await moduleTokenManager.hasPermission(token, 'sys.fs.write');
    expect(hasWrite).toBe(false);
  });
});
