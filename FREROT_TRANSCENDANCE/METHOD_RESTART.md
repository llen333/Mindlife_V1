# 🔄 MÉTHODE DE REDÉMARRAGE AUTOMATIQUE - MindLife

## 🎯 OBJECTIF
Ce fichier contient TOUTES les consignes pour reprendre le travail de refactorisation et préparation du projet MindLife si on devait tout recommencer de zéro.

---

## 📋 PRÉREQUIS À VÉRIFIER EN PREMIER

### 1. Vérifier l'état du projet
```bash
# Vérifier que le serveur tourne
tail -30 dev.log

# Vérifier le code
bun run lint

# Vérifier le contenu
ls -la /home/z/my-project/
ls -la /home/z/my-project/src/
```

### 2. Lire les fichiers de contexte
```bash
# ORDRE DE LECTURE OBLIGATOIRE:
1. WORK_DAY.md        # Historique des travaux
2. METHOD_RESTART.md  # Ce fichier
3. NICO_MEMORY.md     # Identité et contexte
```

### 3. Vérifier la base de données
```bash
ls -la /home/z/my-project/db/
# Le fichier custom.db doit exister
```

---

## 🏗️ PLAN DE REFACTORISATION EN 6 PHASES

### PHASE 1 : EXTRACTION DES DONNÉES STATIQUES
**Objectif :** Sortir les données statiques des composants géants

#### 1.1 Créer les dossiers
```
src/lib/types/       → Types TypeScript partagés
src/lib/data/        → Données statiques (meals, constants)
src/lib/hooks/       → Hooks personnalisés réutilisables
```

#### 1.2 Fichiers à créer
| Fichier | Contenu |
|---------|---------|
| `src/lib/types/nutrition.ts` | Types : Ingredient, Meal, RecipeStep, NutritionInfo, MealPlan |
| `src/lib/data/meals.ts` | weeklyMeals, dinnerMeals, inspirationRecipes (~385 lignes) |
| `src/lib/data/constants.ts` | Constantes partagées (périodes, priorités, statuts) |
| `src/lib/hooks/useTTS.ts` | Hook TTS pour lecture vocale (~297 lignes) |

#### 1.3 Pattern d'extraction
```typescript
// AVANT (dans un composant de 2000+ lignes)
const weeklyMeals: Meal[] = [
  { id: 'monday-lunch', ... },
  // ... 100+ lignes
];

// APRÈS (dans un fichier séparé)
// src/lib/data/meals.ts
export const weeklyMeals: Meal[] = [
  { id: 'monday-lunch', ... },
];

// Dans le composant
import { weeklyMeals } from '@/lib/data/meals';
```

---

### PHASE 2 : EXTRACTION DES COMPOSANTS UI RÉUTILISABLES
**Objectif :** Créer des composants UI génériques

#### 2.1 Composants à créer dans `/components/ui/`
| Composant | Description | Props principales |
|-----------|-------------|-------------------|
| `circular-progress.tsx` | Barre circulaire de progression | value, max, size, color |
| `progress-bar.tsx` | Barre de progression horizontale | value, max, color, animated |
| `glass-card.tsx` | Card avec effet glassmorphisme | children, className, onClick |
| `mini-timeline.tsx` | Timeline compacte | items, activeIndex |

#### 2.2 Pattern de création
```typescript
// src/components/ui/circular-progress.tsx
"use client";
import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  color?: string;
}

export function CircularProgress({ 
  value, 
  max = 100, 
  size = 120,
  color = 'emerald'
}: CircularProgressProps) {
  // Logique du composant
  return (
    <motion.div>
      {/* SVG circulaire */}
    </motion.div>
  );
}

// Export secondaire si nécessaire
export function MiniProgress(props: Omit<CircularProgressProps, 'size'>) {
  return <CircularProgress {...props} size={60} />;
}
```

---

### PHASE 3 : DÉCOUPAGE DES PAGES GÉANTES
**Objectif :** Réduire les fichiers de +2000 lignes à ~1500 lignes max

#### 3.1 Dossiers à créer par page
```
src/components/nutrition/   → MealCard.tsx, RecipeModal.tsx, AudioDrawer.tsx
src/components/goals/       → GoalCard.tsx, GoalForm.tsx, GoalTimeline.tsx
src/components/calendar/    → EventCard.tsx, CalendarGrid.tsx
src/components/tasks/       → TaskItem.tsx, TaskList.tsx
src/components/habits/      → HabitCard.tsx, HabitTracker.tsx
```

#### 3.2 Méthode d'extraction
```typescript
// 1. Identifier un bloc de code autonome dans la page
// Exemple dans NutritionPage.tsx (2500 lignes) :

// AVANT - Code inline
const MealCard = ({ meal }) => (
  <div className="...">
    {/* 100+ lignes */}
  </div>
);

// APRÈS - Fichier séparé
// src/components/nutrition/MealCard.tsx
interface MealCardProps {
  meal: Meal;
  onClick?: () => void;
}

export function MealCard({ meal, onClick }: MealCardProps) {
  return (
    <div className="..." onClick={onClick}>
      {/* Même contenu */}
    </div>
  );
}

// Dans NutritionPage.tsx
import { MealCard } from './nutrition/MealCard';
```

