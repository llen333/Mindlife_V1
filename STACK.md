# STACK.md — Architecture technique de Mindlife

## 1. TECH STACK

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 16 (Turbopack) | Framework full-stack, App Router |
| TypeScript | 5 | Langage |
| Tailwind CSS | 4 | Styles utilitaires |
| Zustand | 5 | State management (stores) |
| @tanstack/react-query | ~5 | Data fetching (React Query) |
| Framer Motion | ~11 | Animations SPA |
| GSAP | ~3 | Animations avancées (dashboard) |
| shadcn/ui | latest | Composants UI (Radix primitives) |
| Lucide React | latest | Icônes |
| Recharts | ~2 | Graphiques |
| react-hook-form + zod | latest | Formulaires + validation |
| @dnd-kit | latest | Drag & drop |
| next-auth | ~4 | Authentification (non utilisée) |

### Backend / Data
| Technologie | Version | Usage |
|-------------|---------|-------|
| Prisma | 6 | ORM, schéma unique |
| SQLite | (file) | Base de données actuelle |
| Convex | (inactif) | Plateforme backend (installé, pas utilisé) |

### AI / Agents
| Technologie | Usage |
|-------------|-------|
| z.ai (API) | Provider LLM principal : `glm-4.5-air` |
| OpenAI-compatible | Fallback providers (Gemini, Groq, OpenRouter...) |
| DuckDuckGo | Web search (via HTML scraping) |
| Marmiton / 750g | Scraping de recettes |
| SpeechSynthesis API | TTS dans Nutrition |

### Autres
| Technologie | Usage |
|-------------|-------|
| Socket.io | Mini-service socket (installé, usage partiel) |
| Bun | Runtime pour mini-services |
| Caddy | Reverse proxy (déploiement) |

---

## 2. ARBORESCENCE COMMENTÉE

```
Mindlife_V11a/
├── AGENTS.md                 # Mémoire projet pour LLMs (LIS-MOI D'ABORD)
├── WORKFLOW.md               # Règles de travail (3 verrous)
├── APP.md                    # Description fonctionnelle
├── STACK.md                  # Architecture technique (ce fichier)
├── ROADMAP.md                # Plan d'action et paliers
│
├── src/
│   ├── app/
│   │   ├── page.tsx          # SPA router (activePanel)
│   │   ├── layout.tsx        # Root layout (Providers, ErrorBoundary)
│   │   ├── globals.css       # Styles globaux Tailwind
│   │   ├── agents/page.tsx   # Page agents (standalone)
│   │   └── api/              # 67 routes API
│   │       ├── meals/        # CRUD repas + génération + historique
│   │       ├── agents/       # CRUD agents + mémoires + sessions
│   │       ├── sport/        # Profil, séances, programmes, stats
│   │       ├── management/   # Transactions, factures, courses, épargne
│   │       ├── youtube/      # Search, transcription, résumé, chat
│   │       ├── scrape/       # Scraping web
│   │       └── ...           # (tâches, objectifs, événements, etc.)
│   │
│   ├── components/
│   │   ├── dashboard/        # Dashboard principal + composants
│   │   ├── nutrition/        # Module alimentation complet
│   │   ├── agents/           # Dashboard agents + SkillManager
│   │   ├── settings/         # Paramètres (8 onglets)
│   │   ├── spirit/           # Module Esprit (Psyche, archives...)
│   │   ├── sport/            # Module Sport (Atlas, KPIs...)
│   │   ├── growth/           # Module Croissance (6 sections)
│   │   ├── management/       # Module Finances (6 composants)
│   │   ├── calendar/         # Calendrier (pages + modales)
│   │   ├── goals/            # Objectifs (pages + modales)
│   │   ├── hub-alimentaire/  # Hub nutritionnel (nouveau)
│   │   ├── ui/               # Composants shadcn (40+)
│   │   ├── SleepPage.tsx     # Module sommeil (fichier unique)
│   │   ├── AssistantChat.tsx # Assistant flottant
│   │   └── ...               # Pages legacy
│   │
│   ├── lib/
│   │   ├── stores/           # 17 stores Zustand
│   │   │   ├── types.ts      # Types partagés (Meal, Task, Goal...)
│   │   │   ├── index.ts      # Hook useStore() composite
│   │   │   ├── mappers.ts    # Transformations DB → store
│   │   │   ├── nutritionStore.ts
│   │   │   ├── userStore.ts
│   │   │   ├── tasksStore.ts
│   │   │   └── ...
│   │   ├── ai-tools.ts       # 20 outils LLM (CRUD via Prisma)
│   │   ├── agent-tools.ts    # Détection d'intention (30+ patterns)
│   │   ├── agent-actions.ts  # Actions concrètes (scraping, search)
│   │   ├── agent-skills.ts   # Définitions des compétences agents
│   │   ├── ai-provider.ts    # Multi-provider LLM
│   │   ├── ai-config.ts      # Configuration IA + prompts systèmes
│   │   ├── ai-fallback.ts    # Réponses locales sans LLM
│   │   ├── services/
│   │   │   └── agent-service.ts  # Orchestrateur Plan & Execute
│   │   ├── hooks/            # React Query hooks
│   │   ├── constants/        # Options de configuration
│   │   └── data/             # Données statiques (meals)
│   │
│   └── hooks/                # Hooks génériques
│
├── prisma/
│   └── schema.prisma         # 42 modèles, SQLite
│
├── scripts/                  # Scripts utilitaires (seed, backup...)
├── convex/                   # Convex (inactif)
├── mini-services/            # Socket.io (usage partiel)
└── FREROT_*/                 # Archives de sessions LLM
```

