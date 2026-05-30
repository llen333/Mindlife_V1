# 🔧 Espace Itérations & Fonctions - MindLife

*Documentation technique de nos sessions - Ce qui a été fait, comment, et pourquoi*

---

## 📅 Session du 11 Mars 2026 - Restauration des Données

### 🎯 Objectif
Restaurer les users, tâches et événements perdus après un reset du sandbox.

### 🔍 Diagnostic
```
État initial:
- Users: 1 (mindlife-user = "Nouvel Utilisateur")
- Tasks: 0
- Events: 0
- Categories: 9
```

### 🛠️ Solution Implémentée

#### 1. Amélioration du script de seed (`/api/seed/route.ts`)

**Fichier modifié :** `src/app/api/seed/route.ts`

**Changements clés :**
- Création de 4 users avec profils complets (weight, height, goals, activity level)
- Génération de 7 catégories par user (Sport, Éducation, Développement Personnel, etc.)
- Création de 5 tâches par user avec différentes priorités et due dates
- Création de 5 événements par user sur plusieurs jours

**Code important :**
```typescript
const TEST_USERS = [
  {
    id: 'mindlife-user',
    email: 'admin@mindlife.app',
    name: 'Alex Martin',
    role: 'admin',
    weight: 75,
    height: 180,
    mainGoal: 'Équilibre vie pro/perso',
  },
  // ... autres users
];

function getDemoTasks(userId: string) {
  return [
    { title: 'Finaliser le projet trimestriel', priority: 'high', status: 'in_progress' },
    { title: 'Séance de sport matinale', priority: 'medium', status: 'pending' },
    // ... autres tâches
  ];
}
```

#### 2. Exécution du seed
```bash
curl -X POST "http://localhost:3000/api/seed"
```

**Résultat :**
```json
{
  "message": "DB peuplée avec succès !",
  "users": 4,
  "categories": 28,
  "tasks": 20,
  "events": 20
}
```

### 📊 Données créées

#### Users
| ID | Nom | Email | Rôle |
|----|-----|-------|------|
| mindlife-user | Alex Martin | admin@mindlife.app | admin |
| user-john | John Doe | john.doe@example.com | member |
| user-mike | Mike Smith | mike.smith@example.com | member |
| user-sarah | Sarah Johnson | sarah.johnson@example.com | member |

#### Catégories (par user)
1. Sport (Dumbbell, emerald)
2. Éducation (BookOpen, blue)
3. Développement Personnel (Brain, purple)
4. Esprit & Spiritualité (Sparkles, orange)
5. Vie Professionnelle (Briefcase, slate)
6. Santé (Heart, rose)
7. Finances (Wallet, green)

#### Tâches (par user)
1. Finaliser le projet trimestriel (high, in_progress)
2. Séance de sport matinale (medium, pending)
3. Lecture quotidienne (low, completed)
4. Méditation guidée (medium, pending)
5. Planifier les repas de la semaine (medium, pending)

