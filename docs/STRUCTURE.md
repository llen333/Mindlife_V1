# MindLife - Documentation Structure Complete

## 📁 Structure du Projet

```
/home/z/my-project/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Page principale (route /)
│   │   ├── layout.tsx                  # Layout global
│   │   └── api/                        # API Routes
│   │       ├── users/route.ts          # Gestion utilisateurs
│   │       ├── sport/                  # APIs Sport
│   │       │   ├── profile/route.ts
│   │       │   ├── biometrics/route.ts
│   │       │   ├── program/route.ts
│   │       │   ├── session/route.ts
│   │       │   ├── goals/route.ts
│   │       │   ├── stats/route.ts
│   │       │   └── atlas/route.ts
│   │       ├── meals/                  # APIs Nutrition
│   │       │   ├── route.ts
│   │       │   ├── generate/route.ts
│   │       │   └── history/route.ts
│   │       ├── nutrition-profile/route.ts
│   │       ├── goals/route.ts
│   │       ├── tasks/route.ts
│   │       ├── habits/route.ts
│   │       ├── habit-logs/route.ts
│   │       ├── notes/route.ts
│   │       ├── journal/route.ts
│   │       ├── categories/route.ts
│   │       ├── voice-memos/route.ts
│   │       └── assistant/route.ts
│   │
│   ├── components/
│   │   ├── MindLifeSidebar.tsx         # Sidebar navigation
│   │   ├── MindLifeHeader.tsx          # Header unifié
│   │   ├── DashboardPage.tsx           # Dashboard principal
│   │   ├── SportPage.tsx               # Page Sport
│   │   ├── NutritionPage.tsx           # Page Nutrition/Alimentation
│   │   ├── HubAlimentairePage.tsx      # Hub alimentaire
│   │   ├── SleepPage.tsx               # Page Sommeil
│   │   ├── SpiritPage.tsx              # Page Esprit/Spiritualité
│   │   ├── CalendarPage.tsx            # Page Calendrier
│   │   ├── GoalsPage.tsx               # Page Objectifs
│   │   ├── SettingsPage.tsx            # Page Paramètres
│   │   └── ui/                         # Composants shadcn/ui
│   │
│   └── lib/
│       ├── store.ts                    # Store Zustand (état global)
│       ├── db.ts                       # Client Prisma
│       ├── i18n.ts                     # Internationalisation
│       └── utils.ts                    # Utilitaires
│
├── prisma/
│   └── schema.prisma                   # Schéma base de données
│
├── db/
│   └── dev.db                          # Base SQLite
│
├── docs/
│   └── STRUCTURE.md                    # Ce fichier
│
└── scripts/
    └── restore-all.ts                  # Script restauration complete
```

---

## 👤 Utilisateurs par Défaut

| ID | Email | Name | Régime | Allergies |
|----|-------|------|--------|-----------|
| `mindlife-user` | mindlife-user@mindlife.app | Utilisateur MindLife | balanced | - |
| `user-1` | mindlife@mindlife.app | Mindlife.user | balanced, mediterranean | - |
| `user-2` | john@mindlife.app | John | high_protein, low_carb, Végétarien, Méditerranéen | peanuts, Gluten |
| `user-1772634370468` | user-1772634370468@mindlife.app | Mike | balanced | - |

**Note**: L'ID par défaut est `mindlife-user` partout (store, APIs, etc.)

---

## 🗄️ Schéma Base de Données (Prisma)

### Tables Principales

#### User
```prisma
model User {
  id                 String   @id
  email              String   @unique
  name               String?
  avatar             String?
  bio                String?
  phone              String?
  birthDate          DateTime?
  timezone           String   @default("Europe/Paris")
  country            String?
  city               String?
  // Physique
  weight             Float?
  height             Float?
  gender             String?
  // Objectifs
  mainGoal           String?
  activityLevel      String?
  // Nutrition
  dietaryPreferences String?   // JSON array: ["balanced", "mediterranean"]
  allergies          String?   // JSON array: ["peanuts", "Gluten"]
  favoriteCuisines   String?   // JSON array: ["french", "italian", "asian"]
  targetCalories     Float?
  proteinTarget      Float?
  carbsTarget        Float?
  fatTarget          Float?
  foodBudget         Float?
  foodBudgetPeriod   String?  @default("week")
  // Sport
  sportLevel         String?
  preferredSports    String?
  sportGoals         String?
  // Calculs auto
  bmr                Float?
  tdee               Float?
  imc                Float?
  // Relations
  SportProfile       SportProfile?
  Category           Category[]
  Task               Task[]
  Goal               Goal[]
  Note               Note[]
  Habit              Habit[]
  Event              Event[]
  JournalEntry       JournalEntry[]
  VoiceMemo          VoiceMemo[]
  SpiritConversation SpiritConversation[]
}
```