---

## 3. STORES ZUSTAND — Dépendances et flux

```
                    ┌──────────────────┐
                    │  navigationStore │ (activePanel)
                    └────────┬─────────┘
                             │
    ┌───────────────┬────────┴────────┬───────────────┐
    ▼               ▼                 ▼               ▼
nutritionStore  tasksStore       goalsStore      eventsStore
    │               │                 │               │
    ├─ meals        ├─ tasks          ├─ goals        ├─ events
    ├─ profile      ├─ CRUD           ├─ jalons       ├─ CRUD
    └─ nutrition    └─ + filter       └─ + calc       └─ + filter
       profile                                          
                                                      
    ┌───────────────┬───────────────┬───────────────────┐
    ▼               ▼               ▼                   ▼
habitsStore    journalStore    notesStore        sleepStore
    │               │               │                   │
    ├─ habits       ├─ entries      ├─ notes            ├─ sleepEntries
    ├─ logs         ├─ mood/wins    ├─ archive/pin      └─ CRUD
    └─ streaks      └─ CRUD         └─ CRUD

    ┌───────────────┬───────────────┬───────────────────┐
    ▼               ▼               ▼                   ▼
userStore      settingsStore   chatStore       voiceMemosStore
    │               │               │                   │
    ├─ currentUser  ├─ theme/lang   ├─ messages         ├─ memos
    ├─ users[]      ├─ sidebar      └─ clear            └─ CRUD
    └─ profile      └─ loading
```

---

## 4. BASE DE DONNÉES (42 modèles)

