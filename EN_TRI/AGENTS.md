# MINDLIFE — Projet Personnel avec Agents IA

## 1. IDENTITÉ

Application Next.js 16 (Turbopack) de gestion de vie personnelle avec agents IA.
Stack : Next.js 16 + Prisma (SQLite) + Zustand + Tailwind CSS 4 + TypeScript 5.
Port local : 3090 | `npm run dev`

## 2. ARCHITECTURE (vue d'ensemble)

```
src/
├── app/                     # Next.js App Router (pages + API routes)
│   ├── page.tsx             # Routeur central avec activePanel
│   └── api/                 # Routes API (meals, agents, tasks, etc.)
├── components/
│   ├── agents/              # Dashboard + gestion des agents IA
│   ├── nutrition/           # Page Alimentation (MealGrid, DailyTracking...)
│   ├── dashboard/           # Tableau de bord
│   ├── calendar/            # Calendrier
│   ├── goals/               # Objectifs
│   ├── tasks/               # Tâches
│   ├── sport/               # Sport
│   ├── sleep/               # Sommeil
│   └── settings/            # Paramètres (dont section agent)
├── lib/
│   ├── stores/              # Zustand stores (1 store par domaine)
│   │   ├── index.ts         # Hook useStore() composite (compatibilité)
│   │   ├── nutritionStore.ts
│   │   ├── userStore.ts
│   │   ├── tasksStore.ts
│   │   └── ...
│   ├── store.ts             # Réexport principal
│   ├── ai-tools.ts          # Outils IA (exécution Prisma)
│   ├── agent-tools.ts       # Détection d'intention agents
│   ├── agent-actions.ts     # Actions concrètes (scraping, recherche)
│   └── services/
│       └── agent-service.ts # Orchestrateur Plan & Execute
└── prisma/
    └── schema.prisma        # 44 modèles, SQLite
```

## 3. ÉTAT ACTUEL (30 Mai 2026)

### ✅ Ce qui marche
- App se lance et répond (HTTP 200)
- Navigation entre tous les panneaux (dashboard, calendrier, tâches, objectifs, nutrition, sport, sommeil, paramètres, agents)
- Page Alimentation : grille hebdo avec données statiques, tracking quotidien, stats
- Agents Dashboard : liste des agents, mémoires (STM/MTM/LTM), sessions
- API routes fonctionnelles (meals, agents, tasks, goals, events...)
- Plan & Execute orchestrator de base fonctionnel
- Scraping de recettes (Marmiton, 750g) fonctionnel

### ⚠️ Problèmes connus
- **124 erreurs TypeScript restantes** dans les composants (API routes: 0 erreur)
  - Session 30/05 : 333 → 124 (209 corrigées)
  - `NutritionPage.tsx` (9) — `RefObject<null>` vs `RefObject`
  - `HabitsPanel.tsx` (8) — `never` type sur `habit.logs`
  - `CalendarPage.tsx` (9) — `never` type sur tableaux
  - `GoalModal.tsx` (6) — types `Goal`/`GoalMilestone`
  - `RoutineBuilder.tsx` (5) — `GrowthRoutine` type
  - `useVoiceRecording.ts` (5) — `SpeechRecognition` API
  - Autres composants dispersés (~160)
- **Store fragmenté** : chaque store a son propre `Meal` type — le mapping entre DB ↔ store ↔ composant n'est pas unifié. Ça cause des bugs d'affichage (ex: grille hebdo vide).
- **Pas de tests automatisés** — toute modification est risquée
- **Git** initialisé ✅ (snapshot + docs + fixes commités)
- **LLM Provider** : configuré pour z.ai (`glm-4.5-air`). Changements de provider récents (Google) ont causé des bugs.

### 🚧 En cours
- Palier 1 : stabilisation TypeScript (API routes: ✅ 0 erreur, composants: ⏳ 124 restantes)
- Fix de l'affichage des repas (grille hebdo)

### 📋 TODO global (priorisé)
1. **~~Initialiser git~~** ✅ (5 commits, 571 fichiers)
2. **Corriger toutes les erreurs TypeScript** (200 restantes dans composants)
3. **Unifier le type `Meal`** : un seul type source de vérité (Prisma), mapper propre pour l'affichage
4. **Tester chaque page manuellement** (navigation, CRUD, rendu)
5. **Ajouter un script de vérification** (`npm run build && curl localhost:3090`)
6. **Migration PostgreSQL + pgvector** (après stabilisation complète)
7. **RAG fonctionnel** (embeddings → retrieval → contexte agents)
8. **Vrais agents capables** (génération de programmes, routines adaptatives)

## 4. RÈGLES POUR TOUT LLM TRAVAILLANT SUR CE PROJET

### AVANT de modifier quoi que ce soit
1. **LIRE ce fichier en entier** (tu es en train de le faire ✓)
2. **Lancer `npm run build`** (ou `tsc --noEmit`) pour voir l'état actuel des erreurs
3. **Vérifier que le serveur tourne** : `curl http://localhost:3090`
4. **DEMANDER** avant toute modification qui touche à plus d'un fichier

