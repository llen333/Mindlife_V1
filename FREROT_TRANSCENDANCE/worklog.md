# MindLife - Analyse Complète et Plan de Refactoring

**Date:** $(date +%Y-%m-%d)  
**Analysé par:** Architecte Logiciel Senior  
**Version du projet:** 0.2.0

---

## 1. ÉTAT DES LIEUX

### 1.1 Statistiques Globales

| Métrique | Valeur |
|----------|--------|
| **Total lignes de code (composants)** | 21,271 |
| **Nombre de composants** | 37 fichiers TSX |
| **Nombre de pages** | 15 |
| **Nombre d'API routes** | 39 |
| **Nombre de stores Zustand** | 13 |
| **Dépendances npm** | 46 |

### 1.2 Fichiers les Plus Volumineux (>1000 lignes)

| Fichier | Lignes | Niveau de risque |
|---------|--------|-----------------|
| `NutritionPage.tsx` | 2,529 | 🔴 CRITIQUE |
| `GoalsPage.tsx` | 2,260 | 🔴 CRITIQUE |
| `CalendarPage.tsx` | 1,901 | 🔴 CRITIQUE |
| `SettingsPage.tsx` | 1,759 | 🔴 CRITIQUE |
| `SpiritPage.tsx` | 1,626 | 🟠 ÉLEVÉ |
| `SportPage.tsx` | 1,374 | 🟠 ÉLEVÉ |
| `MindLifeDashboard.tsx` | 1,208 | 🟠 ÉLEVÉ |
| `HubAlimentairePage.tsx` | 1,164 | 🟠 ÉLEVÉ |

### 1.3 Architecture Actuelle

```
src/
├── app/                    # 39 API routes + pages Next.js
│   ├── api/                # Routes REST
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                 # 38 composants shadcn/ui
│   ├── [Pages].tsx         # 15 pages/composants principaux
│   └── [Panels].tsx        # 8 panels (modals, etc.)
├── lib/
│   ├── stores/             # 13 stores Zustand modulaires
│   ├── hooks/              # Custom hooks
│   ├── store.ts            # Store principal legacy
│   └── utils.ts
├── hooks/
│   ├── use-toast.ts
│   └── use-mobile.ts
└── prisma/
    └── schema.prisma       # 19 modèles DB
```

---

## 2. ANALYSE PAR FICHIER

### 2.1 Composants Critiques (>1500 lignes)

#### NutritionPage.tsx (2,529 lignes) 🔴
- **27 useState** - État local excessif
- **15 useEffect** - Risque de boucles infinies
- **Problèmes identifiés:**
  - Lignes 941-968: Chargement voices avec timeout non nettoyé
  - Lignes 863-871: useEffect sans dependencies array optimisé
  - Données mock (`weeklyMeals`, `dinnerMeals`) hardcodées (~400 lignes)
  - Aucune extraction de composants

#### GoalsPage.tsx (2,260 lignes) 🔴
- **20 useState** - Complexité d'état élevée
- **12 useEffect** - Animations GSAP multiples
- **Problèmes identifiés:**
  - Lignes 385-407: Timer avec setInterval correctement nettoyé ✓
  - Lignes 866-923: Animations GSAP sur 7 refs différents
  - Constantes locales énormes (`GOAL_CATEGORIES`, `TIME_PERIODS`, etc.)
  - Fonction `generateMilestonesLocally` de 70 lignes (devrait être un service)

#### CalendarPage.tsx (1,901 lignes) 🔴
- **10 useEffect**
- **12 useState**
- **Problèmes identifiés:**
  - Composants imbriqués dans le fichier principal
  - `TimeSlot`, `DayCell`, `DayViewSlot` devraient être extraits
  - Animations GSAP dispersées dans plusieurs composants

