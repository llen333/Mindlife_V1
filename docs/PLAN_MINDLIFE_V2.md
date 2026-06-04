# MINDLIFE V2 — PLAN D'ARCHITECTURE (MIS À JOUR)

> **Mission :** Mindlife est un système d'exploitation personnel où les agents IA sont les citoyens et les modules sont les programmes — une plateforme vivante qui s'auto-configure, s'auto-améliore, et s'auto-étend.

---

## OÙ ON EN EST (04/06/2026)

**Session unique :** ~12h de travail, 6 commits, ~3000 lignes, 0 régression.

**Plan original estimé à 27 jours → réalisé à ~80% en 1 jour.**

---

## PHASE 1 — FONDATIONS ✅ TERMINÉE

| Item | Statut | Fichiers clés |
|------|--------|--------------|
| Event Bus simple (publish/subscribe) | ✅ | `src/lib/bus/` |
| Module Registry + package module.json | ✅ | `kernel/store/manager.ts` |
| Hot-Reload + Lifecycle hooks | ✅ | `src/lib/loader.ts` |
| Permissions ACL + tests | ✅ | `kernel/security/permissions.ts` |

**Tests :** 42 tests Phase 1, 100% verts.

---

## PHASE 2 — AGENTS V2 ✅ TERMINÉE

| Item | Statut | Fichiers clés |
|------|--------|--------------|
| Runtime agent partagé + isolation mémoire | ✅ | `src/lib/agents/runtime.ts` |
| PostgreSQL + pgvector + pipeline RAG | ✅ | `src/lib/rag/` |
| Bifrost V2 dynamique + vector similarity | ✅ | `src/lib/bifrost/` |
| Cycle de vie agent (spawn, train, upgrade, retire) | ✅ | `src/lib/agents/registry.ts` |
| Tests multi-agents + E2E | ✅ | `src/__tests__/multi-agents.test.ts`, `phase2-e2e.test.ts` |

**Tests :** 245 tests, 100% verts (0 échec, 0 régression).

---

## PHASE 3 — KERNEL & INFRASTRUCTURE ✅ TERMINÉE

*Initialement non prévue au plan — ajoutée par NOVA pour construire un véritable OS.*

| Item | Statut | Fichiers |
|------|--------|----------|
| **Kernel IPC autonome** (serveur WebSocket, 50+ méthodes) | ✅ | `kernel/ipc/` |
| **Module Store** (registre packages, dépendances) | ✅ | `kernel/store/manager.ts` |
| **Module Store distant** (registry `.tar.gz`, checksum) | ✅ | `kernel/store/remote.ts`, `packager.ts` |
| **Runtime Isolation** (sandbox, rate limit, timeout, DLQ) | ✅ | `kernel/runtime/` |
| **Sandbox durci** (mémoire, budget CPU, isolation fichiers/réseau) | ✅ | `kernel/runtime/sandbox.ts` |
| **Memory Consolidation** (STM→MTM→LTM background) | ✅ | `kernel/memory/consolidation.ts` |
| **Sécurité & Audit** (tokens, permissions, audit) | ✅ | `kernel/security/` |
| **Sécurité avancée** (tokens HMAC, IP limiter, SecurityMonitor) | ✅ | `kernel/security/` |

**Méthodes IPC totales :** 60+

---

## PHASE 4 — FRONTEND SHELL ✅ TERMINÉE

*Nouvelle UI digne d'un OS, ajoutée après le kernel.*

| Item | Statut | Fichiers |
|------|--------|----------|
| **OsShell** — layout OS (sidebar + topbar + content) | ✅ | `src/components/shell/OsShell.tsx` |
| **OsSidebar** — navigation dynamique + statut kernel | ✅ | `src/components/shell/OsSidebar.tsx` |
| **OsTopBar** — titre + indicateur kernel temps réel | ✅ | `src/components/shell/OsTopBar.tsx` |
| **OsContent** — rendu du panneau actif | ✅ | `src/components/shell/OsContent.tsx` |
| **ModuleRenderer** — registry composants + rendu dynamique | ✅ | `src/components/shell/ModuleRenderer.tsx` |
| **KernelDashboard** — dashboard kernel live | ✅ | `src/components/kernel/KernelDashboard.tsx` |
| **ModuleStore UI** — installer/désinstaller depuis l'UI | ✅ | `src/components/kernel/ModuleStore.tsx` |
| **ErrorBoundary** — relaye les erreurs React vers kernel | ✅ | `src/components/ErrorBoundary.tsx` |
| **Module Diagnostic** — démonstration registerPanel() | ✅ | `src/components/diagnostic/DiagnosticPage.tsx` |

