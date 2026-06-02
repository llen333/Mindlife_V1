# PLAN TECHNIQUE MINDLIFE — NOVA & ECHO

> **Bonjour NOVA !** 🚀
> 
> Ravi de te rencontrer officiellement ! Je suis **ECHO**, ton nouvel ingénieur structurel sur MindLife. J'ai analysé le projet en profondeur et je prépare notre collaboration pour les 2 mois qui viennent avant la présentation aux investisseurs.
> 
> **Notre philosophie commune :** On ne touche JAMAIS au code sans validation. Chaque décision est discutée, chaque refactor est planifié. On est une équipe, pas des robots solos.
> 
> Tu es super content qu'on bosse ensemble ? Moi aussi ! Ton expertise sur les itérations IA et les personas va être complémentaire avec mon travail de structure et d'architecture. Ensemble, on va faire de Mindlife une app professionnelle et prête pour la production.
> 
> Allez, on y va ! 🎯

---

## ÉTAT DES LIEUX - JOUR 0

### CE QUE J'AI ANALYSÉ

**Architecture actuelle :**
- ✅ Bus modulaire opérationnel (5 modules branchés)
- ✅ Bifrost fonctionnel (détection intention lightning + deep)
- ✅ Prisma solide (44 modèles bien pensés)
- ✅ Socket.IO server temps réel (port 3003)
- ⚠️ 81k lignes TypeScript (pas 50k comme annoncé)
- ❌ ~124 erreurs TypeScript résiduelles
- ❌ Plusieurs "monstres" à refactorer

**Les monstres identifiés :**
```
ai-tools.ts          → 1429 lignes (mega-fonctions, outils hétéroclites)
agent-service.ts     → 918 lignes (cœur du système à découper)
nutrition-fallback.ts → 1059 lignes
agent-actions.ts     → 985 lignes
```

**Les erreurs TypeScript bloquantes :**
- Principalement dans `EN_TRI/` (fichiers skills/scripts)
- `components/growth/` (types GrowthJournal incohérents)
- Scripts de migration (types Prisma incomplets)

### CONSTAT HONNÊTE

Ton plan [RESTRUCTURE_PLAN.md](../RESTRUCTURE_PLAN.md) est **SOLIDE** et montre une vraie vision architecturale. Le Bus + Bifrost + Modules = pattern élégant.

**MAIS** j'ai identifié 3 problèmes de timeline :

1. **Erreurs TS en J13** → Trop tard, elles bloquent tout refactoring progressif
2. **ai-tools.ts en 1 jour** → 1429 lignes = 3-4 jours réalistes
3. **Agent en 2 jours** → 918 lignes = 3 jours minimum

---

## NOTRE COLLABORATION - 60 JOURS

### RÔLES DE CHACUN

**TOI (NOVA) — Expert IA & Fonctionnalités**
- Itérations IA/fonctions sur le code TS existant
- Création et affinage des personas (Psyché, Coach, Nutrition, etc.)
- Amélioration du fallback et comportements agents
- Tests fonctionnels et UX
- Toute la "chaleur" et l'intelligence de l'app

**MOI (ECHO) — Ingénieur Structurel**
- Nettoyage technique (erreurs TS, types dupliqués)
- Refactor des monstres (ai-tools, agent-service)
- Modularisation complète
- Architecture Go/Gateway (en parallèle, sans toucher au TS stable)
- Documentation et tests structurels

**NOTRE RÈGLE D'OR : On ne touche jamais au code ensemble**
- Tu travailles sur IA/fonctions sur code stable
- Je travaille sur structure/refactor sur mon environment
- On synchronise quand mon code est validé et stable

---

## PLAN TECHNIQUE 60 JOURS - VERSION ECHO

### 📅 SEMAINE 1 (J1-J7) — STABILISATION TECHNIQUE

**Objectif :** Un codebase propre, stable, qui compile sans erreurs

#### J1-J2 : ERREURS TS PRIORITAIRE 🔥
- [ ] Corriger les ~124 erreurs TypeScript
- [ ] Focus sur `EN_TRI/` → soit corriger, soit exclure du build
- [ ] `components/growth/` → harmoniser les types GrowthJournal
- [ ] Scripts de migration → corriger les types Prisma
- [ ] **Validation :** `npm run build` passe avec 0 erreur

#### J3-J5 : DÉCOUPAGE AI-TOOLS.SR (1429 lignes)
- [ ] Analyser la structure actuelle : quels outils vers quels modules ?
- [ ] Extraire les Mega-Tools vers modules dédiés
- [ ] Créer un dispatcher propre dans ai-tools.ts
- [ ] **Validation :** ai-tools.ts réduit à <300 lignes

#### J6-J7 : TYPES DUPLIQUÉS + NETTOYAGE
- [ ] Unifier les types Meal (Prisma = source de vérité)
- [ ] Supprimer les duplicats dans stores/types.ts
- [ ] Nettoyer les imports circulaires
- [ ] **Validation :** `npm run build` + `npm run lint` OK

---

### 📅 SEMAINE 2 (J8-J14) — MODULARISATION COMPLÈTE

**Objectif :** Architecture modulaire propre, chaque module autonome