#### Événements (par user)
1. Réunion équipe (aujourd'hui 10h)
2. Sport - Musculation (aujourd'hui 18h)
3. Méditation matinale (demain 7h)
4. Rendez-vous médical (J+3)
5. Webinar développement personnel (J+2)

### 🔗 Points d'intégration

- **Settings Page** : Dropdown pour switcher de user (`setCurrentUserId`)
- **Store Zustand** : `currentUserId` détermine quelles données charger
- **API Routes** : Toutes acceptent `userId` en paramètre

### 📝 Notes techniques

- Les IDs de catégories sont suffixés par l'userId pour éviter les conflits
- Les tâches et événements sont liés aux catégories du user correspondant
- Le user principal reste `mindlife-user` (compatibilité avec le code existant)

---

## 📅 Session du 24 Mars 2025 - Page Objectifs (Historique)

### 🎯 Objectif
Reconstruire la page Objectifs avec 4 cards principales et le style glassmorphism.

### 🛠️ Implémentation
- 4 cards : Objectifs, Rendez-vous, Tâches, Habitudes
- Style futuriste avec orbes animés et GlassCard
- Timer Focus dans sidebar
- Modal de création d'objectifs avec milestones générés localement

---

## 📅 Session du 11 Mars 2026 (Suite) - Fixes et Modales

### 🎯 Objectifs
1. Fixer le bug de création d'objectifs
2. Corriger l'affichage des objectifs créés
3. Créer des modales pour Tâches et Rendez-vous

### 🐛 Bug #1 : Erreur création objectif

**Erreur :**
```
Error: Unique constraint failed on the fields: (userId, name)
```

**Cause :** Les catégories créées par le seed (Sport, Éducation...) entraient en conflit avec celles de l'API goals.

**Fichier modifié :** `src/app/api/goals/route.ts`

**Solution :**
```typescript
// AVANT - Cherchait par ID seulement
const existing = await db.category.findUnique({
  where: { id: cat.id }
});

// APRÈS - Cherche par nom ET userId
const existing = await db.category.findFirst({
  where: { 
    name: cat.name,
    userId 
  }
});
```

### 🐛 Bug #2 : Objectifs non visibles après création

**Cause :** Le filtre de période par défaut était `'week'`, excluant les objectifs sans date proche.

**Fichier modifié :** `src/components/GoalsPage.tsx`

**Solution :**
```typescript
// AVANT
const [activePeriod, setActivePeriod] = useState('week');

// APRÈS
const [activePeriod, setActivePeriod] = useState('all');
```

### ✨ Feature : Modales Tâches et Événements

**Fichier modifié :** `src/components/GoalsPage.tsx`

**Nouveaux states :**
```typescript
const [selectedTask, setSelectedTask] = useState<Task | null>(null);
const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
const [showTaskModal, setShowTaskModal] = useState(false);
const [showEventModal, setShowEventModal] = useState(false);
```

**Modale Tâche :**
- Header avec icône CheckSquare et priorité colorée
- Description si présente
- Barre de progression animée
- Meta : statut et échéance
- Bouton "Marquer terminée" avec appel API

**Modale Événement :**
- Header avec icône Calendar et date en français
- Description si présente
- Blocs Début/Fin avec heures stylisées
- Localisation si présente
- Design glassmorphism cyan/violet

**Import ajouté :**
```typescript
import { MapPin } from 'lucide-react';
```

### 📊 Résumé des fichiers modifiés

| Fichier | Changement |
|---------|------------|
| `src/app/api/goals/route.ts` | Fix ensureCategoriesExist() |
| `src/components/GoalsPage.tsx` | Filtre défaut 'all', modales, import MapPin |

---

## 🏗️ Architecture du Projet

### Stack Technique
```
Next.js 16 + App Router
TypeScript
Tailwind CSS + shadcn/ui
Prisma + SQLite
Zustand (state persisté)
Framer Motion (animations)
```

### Structure des dossiers
```
src/
├── app/
│   ├── page.tsx          # Route principale
│   └── api/              # API Routes
│       ├── users/
│       ├── tasks/
│       ├── events/
│       ├── goals/
│       ├── seed/         # ← Modifié cette session
│       └── ...
├── components/
│   ├── MindLifeDashboard.tsx
│   ├── SettingsPage.tsx  # ← Sélecteur de users
│   ├── GoalsPage.tsx     # ← Page Objectifs
│   ├── SpiritPage.tsx    # 🛡️ SANCTUAIRE
│   ├── SportPage.tsx     # 🛡️ SANCTUAIRE
│   └── ...
└── lib/
    ├── store.ts          # Store Zustand
    ├── db.ts             # Client Prisma
    └── hooks/
```

### Pages Sanctuaires
- **SpiritPage.tsx** - Ne pas modifier sans validation
- **SportPage.tsx** - Ne pas modifier sans validation

---

## 🔑 Règles Importantes

1. **NEVER** run `bun run db:push` - ça efface toutes les données
2. **NEVER** use Z.ai SDK - problèmes de renouvellement de tokens
3. **TOUJOURS** valider avant de modifier Spirit/Sport
4. **SAUVEGARDER** les fichiers MD à chaque fin de session

---

## 📈 État des Modules

| Module | Complétude | Dernière modif |
|--------|------------|----------------|
| Dashboard | 70% | Session précédente |
| Calendrier | 85% | Stable |
| Tâches | 90% | Cette session |
| Objectifs | 95% | Session précédente |
| Alimentation | 80% | Stable |
| Esprit | 95% | 🛡️ Sanctuaire |
| Sport | 95% | 🛡️ Sanctuaire |
| Settings | 90% | Cette session |

---

## 🔄 Procédure de Seed

### Seed normal (si DB vide)
```bash
curl "http://localhost:3000/api/seed"
```

### Force seed (écrase tout)
```bash
curl -X POST "http://localhost:3000/api/seed"
```

### Vérification
```bash
curl "http://localhost:3000/api/users?all=true"
curl "http://localhost:3000/api/tasks?userId=mindlife-user"
curl "http://localhost:3000/api/events?userId=mindlife-user"
```

---

*Ce fichier doit être mis à jour à chaque session avec les modifications techniques.*

*Dernière mise à jour : 11 Mars 2026 - NICO*