#### SettingsPage.tsx (1,759 lignes) 🔴
- **6 useEffect**
- **9 useState**
- **Problèmes identifiés:**
  - Ligne 282: `setInterval` sans cleanup dans un useEffect (CORRECT: ligne 283 clearInterval)
  - Constantes d'options énormes (~100 lignes de données statiques)
  - Duplication de logique avec AIConfigPanel

#### SpiritPage.tsx (1,626 lignes) 🟠
- **18 useState** - Le plus élevé du projet
- **6 useEffect**
- **Problèmes identifiés:**
  - Ligne 534: `setInterval` avec ref `silenceTimeoutRef` - nettoyé correctement ✓
  - Données mock hardcodées (`archetypes`, `initialFrequencies`, `initialCards`)
  - Logique audio complexe inline (Web Speech API + MediaRecorder)

---

### 2.2 Composants Modérés (500-1500 lignes)

#### SportPage.tsx (1,374 lignes) 🟠
- **19 useState** - Élevé
- **6 useEffect**
- **Problèmes:**
  - Lignes 356-358: Timer avec cleanup correct ✓
  - Lignes 361-367: Session timer avec cleanup correct ✓
  - Données mock énormes (`exercisesByWorkout`, `workoutImages`, `exerciseImages`)

#### MindLifeDashboard.tsx (1,208 lignes) 🟠
- **9 useState**
- **8 useEffect**
- **Problèmes:**
  - Modales inline (Task, Goal, Event) - devraient être extraits
  - Animations GSAP dispersées pour 3 modales différentes

#### HubAlimentairePage.tsx (1,164 lignes) 🟠
- **6 useEffect**
- **7 useState**
- **Problèmes:**
  - Logique de génération de repas inline
  - Données de démo hardcodées

---

### 2.3 Stores Zustand

#### Structure Actuelle
```
stores/
├── index.ts          # Point d'entrée avec useStore() composite
├── userStore.ts      # User + profile
├── settingsStore.ts  # Theme, language, UI state
├── navigationStore.ts
├── categoriesStore.ts
├── tasksStore.ts
├── eventsStore.ts
├── goalsStore.ts
├── notesStore.ts
├── habitsStore.ts
├── journalStore.ts
├── chatStore.ts
├── voiceMemosStore.ts
├── types.ts          # Types partagés
└── mappers.ts        # Mappers DB → Store
```

#### Problèmes Identifiés
1. **Double architecture:** `store.ts` (legacy monolithique 1200+ lignes) + stores modulaires
2. **useStore() composite:** `stores/index.ts` combine 13 stores avec `useShallow` - complexe
3. **Sélecteurs non optimisés:** Tous les stores sont appelés même si un seul champ est nécessaire

---

## 3. PROBLÈMES CRITIQUES

### 3.1 Memory Leaks Potentiels

| Fichier | Ligne | Description |
|---------|-------|-------------|
| ✅ SpiritPage.tsx | 534, 566, 579, 661 | setInterval avec cleanup correct |
| ✅ SportPage.tsx | 356, 364 | Timers avec cleanup correct |
| ✅ GoalsPage.tsx | 389, 406 | Timer avec cleanup correct |
| ✅ SettingsPage.tsx | 282, 283 | Timer avec cleanup correct |
| ✅ MindLifeHeader.tsx | 56, 57 | Timer avec cleanup correct |
| ✅ VoiceRecorder.tsx | 66, 140, 150 | Interval avec cleanup correct |
| ⚠️ NutritionPage.tsx | 962 | Timeout sans cleanup (mineur) |

**Verdict:** Les intervalles sont généralement bien nettoyés. Pas de memory leak critique.

### 3.2 useEffect Sans Dépendances Optimisées

| Fichier | Ligne | Dépendances manquantes/superflues |
|---------|-------|----------------------------------|
| MindLifeDashboard.tsx | 261-276 | `selectedTask` dans deps mais animations devraient être conditionnelles |
| MindLifeDashboard.tsx | 279-294 | `selectedGoal` similaire |
| GoalsPage.tsx | 866-923 | `loading` dependency pourrait causer des re-renders |
| NutritionPage.tsx | 863-871 | Dependencies multiples sur `loadMealsForWeek` |