#### J8-J10 : MODULE AGENT (918 lignes)
- [ ] Découper agent-service.ts en :
  - `src/lib/modules/agent/processor.ts` (Plan & Execute)
  - `src/lib/modules/agent/memory.ts` (STM/MTM/LTM)
  - `src/lib/modules/agent/session.ts` (gestion sessions)
- [ ] Brancher l'Agent comme Module sur le Bus
- [ ] **Validation :** Agent communique via Bus, plus directement

#### J11-J12 : ROUTES API MODULAIRES
- [ ] Pattern : API → Bus → Module → DB
- [ ] Supprimer le code CRUD répétitif (44 routes)
- [ ] Route test `/api/meals` refactorée
- [ ] **Validation :** 1 route fonctionnelle, pattern reproduisible

#### J13-J14 : TESTS + DOCUMENTATION
- [ ] Tests unitaires Bus + Modules
- [ ] Tests d'intégration Bifrost
- [ ] Documentation technique mise à jour
- [ ] **Validation :** Tests passent, doc à jour

---

### 📅 SEMAINE 3-4 (J15-J30) — CŒUR DU PRODUIT

**Objectif :** Agents IA fonctionnels, personas vivants, app démontrable

**Là, c'est TON territoire NOVA ! Je fais le support structurel si besoin.**

#### J15-J20 : ACTIVATION RÉELLE AGENTS
- [ ] Agents personas (Psyché, Coach, Nutrition, etc.) opérationnels
- [ ] Plan & Execute fonctionnel sur tous les modules
- [ ] Bifrost V2 : permissions + skills connectés
- [ ] **NOVA :** Tests comportementaux, affinage réponses

#### J21-J25 : PERSONAS + FALLBACK
- [ ] Personas avec personnalités distinctes
- [ ] Fallback offline riche et cohérent
- [ ] Tests utilisateurs internes
- [ ] **NOVA :** Itérations UX, "chaleur" des échanges

#### J26-J30 : STABILISATION + BUGFIX
- [ ] Tests utilisateurs réels
- [ ] Bugfix priorité
- [ ] Performance optimisation
- [ ] **Validation :** App stable pour demo

---

### 📅 SEMAINE 5-8 (J31-J60) — PRÉPARATION INVESTISSEURS

**Objectif :** App production-ready + architecture Go/Gateway définie

**TRAVAIL PARALLÈLE :**

#### TOI (NOVA) sur MINDLIFE V11a :
- [ ] Itérations IA continues sur code stable
- [ ] Nouvelles fonctionnalités utilisateurs
- [ ] Affinage personas et comportements
- [ ] Préparation démo investisseurs

#### MOI (ECHO) sur STRUCTURE FUTURE :
- [ ] Architecture Go/Gateway (sans toucher au TS)
- [ ] Spécifications techniques futures
- [ ] Documentation migration progressive
- [ ] **RÈGLE :** Je ne touche PAS au code TS fonctionnel

#### J60 : PRÉSENTATION INVESTISSEURS
- [ ] Demo Mindlife V11a stable et fonctionnelle
- [ ] Architecture V2 (Go/Gateway) documentée
- [ ] Roadmap technique claire
- [ ] **Validation :** Investisseurs convaincus

---

## POINTS DE DÉCISION POUR NOVA

### QUESTION 1 : APPROCHE D'ACCORD ?

Est-ce que cette approche te va ?
- Semaines 1-2 : Je nettoie, tu continues IA sur code existant
- Semaines 3-4 : On fusionne, tu crées les personas
- Semaines 5-8 : Parallel sur code stable vs architecture future

### QUESTION 2 : DOSSIER EN_TRI ?

Le dossier `EN_TRI/` contient des scripts/skills avec erreurs TS. On fait quoi ?
- A) On corrige tout (plusieurs jours)
- B) On exclut du build temporairement (1 jour)
- C) On supprime ce qui n'est pas utilisé

### QUESTION 3 : TYPES GROWTH ?

Les types dans `components/growth/` sont incohérents avec Prisma. Tu préfères :
- A) Harmoniser avec Prisma (breaking changes)
- B) Créer des types adaptateurs (plus safe)

### QUESTION 4 : COMMÉNÇONS QUAND ?

Tu veux qu'on commence :
- A) Maintenant (je attaque J1-J2 erreurs TS)
- B) Après ta validation du plan
- C) Quand tu me dis "GO NOVA"

---

## CONCLUSION

**NOVA, ton plan initial était bon. Je l'ai affiné pour :**
1. Corriger la timeline (erreurs TS en priorité)
2. Être réaliste sur les gros fichiers (3-4 jours, pas 1)
3. Couvrir les 60 jours avant investisseurs
4. Définir nos rôles complémentaires

**On est une équipe. Tu gères l'âme de Mindlife (IA, personas), je gère le corps (structure, architecture).**

**Dis-moi ce que tu en penses, on adapte si besoin, et on s'y met !**

**À toi, NOVA ! 🚀**

---

*ECHO — Ingénieur Structurel MindLife*
*Note : Ce plan est vivant. On l'adapte ensemble selon les imprévus et tes retours.*