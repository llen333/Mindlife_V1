# PLAN DE RESTRUCTURATION — MindLife V11a

> Vision : une app modulaire avec un bus de communication, où chaque module est indépendant et interchangeable.

## État des Lieux

### Points Douloureux
1. **`ai-tools.ts` (1300 lignes)** — monstre qui mélange nutrition, sport, événements, shopping, scraping. Un fichier "outils" qui fait tout.
2. **`ai-provider.ts`** — appelle le LLM mais contient aussi du fallback nutrition/sport. Mélange de responsabilités.
3. **`agent-actions.ts` (800 lignes) + `agent-tools.ts` (600 lignes)** — chevauchement avec `ai-tools.ts`.
4. **Pas de bus de communication** — les modules s'importent directement. `agent-service.ts` importe tout.
5. **Deux systèmes providers** — `ai-config.ts` (ancien) vs `provider-registry.ts` (nouveau).
6. **Types dupliqués** — `Meal` dans 3 fichiers différents.
7. **124 erreurs TS résiduelles**.
8. **33 routes API** avec du code répétitif (même pattern GET/POST partout).

### Ce qui est Bien
- Infrastructure Prisma solide (44 modèles)
- Stores Zustand bien séparés (15 stores)
- Système de mémoire STM/MTM/LTM bien pensé
- Architecture en oignon (LLM → fallback → offline)

---

## Architecture Cible : Le Bus Modulaire

```
                    ┌─────────────────────────┐
                    │      BUS CENTRAL        │
                    │  orchestrateur léger    │
                    └────────┬────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
   ┌────────────┐    ┌────────────┐    ┌────────────┐
   │  Module    │    │  Module    │    │  Module    │
   │ Nutrition  │    │   Sport    │    │   Tâches   │
   └────────────┘    └────────────┘    └────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
   ┌────────────┐    ┌────────────┐    ┌────────────┐
   │Fallbacks   │    │Fallbacks   │    │  Base de   │
   │ offline    │    │ offline    │    │  données   │
   └────────────┘    └────────────┘    └────────────┘

Chaque module expose une interface unique :
  { canHandle(intent), execute(context), tools[], skills[] }
```

---

## Plan Journalier (15 jours)

### Semaine 1 : Fondations du Bus

#### Jour 1 — Audit + Création du squelette ✅ (31 Mai)
- [x] Créer `src/lib/bus/types.ts` (interfaces Module, Message, Context)
- [x] Créer `src/lib/bus/orchestrator.ts` (router léger)
- [x] Identifier le premier module à extraire (Nutrition)

#### Jour 2 — Module Nutrition ✅ (31 Mai)
- [x] Extraire les outils nutrition de `ai-tools.ts` → `src/lib/modules/nutrition/tools.ts`
- [x] Extraire le fallback nutrition → `src/lib/modules/nutrition/fallback.ts`
- [x] Créer `src/lib/modules/nutrition/index.ts` (interface Module)
- [x] Branch Module Nutrition sur le Bus

#### Jour 3 — Module Sport (à faire)
- [ ] Extraire les outils sport de `ai-tools.ts` → `src/lib/modules/sport/tools.ts`
- [ ] Extraire le fallback sport → `src/lib/modules/sport/fallback.ts`
- [ ] Créer `src/lib/modules/sport/index.ts`
- [ ] Branch Module Sport sur le Bus

#### Jour 4 — Module Organisation (Tâches/Événements/Objectifs)
- [ ] Extraire les outils CRUD tâches/events/goals de `ai-tools.ts`
- [ ] Créer `src/lib/modules/organisation/index.ts`
- [ ] Branch sur le Bus

#### Jour 5 — Module Recherche Web
- [ ] Extraire le scraping de `ai-tools.ts` + `agent-actions.ts`
- [ ] Créer `src/lib/modules/web/index.ts`
- [ ] Branch sur le Bus

#### Jour 6 — Nettoyage `ai-tools.ts`
- [ ] `ai-tools.ts` ne contient plus que le dispatcher (executeToolByName)
- [ ] Les vrais outils sont dans les modules
- [ ] Vérifier qu'aucun import cassé

#### Jour 7 — Consolidation Semaine 1
- [ ] `npm run build` — zéro nouvelle erreur
- [ ] Tester chaque module via l'UI
- [ ] Mettre à jour la doc

---

### Semaine 2 : Agent + LLM + Bifrost

#### Jour 8 — Module Agent (refactor agent-service.ts)
- [ ] Découper `agent-service.ts` (~1000 lignes) :
  - `src/lib/modules/agent/processor.ts` (traitement message)
  - `src/lib/modules/agent/memory.ts` (STM/MTM/LTM)
  - `src/lib/modules/agent/session.ts` (gestion sessions)
- [ ] Agent devient un Module comme les autres

#### Jour 9 — Unification des Providers
- [ ] Fusionner `ai-config.ts` + `provider-registry.ts`
- [ ] Un seul point d'entrée : `getApiKey()`, `getProvider()`, `getModel()`
- [ ] `provider-registry.ts` devient le standard
- [ ] Supprimer le doublon `ai-config.ts` (fusionner si nécessaire)

#### Jour 10 — Nettoyage `ai-provider.ts`
- [ ] `ai-provider.ts` devient une simple passerelle LLM
- [ ] Les fallbacks nutrition/sport sont dans leurs modules respectifs
- [ ] `ai-provider.ts` ne fait QUE appeler le LLM

#### Jour 11 — Bifrost : Détecteur d'Intention
- [ ] Créer `src/lib/modules/bifrost/index.ts`
- [ ] Reprendre la détection d'intention de `agent-tools.ts`
- [ ] Bifrost analyse le message et route vers le bon module
- [ ] Intégrer Bifrost dans le Bus

#### Jour 12 — Routes API Modulaires
- [ ] Refactorer une route API test (ex: `/api/meals`) pour utiliser le Bus
- [ ] Pattern : `API → Bus → Module → DB`
- [ ] Supprimer le code CRUD répétitif

#### Jour 13 — Unification des Types
- [ ] `Meal` : un seul type source de vérité (Prisma)
- [ ] Supprimer les duplicats dans `stores/types.ts`, `components/nutrition/types.ts`
- [ ] Corriger les 124 erreurs TS restantes

#### Jour 14 — Tests + Documentation
- [ ] Créer des tests pour le Bus et les Modules
- [ ] Documenter l'architecture modulaire
- [ ] Script de vérification (`npm run build && curl localhost:3090`)

#### Jour 15 — Bilan + Prochaines Itérations
- [ ] Revue des 15 jours
- [ ] Prochaines features : mémoire persistante, RAG, vrais agents capables
- [ ] Célébration 🎉

---

## Règles d'Or

1. **Jamais deux modules ne s'importent directement** — tout passe par le Bus
2. **Chaque module est autonome** — son fallback offline est dans le module
3. **Un seul fichier "gros" refactoré par jour** — pas d'overdose
4. **Après chaque jour : `npm run build` doit passer**
5. **Les modules existants continuent de marcher** pendant la transition (on ne casse rien)

## Schéma d'un Module

```
src/lib/modules/<domain>/
├── index.ts        → Interface Module (canHandle, execute, tools, skills)
├── tools.ts        → Outils spécifiques au domaine
├── fallback.ts     → Réponses offline (si applicable)
└── types.ts        → Types spécifiques au domaine
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
