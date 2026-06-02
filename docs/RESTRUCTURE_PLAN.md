# PLAN DE RESTRUCTURATION — MindLife V11a

> **Vision réelle :** un système d'exploitation dont les programmes sont des entités IA.
> L'app Mindlife est la coque visible, le Bus modulaire est le noyau.
> Chaque module est une entité autonome qui apprend, s'adapte, et demain s'écrira elle-même.

## État des Lieux

### Points Douloureux
1. **`ai-tools.ts` (1429 lignes)** — monstre tentaculaire. En cours de dépeçage (3 extractions faites, reste ~600 lignes à dispatcher).
2. **`ai-provider.ts`** — appelle le LLM mais contient aussi du fallback. Mélange de responsabilités.
3. **`agent-actions.ts` (985 lignes) + `agent-tools.ts` (403 lignes)** — chevauchement partiel avec `ai-tools.ts`.
4. **Bus modulaire existant** ✅ — plus aucun module ne s'importe directement.
5. **Deux systèmes providers** — `ai-config.ts` (ancien) vs `provider-registry.ts` (nouveau). À fusionner.
6. **Types dupliqués** — `Meal` dans 3 fichiers différents.
7. **~124 erreurs TS résiduelles**.
8. **44 routes API** avec du code CRUD répétitif.

### Ce qui est Bien
- Infrastructure Prisma solide (44 modèles)
- **Bus modulaire opérationnel** + 5 modules branchés
- **Bifrost opérationnel** — routage intelligent 0-Lightning ou 1-Deep call LLM
- Architecture en oignon (LLM → fallback → offline) intégrée dans chaque module
- Chaque module embarque son fallback offline, zéro dépendance externe
- Détection d'intention 0 LLM call pour les cas évidents (lightning)
- Images agents en local (fini le décodage réseau)
- Système de mémoire STM/MTM/LTM en place
- Le code commence à ressembler à un OS plutôt qu'à une app

---

## Architecture Actuelle (01 Juin)

```
                     ┌──────────────────────────┐
                     │       BIFROST            │
                     │  detecteur d'intention   │
                     │  (lightning + deep)      │
                     └──────┬───────────────────┘
                            │
                     ┌──────▼───────────────────┐
                     │   BUS (Orchestrator)     │
                     │  route vers le bon module│
                     └──────┬───────────────────┘
                            │
    ┌──────────┬──────────┬─┼──────────┬──────────┬──────────┐
    │          │          │ │          │          │          │
    ▼          ▼          ▼ ▼          ▼          ▼          ▼
 ┌──────┐ ┌──────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐
 │ NUTR │ │SPORT │ │ORGANISAT │ │RECHERCHE │ │DONNEES │ │ LEGACY  │
 │rition│ │      │ │  ion     │ │   Web    │ │ & Logs │ │ (pont)  │
 └──────┘ └──────┘ └──────────┘ └──────────┘ └────────┘ └─────────┘

Chaque module :
  ✓ Interface unique : canHandle, execute, tools, skills
  ✓ Fallback offline embarqué
  ✓ Auto-registration sur le Bus à l'import
  ✓ Zéro import croisé entre modules
```

---

## Plan Journalier — Réel vs Planifié

### Légende
- **Planifié** = ce qui était prévu dans le plan original
- **Réel** = ce qu'on a effectivement fait
- **Delta** = écart et raison

---

### J1 (30 Mai) — Bus Modulaire

| Planifié | Réel | Delta |
|----------|------|-------|
| Audit + création squelette Bus | ✅ Bus types.ts + orchestrator.ts | Conforme |
| Identifier 1er module (Nutrition) | ✅ Nutrition identifié | Conforme |

### J2 (30 Mai) — Module Nutrition

| Planifié | Réel | Delta |
|----------|------|-------|
| Extraire outils nutrition | ✅ nutrition/tools.ts (5 outils) | Conforme |
| Extraire fallback nutrition | ✅ nutrition/fallback.ts | Conforme |
| Créer index.ts | ✅ nutrition/index.ts | Conforme |
| Branch sur le Bus | ✅ Auto-register | Conforme |

### J3 (31 Mai) — Module Sport