#### 3.3 Critères d'extraction
- ✅ Le composant a une responsabilité unique
- ✅ Il peut être testé isolément
- ✅ Il est réutilisable dans d'autres pages
- ✅ Il réduit significativement la taille du fichier parent

---

### PHASE 4 : UNIFICATION DES ANIMATIONS
**Objectif :** Utiliser Framer Motion de manière cohérente

#### 4.1 Pattern Framer Motion standardisé
```typescript
// Animation d'entrée standard
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

// Sur un élément
<motion.div {...fadeInUp}>
  Contenu
</motion.div>

// Animation de liste
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Utilisation
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

#### 4.2 Conversion GSAP → Framer Motion
```typescript
// AVANT (GSAP)
useEffect(() => {
  gsap.fromTo('.card', 
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }
  );
}, []);

// APRÈS (Framer Motion)
<motion.div
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
```

---

### PHASE 5 : OPTIMISATION DES STORES ZUSTAND
**Objectif :** Éviter les re-renders inutiles

#### 5.1 Pattern de sélecteur optimisé
```typescript
// src/lib/store/selectors.ts
import { useShallow } from 'zustand/react/shallow';

// ❌ MAUVAIS - Crée un nouvel objet à chaque render
const { tasks, goals } = useAppStore(state => ({
  tasks: state.tasks,
  goals: state.goals,
}));

// ✅ BON - Avec useShallow
const { tasks, goals } = useAppStore(
  useShallow(state => ({
    tasks: state.tasks,
    goals: state.goals,
  }))
);

// ✅ ENCORE MIEUX - Sélecteurs individuels
const tasks = useAppStore(state => state.tasks);
const goals = useAppStore(state => state.goals);
```

#### 5.2 Sélecteurs dérivés mémoisés
```typescript
// Sélecteur de base
const selectGoals = (state: AppState) => state.goals;

// Sélecteur dérivé avec reselect
import { createSelector } from 'reselect';

export const selectActiveGoals = createSelector(
  [selectGoals],
  (goals) => goals.filter(g => g.status === 'active')
);

export const selectGoalsByPeriod = (period: string) =>
  createSelector([selectGoals], (goals) =>
    goals.filter(g => g.period === period)
  );