### PENDANT les modifications
1. **Une seule chose à la fois** — ne pas corriger 3 bugs en parallèle
2. **Ne jamais modifier** : `prisma/schema.prisma` sans demander
3. **Ne jamais modifier** : `src/lib/ai-tools.ts` (outils critiques) sans validation
4. **Ne jamais modifier** : `src/lib/store.ts` ou `src/lib/stores/index.ts` sauf pour un bug précis
5. **Toute modification DOIT** être testée (build + curl) avant de passer à la suivante

### APRÈS chaque modification
1. `npm run build` (ou `tsc --noEmit`) — pas de nouvelles erreurs
2. `curl http://localhost:3090` — HTTP 200
3. Si erreur → **rollback immédiat** (défaire la modification)
4. Mettre à jour ce fichier (section 3 → État actuel)

### NE PAS FAIRE
- Ne pas "réparer" des parties qui marchent juste parce que le style ne plaît pas
- Ne pas changer l'architecture globale (Plan & Execute, stores Zustand)
- Ne pas proposer de migration PostgreSQL sans que l'utilisateur valide
- Ne pas ajouter de dépendances npm sans demander
- Ne pas supprimer de code "qui ne sert à rien" — demander d'abord
- Ne pas lancer `npx prisma migrate` ou `db push` sans accord explicite

## 5. DERNIÈRES MODIFICATIONS (30 Mai 2026)

| Fichier | Modification | Raison |
|---------|-------------|--------|
| `toute la session` | Suppression de Convex + fix i18n + fix 67 erreurs TS dans API routes | Palier 1 — stabilisation |
| `src/app/api/habit-logs/route.ts` | `habit` → `Habit` (Prisma relation PascalCase) | Erreur TS |
| `src/app/api/users/route.ts` | `let bmr = null` → `let bmr: number \| null = null` | Erreur TS |
| `src/app/api/sport/*/route.ts` | `sportGoals` → `SportGoal`, ajout `id` dans creates, `exercises` → `SessionExercise` | Erreurs TS Prisma |
| `src/app/api/meals/*/route.ts` | Ajout `id` dans creates, type `GeneratedMeal`, `const X: any[] = []` | Erreurs TS Prisma + `never` |
| `src/app/api/{tasks,goals,categories,habits,journal,notes,voice-memos}/route.ts` | Ajout `id` dans creates Prisma (modèles sans `@default` sur `@id`) | Erreurs TS Prisma |
| `src/app/api/speech/route.ts` | `'tts' as any` et `'asr' as any` | `FunctionMap` type trop étroit |
| `src/app/api/test-tools/route.ts` | Suppression import mort `callOpenAICompatibleDirect` | Export supprimé |
| `src/app/api/nutrition-profile/route.ts` | Ajout `id` dans upsert.create et create | Erreur TS |
| `src/lib/nutrition-fallback.ts` | Export de `Ingredient` | Nécessaire pour `GeneratedMeal` |
| `src/lib/hooks.ts` | Supprimé (legacy) | Masquait `hooks/index.ts` dans la résolution TS |
| `src/components/nutrition/NutritionPage.tsx` | RefObject null + Meal types + Date string | 11 erreurs TS |
| `src/components/HabitsPanel.tsx` | `const days = []` → typé | 11 erreurs `never` |
| `src/components/calendar/CalendarPage.tsx` | `const x = []` → typé (Date[], string[], ReactNode[]) | 9 erreurs `never` |
| `src/components/goals/GoalModal.tsx` | Champs supprimés (completedMilestones, actions) | 6 erreurs types |
| `src/components/sport/components/HistoryPanel.tsx` | Tableaux typés | 6 erreurs `never` |
| `src/components/growth/sections/PsycheSection.tsx` | `c.masteryLevel ?? 0` | 4 erreurs undefined |
| `src/components/growth/components/RoutineBuilder.tsx` | `routine.type` → champ réel + `icon` → champ réel | 5 erreurs types |
| `src/components/goals/GoalCard.tsx` | `goal.category` → `goal.categoryId` | 2 erreurs |
| `src/components/goals/GoalsPanel.tsx` | `milestone.isCompleted` → `milestone.completed` | 2 erreurs |

## 6. CONTEXTE CRITIQUE (ce que les LLMs oublient toujours)

- **L'utilisateur paie pour chaque token** — les modifications hasardeuses coûtent cher
- **Le modèle LLM utilisé est `glm-4.5-air`** — il peut halluciner de l'exécution sans retour d'outil
- **L'user ID par défaut est `mindlife-user`** — testé en local avec `DEFAULT_USER_ID = 'mindlife-user'`
- **Le port est 3090** — pas 3000
- **L'app est un SPA avec activePanel** — pas de pages multiples, tout passe par `app/page.tsx`
- **Les stores sont migrés vers des stores individuels** — `useStore()` est un wrapper de compatibilité
- **Les types Meal sont DUPLIQUÉS** entre `stores/types.ts` et `components/nutrition/types.ts` — c'est un problème connu, ne pas "corriger" sans plan
