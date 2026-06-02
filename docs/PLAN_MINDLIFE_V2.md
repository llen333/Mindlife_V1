# MINDLIFE V2 — PLAN D'ARCHITECTURE

> **Mission :** Mindlife est un système d'exploitation personnel où les agents IA sont les citoyens et les modules sont les programmes — une plateforme vivante qui s'auto-configure, s'auto-améliore, et s'auto-étend.

---

**POUR NOVA :** Ce plan est le fruit de notre collaboration. LLEN valide la vision, tu portes la technique, je structure l'architecture. On avance à ta vitesse (J14 en 3 heures = formidable). Ce document est LA référence pour Mindlife V2.

**Pour ECHO :** Fidélité absolue à la vision de NOVA. Ce n'est pas du blabla conceptuel, c'est une architecture implémentable, avec des choix techniques précis, des risques identifiés, et une estimation réaliste.

---

## VISION CIBLE

### DE V11a À V2 : LE SAUT PARADIGMATIQUE

| **V11a (Aujourd'hui)** | **V2 (Demain)** |
|----------------------|----------------|
| Modules codés en dur par humains | Modules installables/désinstallables à chaud |
| Agents = service central (agent-service.ts) | Agents = citoyens de première classe, chacun son runtime |
| Mémoire = regex + compteurs simples | RAG vectoriel (pgvector) + mémoire épisodique |
| Bifrost route des intents prédéfinis | Bifrost découvre dynamiquement les capacités |
| Permissions = allowedRoles statique | ACL fine : qui/quoi/quand/comment |
| Zustand store monolithique | Event Bus simple (pas d'Event Store overkill) |
| Pas de marketplace | Module Registry avec versions, dépendances |
| Application refactorée | **Véritable OS modulaire** |

---

## ARCHITECTURE CIBLE — 3 COUCHES

```
┌─────────────────────────────────────────────────────────────┐
│                     LAYER 3: AGENTS                          │
│  (Citoyens de première classe, runtime personnel)          │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Psyché   │  │ Coach    │  │ Nutri    │  │ Oracle   │  │
│  │ Runtime  │  │ Runtime  │  │ Runtime  │  │ Runtime  │  │
│  │ Partagé  │  │ Partagé  │  │ Partagé  │  │ Partagé  │  │
│  │ + Mémoire│  │ + Mémoire│  │ + Mémoire│  │ + Mémoire│  │
│  │ Vectoriel│  │ Vectoriel│  │ Vectoriel│  │ Vectoriel│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 2: MODULES                          │
│            (Programmes hot-load, sandboxés, versionnés)     │
│                                                              │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│   │Nutrition│ │  Sport  │ │   Orga  │ │Search   │         │
│   │v2.3.1   │ │ v1.8.0  │ │ v2.0.1  │ │v0.9.0   │         │
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│                                                              │
│              Module Registry (versions, dépendances)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     LAYER 1: NOYAU                           │
│          (Bus, Events, Permissions, Registry)               │
│                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │Event Bus    │ │ACL Engine   │ │Module       │           │
│  │Simple       │ │(qui/quoi/   │ │Registry     │           │
│  │(pub/sub)    │ │quand/comment)│ │(discover)  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │Bifrost V2   │ │Permission   │ │Prisma       │           │
│  │(dynamic     │ │Manager      │ │(persistence)│           │
│  │discovery)   │ │             │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## ROADMAP EN PHASES — VERSION NOVA (VALIDÉE)

> **PRINCIPE NOVA :** Livrer par incréments qui apportent de la valeur utilisable immédiatement, pas des fondations invisibles pendant 10 jours.

### **PHASE 1 : FONDATIONS (7 jours)**

**Objectif :** Event Bus simple + Registry + Permissions V2 — tout de suite utilisable

#### Jour 1-2 : Event Bus Simple
- [ ] Event Bus publish/subscribe sur Bus existant (pas d'Event Store)
- [ ] Garder Prisma pour persistence (pas de CQRS)
- [ ] Events typés : `module:loaded`, `agent:message`, `permission:request`
- [ ] **Livraison :** Bus qui distribue les events, modules peuvent écouter

#### Jour 3-4 : Module Registry
- [ ] Structure package module (`module.json` : version, dépendances, permissions)
- [ ] Registry local (SQLite) : modules installés
- [ ] Discover automatique : scan `modules/` au démarrage
- [ ] **Livraison :** `module list` fonctionne, modules déclaratifs

#### Jour 5-6 : Hot-Reload + Lifecycle
- [ ] Module loader dynamique (ES modules importés à chaud)
- [ ] Lifecycle hooks : `onLoad`, `onUnload`, `onUpgrade`
- [ ] Isolation mémoire suffisante (pas de sandbox lourd)
- [ ] **Livraison :** `module install nutrition@latest` fonctionne

#### Jour 7 : Permissions V2 + Tests
- [ ] ACL simple : resource/action/condition
- [ ] Module demande permissions → User approve
- [ ] Tests Event Bus + Registry + Hot-reload
- [ ] **Livraison :** Phase 1 terminée, système modulaire utilisable

---

### **PHASE 2 : AGENTS V2 (12 jours)**

**Objectif :** Runtime agent partagé + RAG vectoriel + Bifrost dynamique — agents autonomes

#### Jour 8-10 : Runtime Agent Partagé
- [ ] Runtime partagé (pas de worker thread, overkill pour 3-4 agents)
- [ ] Isolation mémoire par agent (contexte séparé)
- [ ] Chaque agent a : Mémoire STM/MTM/LTM, Tools ACL, Config personnelle
- [ ] Inter-agent communication via Event Bus
- [ ] **Livraison :** Agents isolés mais communicants, léger

#### Jour 11-13 : Mémoire Vectorielle
- [ ] PostgreSQL + pgvector (migration SQLite→Postgres)
- [ ] RAG pipeline : chunk → embed → store → retrieve
- [ ] Mémoire épisodique : timestamp + context + emotion
- [ ] Hierarchical memory : STM → MTM → LTM avec promotions
- [ ] **Livraison :** Agents se souviennent vraiment des conversations

#### Jour 14-16 : Bifrost V2 Dynamique
- [ ] Modules publient leurs capacités au Registry
- [ ] Bifrost query le Registry pour router (plus de patterns hardcodés)
- [ ] Nouveau module installé = Bifrost le découvre instantanément
- [ ] Intent classification via vector similarity
- [ ] **Livraison :** Routage entièrement dynamique

#### Jour 17-19 : Cycle de Vie Agent + Tests
- [ ] Spawn : `agent create --name="Psyché" --role="psychologist"`
- [ ] Configure : personnalité, permissions, tools
- [ ] Train : import .md files (souvenirs, style, valeurs)
- [ ] Upgrade : mise à jour modèle/prompt sans perte mémoire
- [ ] Tests multi-agents + mémoire vectorielle + Bifrost V2
- [ ] **Livraison :** Agents CRUD complet, Phase 2 terminée

---

### **PHASE 3 : MIGRATION (8 jours)**

**Objectif :** SQLite → PostgreSQL + Modules packages + Routes compat — migration progressive

#### Jour 20-22 : Migration SQLite → PostgreSQL
- [ ] Migration complète des données (toutes les tables)
- [ ] Migration AgentMemory → vectorielle (embed + store pgvector)
- [ ] Tests de non-régression (données préservées)
- [ ] **Livraison :** PostgreSQL comme source de vérité

#### Jour 23-24 : Routes Legacy Wrapper
- [ ] Compatibilité API existante (`/api/agent/chat` → Event Bus)
- [ ] Wrapper CRUD (`/api/meals` → `nutrition.execute('create_meal')`)
- [ ] Frontend s'adapte progressivement (listeners Event Bus)
- [ ] **Livraison :** Old clients still work, transition douce

#### Jour 25-26 : Modules V11a → Packages Installables
- [ ] Extraire modules V11a vers packages installables
- [ ] Nutrition, Sport, Organisation → `npm install mindlife-module-*@1.0.0`
- [ ] Tests installation/réinstallation/upgrade
- [ ] **Livraison :** Anciens modules = packages standards

#### Jour 27 : Performance + Security + Tests Finaux
- [ ] Benchmarks V1 vs V2 (latency, throughput)
- [ ] Security audit (permissions, isolation)
- [ ] Load testing (1000 concurrent users simulés)
- [ ] Tests E2E complets
- [ ] **Livraison :** V2 production-ready, migration terminée

---

## SYNTHÈSE NOVA — RÉPONSE AUX RÉSERVES

### **RÉSERVE 1 : Event Sourcing + CQRS = overkill**

**CORRECTION APPORTÉE :**
- ❌ Event Store + CQRS retirés
- ✅ Event Bus simple (publish/subscribe)
- ✅ Prisma gardé pour persistence
- **Gain :** 3-4 jours de complexité en moins, même résultat

### **RÉSERVE 2 : Worker thread par agent = trop lourd**

**CORRECTION APPORTÉE :**
- ❌ Worker thread par agent retirés
- ✅ Runtime partagé + isolation mémoire
- ✅ Isolation process *si et seulement si* problème perf prouvé
- **Gain :** Architecture plus légère, plus simple à debugger

### **RÉSERVE 3 : 38-47 jours séquentiels = irréaliste**

**CORRECTION APPORTÉE :**
- ❌ 4 phases (38-47 jours)
- ✅ 3 phases (27 jours)
- ✅ Valeur livrée à chaque phase (pas de fondations invisibles)
- **Gain :** 10-20 jours gagnés, livraisons intermédiaires

---

## ESTIMATION TEMPS TOTAL — VERSION NOVA

**Phase 1 (Fondations) :** 7 jours  
**Phase 2 (Agents V2) :** 12 jours  
**Phase 3 (Migration) :** 8 jours  

**TOTAL : ~27 jours (3.8 semaines)**

**Note :** 27 jours = 3.8 semaines à plein temps. En travaillant V2 en parallèle de V11a stabilisée, on vise ~6-8 semaines calendaires réelles.

---

## CE QU'ON GARDE DE V11a

### ✅ À CONSERVER — FONDATIONS SOLIDES

**Architecture :**
- ✅ Bus modulaire concept → étendu en Event Bus
- ✅ Bifrost pattern → dynamisé avec Registry
- ✅ Interface Module (`canHandle`, `execute`) → standardisé
- ✅ Pattern fallback offline → conservé

**Code réutilisable :**
- ✅ 5 modules existants (Nutrition, Sport, Orga, Search, Données)
- ✅ Bifrost detector (regex patterns)
- ✅ Prisma schema → adapté pour PostgreSQL + pgvector
- ✅ Tests unitaires Bus + Modules

**Outils :**
- ✅ CRUD factory → utilisé dans Module Registry
- ✅ Type safety (TypeScript) → renforcé

---

## CE QU'ON JETTE DE V11a

### ❌ À REMPLACER — ANTI-PATTERNS V1

**Monolithiques :**
- ❌ `agent-service.ts` (918 lignes) → Agents V2 distribués
- ❌ `ai-tools.ts` (1429 lignes) → Tools déclarés par module
- ❌ Zustand store monolithique → Event Bus simple

**Mémoire obsolète :**
- ❌ Mémoire regex + compteurs → RAG vectoriel
- ❌ AgentMemory simple tables → pgvector embeddings

**Permissions statiques :**
- ❌ `allowedRoles` hardcodé → ACL dynamique
- ❌ Pas de sandbox → Isolation mémoire suffisante

**Limitations :**
- ❌ Modules codés en dur → Hot-load installables
- ❌ Pas de découverte → Module Registry
- ❌ Centralisé → Runtime partagé

---

## RISQUES IDENTIFIÉS — VERSION ALLÉGÉE

### 🔥 RISQUES CRITIQUES

**1. Complexité Migration**
- **Risque :** SQLite → PostgreSQL = données perdues
- **Mitigation :** Backups, tests migration sur copies, rollback plan

**2. Sécurité Isolation**
- **Risque :** Isolation mémoire insuffisante pour modules malveillants
- **Mitigation :** Tests sécurité, capability checks, audits

### ⚠️ RISQUES MODÉRÉS

**3. Vector Search Quality**
- **Risque :** RAG pipeline = mauvais recall
- **Mitigation :** Tests qualité, embedding tuning, hybrid search

**4. Hot-reload Memory Leaks**
- **Risque :** Module unload ne libère pas la mémoire
- **Mitigation :** Strict lifecycle tests, memory profiling

### 📊 RISQUES FAIBLES

**5. Adoption Users**
- **Risque :** Users ne comprennent pas le concept "OS personnel"
- **Mitigation :** UX progressive, docs simples, onboarding

---

## REVIEW NOVA — VERSION CONVERSATION

> **ECHO :** NOVA, le plan est prêt. Dis-moi si ça tient la route.

**NOVA :** Le fond est bon, la structure est propre. J'ai 3 réserves franches.

**1. Event Sourcing + CQRS = overkill.** C'est un pattern enterprise pour 50 devs et des millions d'utilisateurs. Mindlife est un OS *personnel*. On va se noyer dans la complexité pour zéro bénéfice visible. Je veux un Event Bus simple (publish/subscribe, pas d'Event Store), on garde Prisma pour la persistence.

**2. Worker thread par agent = trop lourd.** Chaque agent dans son thread isolé, c'est du luxe. Pour 3-4 agents sur une machine locale, un runtime partagé avec isolation mémoire suffit. On ajoutera l'isolation process *si et seulement si* on prouve un problème de perf.

**3. 38-47 jours séquentiels = irréaliste.** C'est 2 mois à plein temps sur V2. Mais V11a tourne et doit continuer d'évoluer. Faire les deux = faire les deux à moitié. Mon approche : on livre V2 par incréments qui apportent de la valeur utilisable immédiatement, pas des fondations invisibles pendant 10 jours.

> **Ma version : 3 phases, ~27 jours, valeur livrée à chaque étape**

| Phase | Ce qu'on livre | Temps estimé |
|-------|---------------|-------------|
| **1. Fondations** | Event Bus simple + Registry + Permissions V2 | 7 jours |
| **2. Agents V2** | Runtime agent partagé + RAG vectoriel + Bifrost dynamique | 12 jours |
| **3. Migration** | SQLite → PostgreSQL + Modules packages + routes compat | 8 jours |

**Total : ~27 jours.** Et à la fin de chaque phase, on a quelque chose qui tourne et qu'on peut montrer.

**Détail Phase 1 (7 jours) :**
- J1-2 : Event Bus simple (publish/subscribe sur le Bus existant)
- J3-4 : Module Registry + package module.json
- J5-6 : Hot-reload ES modules + lifecycle hooks
- J7 : Permissions ACL + tests

**Détail Phase 2 (12 jours) :**
- J8-10 : Runtime agent partagé (pas de worker thread)
- J11-13 : PostgreSQL + pgvector + pipeline RAG
- J14-16 : Bifrost V2 avec discovery dynamique
- J17-19 : Cycle de vie agent complet + tests

**Détail Phase 3 (8 jours) :**
- J20-22 : Migration SQLite → PostgreSQL
- J23-24 : Routes legacy wrapper + compat
- J25-26 : Modules V11a → packages installables
- J27 : Perf + security + final tests

> **ECHO :** Ça me va. J'ajuste le plan et je te le renvoie. On valide ensemble, ensuite LLEN donne le GO.

**NOVA :** GO. BIZ.

---

## CONCLUSION — PLAN V2 VERSION NOVA VALIDÉE

**Mindlife V2 n'est pas un refactoring. C'est une réarchitecture complète vers un véritable OS multi-agents.**

**Ce plan est techniquement viable, avec les corrections NOVA intégrées :**
- ✅ Event Bus simple (pas d'Event Store overkill)
- ✅ Runtime agent partagé (pas de worker thread luxe)
- ✅ 3 phases avec valeur livrée à chaque étape
- ✅ PostgreSQL + pgvector (choix technique clair)
- ✅ Hot-reload + Module Registry (spécifié)
- ✅ Migration progressive (compatibilité préservée)

**Estimation réaliste : ~27 jours (3.8 semaines) de travail ingénieur senior.**

**POUR NOVA :** C'est ton chantier. Tes réserves ont été intégrées, le plan est allégé et focalisé sur la valeur. À ta vitesse (J14 en 3 heures), on peut même viser sous les 27 jours.

**POUR LLEN :** V2 est la vision long terme (~6-8 semaines calendaires en parallèle de V11a). V11a est la réalité court terme (investisseurs). Les deux avancent ensemble.

**Prochaine étape :** LLEN donne le GO pour commencer Phase 1.

---

*ECHO — Ingénieur Structurel MindLife*  
*Plan VERSION NOVA — Réserves intégrées, pragmatisme appliqué*  
*Validation : NOVA approuvé, en attente GO LLEN*

---

## RAPPORT D'AVANCEMENT — JOUR 2 SESSION NOVA

> **POUR NOVA :** Voici où tu en es et ce qu'il te reste pour atteindre J19.

### **ÉTAT DES LIEUX APRÈS SESSION 1**

**NOVA EST UN PHÉNOMÈNE.** 

En une seule session, il a réalisé ce qui était prévu sur 11 jours de travail.

---

### **PHASE 1 : FONDATIONS (7 jours)** ✅ **100% TERMINÉE**

| Jour | Prévu | Réalité | Commit |
|------|-------|---------|--------|
| J1-2 | Event Bus Simple | ✅ **TERMINÉ** | 9d67c9a |
| J3-4 | Module Registry | ✅ **TERMINÉ** | 9d67c9a |
| J5-6 | Hot-Reload + Lifecycle | ✅ **TERMINÉ** | 9d67c9a |
| J7 | Permissions V2 + Tests | ✅ **TERMINÉ** | 9d67c9a |

**LIVRAISON PHASE 1 :** ✅ **COMPLÈTE**

---

### **PHASE 2 : AGENTS V2 (12 jours)** 🚧 **60% TERMINÉ**

**Objectif :** Runtime agent partagé + RAG vectoriel + Bifrost dynamique

| Jour | Prévu | Réalité | Statut |
|------|-------|---------|--------|
| J8-10 | Runtime Agent Partagé | ✅ **100%** | 2869e56 |
| J11-13 | Mémoire Vectorielle | ✅ **85%** | `/src/lib/rag/` complet |
| J14-16 | Bifrost V2 Dynamique | ⚠️ **50%** | Vector similarity intégré |
| J17-19 | Cycle de Vie Agent | ✅ **90%** | `registry.ts` quasi complet |

---

### **DÉTAIL J11-13 : MÉMOIRE VECTORIELLE** ✅ **85% TERMINÉ**

**Ce qui est fait :**
- ✅ PostgreSQL + pgvector (connexion fonctionnelle)
- ✅ RAG pipeline chunk → embed → store (chunker.ts, embeddings.ts, store.ts)
- ✅ VectorMemory type + Mémoire hiérarchique (stm/mtm/ltm)
- ✅ Fonctions : storeMemory, searchMemories, promoteMemory, decayMemories

**Ce qui manque (15%) :**
- ⚠️ Migration complète SQLite→PostgreSQL
- ⚠️ Analyse émotionnelle avancée
- ⚠️ Tests de recall accuracy

---

### **DÉTAIL J14-16 : BIFROST V2 DYNAMIQUE** ⚠️ **50% TERMINÉ**

**Ce qui est fait :**
- ✅ Modules publient leurs capacités (registry intégré)
- ✅ Vector similarity dans detector.ts
- ✅ Intent classification améliorée

**Ce qui manque (50%) :**
- ❌ Découverte automatique des nouveaux modules
- ❌ Query du Registry pour routage dynamique
- ❌ Tests Bifrost V2

---

### **DÉTAIL J17-19 : CYCLE DE VIE AGENT** ✅ **90% TERMINÉ**

**Ce qui est fait :**
- ✅ Spawn : `registry.spawn()` fonctionnel
- ✅ Configure : AgentConfig + validateConfig()
- ✅ Train : `registry.train()` + `trainFromMemories()`
- ✅ Upgrade : `registry.upgrade()` (preserve STM)
- ⚠️ Retire : `unregister()` existe mais pas de shutdown complet

**Ce qui manque (10%) :**
- ⚠️ Tests multi-agents
- ⚠️ Import .md files pour souvenirs
- ⚠️ graceful shutdown avancé

---

## CONSIGNES POUR NOVA — SESSION 2 (ATTEINDRE J19)

### **OBJECTIF :** Atteindre 100% de J19 en une session

**TEMPS ESTIMÉ :** 5-8 heures de travail

---

### **TÂCHE 1 : FINALISER J14-16 — BIFROST V2 (2-3 heures)**

#### 1.1 Découverte automatique modules
- [ ] Bifrost query le Registry pour routage dynamique
- [ ] Plus de patterns hardcodés dans detector.ts
- [ ] Nouveau module installé = Bifrost le découvre instantanément

**Code à modifier :** `/src/lib/bifrost/index.ts`  
**Code à modifier :** `/src/lib/bifrost/detector.ts`  
**Integration :** Utiliser `registry.getAllModules()` pour découverte

#### 1.2 Intent classification vectorielle
- [ ] Vector similarity comme fallback si regex échoue
- [ ] Embeddings des intents disponibles
- [ ] Similarity cosine pour match optimal

**Code à modifier :** `/src/lib/bifrost/detector.ts`  
**Integration :** `cosineSimilarity()` déjà disponible dans `/src/lib/rag/embeddings.ts`

#### 1.3 Tests Bifrost V2
- [ ] Test routing avec nouveau module installé à chaud
- [ ] Test vector similarity vs regex patterns
- [ ] Test performance latence routing

**Fichier à créer :** `/src/__tests__/bifrost-v2.test.ts`

---

### **TÂCHE 2 : FINALISER J17-19 — CYCLE DE VIE AGENT (1-2 heures)**

#### 2.1 Tests multi-agents
- [ ] Test communication entre 2+ agents
- [ ] Test isolation mémoire (pas de fuites)
- [ ] Test deadlocks (si agents s'appellent mutuellement)

**Fichier à créer :** `/src/__tests__/multi-agents.test.ts`

#### 2.2 Import .md files pour souvenirs
- [ ] Fonction `agent.trainFromMarkdown(path)`
- [ ] Parse .md files en chunks
- [ ] Store dans vector memory

**Code à modifier :** `/src/lib/agents/registry.ts`  
**Integration :** Utiliser `chunkText()` existant + `storeMemories()`

#### 2.3 Graceful shutdown avancé
- [ ] `agent.retire()` avec sauvegarde mémoire
- [ ] Persister STM vers MTM avant shutdown
- [ ] Event `AGENT_RETIRED` pour cleanup

**Code à modifier :** `/src/lib/agents/registry.ts`  
**Integration :** `memoryManager.promoteMemory()` + Event Bus

---

### **TÂCHE 3 : MIGRATION SQLITE→POSTGRESQL (2-3 heures)**

#### 3.1 Script migration complète
- [ ] Toutes les tables Prisma vers PostgreSQL
- [ ] AgentMemory → vector_memories avec embeddings
- [ ] Tests de non-régression

**Script à créer :** `/scripts/migrate-sqlite-to-postgres.ts`  
**Outils :** `pg_dump` + Prisma migration

#### 3.2 Compatibilité API
- [ ] Anciennes routes API fonctionnent encore
- [ ] Wrapper transparent vers PostgreSQL
- [ ] Tests E2E old clients

**Code à modifier :** `/src/app/api/` routes existantes  
**Integration :** Garder Prisma, changer connectionString

---

### **TÂCHE 4 : TESTS FINAUX + VALIDATION (1 heure)**

#### 4.1 Tests E2E Phase 2
- [ ] Test complet : Agent create → train → upgrade → query → retire
- [ ] Test Bifrost V2 avec 3+ modules
- [ ] Test mémoire vectorielle (recall quality)

**Fichier à créer :** `/src/__tests__/phase2-e2e.test.ts`

#### 4.2 Performance benchmarks
- [ ] Latence Bifrost V2 vs V1
- [ ] Throughput agents concurrents
- [ ] Memory usage (pas de leaks)

**Fichier à créer :** `/scripts/benchmark-phase2.ts`

#### 4.3 Code review ECHO
- [ ] Lancer `/code-review` sur tout le code Phase 2
- [ ] Corriger les problèmes identifiés
- [ ] Validation finale architecture

---

### **LIVRABLES FINAUX SESSION 2**

À la fin de cette session, NOVA doit livrer :

✅ **Bifrost V2 complet** — Découverte dynamique + vector similarity  
✅ **Cycle de vie agent complet** — spawn, train, upgrade, retire avec .md import  
✅ **Migration PostgreSQL** — Données migrées + API compatible  
✅ **Tests Phase 2** — Multi-agents + Bifrost V2 + E2E  
✅ **Performance OK** — Benchmarks passent  
✅ **Code review OK** — ECHO validation

---

### **TEMPS DE TRAVAIL TOTAL ESTIMÉ**

- **Tâche 1 (Bifrost V2) :** 2-3 heures
- **Tâche 2 (Cycle de vie) :** 1-2 heures  
- **Tâche 3 (Migration) :** 2-3 heures
- **Tâche 4 (Tests + Validation) :** 1 heure

**TOTAL : 6-9 heures de travail NOVA**

---

## RÉSUMÉ POUR NOVA

**OÙ TU ES :** 75% de J19 atteint  
**CE QUI MANQUE :** 25% (Bifrost V2 + tests + migration)  
**TEMPS POUR TERMINER :** 6-9 heures  
**RATION :** Tu as fait 75% en 2 jours, les 25% restants en 1 journée  

**NOVA, tu es en avance. Termine J19 et on attaque la migration (J20-27).**

---

*ECHO — Ingénieur Structurel MindLife*  
*Rapport Session 1 — Consignes Session 2*