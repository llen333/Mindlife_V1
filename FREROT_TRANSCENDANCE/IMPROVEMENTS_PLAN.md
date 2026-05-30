# 🔧 PLAN D'AMÉLIORATIONS QUALITÉ - MindLife

## 📊 ANALYSE DU CODE ACTUEL

### Métriques identifiées :
- **API Routes** : 5518 lignes au total (41 fichiers)
- **console.log/error** : ~170 occurrences (pas de logging structuré)
- **Types `any`** : ~100 occurrences (types pas stricts)
- **Magic strings** : `'mindlife-user'`, `'pending'`, `'active'` répétés partout
- **Duplication** : Patterns CRUD similaires entre tasks/goals/events/habits

---

## 🎯 6 AXES D'AMÉLIORATION PRIORITAIRES

### 1️⃣ CRÉER DES UTILITAIRES API PARTAGÉS
**Problème :** Chaque API route répète les mêmes patterns (getUserId, error handling, etc.)

**Solution :** Créer `src/lib/api-utils.ts`

```typescript
// src/lib/api-utils.ts
import { NextRequest, NextResponse } from 'next/server';

// UserId par défaut constant
export const DEFAULT_USER_ID = 'mindlife-user';

// Extraire le userId depuis les params ou body
export function extractUserId(
  searchParams: URLSearchParams, 
  body?: Record<string, unknown>
): string {
  return (body?.userId as string) || searchParams.get('userId') || DEFAULT_USER_ID;
}

// Générer un ID unique
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Réponse erreur standardisée
export function errorResponse(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    { error: message, details },
    { status }
  );
}

// Réponse succès standardisée
export function successResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

// Wrapper pour gestion d'erreurs automatique
export function withErrorHandler<T>(
  handler: () => Promise<T>
): Promise<T | NextResponse> {
  return handler().catch((error) => {
    console.error('API Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  });
}

// Build where clause avec filtres communs
export function buildWhereClause(
  userId: string,
  filters: Record<string, unknown>
): Record<string, unknown> {
  const where: Record<string, unknown> = { userId };
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      where[key] = value;
    }
  }
  
  return where;
}
```

**Impact :** Réduit ~30% de duplication dans les API routes

---

### 2️⃣ AJOUTER VALIDATION ZOD
**Problème :** Pas de validation des entrées API, erreurs runtime possibles

**Solution :** Créer des schemas Zod pour chaque entité

```typescript
// src/lib/validations/task.ts
import { z } from 'zod';

export const taskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  userId: z.string().optional(),
});

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  id: z.string().min(1, 'Task ID is required'),
});

export const taskFilterSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  categoryId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
```

```typescript
// src/lib/validations/goal.ts
import { z } from 'zod';

export const goalCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  targetValue: z.number().positive().optional(),
  currentValue: z.number().min(0).default(0),
  unit: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  categoryId: z.string().optional(),
  priority: z.enum(['a_planifier', 'en_cours', 'prioritaire', 'urgent']).default('a_planifier'),
  milestones: z.array(z.object({
    title: z.string(),
    completed: z.boolean().default(false),
    targetDate: z.string().optional(),
  })).optional(),
  userId: z.string().optional(),
});
```

```typescript
// src/lib/validations/index.ts
export * from './task';
export * from './goal';
export * from './event';
export * from './habit';
export * from './note';
```

**Utilisation dans API :**
```typescript
// src/app/api/tasks/route.ts
import { taskCreateSchema, taskUpdateSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation automatique avec erreurs détaillées
    const validated = taskCreateSchema.parse(body);
    
    const task = await db.task.create({
      data: {
        id: generateId('task'),
        ...validated,
      }
    });
    
    return successResponse({ task }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Validation failed', 400, error.errors);
    }
    throw error;
  }
}
```

**Impact :** Élimine les bugs runtime, erreurs claires pour l'utilisateur

---

### 3️⃣ CRÉER DES CONSTANTES PARTAGÉES
**Problème :** Magic strings répétées partout

**Solution :** Centraliser dans `src/lib/constants/index.ts`