### Modèles principaux (30)
| Modèle | Lignes estimées | Relations |
|--------|----------------|-----------|
| User | ~5 | Central (lié à tout) |
| Task | ~50 | → User, Category, Event |
| Event | ~50 | → User, Category, Goal |
| Goal | ~20 | → User, Category |
| Habit | ~20 | → User, Category |
| HabitLog | ~200 | → Habit |
| Note | ~30 | → User, Category |
| JournalEntry | ~30 | → User |
| Category | ~10 | → User (lié à Event, Goal, Habit, Task, Note) |
| Meal | ~100 | → User |
| MealPlan | ~10 | → User |
| WeightEntry | ~50 | → User |
| SleepEntry | ~30 | → User |
| NutritionProfile | ~5 | → User (1:1) |
| ChatMessage | ~200 | → User |
| VoiceMemo | ~10 | → User |
| MediaItem | ~10 | → User |
| Transaction | ~30 | → User |
| RecurringBill | ~5 | → User |
| ShoppingList | ~10 | → User + ShoppingItem |
| ShoppingItem | ~30 | → ShoppingList |
| SavingsGoal | ~5 | → User |
| SportProfile | ~5 | → User (1:1) + SportGoal, WeeklyProgram, WorkoutSession |
| SportGoal | ~10 | → SportProfile |
| BiometricData | ~30 | → SportProfile |
| WeeklyProgram | ~5 | → SportProfile + ProgramDay |
| ProgramDay | ~20 | → WeeklyProgram + DayExercise |
| DayExercise | ~50 | → ProgramDay |
| WorkoutSession | ~20 | → SportProfile + SessionExercise |
| SessionExercise | ~60 | → WorkoutSession |

### Modèles agents (8)
| Modèle | Usage |
|--------|-------|
| Agent | Configuration d'un agent IA |
| AgentMemory | Mémoire persistante (STM/MTM/LTM) |
| AgentSession | Session de conversation |
| AgentChatMessage | Messages dans une session |
| AgentState | État de synchronisation |
| AgentMessage | Messagerie inter-agents |
| PersonaPattern | Réponses par pattern |
| InteractionHistory | Historique des interactions |

### Modèles utilitaires (4)
| Modèle | Usage |
|--------|-------|
| ScrapedRecipe | Recettes scrapées |
| ScrapedExercise | Exercices scrapés |
| UserPreference | Préférences apprises |
| TempData | Données temporaires |

---

## 5. API ROUTES (67 routes)

### CRUD standards
- `/api/meals` `[GET, POST, DELETE]` + `/api/meals/save` `[POST]` + `/api/meals/generate` `[POST]` + `/api/meals/history` `[GET]`
- `/api/tasks` `[GET, POST, PUT, DELETE]`
- `/api/events` `[GET, POST, PUT, DELETE]`
- `/api/goals` `[GET, POST, PUT, DELETE]`
- `/api/habits` `[GET, POST, PUT, DELETE]`
- `/api/habit-logs` `[GET, POST, DELETE]`
- `/api/notes` `[GET, POST, PUT, DELETE]`
- `/api/journal` `[GET, POST, PUT, DELETE]`
- `/api/categories` `[GET, POST, PUT, DELETE]`
- `/api/sleep` `[GET, POST, PUT, DELETE]`
- `/api/weight` `[GET, POST]`
- `/api/nutrition-profile` `[GET, PUT]`
- `/api/meal-plans` `[POST]`

### Agents
- `/api/agents` `[POST]` — CRUD agents + mémoires + sessions
- `/api/agent-service` `[POST]` — Orchestrateur Plan & Execute
- `/api/smart-agent` `[POST]` — Agent intelligent
- `/api/ai-agent` `[POST]` — Agent IA générique
- `/api/oracle-psyche` `[POST]` — Oracle Psyche
- `/api/assistant` `[POST]` — Assistant conversationnel

### AI / Chat
- `/api/chat` `[POST]`
- `/api/spirit-chat` `[POST]`
- `/api/spirit-conversations` `[POST]`
- `/api/nutrition-ai` `[POST]`
- `/api/generate-recipe` `[POST]`
- `/api/tts` `[POST]` — Text-to-Speech
- `/api/asr` `[POST]` — Automatic Speech Recognition
- `/api/speech` `[POST]`
- `/api/test-tools` `[GET, POST]`

### YouTube
- `/api/youtube/search` `[POST]`
- `/api/youtube/transcript` `[POST]`
- `/api/youtube/summary` `[POST]`
- `/api/youtube/chat` `[POST]`

