import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type PrismaModel = {
  findMany: (args: any) => Promise<any[]>;
  findUnique: (args: any) => Promise<any | null>;
  findFirst: (args: any) => Promise<any | null>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
  count: (args: any) => Promise<number>;
};

type FieldMapping = Record<string, (val: any) => any>;

interface CRUDFactoryConfig {
  model: PrismaModel;
  modelName: string;
  listFields?: string[]; // Fields to expose for filterable listing
  mutableFields: string[]; // Fields allowed on create/update
  fieldMappings?: FieldMapping; // Transform functions for incoming values
  defaultUserId?: string;
  idPrefix?: string;
  listOrderBy?: any;
  listInclude?: any;
  detailInclude?: any;
  validateCreate?: (body: any) => string | null;
}

function buildUpdateData(body: any, mutableFields: string[], mappings?: FieldMapping) {
  const data: Record<string, any> = {};
  for (const field of mutableFields) {
    if (body[field] !== undefined) {
      data[field] = mappings?.[field] ? mappings[field](body[field]) : body[field];
    }
  }
  return data;
}

export function createCRUDFactory(config: CRUDFactoryConfig) {
  const { model, modelName, mutableFields, fieldMappings } = config;
  const plural = modelName + 's';
  const defaultUserId = config.defaultUserId || 'mindlife-user';

  function respond(data: Record<string, any>, status = 200) {
    return NextResponse.json(data, { status });
  }

  function error(msg: string, status = 500) {
    return NextResponse.json({ error: msg }, { status });
  }

  function parseFilters(searchParams: URLSearchParams, listFields?: string[]) {
    const where: Record<string, any> = {};
    const userId = searchParams.get('userId') || defaultUserId;
    where.userId = userId;

    const fields = listFields || mutableFields;
    for (const field of fields) {
      const val = searchParams.get(field);
      if (val === null) continue;
      const parts = field.split('_');
      if (parts.length === 2) {
        const [base, op] = parts;
        if (['gte', 'lte', 'gt', 'lt', 'in', 'not', 'contains'].includes(op)) {
          where[base] = { ...(where[base] || {}), [op]: op === 'in' ? val.split(',') : val };
          continue;
        }
      }
      where[field] = val;
    }

    return where;
  }

  return {
    async list(request: NextRequest) {
      try {
        const { searchParams } = new URL(request.url);
        const where = parseFilters(searchParams, config.listFields);
        const items = await model.findMany({
          where,
          orderBy: config.listOrderBy || { createdAt: 'desc' },
          include: config.listInclude,
        });
        return respond({ success: true, [plural]: items });
      } catch (e: any) {
        console.error(`[CRUD] Error listing ${plural}:`, e);
        return error(`Failed to fetch ${plural}`);
      }
    },

    async create(request: NextRequest) {
      try {
        const body = await request.json();
        if (config.validateCreate) {
          const err = config.validateCreate(body);
          if (err) return error(err, 400);
        }

        const data: Record<string, any> = {
          id: body.id || `${config.idPrefix || modelName}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          userId: body.userId || defaultUserId,
          ...buildUpdateData(body, mutableFields, fieldMappings),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const item = await model.create({ data });
        return respond({ [modelName]: item }, 201);
      } catch (e: any) {
        console.error(`[CRUD] Error creating ${modelName}:`, e);
        return error(`Failed to create ${modelName}`);
      }
    },

    async update(request: NextRequest) {
      try {
        const body = await request.json();
        const { id, userId, ...rest } = body;
        if (!id) return error('id required', 400);

        const ownerId = userId || defaultUserId;
        const existing = await model.findFirst({ where: { id, userId: ownerId } });
        if (!existing) return error(`${modelName} not found`, 404);

        const updateData = buildUpdateData(rest, mutableFields, fieldMappings);
        updateData.updatedAt = new Date();

        const item = await model.update({ where: { id }, data: updateData, include: config.detailInclude });
        return respond({ [modelName]: item });
      } catch (e: any) {
        console.error(`[CRUD] Error updating ${modelName}:`, e);
        return error(`Failed to update ${modelName}`);
      }
    },

    async remove(request: NextRequest) {
      try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const userId = searchParams.get('userId') || defaultUserId;
        if (!id) return error('id required', 400);

        const existing = await model.findFirst({ where: { id, userId } });
        if (!existing) return error(`${modelName} not found`, 404);

        await model.delete({ where: { id } });
        return respond({ success: true });
      } catch (e: any) {
        console.error(`[CRUD] Error deleting ${modelName}:`, e);
        return error(`Failed to delete ${modelName}`);
      }
    },
  };
}