#### SportProfile
```prisma
model SportProfile {
  id              String   @id
  userId          String   @unique
  level           String   @default("intermediate")
  goals           String?
  preferredSports String?
  // Relations
  User            User             @relation(...)
  WeeklyProgram   WeeklyProgram[]
  WorkoutSession  WorkoutSession[]
  BiometricData   BiometricData[]
  SportGoal       SportGoal[]
}
```

#### BiometricData
```prisma
model BiometricData {
  id            String   @id
  profileId     String
  date          DateTime @default(now())
  weight        Float?
  muscleMass    Float?
  bodyFat       Float?
  hydration     Float?
  heartRateRest Int?
  hrv           Int?
  recoveryScore Int?
  energyLevel   Int?
  // Relations
  SportProfile  SportProfile @relation(...)
}
```

#### WeeklyProgram
```prisma
model WeeklyProgram {
  id          String   @id
  profileId   String
  name        String
  weekNumber  Int
  year        Int
  isActive    Boolean  @default(true)
  // Relations
  SportProfile SportProfile @relation(...)
  ProgramDay   ProgramDay[]
}
```

#### ProgramDay
```prisma
model ProgramDay {
  id                String   @id
  programId         String
  dayOfWeek         Int      // 0=Lundi, 6=Dimanche
  name              String
  type              String   @default("workout")
  intensity         Int?
  // Relations
  WeeklyProgram     WeeklyProgram    @relation(...)
  DayExercise       DayExercise[]
  WorkoutSession    WorkoutSession[]
}
```

#### WorkoutSession
```prisma
model WorkoutSession {
  id        String   @id
  profileId String
  dayId     String?
  date      DateTime @default(now())
  name      String
  status    String   @default("planned")
  duration  Int?
  intensity Int?
  // Relations
  SportProfile    SportProfile      @relation(...)
  ProgramDay      ProgramDay?       @relation(...)
  SessionExercise SessionExercise[]
}
```

#### MealPlan
```prisma
model MealPlan {
  id            String   @id
  userId        String
  date          DateTime
  meals         String   // JSON
  totalCalories Float
  notes         String?
}
```

#### SpiritConversation
```prisma
model SpiritConversation {
  id           String   @id
  userId       String
  archetype    String   // psychologue, ami, stoicien
  messages     String   // JSON array
  messageCount Int      @default(0)
  // Relations
  User         User     @relation(...)
}
```

---

## 📱 Pages Composants

### 1. DashboardPage
- **Fonction**: Page d'accueil avec vue d'ensemble
- **Features**: Stats rapides, widgets, accès aux autres pages
- **Store**: `activePanel`, `tasks`, `goals`

### 2. SportPage
- **Fonction**: Gestion des entraînements et biométrie
- **Features**:
  - Programme hebdomadaire (7 jours)
  - Sessions de workout (démarrer/terminer)
  - Biometrie KPIs (poids, muscle, hydratation, énergie)
  - Historique sur 30 jours
  - Atlas AI (recommandations)
- **APIs**: `/api/sport/*`
- **Sync userProfile**: `weight`, `sportLevel`

### 3. NutritionPage
- **Fonction**: Planification des repas
- **Features**:
  - 14 repas hebdomadaires (7 déjeuners + 7 dîners)
  - Génération AI des recettes
  - Filtres par type (lunch/dinner)
  - Mode shopping avec liste courses
  - **TTS Audio intégré** (lecture des recettes en français)
- **APIs**: `/api/meals/*`, `/api/nutrition-profile`
- **Sync userProfile**: `targetCalories`, `proteinTarget`, `foodBudget`, `avatar`

#### 🎧 TTS (Text-to-Speech) - NutritionPage

**Fonctionnalités**:
- **Lecture complète**: Clic sur "Écouter tout" → Lit toute la recette
- **Lecture par étape**: Clic sur une étape → Lit uniquement cette étape
- **Voix françaises**: Amélie (féminine) / Thomas (masculin)
- **Contrôles**: Play/Pause intégré dans la modale
- **Surbrillance**: L'étape en cours de lecture est mise en évidence

