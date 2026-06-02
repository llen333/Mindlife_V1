import { describe, it, expect } from 'vitest';

describe('CRUD Factory', () => {
  it('configures correctly with model name and fields', async () => {
    const { createCRUDFactory } = await import('@/lib/api/crud-factory');
    const mockModel = {
      findMany: async (args: any) => ({ args }),
      findUnique: async (args: any) => ({ args }),
      findFirst: async (args: any) => ({ args }),
      create: async (args: any) => args.data,
      update: async (args: any) => args.data,
      delete: async (args: any) => ({ args }),
      count: async (args: any) => 0,
    };

    const factory = createCRUDFactory({
      model: mockModel as any,
      modelName: 'test',
      mutableFields: ['name', 'value'],
      idPrefix: 'test',
    });

    expect(factory).toHaveProperty('list');
    expect(factory).toHaveProperty('create');
    expect(factory).toHaveProperty('update');
    expect(factory).toHaveProperty('remove');
  });

  it('validates required fields on create', async () => {
    const { createCRUDFactory } = await import('@/lib/api/crud-factory');
    const mockModel = {
      findMany: async () => [],
      findUnique: async () => null,
      findFirst: async () => null,
      create: async (args: any) => args.data,
      update: async (args: any) => args.data,
      delete: async () => ({}),
      count: async () => 0,
    };

    const factory = createCRUDFactory({
      model: mockModel as any,
      modelName: 'test',
      mutableFields: ['name'],
      validateCreate: (body) => !body.name ? 'name required' : null,
    });

    // Simulate a request with missing name
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await factory.create(req as any);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe('name required');
  });

  it('rejects update without id', async () => {
    const { createCRUDFactory } = await import('@/lib/api/crud-factory');
    const mockModel = {
      findMany: async () => [],
      findUnique: async () => null,
      findFirst: async () => null,
      create: async (args: any) => args.data,
      update: async (args: any) => args.data,
      delete: async () => ({}),
      count: async () => 0,
    };

    const factory = createCRUDFactory({
      model: mockModel as any,
      modelName: 'test',
      mutableFields: ['name'],
    });

    const req = new Request('http://localhost/api/test', {
      method: 'PUT',
      body: JSON.stringify({ name: 'test' }),
    });
    const res = await factory.update(req as any);
    expect(res.status).toBe(400);
  });
});
