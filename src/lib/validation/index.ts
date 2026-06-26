import { z } from 'zod';

const userId = z.string().min(1, 'userId requis').default('mindlife-user');
const id = z.string().min(1, 'id requis');

export const taskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Le titre est requis').max(500),
  description: z.string().max(5000).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  startDate: z.string().datetime({ offset: true }).optional().nullable(),
  tags: z.string().optional(),
  categoryId: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  chapters: z.string().optional(),
  observations: z.string().optional(),
  addToCalendar: z.boolean().optional(),
  createdBy: z.string().optional(),
  userId: userId.optional(),
});

export const goalSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Le titre est requis').max(500),
  description: z.string().max(5000).optional(),
  status: z.enum(['active', 'completed', 'cancelled', 'draft']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  categoryId: z.string().optional(),
  tags: z.string().optional(),
  color: z.string().optional(),
  milestones: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    dueDate: z.string().optional().nullable(),
    completed: z.boolean().optional(),
  })).optional(),
  userId: userId.optional(),
});

export const eventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Le titre est requis').max(500),
  description: z.string().max(5000).optional(),
  startAt: z.string().datetime({ offset: true }),
  endAt: z.string().datetime({ offset: true }).optional(),
  isAllDay: z.boolean().optional(),
  color: z.string().optional(),
  categoryId: z.string().optional(),
  userId: userId.optional(),
});

export const noteSchema = z.object({
  id: z.string().optional(),
  title: z.string().max(500).optional(),
  content: z.string().optional(),
  tags: z.string().optional(),
  categoryId: z.string().optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  userId: userId.optional(),
});

export const habitSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Le nom est requis').max(200),
  description: z.string().max(2000).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'custom']).optional(),
  categoryId: z.string().optional(),
  userId: userId.optional(),
});

export const journalSchema = z.object({
  id: z.string().optional(),
  title: z.string().max(500).optional(),
  content: z.string().min(1, 'Le contenu est requis'),
  mood: z.string().optional(),
  tags: z.string().optional(),
  userId: userId.optional(),
});

export const nutritionProfileSchema = z.object({
  age: z.number().min(1).max(150).optional(),
  weight: z.number().min(20).max(500).optional(),
  height: z.number().min(50).max(300).optional(),
  goal: z.enum(['lose', 'maintain', 'gain']).optional(),
  diet: z.string().optional(),
  allergies: z.string().optional(),
  userId: userId.optional(),
});

export const sportSessionSchema = z.object({
  name: z.string().max(200).optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'skipped']).optional(),
  intensity: z.string().optional(),
  duration: z.number().optional(),
  rating: z.number().min(0).max(10).optional(),
  notes: z.string().optional(),
  dayId: z.string().optional(),
  exercises: z.array(z.object({
    name: z.string().min(1),
    sets: z.number().min(1),
    reps: z.string(),
    weight: z.number().optional(),
    order: z.number(),
    completed: z.boolean().optional(),
  })).optional(),
  userId: userId.optional(),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { data?: T; error?: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return { error: `${firstError.path.join('.')} : ${firstError.message}` };
  }
  return { data: result.data };
}