### 3.3 Anti-Patterns Identifiés

#### A. Composants Géants (God Components)
```
NutritionPage.tsx    → 2,529 lignes → Devrait être 5-7 composants
GoalsPage.tsx        → 2,260 lignes → Devrait être 4-6 composants
CalendarPage.tsx     → 1,901 lignes → Devrait être 6-8 composants
SettingsPage.tsx     → 1,759 lignes → Devrait être 4-5 composants
```

#### B. Données Hardcodées
```typescript
// Exemples dans NutritionPage.tsx (lignes 132-440)
const weeklyMeals: Meal[] = [...]  // ~300 lignes de données mock
const dinnerMeals: Meal[] = [...]  // ~140 lignes
const inspirationRecipes = [...]   // ~35 lignes

// Exemples dans SportPage.tsx (lignes 98-269)
const workoutImages: Record<string, string> = {...}
const exerciseImages: Record<string, string> = {...}
const exercisesByWorkout: Record<string, {...}> = {...}  // ~85 lignes
```

#### C. Doublons de Code

| Pattern | Fichiers concernés | Lignes dupliquées estimées |
|---------|-------------------|---------------------------|
| `GlassCard` component | 5 fichiers | ~150 lignes |
| `AnimatedOrbs` (null) | 4 fichiers | ~20 lignes |
| Animations GSAP modales | 3+ fichiers | ~200 lignes |
| Fonction `formatTime` | 3 fichiers | ~15 lignes |
| Couleurs/ColorMaps | 4 fichiers | ~60 lignes |

---

## 4. ANALYSE DES CHOIX TECHNIQUES

### 4.1 GSAP vs Framer Motion

| Métrique | GSAP | Framer Motion |
|----------|------|---------------|
| **Fichiers utilisant** | 26 fichiers | 0 fichiers (package présent mais non utilisé) |
| **Imports** | `import gsap from 'gsap'` | Non utilisé |
| **Performance** | ✅ Optimal pour animations complexes | ❌ Non utilisé |
| **Cleanup** | ⚠️ Manuel via event listeners | - |
| **Taille bundle** | ~45KB gzipped | ~25KB gzipped (inutilisé) |

**Constat:** Le projet a migré de Framer Motion vers GSAP (commentaires "Framer Motion supprimé - migré vers GSAP" présents). Framer Motion est encore dans les dépendances mais **non utilisé**.

**Recommandation:** Supprimer `framer-motion` du package.json (économie ~25KB).

### 4.2 Zustand Architecture

#### Version Actuelle
- Store monolithique legacy (`store.ts`) + stores modulaires
- `useStore()` composite qui combine tous les stores
- Pas de normalisation des données

#### Problèmes
1. **Double source de vérité:** `store.ts` (1200+ lignes) et stores modulaires
2. **Re-renders excessifs:** `useStore()` sans sélecteur provoque re-render de tous les composants
3. **Mappers dans le store:** Devraient être des utilitaires séparés

#### Best Practices Violated
- ❌ Pas de `useShallow` pour les objets
- ❌ Store monolithique présent
- ✅ Stores modulaires créés (bonne direction)
- ⚠️ Sélecteurs non utilisés correctement

### 4.3 Animations CSS vs GSAP

| Type | Implémentation | Performance |
|------|---------------|-------------|
| Hover effects | CSS `transition-all` | ✅ Bon |
| Modal animations | GSAP `gsap.fromTo` | ✅ Bon |
| Progress bars | CSS + GSAP | ✅ Bon |
| Infinite loops | **AnimatedOrbs désactivé** | ⚠️ Commenté "surcharge GPU" |

**Note:** `AnimatedOrbs` est désactivé partout (`const AnimatedOrbs = () => null`) avec commentaire explicatif sur la surcharge GPU. **Bonne décision.**