| Planifié | Réel | Delta |
|----------|------|-------|
| Extraire outils sport | ✅ sport/tools.ts (2 outils) | Conforme |
| Extraire fallback sport | ✅ sport/fallback.ts | Conforme |
| Créer index.ts + Bus | ✅ sport/index.ts + auto-register | Conforme |
| *(non prévu)* | **✅ Bifrost créé** (types, detector, legacy, index) | **ANTICIPÉ de J11** |

**Pivot :** Bifrost a été construit en J3 au lieu de J11. Une fois le Bus en place, c'était la brique logique suivante — la détection d'intention avant même de laisser le LLM Plan & Execute décider.

### J4 (1 Juin) — Module Organisation

| Planifié | Réel | Delta |
|----------|------|-------|
| Extraire CRUD tâches/events/goals | ✅ organisation/tools.ts | Conforme |
| Créer index.ts + Bus | ✅ organisation/index.ts | Conforme |
| *(non prévu)* | **✅ Bifrost wiring dans agent-service.ts** | **ANTICIPÉ de J11** |
| *(non prévu)* | **✅ CRUD bypass** (réponse directe, pas de LLM) | **AMÉLIORATION** |
| *(non prévu)* | **✅ cleanTitle** amélioré (verbes, articles, dates) | **AMÉLIORATION** |
| *(non prévu)* | **✅ Fix CPU spike** (backdrop-filter supprimé) | **BUG FIX** |

### J5 (1 Juin) — Module Recherche Web

| Planifié | Réel | Delta |
|----------|------|-------|
| Extraire scraping | ✅ recherche/tools.ts (web_search, scrape_url) | Conforme |
| Créer index.ts + Bus | ✅ recherche/index.ts | Conforme |
| *(non prévu)* | **✅ Pattern Bifrost pour web search** | **CONSOLIDATION** |

**Note :** Le plan original mettait la Recherche en J5. On l'a faite le même jour que J4. Rythme soutenu.

### J6 (1 Juin) — Module Données

| Planifié | Réel | Delta |
|----------|------|-------|
| *Rien de prévu (J6 = nettoyage ai-tools)* | **✅ donnees/tools.ts** (notes, poids, sommeil, courses) | **NOUVEAU MODULE** |
| *(non prévu)* | **✅ Fix save_note pattern** trop large (note.*pour) | **BUG FIX** |
| *(non prévu)* | **✅ Fix routing Organisation** (utilisation context.intent) | **BUG FIX** |
| *(non prévu)* | **✅ Ordre patterns Bifrost réordonné** | **AMÉLIORATION** |
| *(non prévu)* | **✅ Pattern note.*rendez-vous ajouté à event_create** | **AMÉLIORATION** |

**Pivot :** Au lieu de nettoyer `ai-tools.ts`, on a extrait un 5e module et consolidé le routing. Le nettoyage de `ai-tools.ts` est déplacé en J7.

---

## Bilan des 3 jours (30 Mai → 1 Juin)

### Ce qu'on a construit

| Composant | Fichiers | Lignes |
|-----------|----------|--------|
| Bus modulaire (types + orchestrator) | 2 | ~106 |
| Module Nutrition | 3 | ~230 |
| Module Sport | 3 | ~228 |
| Module Organisation | 3 | ~226 |
| Module Recherche Web | 3 | ~141 |
| Module Données & Logs | 3 | ~303 |
| Bifrost (détecteur + routeur) | 4 | ~402 |
| **Total** | **21 fichiers** | **~1 636 lignes** |

### Ce qui reste

| Tâche | Sévérité | Estimation |
|-------|----------|------------|
| **Nettoyage ai-tools.ts** (retirer outils extraits) | Haute | 1 jour (J7) |
| **Module Agent** (découpage agent-service.ts) | Haute | 2 jours (J8-J9) |
| **Unification providers LLM** (ai-config vs provider-registry) | Haute | 1 jour (J10) |
| **Bifrost : permissions + skills connectés aux modules** | Haute | 1 jour (J11) |
| **Routes API modulaires** (API → Bus → Module → DB) | Moyenne | 1 jour (J12) |
| **Unification des types** (Meal, erreurs TS) | Moyenne | 1 jour (J13) |
| **Tests + documentation** | Haute | 1-2 jours (J14-J15) |