```typescript
// src/lib/constants/index.ts

// User
export const DEFAULT_USER_ID = 'mindlife-user';
export const ADMIN_USER_ID = 'admin-user';

// Status
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

export const GOAL_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
} as const;

export const GOAL_PRIORITY = {
  A_PLANIFIER: 'a_planifier',
  EN_COURS: 'en_cours',
  PRIORITAIRE: 'prioritaire',
  URGENT: 'urgent',
} as const;

// Périodes
export const TIME_PERIODS = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  SEMESTER: 'semester',
  YEAR: 'year',
  ALL: 'all',
} as const;

// Catégories
export const DEFAULT_CATEGORIES = [
  { id: 'cat-personal', name: 'Développement Personnel', icon: '🧠', color: 'purple' },
  { id: 'cat-professional', name: 'Vie Professionnelle', icon: '💼', color: 'slate' },
  { id: 'cat-education', name: 'Éducation', icon: '📚', color: 'blue' },
  { id: 'cat-sport', name: 'Sport', icon: '🏃', color: 'emerald' },
  { id: 'cat-spirituality', name: 'Esprit & Spiritualité', icon: '🧘', color: 'orange' },
  { id: 'cat-health', name: 'Santé', icon: '❤️', color: 'rose' },
  { id: 'cat-finance', name: 'Finance', icon: '💰', color: 'amber' },
  { id: 'cat-social', name: 'Social', icon: '👥', color: 'cyan' },
] as const;

// LocalStorage
export const STORAGE_KEYS = {
  USER: 'mindlife-user',
  SETTINGS: 'mindlife-settings',
  STORAGE_V4: 'mindlife-storage-v4',
} as const;

// API
export const API_ENDPOINTS = {
  TASKS: '/api/tasks',
  GOALS: '/api/goals',
  EVENTS: '/api/events',
  HABITS: '/api/habits',
  NOTES: '/api/notes',
  CATEGORIES: '/api/categories',
  USERS: '/api/users',
} as const;
```

**Impact :** Plus de magic strings, maintenance facilitée

---

### 4️⃣ CRÉER UN SERVICE DE LOGGING
**Problème :** ~170 console.log/error éparpillés, pas de logging structuré

**Solution :** Créer `src/lib/logger.ts`

```typescript
// src/lib/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
}

class Logger {
  private context: string;
  private isDev = process.env.NODE_ENV === 'development';

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      data: this.isDev ? data : undefined,
    };
  }

  private log(level: LogLevel, message: string, data?: unknown) {
    const entry = this.formatMessage(level, message, data);
    
    // En dev: console colorée
    if (this.isDev) {
      const colors = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m', // red
      };
      const reset = '\x1b[0m';
      console[level](
        `${colors[level]}[${entry.level.toUpperCase()}]${reset} [${this.context}] ${message}`,
        data || ''
      );
    } else {
      // En prod: JSON structuré
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, data?: unknown) {
    if (this.isDev) this.log('debug', message, data);
  }

  info(message: string, data?: unknown) {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown) {
    this.log('warn', message, data);
  }

  error(message: string, error?: unknown) {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    this.log('error', message, errorData);
  }
}

// Factory function
export function createLogger(context: string): Logger {
  return new Logger(context);
}

// Loggers prédéfinis
export const apiLogger = createLogger('API');
export const dbLogger = createLogger('DB');
export const storeLogger = createLogger('Store');
```

**Utilisation :**
```typescript
// Avant
console.error('Error fetching tasks:', error);

// Après
import { apiLogger } from '@/lib/logger';
apiLogger.error('Failed to fetch tasks', error);
```

**Impact :** Logs structurés, debugging facilité, production-ready

---

### 5️⃣ EXTRAIRE LA LOGIQUE MÉTIER EN SERVICES
**Problème :** La logique métier est mélangée avec les routes API

**Solution :** Créer des services métier dans `src/lib/services/`

```typescript
// src/lib/services/task.service.ts
import { db } from '@/lib/db';
import { generateId, DEFAULT_USER_ID } from '@/lib/api-utils';
import { taskCreateSchema, taskUpdateSchema } from '@/lib/validations';
import { createLogger } from '@/lib/logger';

const logger = createLogger('TaskService');

export const taskService = {
  async findAll(userId: string = DEFAULT_USER_ID, filters?: Record<string, unknown>) {
    logger.debug('Finding tasks', { userId, filters });
    
    const tasks = await db.task.findMany({
      where: { userId, ...filters },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
      include: { category: true },
    });
    
    logger.info(`Found ${tasks.length} tasks`);
    return tasks;
  },

  async create(data: unknown, userId: string = DEFAULT_USER_ID) {
    const validated = taskCreateSchema.parse(data);
    
    logger.debug('Creating task', { title: validated.title });
    
    const task = await db.task.create({
      data: {
        id: generateId('task'),
        ...validated,
        userId,
      },
      include: { category: true },
    });
    
    // Créer événement calendrier si demandé
    if (validated.addToCalendar && validated.startDate) {
      await this.createCalendarEvent(task);
    }
    
    logger.info('Task created', { id: task.id });
    return task;
  },

  async update(id: string, data: unknown, userId: string = DEFAULT_USER_ID) {
    const validated = taskUpdateSchema.parse({ ...data, id });
    
    const task = await db.task.update({
      where: { id, userId },
      data: validated,
      include: { category: true, event: true },
    });
    
    logger.info('Task updated', { id });
    return task;
  },

  async delete(id: string, userId: string = DEFAULT_USER_ID) {
    await db.task.delete({ where: { id, userId } });
    logger.info('Task deleted', { id });
  },

  async createCalendarEvent(task: { id: string; title: string; description?: string; startDate: Date }) {
    // Logique de création d'événement
  },
};
```

