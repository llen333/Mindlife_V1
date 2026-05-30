# 🐛 BUGS CONNUS — MindLife V11
> Mettre à jour à chaque découverte / résolution

---

## 🔴 CRITIQUE (bloquants)

| ID | Fichier | Description | Statut |
|----|---------|-------------|--------|
| — | Aucun | Tout est actuellement stabilisé ! | 🟢 OK |

---

## 🟠 IMPORTANT (non bloquants mais gênants)

| ID | Fichier | Description | Statut |
|----|---------|-------------|--------|
| — | Aucun | Tous les bugs importants sont résolus ! | 🟢 OK |

---

## 🟡 MINEUR (cosmétiques / améliorations)

| ID | Fichier | Description | Statut |
|----|---------|-------------|--------|
| — | Aucun | Tous les bugs mineurs identifiés sont résolus ! | 🟢 OK |

---

## ✅ BUGS RÉSOLUS

| ID | Description | Résolu le | Comment |
|----|-------------|-----------|---------|
| BUG-008 | SleepPage module vide, placeholder uniquement | 18/05/2026 | Implémenté de bout en bout : modèle prisma, route API CRUD complète, store Zustand et dashboard avec AreaChart Recharts et modal glassmorphic. |
| BUG-009 | NutritionPage tracking des calories absent | 18/05/2026 | Implémenté jauge circulaire SVG, progress macros, Recharts AreaChart, saisie manuelle de repas et synchro SQLite store en temps réel. |
| BUG-001 | habit-logs route userId hardcodé | 18/05/2026 | userId maintenant dynamique (POST/PUT/GET) avec fallback |
| BUG-002 | voice-memos route userId hardcodé | 18/05/2026 | userId maintenant dynamique (POST/PUT/GET/DELETE) avec fallback |
| BUG-003 | assistant route userId hardcodé | 18/05/2026 | userId maintenant dynamique (POST/GET) pour context & logs |
| BUG-004 | Mapper des événements dupliqué × 2 dans le Store | 18/05/2026 | Factorisé et nettoyé, utilise maintenant les mappers génériques `./mappers` |
| BUG-005 | HubAlimentairePage `toggleCuisine` non implémenté | 18/05/2026 | Complètement implémenté de manière dynamique avec active user ID et rafraîchissement d'état |
| BUG-006 | Audit package.json `z-ai-web-dev-sdk` | 18/05/2026 | Confirmé indispensable, utilisé dans TTS/ASR/Oracle/Recherche/Nutrition |
| BUG-007 | Dashboard: Données statiques, pas d'agrégation réelle | 18/05/2026 | Validé : entièrement branché sur le store Zustand et les APIs réelles, avec animations et mappers optimisés |
| — | Store monolithique de 1115 lignes | Avant 18/05 | Découpé en 12 stores |
| — | Historique Spirit perdu | Avant 18/05 | Tables dédiées SpiritConversation/SpiritMessage |
| — | Hardcoded IDs dans tasks/events | Avant 18/05 | Corrigé dans les stores |

