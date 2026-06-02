import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { createCRUDFactory } from '@/lib/api/crud-factory';

const meals = createCRUDFactory({
  model: db.meal as any,
  modelName: 'meal',
  mutableFields: ['name', 'type', 'date', 'calories', 'protein', 'carbs', 'fat', 'servings', 'description', 'ingredients', 'instructions', 'prepTime', 'cookTime'],
  fieldMappings: {
    date: (v: string) => new Date(v),
    calories: (v: string) => parseFloat(v),
    protein: (v: string) => parseFloat(v),
    carbs: (v: string) => parseFloat(v),
    fat: (v: string) => parseFloat(v),
    servings: (v: string) => parseInt(v),
  },
  idPrefix: 'meal',
  listOrderBy: { date: 'asc' },
  validateCreate: (body) => !body.name ? 'name required' : null,
});

export const GET = (req: NextRequest) => meals.list(req);
export const POST = (req: NextRequest) => meals.create(req);
export const PUT = (req: NextRequest) => meals.update(req);
export const DELETE = (req: NextRequest) => meals.remove(req);