### 4.4 API Design

#### Routes Existantes (39 routes)
```
/api/users/          - CRUD utilisateurs
/api/tasks/          - CRUD tâches
/api/goals/          - CRUD objectifs
/api/events/         - CRUD événements
/api/habits/         - CRUD habitudes
/api/notes/          - CRUD notes
/api/journal/        - CRUD journal
/api/spirit-chat/    - Chat IA
/api/sport/          - Endpoints sport (program, session, stats, etc.)
/api/meals/          - Nutrition (generate, save, history)
/api/asr/            - Speech-to-text
/api/tts/            - Text-to-speech
...etc
```

#### Problèmes Identifiés
1. **Pas de validation Zod** sur la plupart des routes
2. **Pas de middleware d'authentification** centralisé
3. **Gestion d'erreurs inconsistante**

---

## 5. PLAN DE REFACTORING

### Phase 1: Nettoyage Immédiat (1-2 jours)

#### 1.1 Supprimer les Dépendances Inutilisées
```bash
npm uninstall framer-motion  # Économie ~25KB
```

#### 1.2 Extraire les Constantes
Créer `src/lib/constants/`:
```
constants/
├── nutrition.ts    # weeklyMeals, dinnerMeals, etc.
├── sport.ts        # exercisesByWorkout, workoutImages
├── goals.ts        # GOAL_CATEGORIES, GOAL_PRIORITIES
├── settings.ts     # genderOptions, activityLevelOptions, etc.
└── index.ts
```

#### 1.3 Créer un Composant GlassCard Partagé
```typescript
// src/components/ui/glass-card.tsx
// Supprimer les 5 copies locales
```

### Phase 2: Découpage des Composants Géants (3-5 jours)

#### 2.1 NutritionPage.tsx → 7 composants
```
NutritionPage/
├── index.tsx              (~200 lignes)
├── MealCard.tsx           (~100 lignes)
├── RecipeModal.tsx        (~150 lignes)
├── AudioDrawer.tsx        (~200 lignes)
├── ShoppingList.tsx       (~100 lignes)
├── WeekSelector.tsx       (~80 lignes)
└── MealGenerationPanel.tsx (~150 lignes)
```

#### 2.2 GoalsPage.tsx → 5 composants
```
GoalsPage/
├── index.tsx              (~300 lignes)
├── GoalCard.tsx           (~150 lignes)
├── GoalDetailModal.tsx    (~200 lignes)
├── NewGoalModal.tsx       (~150 lignes)
├── TimerPanel.tsx         (~100 lignes)
└── MilestonesList.tsx     (~100 lignes)
```

#### 2.3 CalendarPage.tsx → 6 composants
```
CalendarPage/
├── index.tsx              (~300 lignes)
├── MonthView.tsx          (~200 lignes)
├── WeekView.tsx           (~200 lignes)
├── DayView.tsx            (~200 lignes)
├── TimeSlot.tsx           (~80 lignes)
├── DayCell.tsx            (~80 lignes)
└── EventModals.tsx        (~300 lignes)
```

#### 2.4 SettingsPage.tsx → 4 composants
```
SettingsPage/
├── index.tsx              (~300 lignes)
├── IdentitySection.tsx    (~200 lignes)
├── CorpusSection.tsx      (~300 lignes)
├── NutritionSection.tsx   (~200 lignes)
└── UsersSection.tsx       (~150 lignes)
```

### Phase 3: Optimisation Zustand (2-3 jours)

#### 3.1 Supprimer le Store Legacy
- Supprimer `src/lib/store.ts`
- Mettre à jour tous les imports vers `@/lib/stores`

#### 3.2 Implémenter les Sélecteurs
```typescript
// Avant
const { tasks, goals, events } = useStore();

// Après
const tasks = useTasks();
const goals = useGoals();
const events = useEvents();
```