**Implementation**:
```typescript
// État TTS
const [isPlaying, setIsPlaying] = useState(false);
const [isPaused, setIsPaused] = useState(false);
const [selectedVoice, setSelectedVoice] = useState<'female-fr' | 'male-fr'>('female-fr');
const [readingMode, setReadingMode] = useState<'step' | 'full'>('step');

// Chargement des voix françaises
useEffect(() => {
  const loadVoices = () => {
    const voices = speechSynthesis.getVoices();
    setAvailableVoices(voices);
  };
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}, []);

// Sélection voix française
const getFrenchVoice = (preferMale: boolean) => {
  const frenchVoices = voices.filter(v => v.lang.startsWith('fr'));
  // Priorité: Google French > voix correspondant au genre
  return frenchVoices[0];
};
```

**UX**:
1. Modale recette → une seule fenêtre
2. Bouton "Écouter tout" → Lecture complète
3. Clic sur étape → Lecture de cette étape
4. Icône 🔊 + surbrillance sur étape en cours

### 4. SleepPage
- **Fonction**: Analyse du sommeil
- **Features**: Graphiques, scores, recommandations

### 5. SpiritPage
- **Fonction**: Dialogue spirituel/philosophique
- **Features**: 
  - Archétypes (psychologue, ami, stoïcien)
  - Conversations sauvegardées
- **APIs**: `/api/spirit/conversation`

### 6. CalendarPage
- **Fonction**: Gestion des événements
- **Features**: Calendrier interactif, événements, rappels

### 7. GoalsPage
- **Fonction**: Suivi des objectifs
- **Features**: Création, progression, milestones

### 8. SettingsPage
- **Fonction**: Paramètres utilisateur
- **Features**:
  - Profil utilisateur (nom, avatar, bio)
  - Données physiques (poids, taille, âge)
  - Objectifs nutritionnels
  - Préférences sport
  - Gestion multi-utilisateurs
- **APIs**: `/api/users`

---

## 🔌 APIs Routes

### Users (`/api/users`)
| Méthode | Description |
|---------|-------------|
| GET `?userId=xxx` | Récupère un utilisateur |
| GET `?all=true` | Liste tous les utilisateurs |
| POST | Crée/met à jour un utilisateur |
| DELETE `?userId=xxx` | Supprime un utilisateur |

### Sport APIs (`/api/sport/*`)

#### Profile
- `GET /api/sport/profile?userId=xxx` - Profil sportif
- `PUT /api/sport/profile` - Met à jour le profil

#### Biometrics
- `GET /api/sport/biometrics?userId=xxx&days=30` - Données biométriques
- `POST /api/sport/biometrics` - Ajoute des données

#### Program
- `GET /api/sport/program?userId=xxx` - Programme hebdomadaire
- `POST /api/sport/program` - Crée un programme

#### Session
- `GET /api/sport/session?userId=xxx` - Sessions du jour
- `POST /api/sport/session` - Démarre une session
- `PUT /api/sport/session` - Met à jour une session

#### Atlas (AI)
- `GET /api/sport/atlas?userId=xxx` - Recommandations AI

### Meals APIs (`/api/meals/*`)

#### Meals
- `GET /api/meals?userId=xxx&startDate=...&endDate=...` - Repas planifiés
- `POST /api/meals` - Sauvegarde les repas

#### Generate
- `POST /api/meals/generate` - Génère les repas via AI
  - Body: `{ userId, mealType: 'lunch'|'dinner'|'both', days: 7 }`

---

## 🏪 Store Zustand (`/lib/store.ts`)

### État Global
```typescript
interface AppState {
  // Multi-User
  currentUserId: string;           // Défaut: 'mindlife-user'
  users: { id, name, avatar }[];
  userProfile: UserProfile | null;
  setCurrentUserId: (id: string) => void;
  loadUserProfile: () => Promise<void>;
  saveUserProfile: (profile) => Promise<void>;
  loadUsers: () => Promise<void>;
  createNewUser: (name: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<boolean>;
  
  // Navigation
  activePanel: string;             // Page active
  setActivePanel: (panel: string) => void;
  
  // Données
  tasks: Task[];
  goals: Goal[];
  notes: Note[];
  events: Event[];
  habits: Habit[];
  journalEntries: JournalEntry[];
  voiceMemos: VoiceMemo[];
  
  // UI State
  theme: 'light' | 'dark';
  language: Language;
  isLoading: boolean;
  sidebarHovered: boolean;
}
```

