import type { BlockDef } from './types';

const API_BASE = '';

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const BLOCK_REGISTRY: BlockDef[] = [
  {
    type: 'create-task',
    label: 'Create Task',
    icon: 'CheckSquare',
    category: 'actions',
    color: '#10b981',
    description: 'Crée une nouvelle tâche dans Mindlife',
    inputs: [{ id: 'in', label: 'Input', type: 'input', acceptedType: 'any' }],
    outputs: [{ id: 'out', label: 'Task', type: 'output', acceptedType: 'data' }],
    configFields: [
      { name: 'title', label: 'Titre', type: 'text', required: true, placeholder: 'Faire du sport...' },
      { name: 'priority', label: 'Priorité', type: 'select', defaultValue: 'medium', options: [
        { label: 'Basse', value: 'low' }, { label: 'Moyenne', value: 'medium' }, { label: 'Haute', value: 'high' },
      ]},
      { name: 'dueDate', label: 'Date échéance', type: 'text', placeholder: '2026-06-06' },
    ],
    execute: async (config, inputs) => {
      const prevOutput = inputs['in'] as Record<string, unknown> | undefined;
      const data = await apiFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: String(config.title || prevOutput?.title || 'Tâche sans titre'),
          priority: config.priority || 'medium',
          dueDate: config.dueDate ? new Date(config.dueDate as string).toISOString() : undefined,
          status: 'pending',
          userId: 'mindlife-user',
        }),
      });
      return { task: data.task, id: data.task?.id, ...data };
    },
  },
  {
    type: 'log-meal',
    label: 'Log Meal',
    icon: 'UtensilsCrossed',
    category: 'actions',
    color: '#f59e0b',
    description: 'Enregistre un repas dans le journal alimentaire',
    inputs: [{ id: 'in', label: 'Input', type: 'input', acceptedType: 'any' }],
    outputs: [{ id: 'out', label: 'Meal', type: 'output', acceptedType: 'data' }],
    configFields: [
      { name: 'name', label: 'Nom du repas', type: 'text', required: true, placeholder: 'Salade Caesar' },
      { name: 'type', label: 'Type', type: 'select', defaultValue: 'lunch', options: [
        { label: 'Petit-déjeuner', value: 'breakfast' }, { label: 'Déjeuner', value: 'lunch' },
        { label: 'Dîner', value: 'dinner' }, { label: 'Snack', value: 'snack' },
      ]},
      { name: 'calories', label: 'Calories', type: 'number', placeholder: '450' },
    ],
    execute: async (config, inputs) => {
      const prevOutput = inputs['in'] as Record<string, unknown> | undefined;
      const data = await apiFetch('/api/meals', {
        method: 'POST',
        body: JSON.stringify({
          name: String(config.name || prevOutput?.name || 'Repas sans nom'),
          type: config.type || 'lunch',
          calories: Number(config.calories) || 0,
          protein: 0, carbs: 0, fat: 0,
          date: new Date().toISOString(),
          userId: 'mindlife-user',
        }),
      });
      return { meal: data.meal, ...data };
    },
  },
  {
    type: 'log-weight',
    label: 'Log Weight',
    icon: 'Weight',
    category: 'actions',
    color: '#8b5cf6',
    description: 'Enregistre ton poids du jour',
    inputs: [{ id: 'in', label: 'Input', type: 'input', acceptedType: 'any' }],
    outputs: [{ id: 'out', label: 'Done', type: 'output', acceptedType: 'data' }],
    configFields: [
      { name: 'weight', label: 'Poids (kg)', type: 'number', required: true, placeholder: '75.5' },
    ],
    execute: async (config, inputs) => {
      const prevOutput = inputs['in'] as Record<string, unknown> | undefined;
      const weight = Number(config.weight || prevOutput?.weight);
      if (!weight) throw new Error('Poids requis — configure le bloc ou passe une donnée avec .weight');
      await apiFetch('/api/weight', {
        method: 'POST',
        body: JSON.stringify({ weight, date: new Date().toISOString(), userId: 'mindlife-user' }),
      });
      return { success: true, weight };
    },
  },
  {
    type: 'ai-coach',
    label: 'AI Coach',
    icon: 'Brain',
    category: 'ai',
    color: '#06b6d4',
    description: 'Pose une question à ton coach IA Mindlife',
    inputs: [{ id: 'in', label: 'Question', type: 'input', acceptedType: 'data' }],
    outputs: [{ id: 'out', label: 'Réponse', type: 'output', acceptedType: 'data' }],
    configFields: [
      { name: 'prompt', label: 'Instruction', type: 'textarea', placeholder: 'Que manger ce soir ?', required: true },
      { name: 'module', label: 'Module Mindlife', type: 'select', defaultValue: 'mind', options: [
        { label: 'Esprit', value: 'mind' }, { label: 'Nutrition', value: 'nutrition' },
        { label: 'Sport', value: 'sport' }, { label: 'Organisation', value: 'organisation' },
      ]},
    ],
    execute: async (config, inputs) => {
      const prevOutput = inputs['in'] as Record<string, unknown> | undefined;
      const message = String(config.prompt || prevOutput?.response || prevOutput?.message || '');
      if (!message) throw new Error('Instruction requise — configure le bloc ou connecte une donnée');
      const data = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message, moduleId: config.module || 'mind', userId: 'mindlife-user' }),
      });
      return { response: data.response || data.content, ...data };
    },
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: 'GitBranch',
    category: 'logic',
    color: '#f97316',
    description: 'Teste une condition et aiguille le flux',
    inputs: [{ id: 'in', label: 'Data', type: 'input', acceptedType: 'data' }],
    outputs: [
      { id: 'true', label: 'Vrai', type: 'output', acceptedType: 'control' },
      { id: 'false', label: 'Faux', type: 'output', acceptedType: 'control' },
    ],
    configFields: [
      { name: 'field', label: 'Champ à tester', type: 'text', placeholder: 'calories' },
      { name: 'operator', label: 'Opérateur', type: 'select', defaultValue: 'gt', options: [
        { label: '> (supérieur)', value: 'gt' }, { label: '< (inférieur)', value: 'lt' },
        { label: '== (égal)', value: 'eq' }, { label: 'existe', value: 'exists' },
      ]},
      { name: 'value', label: 'Valeur de comparaison', type: 'text', placeholder: '500' },
    ],
    execute: async (config, inputs) => {
      const field = config.field as string;
      const operator = config.operator as string;
      const value = config.value;
      const inputVal = (inputs as Record<string, unknown>)[field];
      let result = false;
      if (operator === 'exists') result = inputVal !== undefined && inputVal !== null;
      else if (operator === 'gt') result = Number(inputVal) > Number(value);
      else if (operator === 'lt') result = Number(inputVal) < Number(value);
      else if (operator === 'eq') result = String(inputVal) === String(value);
      return { result, branch: result ? 'true' : 'false' };
    },
  },
  {
    type: 'trigger-manual',
    label: 'Démarrer',
    icon: 'Play',
    category: 'triggers',
    color: '#22c55e',
    description: 'Point de départ du workflow (clic sur Run)',
    inputs: [],
    outputs: [{ id: 'out', label: 'Start', type: 'output', acceptedType: 'control' }],
    configFields: [],
    execute: async () => ({ started: true }),
  },
  {
    type: 'create-note',
    label: 'Create Note',
    icon: 'FileText',
    category: 'actions',
    color: '#3b82f6',
    description: 'Crée une note dans le journal Mindlife',
    inputs: [{ id: 'in', label: 'Input', type: 'input', acceptedType: 'any' }],
    outputs: [{ id: 'out', label: 'Note', type: 'output', acceptedType: 'data' }],
    configFields: [
      { name: 'title', label: 'Titre', type: 'text', placeholder: 'Ma note', required: true },
      { name: 'content', label: 'Contenu', type: 'textarea', placeholder: 'Contenu de la note...' },
    ],
    execute: async (config, inputs) => {
      const prevOutput = inputs['in'] as Record<string, unknown> | undefined;
      const title = String(config.title || prevOutput?.title || 'Note sans titre');
      const content = String(config.content || prevOutput?.content || '');
      const data = await apiFetch('/api/notes', {
        method: 'POST',
        body: JSON.stringify({ title, content, type: 'text', userId: 'mindlife-user', categoryId: 'general' }),
      });
      return { note: data.note, ...data };
    },
  },
  {
    type: 'list-tasks',
    label: 'List Tasks',
    icon: 'ListTodo',
    category: 'actions',
    color: '#14b8a6',
    description: 'Récupère les tâches du jour',
    inputs: [{ id: 'in', label: 'Input', type: 'input', acceptedType: 'any' }],
    outputs: [{ id: 'out', label: 'Tasks', type: 'output', acceptedType: 'data' }],
    configFields: [
      { name: 'status', label: 'Statut', type: 'select', defaultValue: 'pending', options: [
        { label: 'En cours', value: 'pending' }, { label: 'Terminées', value: 'completed' }, { label: 'Toutes', value: 'all' },
      ]},
    ],
    execute: async (config) => {
      const status = config.status === 'all' ? '' : `&status=${config.status}`;
      const data = await apiFetch(`/api/tasks?userId=mindlife-user${status}`);
      return { tasks: data.tasks || [], count: (data.tasks || []).length };
    },
  },
];

export function getBlockDef(type: string): BlockDef | undefined {
  return BLOCK_REGISTRY.find(b => b.type === type);
}

export function getBlocksByCategory(category: string): BlockDef[] {
  return BLOCK_REGISTRY.filter(b => b.category === category);
}