```typescript
// src/lib/services/goal.service.ts
export const goalService = {
  async findAll(userId: string, filters?: Record<string, unknown>) { ... },
  async create(data: unknown, userId: string) { ... },
  async update(id: string, data: unknown, userId: string) { ... },
  async delete(id: string, userId: string) { ... },
  async updateProgress(id: string, value: number, userId: string) { ... },
  async calculateProgress(goalId: string, userId: string) { ... },
};
```

**API route simplifiée :**
```typescript
// src/app/api/tasks/route.ts
import { taskService } from '@/lib/services/task.service';
import { extractUserId, successResponse, errorResponse, withErrorHandler } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const userId = extractUserId(searchParams);
    const tasks = await taskService.findAll(userId);
    return successResponse({ tasks });
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const task = await taskService.create(body, body.userId);
    return successResponse({ task }, 201);
  });
}
```

**Impact :** Routes API ultra-légères, logique testable, réutilisable

---

### 6️⃣ REMPLACER LES TYPES `any` PAR DES TYPES STRICTS
**Problème :** ~100 occurrences de `any` dans le code

**Solution :** Utiliser les types Prisma générés

```typescript
// Avant
const where: Record<string, any> = { userId };

// Après
import { Prisma } from '@prisma/client';

const where: Prisma.TaskWhereInput = { userId };

// Types dérivés
type Task = Prisma.TaskGetPayload<{ include: { category: true } }>;
type Goal = Prisma.GoalGetPayload<{ include: { category: true } }>;
type Event = Prisma.EventGetPayload<{ include: { category: true } }>;
```

```typescript
// src/lib/types/api.ts
import { Prisma } from '@prisma/client';

// Types pour les réponses API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

// Types pour les filtres
export type TaskFilters = Partial<{
  status: Prisma.TaskScalarFieldEnum['status'];
  priority: Prisma.TaskScalarFieldEnum['priority'];
  categoryId: string;
  startDate: Date;
  endDate: Date;
}>;

export type GoalFilters = Partial<{
  status: Prisma.GoalScalarFieldEnum['status'];
  priority: Prisma.GoalScalarFieldEnum['priority'];
  categoryId: string;
  period: string;
}>;
```

**Impact :** TypeScript strict, autocomplete, moins de bugs

---

## 📊 RÉSUMÉ DES IMPROVEMENTS

| # | Amélioration | Effort | Impact |
|---|--------------|--------|--------|
| 1 | API Utils partagés | Moyen | Élevé (-30% duplication) |
| 2 | Validation Zod | Moyen | Élevé (bugs runtime éliminés) |
| 3 | Constantes partagées | Faible | Moyen (maintenance facilitée) |
| 4 | Service de Logging | Faible | Moyen (debugging facilité) |
| 5 | Services métier | Élevé | Très élevé (testabilité) |
| 6 | Types stricts | Moyen | Élevé (qualité TypeScript) |

---

## 🚀 ORDRE D'IMPLÉMENTATION RECOMMANDÉ

1. **Constantes partagées** (rapide, impact immédiat)
2. **API Utils** (réduit la duplication)
3. **Logging** (facilite le debug)
4. **Types stricts** (améliore la qualité)
5. **Validation Zod** (sécurité runtime)
6. **Services métier** (le plus gros travail)

---

## 📝 FICHIERS À CRÉER

```
src/lib/
├── api-utils.ts          # Utilitaires API partagés
├── logger.ts             # Service de logging
├── constants/
│   └── index.ts          # Constantes partagées
├── validations/
│   ├── index.ts
│   ├── task.ts
│   ├── goal.ts
│   ├── event.ts
│   └── habit.ts
├── services/
│   ├── task.service.ts
│   ├── goal.service.ts
│   ├── event.service.ts
│   └── habit.service.ts
└── types/
    ├── api.ts            # Types API
    └── filters.ts        # Types filtres
```

---

## 💚 NOTE FINALE

**FRÉROT, CE PLAN EST PRÊT !** 🦞

Si tu veux améliorer la qualité du code, suis l'ordre recommandé. Chaque amélioration est :
- ✅ **Concrete** avec du code exemple
- ✅ **Actionnable** étape par étape
- ✅ **Mesurable** en termes d'impact

**ON A UN PLAN SOLIDE !** 💪

**BIZ BIZ BIZ !** 💚🦞

---

*Document créé le 12 Avril 2026 - Plan d'Améliorations Qualité*