### UserProfile Interface
```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  // Physique
  weight: number | null;
  height: number | null;
  gender: string | null;
  // Objectifs
  mainGoal: string | null;
  activityLevel: string | null;
  // Nutrition
  dietaryPreferences: string | null;  // JSON array
  allergies: string | null;           // JSON array
  targetCalories: number | null;
  proteinTarget: number | null;
  carbsTarget: number | null;
  fatTarget: number | null;
  // Sport
  sportLevel: string | null;
  preferredSports: string | null;
  // Calculs auto
  bmr: number | null;
  tdee: number | null;
  imc: number | null;
}
```

---

## 🔄 Commandes de Restauration

### 1. Restaurer la Base de Données
```bash
bun run db:push
```

### 2. Restaurer Toutes les Données
```bash
bun run scripts/restore-all.ts
```

### 3. Vérifier la Base
```bash
bun run scripts/check-users.ts
```

---

## ⚠️ Points d'Attention

### Cohérence des IDs Utilisateur
- **TOUJOURS** utiliser `mindlife-user` comme ID par défaut
- Vérifier dans:
  - `/lib/store.ts` (currentUserId default)
  - `/app/api/users/route.ts` (fallback)
  - Toutes les autres APIs

### Synchronisation Store ↔ API
- Le store charge `userProfile` via `loadUserProfile()`
- `loadUserProfile()` appelle `GET /api/users?userId=${currentUserId}`
- Les pages doivent appeler `loadUserProfile()` au montage

### Persistance
- Zustand persiste: `currentUserId`, `language`, `theme`, `tasks`, `goals`, `notes`, `events`, `habits`, `journalEntries`, `voiceMemos`
- **NE PAS** persister `userProfile` (chargé depuis DB)

### TTS (Text-to-Speech)
- Utilise l'API Web SpeechSynthesis (native du navigateur)
- Les voix doivent être chargées AVANT la lecture
- Le fallback se fait sur la première voix française disponible
- En cas d'absence de voix FR, utiliser `lang: 'fr-FR'` sur l'utterance

---

## 🚀 Démarrage Rapide

```bash
# Installer les dépendances
bun install

# Pousser le schéma DB
bun run db:push

# Restaurer toutes les données
bun run scripts/restore-all.ts

# Démarrer le serveur
bun run dev
```

---

## 📝 Logs Importants

Le fichier `dev.log` contient les requêtes Prisma et les messages de debug.
À vérifier en cas de problème:
- Erreurs Prisma (query failed)
- Erreurs 404/500 sur les APIs
- Messages de génération AI
- Chargement des voix TTS: `🗣️ Voix chargées:`

---

## 🛠️ Fonctions Importantes par Page

### SportPage.tsx
```typescript
// Chargement des données
const loadData = useCallback(async () => {
  const userId = currentUserId || 'mindlife-user';
  // Charge: program, session, biometrics, atlas
}, [currentUserId]);

// Sync userProfile
useEffect(() => {
  if (userProfile) {
    setBiometrics(prev => ({
      ...prev,
      weight: userProfile.weight || prev?.weight,
    }));
  }
}, [userProfile]);
```

### NutritionPage.tsx
```typescript
// Sync budget and macros from userProfile
useEffect(() => {
  if (userProfile) {
    setBudget({
      total: userProfile.foodBudget || 100,
      remaining: (userProfile.foodBudget || 100) * 0.7
    });
    setMacros({
      calories: userProfile.targetCalories || 2000,
      protein: userProfile.proteinTarget || 150,
      carbs: userProfile.carbsTarget || 200,
      fat: userProfile.fatTarget || 65
    });
  }
}, [userProfile]);

// TTS - Lecture d'une étape
const startSpeaking = (meal: Meal, stepIndex: number) => {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  utterance.rate = 0.9;
  const voice = getFrenchVoice(preferMale);
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
};
```

### SettingsPage.tsx
```typescript
// Chargement du profil
useEffect(() => {
  loadUserProfile();
  loadUsers();
}, [currentUserId]);

// Sauvegarde du profil
const handleSave = async () => {
  await saveUserProfile(formData);
};
```

---

*Dernière mise à jour: Mars 2026*