### Sport
- `/api/sport/profile` `[GET, POST]`
- `/api/sport/session` `[GET, POST]`
- `/api/sport/stats` `[GET]`
- `/api/sport/goals` `[GET, POST]`
- `/api/sport/program` `[GET, POST]`
- `/api/sport/biometrics` `[GET, POST]`
- `/api/sport/atlas` `[GET, POST]`

### Management
- `/api/management/transactions` `[GET, POST]` + `/[id]` `[GET, PUT, DELETE]`
- `/api/management/bills` `[GET, POST]` + `/[id]` `[GET, PUT, DELETE]`
- `/api/management/shopping` `[GET, POST]` + `/[listId]/items` `[GET, POST, PUT]` + `/items/[itemId]` `[PUT, DELETE]`
- `/api/management/savings` `[GET, POST]` + `/[id]` `[GET, PUT, DELETE]`

### Système
- `/api/users` `[GET, POST]`
- `/api/media-items` `[GET, POST]`
- `/api/voice-memos` `[GET, POST]`
- `/api/scrape` `[POST]`
- `/api/scraper` `[POST]`
- `/api/search` `[POST]`
- `/api/backup` `[POST]` + `/api/backup/restore` `[POST]`
- `/api/export` `[POST]`
- `/api/import` `[POST]`
- `/api/restore` `[POST]`
- `/api/sync` `[POST]`
- `/api/seed` `[POST]`

---

## 6. ARCHITECTURE DES AGENTS

### Plan & Execute (agent-service.ts)
```
Message → Intent Detection → Planning → Execution → Memory Update → Response
                                     ↓
                              Tool Execution
                              (DB CRUD, Web, Scrape...)
```

### Système de mémoire
```
STM (session en cours, importance 4-5)
  │ consolidation
  ▼
MTM (inter-sessions, importance 2-3)
  │ consolidation périodique
  ▼
LTM (permanent, importance 1)
```

### Outils disponibles pour les agents (20, dans ai-tools.ts)
`create_event, get_events, update_event, delete_event, search_recipes, save_meal, get_meals, create_meal_plan, get_meal_plan, create_shopping_list, get_shopping_lists, create_task, get_tasks, log_weight, log_sleep, log_sport_session, web_search, scrape_url, save_note, get_notes`

### Détection d'intention (agent-tools.ts)
30+ patterns regex détectant : recherche web, scraping recette, création événement/tâche/objectif, exécution de code, sauvegarde note, etc.

---

## 7. CONFIGURATION IA

### Provider principal
- **Plateforme** : z.ai
- **Modèle** : `glm-4.5-air`
- **Stockage API key** : localStorage

### Fallback (quand LLM indisponible)
- Nutrition : `nutrition-fallback.ts` (réponses locales pré-écrites)
- Sport : `sport-fallback.ts` (programmes génériques)
- Chat : `ai-fallback.ts` (réponses psychologue, ami, stoïcien)

### Prompts systèmes disponibles
Spirit, assistant nutrition, coach sportif, chat général, calendrier, objectifs, tâches

---

## 8. PROBLÈMES TECHNIQUES CONNUS

| Problème | Fichiers concernés | Gravité |
|----------|-------------------|---------|
| Type `Meal` dupliqué | `stores/types.ts` vs `nutrition/types.ts` | Haute |
| Pas de tests automatisés | — | Haute |
| Pas de git jusqu'au 30/05 | — | Haute (résolu) |
| Stores legacy (store.ts, store/) | `lib/store.ts`, `lib/store/` | Moyenne |
| Convex installé mais inactif | `convex/`, package.json | Basse |
| Pages placeholder vides | Culture, Santé, Synthèse IA | Basse |
| `any` dans certains mappers | `stores/mappers.ts` | Moyenne |
| 2 copies de projet parallèles | `Mindlife_V11`, `Mindlife_V11a copie` | Basse |
