# 🎯 MindLife - Plan d'Actions & Scénarios

> **Dernière mise à jour**: Session du jour
> **Statut**: En cours de planification
> **Frérot**: BIZ! 💚🦞

---

## 📊 État Actuel du Projet

### ✅ Ce qui fonctionne
- [x] Structure de base Next.js 16
- [x] Base de données SQLite + Prisma
- [x] Store Zustand
- [x] API Routes principales
- [x] Composants UI shadcn/ui
- [x] Seed des données de test
- [x] Navigation entre panels

### ⚠️ Problèmes identifiés
- [ ] Incohérences d'affichage dans GoalsPage (filtres période)
- [ ] Données qui ne s'affichent pas toujours
- [ ] Problèmes de parsing JSON (milestones, chapters)
- [ ] Certains composants crashent si données undefined
- [ ] Dashboard: tâches non affichées
- [ ] Calendrier: dates non affichées

---

## 🔧 SCÉNARIOS À IMPLÉMENTER

### SCÉNARIO 1: Dashboard - Affichage Complet
**Problème**: Les tâches et événements ne s'affichent pas dans les cards du Dashboard

**Fichiers concernés**:
- `src/components/Dashboard.tsx`
- `src/components/StatsCards.tsx`
- `src/lib/store.ts`

**Actions**:
- [ ] Vérifier le chargement des données depuis le store
- [ ] Ajouter fallback si données vides
- [ ] Afficher message "Aucune donnée" si nécessaire
- [ ] Vérifier le format des données (Tasks avec dueDate, Events avec startAt)
- [ ] Logger les données pour debug

---

### SCÉNARIO 2: GoalsPage - Filtres Temporels
**Problème**: Incohérences dans les vues jour/semaine/mois

**Fichiers concernés**:
- `src/components/GoalsPage.tsx`

**Actions**:
- [x] Corriger la logique `isGoalActiveInPeriod`
- [ ] Tester chaque période avec données réelles
- [ ] Ajouter indicateur visuel de la période active
- [ ] S'assurer que les objectifs sans endDate sont inclus

---

### SCÉNARIO 3: Calendrier - Affichage des Événements
**Problème**: Le calendrier reste vide, pas de dates affichées

**Fichiers concernés**:
- `src/components/CalendarPanel.tsx`
- `src/lib/store.ts`

**Actions**:
- [ ] Vérifier que les events sont bien chargés
- [ ] Vérifier le format de `startAt` et `endAt`
- [ ] Logger les events dans le composant calendrier
- [ ] Ajouter des events de test si vide
- [ ] Vérifier la logique d'affichage des points/dates

---

### SCÉNARIO 4: Parsing JSON Robuste
**Problème**: `milestones`, `chapters`, `dietaryPreferences` etc. crashent parfois

**Fichiers concernés**:
- `src/lib/store.ts` (mapDBGoalToStore, mapDBHabitToStore)
- `src/components/GoalsPage.tsx`
- `src/components/HubAlimentairePage.tsx`

**Actions**:
- [ ] Créer une fonction utilitaire `safeParseJSON`
- [ ] L'appliquer partout où on parse des données JSON
- [ ] Gérer les cas: string, object, null, undefined
- [ ] Ajouter des valeurs par défaut cohérentes

```typescript
// Fonction utilitaire à créer
function safeParseJSON<T>(data: unknown, defaultValue: T): T {
  if (!data) return defaultValue;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }
  if (typeof data === 'object') return data as T;
  return defaultValue;
}
```

---

### SCÉNARIO 5: Protection Composants (undefined safety)
**Problème**: Certains composants crashent si `parsedProfile` ou `computed` sont undefined

**Fichiers concernés**:
- `src/components/HubAlimentairePage.tsx` (déjà partiellement fait)
- `src/components/Dashboard.tsx`
- `src/components/StatsCards.tsx`

**Actions**:
- [ ] Ajouter DEFAULT_* constants dans chaque composant
- [ ] Utiliser `const data = rawData || DEFAULT_DATA`
- [ ] Ajouter états de chargement (spinner/skeleton)
- [ ] Logger les erreurs pour debug

---

### SCÉNARIO 6: Store Zustand - Cohérence des Données
**Problème**: Données parfois incohérentes entre store et API

**Fichiers concernés**:
- `src/lib/store.ts`

**Actions**:
- [ ] Vérifier `loadAllData()` charge bien toutes les données
- [ ] S'assurer que `dataLoaded` passe à true
- [ ] Vérifier les types dans le store
- [ ] Ajouter des logs de debug (dev seulement)
- [ ] Uniformiser les interfaces Goal, Task, Event, Habit

---

### SCÉNARIO 7: API Routes - Validation & Erreurs
**Problème**: APIs parfois silencieuses sur les erreurs

**Fichiers concernés**:
- `src/app/api/goals/route.ts`
- `src/app/api/tasks/route.ts`
- `src/app/api/events/route.ts`
- `src/app/api/habits/route.ts`
- `src/app/api/users/route.ts`

**Actions**:
- [ ] Ajouter try/catch partout
- [ ] Retourner des erreurs explicites
- [ ] Logger les erreurs côté serveur
- [ ] Valider les entrées (userId, etc.)

---

## 📋 CHECKLIST PRE-SESSION

Avant de commencer les modifs:
- [ ] Lancer `bun run dev` et vérifier qu'il tourne
- [ ] Vérifier `tail -20 /home/z/my-project/dev.log`
- [ ] Lancer `bun run lint`
- [ ] Vérifier que la DB a des données: `curl localhost:3000/api/goals?userId=user-admin`

---

## 🚀 ORDRE D'EXÉCUTION RECOMMANDÉ

1. **Scénario 4**: Parsing JSON Robuste (fundation)
2. **Scénario 6**: Store Zustand (data layer)
3. **Scénario 7**: API Routes (backend)
4. **Scénario 5**: Protection Composants (frontend safety)
5. **Scénario 1**: Dashboard
6. **Scénario 3**: Calendrier
7. **Scénario 2**: GoalsPage (dernier car déjà partiellement fait)

---

## 📝 NOTES & OBSERVATIONS

### À ajouter au fur et à mesure:

**Date**: ___
**Problème rencontré**:
- 

**Solution appliquée**:
- 

---

**Date**: ___
**Problème rencontré**:
- 

**Solution appliquée**:
- 

---

## 🎨 AMÉLIORATIONS FUTURES (Post-Fix)

- [ ] Ajouter tests unitaires
- [ ] Optimiser les requêtes DB
- [ ] Ajouter caching
- [ ] Améliorer l'accessibilité (a11y)
- [ ] Ajouter dark/light mode toggle
- [ ] PWA support

---

**BIZ MON FRÉROT! 💚🦞**
*On attaque ça à fond la prochaine session!*