#### 3.3 Normaliser les Données
```typescript
// Implémenter une structure normalisée
state = {
  tasks: { ids: [], entities: {} },
  goals: { ids: [], entities: {} },
  // ...
}
```

### Phase 4: Optimisation des Animations (1-2 jours)

#### 4.1 Créer des Hooks d'Animation
```typescript
// src/lib/hooks/use-gsap-modal.ts
export function useGSAPModal(isOpen: boolean, overlayRef, contentRef) {
  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(overlayRef.current, ...);
      gsap.fromTo(contentRef.current, ...);
    }
  }, [isOpen]);
}
```

#### 4.2 Migrer les Animations Hover vers CSS
```css
/* Remplacer les event listeners GSAP par CSS */
.card {
  transition: transform 0.2s ease-out;
}
.card:hover {
  transform: scale(1.01) translateY(-2px);
}
```

### Phase 5: Tests et Documentation (2-3 jours)

#### 5.1 Tests Unitaires
- Tests pour les stores Zustand
- Tests pour les composants critiques

#### 5.2 Documentation
- Storybook pour les composants UI
- Documentation des stores

---

## 6. RECOMMANDATIONS FINALES

### 6.1 Priorité Haute (Immédiat)
1. ✅ **Supprimer framer-motion** du package.json
2. ✅ **Extraire les constantes** hardcodées
3. ✅ **Créer GlassCard partagé**
4. ⚠️ **Nettoyer les useEffect** inutiles

### 6.2 Priorité Moyenne (1-2 semaines)
1. 📦 **Découper les composants >1000 lignes**
2. 🗃️ **Supprimer store.ts legacy**
3. 🎯 **Implémenter les sélecteurs Zustand**
4. 🎨 **Migrer hover animations vers CSS**

### 6.3 Priorité Basse (1 mois+)
1. 📚 **Ajouter des tests unitaires**
2. 📖 **Documenter avec Storybook**
3. 🔧 **Normaliser les données du store**
4. ⚡ **Optimiser les re-renders**

### 6.4 Architecture Recommandée

```
src/
├── app/
│   ├── (auth)/           # Route groups
│   ├── (dashboard)/
│   └── api/
├── components/
│   ├── ui/               # shadcn/ui
│   ├── shared/           # GlassCard, AnimatedButton, etc.
│   ├── nutrition/        # NutritionPage découpé
│   ├── goals/            # GoalsPage découpé
│   ├── calendar/         # CalendarPage découpé
│   └── settings/         # SettingsPage découpé
├── lib/
│   ├── constants/        # Données statiques
│   ├── stores/           # Zustand stores modulaires
│   ├── hooks/            # Custom hooks
│   ├── services/         # API calls
│   └── utils/            # Utilitaires
└── types/                # TypeScript types
```

---

## 7. MÉTRIQUES DE SUCCÈS

| Métrique | Actuel | Cible |
|----------|--------|-------|
| Plus gros fichier | 2,529 lignes | <500 lignes |
| Nombre de useState max | 27 | <10 |
| Nombre de useEffect max | 15 | <5 |
| Bundle size (framer-motion) | ~25KB | 0KB |
| Stores legacy | 1 | 0 |
| Composants dupliqués | 5+ GlassCard | 1 |

---

## 8. CONCLUSION

Le codebase MindLife présente une architecture fonctionnelle mais souffre de **problèmes de maintenabilité** dus à:

1. **Composants trop volumineux** (jusqu'à 2,529 lignes)
2. **Duplication de code** (GlassCard, animations modales)
3. **Double architecture Zustand** (legacy + modulaire)
4. **Données hardcodées** qui devraient être externalisées

Les **points positifs** notables:
- Les timers/setInterval sont correctement nettoyés
- La migration vers GSAP est complète
- Les stores modulaires sont une bonne direction
- Les types TypeScript sont bien définis

Le plan de refactoring proposé permettrait d'atteindre un code plus maintenable, testable et performant en **2-3 semaines** de travail.

---

*Fin du rapport*