---

## Plan Journalier Révisé

> Tient compte de Bifrost anticipé (J3→J11) et des nouveaux modules.

### J7 (1-2 Juin) — Nettoyage `ai-tools.ts` + Consolidation
- [ ] Retirer les 5 blocs d'outils déjà extraits (nutrition, sport, organisation, web, données)
- [ ] Réduire `ai-tools.ts` au seul dispatcher `executeToolByName`
- [ ] Vérifier que `agent-service.ts` utilise le Bus partout où possible
- [ ] `npm run build` — 0 nouvelle erreur

### J8 — Module Agent (découpage agent-service.ts)
- [ ] Découper `agent-service.ts` (~918 lignes) :
  - `src/lib/modules/agent/processor.ts` (traitement message + Plan & Execute)
  - `src/lib/modules/agent/memory.ts` (STM/MTM/LTM)
  - `src/lib/modules/agent/session.ts` (gestion sessions)
- [ ] L'agent devient un Module comme les autres, branché sur le Bus
- [ ] Il ne parle plus directement à `ai-tools.ts` — il passe par le Bus

### J9 — Unification des Providers LLM
- [ ] Fusionner `ai-config.ts` + `provider-registry.ts`
- [ ] Un seul point d'entrée : `getApiKey()`, `getProvider()`, `getModel()`
- [ ] Supprimer le doublon

### J10 — Nettoyage `ai-provider.ts`
- [ ] `ai-provider.ts` devient une simple passerelle LLM
- [ ] Les fallbacks nutrition/sport sont dans leurs modules respectifs (déjà fait ✅)
- [ ] `ai-provider.ts` ne fait QUE appeler le LLM

### J11 — Bifrost V2 : Permissions + Skills
- [ ] Bifrost vérifie les permissions agent → module (allowedRoles)
- [ ] Skills = liste des modules autorisés par agent
- [ ] DB seed pour les rôles
- [ ] Bifrost utilise l'historique de conversation pour la détection

### J12 — Routes API Modulaires
- [ ] Pattern : `API → Bus → Module → DB`
- [ ] Supprimer le code CRUD répétitif dans les 44 routes
- [ ] Route test (ex: `/api/meals`) refactorée d'abord

### J13 — Unification des Types + Erreurs TS
- [ ] `Meal` : un seul type source de vérité (Prisma)
- [ ] Supprimer les duplicats dans `stores/types.ts`, `components/nutrition/types.ts`
- [ ] Corriger les ~124 erreurs TS restantes

### J14 — Tests
- [ ] Tests unitaires pour le Bus et les Modules
- [ ] Tests d'intégration pour Bifrost
- [ ] Script de vérification automatisé

### J15 — Bilan
- [ ] Revue des 15 jours
- [ ] Prochaines étapes : permissions fines, mémoire RAG vectorielle, agents capables d'écrire leurs propres modules
- [ ] Prochaine session : architecture Mindlife V2 (le vrai chantier OS)

---

## Règles d'Or

1. **Jamais deux modules ne s'importent directement** — tout passe par le Bus ✅
2. **Chaque module est autonome** — son fallback offline est dans le module ✅
3. **Un seul fichier "gros" refactoré par jour** — pas d'overdose
4. **Après chaque jour : `npm run build` doit passer** ✅
5. **Les modules existants continuent de marcher** pendant la transition
6. **Bifrost est le cerveau** — détection 0 ou 1 call LLM, jamais 2-3

---

## Schéma d'un Module

```
src/lib/modules/<domain>/
├── index.ts        → Interface Module (canHandle, execute, tools, skills) + auto-register
├── tools.ts        → Outils spécifiques au domaine
├── fallback.ts     → Réponses offline (si applicable)
└── types.ts        → Types spécifiques au domaine (optionnel)
```

## Interface Module

```typescript
interface Module {
  id: string;
  name: string;
  canHandle(intent: string): boolean;
  execute(context: MessageContext): Promise<ModuleResponse>;
  getTools(): ToolDefinition[];
  getSkills(): SkillDefinition[];
}
```
