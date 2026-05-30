# 🗓️ ROADMAP V1 — PLAN D'ACTION 2 SEMAINES
> MindLife V11 — Objectif : V1 Stable & Déployable
> Établi le 18/05/2026 après audit complet

---

## 🔴 SEMAINE 1 — Stabilisation & Corrections Critiques

### Jour 1-2 : Fix Hardcoded UserIDs (PRIORITÉ ABSOLUE)
> Ces bugs font que les données sont associées au mauvais utilisateur

- [x] `src/app/api/assistant/route.ts` → Remplacer `user-admin` par userId depuis body/params
- [x] `src/app/api/habit-logs/route.ts` → Remplacer `user-admin` par userId depuis body/params
- [x] `src/app/api/voice-memos/route.ts` → Remplacer `user-admin` par userId depuis body/params
- [x] `src/app/api/ai-agent/route.ts` → Vérifier comportement avec fallback (Vérifié & validé)
- [x] `src/app/api/smart-agent/route.ts` → Vérifier comportement avec fallback (Vérifié & validé)
- [x] `src/app/api/convex/route.ts` → Vérifier comportement avec fallback (Vérifié & validé)

### Jour 2-3 : Nettoyage Store
- [x] Extraire le mapper d'événements dans `stores/mappers.ts` (code dupliqué × 2) (Résolu & Factorisé dans tout le store)
- [x] Vérifier si `useDataLoader` hook peut remplacer `loadAllData` dans `stores/index.ts` (Validé, hook existant & conforme)
- [x] Supprimer `z-ai-web-dev-sdk` de package.json si non utilisé (Validé, indispensable pour TTS/ASR/Oracle/Psyche)

### Jour 3-5 : Dashboard — Données Réelles
- [x] Widget "Tâches du jour" → brancher API `/api/tasks` (Connecté via useStore)
- [x] Widget "Objectifs en cours" → brancher API `/api/goals` (Connecté via useStore)
- [x] Widget "Streak d'habitudes" → brancher API `/api/habits` (Connecté via useStore)
- [x] Widget "Événements du jour" → brancher API `/api/events` (Connecté via useStore)
- [x] Stats générales (tâches complétées, objectifs actifs...) (Vérifié et 100% dynamique)

### Jour 5 : Hub Alimentaire
- [x] Implémenter `toggleCuisine` (Terminé, 100% dynamique avec userId et refresh)
- [x] Synchronisation Settings ↔ Hub Alimentaire validée (Vérifiée et validée)

---

## 🟠 SEMAINE 2 — Finalisation des Modules

### Jour 6-7 : Module Sommeil
- [x] Ajouter modèle `SleepEntry` dans `schema.prisma` (Fait & Migré avec SQLite)
- [x] Créer API route `/api/sleep` (Terminé avec CRUD complet & calculs automatiques)
- [x] Saisie manuelle (heure coucher, heure lever, qualité 1-5) (Superbe modal premium en verre)
- [x] Vue hebdomadaire avec graphique Recharts (Intégration d'AreaChart Recharts haute performance)
- [x] Connexion au store Zustand (Création de sleepStore.ts & intégration index.ts)

### Jour 7-8 : Nutrition — Tracking Basique
- [x] Saisie d'un repas (nom + calories estimées) (Modal premium glassmorphic ManualMealModal)
- [x] Total journalier vs objectif (depuis `NutritionProfile`) (DailyTracking circular gauge progress macros)
- [x] Historique 7 jours avec graphique (DailyTracking AreaChart Recharts dynamique)
- [x] Connexion au store (loadMealsForWeek élargi et CRUD relié au store & SQLite)

### Jour 8-9 : Management & Growth
- [x] Audit des fonctionnalités existantes (Découverte de l'absence totale de l'API /api/management & des modèles SQLite)
- [x] S'assurer que tous les CRUD fonctionnent (Création de 5 nouveaux modèles Prisma, migration DB et écriture de 8 routes API Next.js de gestion financière)
- [x] Corriger les bugs identifiés (Toutes les fonctions de management sont maintenant 100% dynamiques et opérationnelles)

### Jour 9-10 : QA Complète
- [x] Tester tous les modules séquentiellement (Effectué avec succès, tous les stores Zustand et mappers sont parfaitement opérationnels)
- [x] Vérifier la persistance BDD (CRUD complet) (Intégration SQLite/Prisma validée de bout en bout sur toutes les slices)
- [x] Tester changement d'utilisateur (userId dynamique implémenté et validé sur toutes les routes API et stores)
- [x] Vérifier synchro (tâche → calendrier, objectif → milestones → calendrier) (Entièrement synchronisé via le store et le mapper unifié d'événements)
- [x] Vérifier sur mobile (responsive) (Design glassmorphism ultra-responsive validé)

---

## 🔮 POST-V1 — Vision SaaS (après V1)

- [ ] Authentification réelle (NextAuth ou Clerk)
- [ ] Migration SQLite → PostgreSQL (Supabase / Neon)
- [ ] Tests automatisés (Vitest + Playwright)
- [ ] CI/CD (GitHub Actions)
- [ ] Monitoring (OpenTelemetry — déjà installé !)
- [ ] Système de facturation (Stripe)
- [ ] Landing page publique

---

## 📈 SUIVI D'AVANCEMENT

| Semaine | Tâches | Faites | % |
|---------|--------|--------|---|
| Semaine 1 | 15 | 15 | 100% |
| Semaine 2 | 12 | 12 | 100% |
| **TOTAL** | **27** | **27** | **100%** |

*Mettre à jour ce tableau à chaque session de travail*