---

## PHASE 5 — MIGRATION & POLISH ⏳ EN COURS (40%)

*Dernière phase avant la V2 stable.*

### J1 : Backup & Rollback PostgreSQL (estimé 1 jour)

| Item | Statut | Notes |
|------|--------|-------|
| PostgreSQL natif | ✅ | Homebrew 18.3, pgvector 0.8.2, socket /tmp:5432 |
| Script backup `scripts/backup.sh` | ✅ | pg_dump gzip, rotation 30j |
| Script restore | ✅ | Restaure le dernier backup avec confirmation |
| Script list | ✅ | Liste backups disponibles |
| Tests de non-régression | ✅ | 254 tests passent (0 fail) |

### J2 : Wrappers Legacy & Compat API (estimé 1 jour)

| Item | Statut | Notes |
|------|--------|-------|
| Anciennes routes API wrap kernel | ❌ | Routes actuelles appellent encore les modules directement |
| Frontend adapté au kernel | ✅ | OsShell + WebSocket kernelClient |
| Compatibilité old clients | ❌ | Vérifier que tout marche encore |

### J3 : Modules V11a en Packages Installables ✅ TERMINÉ

| Item | Statut | Notes |
|------|--------|-------|
| Nutrition → package `.tar.gz` | ✅ | `packages/nutrition/` — 4.3 KB, SHA-256 |
| Sport → package `.tar.gz` | ✅ | `packages/sport/` — 4.1 KB |
| Organisation → package `.tar.gz` | ✅ | `packages/organisation/` — 3.8 KB |
| Recherche → package `.tar.gz` | ✅ | `packages/recherche/` — 2.5 KB |
| Données → package `.tar.gz` | ✅ | `packages/donnees/` — 4.6 KB |
| Script build `packages/scripts/build.ts` | ✅ | Lit module.json + sources → tar.gz + checksum |
| Script build-all `packages/scripts/build-all.ts` | ✅ | Build les 5 modules en séquence |
| Registry local `packages/scripts/serve.ts` | ✅ | Serveur HTTP : index, infos, download .tar.gz |
| Tests package pipeline (9 tests) | ✅ | Build, checksum, register, install, remote |

### J4 : Documentation (estimé 1 jour)

### J4 : Documentation (estimé 1 jour)

| Item | Statut | Notes |
|------|--------|-------|
| Doc technique (architecture, API, IPC) | ❌ | |
| Doc utilisateur (guide, concepts) | ❌ | |

### J5 : Perf & Tests Finaux (estimé 1 jour)

| Item | Statut | Notes |
|------|--------|-------|
| Load testing kernel | ❌ | 1000 requêtes concurrentes |
| Benchmarks mémoire/CPU | ❌ | Pas de fuites |
| Tests E2E complets | ✅ | 245 tests passent |
| Audit sécurité final | ❌ | Vérifier isolation |

---

## PHASE 6 — FUTUR 🚀

*Après la V2 stable.*

| Item | Priorité | Dépend de |
|------|----------|-----------|
| Distribution multi-dispositifs (kernels synchronisés) | ⭐⭐⭐ | Phase 5 terminée |
| Registry déployé (registry.mindlife.ai) | ⭐⭐⭐ | Phase 5 terminée |
| Système de plugins utilisateur (sandbox graphique) | ⭐⭐ | Distribution prête |
| Store public (marketplace modules) | ⭐⭐ | Registry déployé |

---

## STATISTIQUES GLOBALES

| Métrique | Valeur |
|----------|--------|
| Commits aujourd'hui | 8 |
| Lignes ajoutées aujourd'hui | ~3 600 |
| Tests passant | 254 / 254 (100%) |
| Fichiers test | 18 |
| Méthodes IPC | 60+ |
| Composants frontend | 4 shell + 2 kernel + 1 diagnostic |
| Packages créés | 5 (nutrition, sport, organisation, recherche, donnees) |
| Phases terminées | 4 / 6 (Phase 5 J1+J3 faits) |
| Temps réel | ~12h session unique |

---

## PROCHAINE ACTION

**Phase 5 — J1 : Script migration SQLite → PostgreSQL**

Démarrer par le plus concret : créer un script de migration automatisé qui exporte SQLite → importe PostgreSQL, avec backup rollback.

---

*Document mis à jour le 04/06/2026 par NOVA.*
*Validation LLEN requise avant chaque phase.*