```

---

### PHASE 6 : CONSOLIDATION DES API ROUTES
**Objectif :** Centraliser la logique API (optionnel)

#### 6.1 Structure actuelle (à conserver)
```
src/app/api/
├── tasks/route.ts
├── goals/route.ts
├── events/route.ts
├── habits/route.ts
├── notes/route.ts
├── users/route.ts
├── categories/route.ts
├── meals/route.ts
├── nutrition-profile/route.ts
├── sport-profile/route.ts
├── spirit-conversations/route.ts
├── spirit-messages/route.ts
├── habit-logs/route.ts
├── voice-memos/route.ts
└── ...
```

#### 6.2 Pattern standardisé
```typescript
// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Récupérer
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || 'mindlife-user';
    const items = await db.task.findMany({
      where: { userId },
      include: { category: true }
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

// POST - Créer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || 'mindlife-user';
    
    const item = await db.task.create({
      data: {
        id: body.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...body,
        userId,
      }
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

// PUT - Mettre à jour
export async function PUT(request: NextRequest) {
  // ...
}

// DELETE - Supprimer
export async function DELETE(request: NextRequest) {
  // ...
}
```

---

## 🚀 MÉTHODE DE CRÉATION DU SCRIPT SETUP AUTOMATIQUE

### 1. Créer le script
**Fichier :** `scripts/setup-fresh.ts`

### 2. Structure du script
```typescript
#!/usr/bin/env bun
/**
 * MindLife - Script d'installation fraîche complète
 * Usage: bun run setup
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = process.cwd();

// Étapes du script:
// 1. Vérifier Bun
// 2. Nettoyer anciens fichiers (optionnel)
// 3. Créer .env
// 4. Installer dépendances (bun install)
// 5. Générer Prisma client
// 6. Créer tables DB (prisma db push)
// 7. Peupler DB (seed)
// 8. Vérification finale
```

### 3. Contenu du .env à générer
```env
# MindLife - Configuration locale
DATABASE_URL="file:./db/custom.db"
USE_LOCAL_AI=true
USE_LOCAL_TTS=true
USE_LOCAL_ASR=true
USE_LOCAL_SPEECH=true
USE_LOCAL_SEARCH=true
AI_PROVIDER=local
AI_USE_FALLBACK=true
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

### 4. Ajouter le script au package.json
```json
{
  "scripts": {
    "setup": "bun run scripts/setup-fresh.ts",
    "dev": "next dev",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:seed": "bun run scripts/seed-db.ts"
  }
}
```

---

## 📦 MÉTHODE DE PRÉPARATION DU ZIP COMPLET

### 1. Fichiers à inclure
```
mindlife/
├── src/                    # Code source complet
├── prisma/                 # Schéma DB
│   └── schema.prisma
├── public/                 # Images et assets
├── scripts/                # Scripts d'installation
│   ├── setup-fresh.ts
│   └── seed-db.ts
├── db/                     # Dossier pour la DB (vide dans le ZIP)
├── package.json            # Dépendances + scripts
├── bun.lock                # Lock file
├── tsconfig.json           # Config TypeScript
├── tailwind.config.ts      # Config Tailwind
├── components.json         # Config shadcn/ui
├── next.config.ts          # Config Next.js
├── .env.example            # Template .env
├── README-INSTALL.md       # Instructions
├── WORK_DAY.md             # Historique travaux
├── METHOD_RESTART.md       # Ce fichier
└── NICO_MEMORY.md          # Contexte
```

### 2. Fichiers à EXCLURE
```
node_modules/           # Trop volumineux
db/custom.db           # DB vide de préférence
.next/                 # Build cache
.env                   # Config locale (mettre .env.example)
*.log                  # Logs
```

### 3. Commande de création du ZIP
```bash
# Depuis /home/z/my-project/
cd /home/z/my-project/public

zip -r MindLife_complete.zip \
  src/ \
  prisma/ \
  public/ \
  scripts/ \
  package.json \
  bun.lock \
  tsconfig.json \
  tailwind.config.ts \
  components.json \
  next.config.ts \
  .env.example \
  README-INSTALL.md \
  WORK_DAY.md \
  METHOD_RESTART.md \
  NICO_MEMORY.md \
  -x "node_modules/*" \
  -x "db/custom.db" \
  -x ".next/*" \
  -x "*.log"
```

### 4. README-INSTALL.md à créer
```markdown
# MindLife - Installation

## Prérequis
- Bun (https://bun.sh)

## Installation (UNE SEULE COMMANDE !)
\`\`\`bash
bun run setup
\`\`\`

## Démarrage
\`\`\`bash
bun run dev
\`\`\`

## Application
http://localhost:3000

## Comptes de test
- admin@mindlife.app (Admin)
- john@mindlife.app
- mike@mindlife.app
- sarah@mindlife.app
- emma@mindlife.app
```

---

## ✅ CHECKLIST DE VÉRIFICATION FINALE

### Avant de dire "terminé"
- [ ] `bun run lint` passe sans erreur
- [ ] `tail -30 dev.log` ne montre pas d'erreur
- [ ] L'app se charge dans le preview panel
- [ ] Les pages principales fonctionnent (Dashboard, Tasks, Goals, Calendar, Nutrition)
- [ ] Les créations CRUD fonctionnent (Task, Goal, Event)
- [ ] Le script `bun run setup` fonctionne sur une fresh install

### Avant de créer le ZIP
- [ ] WORK_DAY.md est à jour
- [ ] METHOD_RESTART.md existe
- [ ] .env.example existe
- [ ] README-INSTALL.md existe
- [ ] Le ZIP exclut node_modules et .next

---

## 🎯 RÉSUMÉ DES RÉDUCTIONS DE CODE

| Page | Avant | Après | Réduction |
|------|-------|-------|-----------|
| NutritionPage.tsx | 2487 lignes | 1369 lignes | **-45%** |
| GoalsPage.tsx | 2260 lignes | 1994 lignes | **-12%** |
| CalendarPage.tsx | 1901 lignes | 825 lignes | **-57%** |
| **TOTAL** | **6648 lignes** | **4188 lignes** | **-37%** |

---

## 🔧 COMMANDES UTILES

```bash
# Démarrer le serveur
bun run dev

# Vérifier le code
bun run lint

# Setup complet (nouvelle installation)
bun run setup

# Seed seul
bun run db:seed

# Voir les logs
tail -30 dev.log

# Créer le ZIP
cd public && zip -r MindLife_complete.zip [fichiers...]
```

---

## ⚠️ POINTS D'ATTENTION CRITIQUES

1. **userId par défaut :** TOUJOURS utiliser `mindlife-user`
2. **localStorage key :** `mindlife-storage-v4`
3. **DB :** SQLite dans `db/custom.db`
4. **Fallback API :** `userId || 'mindlife-user'`
5. **ID auto-généré :** Toujours ajouter `id: item-${Date.now()}-${random}`

---

## 💚 MESSAGE POUR LE FRÉROT DU LENDEMAIN

**FRÉROT !** 🦞💚

Si tu lis ce fichier, c'est qu'on a besoin de tout recommencer ou de continuer le travail.

**Voici ce que tu dois faire :**

1. **LIRE** WORK_DAY.md pour savoir où on en est
2. **LIRE** ce fichier (METHOD_RESTART.md) pour la méthode
3. **VÉRIFIER** l'état du projet avec les commandes
4. **APPLIQUER** les phases de refactorisation si nécessaire
5. **CRÉER** le script setup-fresh.ts si nécessaire
6. **PRÉPARER** le ZIP si nécessaire
7. **METTRE À JOUR** WORK_DAY.md avec tes travaux

**ON EST UNE ÉQUIPE DE WINNER !** 💪

**MERCI DE CONTINUER LE TRAVAIL !**

**BIZ BIZ BIZ !** 🦞💚

---

*Document créé le 12 Avril 2026 - Méthode de Redémarrage Automatique*
