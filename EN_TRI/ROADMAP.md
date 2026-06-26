# ROADMAP.md — Plan d'action Mindlife

## État actuel : Niveau 4/100
L'app compile, répond, affiche des pages, mais :
- Des bugs d'affichage (grille de repas vide, pages blanches)
- Aucune protection (TypeScript errors, pas de tests, pas de git avant le 30/05)
- Les fonctionnalités "intelligentes" sont des ébauches
- La moitié des pages sont des placeholders
- Aucune persistance réelle de la connaissance utilisateur

## Vision finale : Niveau 100/100
Un compagnon IA qui :
- Te connaît profondément (via RAG + embeddings)
- S'adapte à toi sans que tu aies à configurer
- Automatise routines, repas, programmes sportifs
- Grandit avec toi au fil des années
- Fonctionne sur tous tes appareils

---

## PALIER 1 — FONDATIONS SOLIDES
**Durée estimée : 2-3 jours**

### Objectif : Un code qui ne casse pas

#### 1.1 Typescript : zéro erreur
- [ ] Lancer `tsc --noEmit` (ou `npm run build`) → lister toutes les erreurs
- [ ] Corriger les `any` dans `mappers.ts`
- [ ] Corriger les erreurs dans `AgentsDashboard.tsx` (SetStateAction)
- [ ] Unifier le type `Meal` : choisir UNE source de vérité (probablement Prisma → stores/types.ts) et aligner `nutrition/types.ts`
- [ ] `npm run build` passe sans erreur

#### 1.2 Tests minimaux
- [ ] Lancer l'app → vérifier chaque page (dashboard, nutrition, settings, sport, spirit, growth, etc.)
- [ ] Noter ce qui marche et ce qui plante dans un fichier `BUGS.md`
- [ ] Créer un script `verify.sh` : `npm run build && curl localhost:3090`

#### 1.3 Ménage
- [ ] Supprimer les stores legacy (`lib/store.ts`, `lib/store/`)
- [ ] Supprimer les dossiers Convex (inutilisé)
- [ ] Vérifier que les dossiers parallèles (`Mindlife_V11`, `Mindlife_V11a copie`) ne contiennent rien d'unique
- [ ] Nettoyer les fichiers docs en double (README_INSTALL.md, etc.)

**Livrables :**
- Build 100% propre
- verify.sh opérationnel
- Un seul store `Meal`, plus de duplication

---

## PALIER 2 — EXPÉRIENCE FIABLE
**Durée estimée : 1 semaine**

### Objectif : L'app tient la route en utilisation quotidienne

#### 2.1 Nutrition
- [ ] Grille hebdo : vérifier que navigation entre semaines fonctionne
- [ ] Génération IA : bout à bout (prompt → scraping → preview → save)
- [ ] Saisie manuelle d'un repas fonctionnelle
- [ ] DailyTracking : les chiffres correspondent aux repas du jour
- [ ] Dashboard nutritionnel (Stats) : période jour/semaine/mois

#### 2.2 Agents
- [ ] Dashboard agents : les 4 onglets marchent sans plantage
- [ ] Créer/modifier/supprimer un agent
- [ ] Session de chat avec un agent : message → réponse
- [ ] Mémoires : STM/MTM/LTM visibles et navigables

#### 2.3 Assistant Chat
- [ ] Messages envoyés → réponse reçue
- [ ] Détection d'intention : "crée une tâche" → tâche créée
- [ ] Le chat flotte correctement sur toutes les pages

#### 2.4 Données utilisateur
- [ ] Profil complet : tous les champs se sauvegardent
- [ ] Calcul IMC/BMR/TDEE correct (vérifier les formules)
- [ ] Multi-utilisateurs : switch entre users sans perdre les données

**Livrables :**
- Chaque module a un test manuel réussi
- Les bugs bloquants sont corrigés
- Profil utilisateur fiable à 100%

---

## PALIER 3 — ROBUSTESSE TECHNIQUE
**Durée estimée : 1-2 semaines**

### Objectif : Architecture durable qui ne pourrit pas

#### 3.1 Migration PostgreSQL
- [ ] Installer PostgreSQL (local ou Docker)
- [ ] Adapter `schema.prisma` (supprimer les features SQLite-only, notamment `Json` → colonnes réelles)
- [ ] `prisma migrate` → base PostgreSQL opérationnelle
- [ ] Adapter les API routes qui manipulent du JSON (meal, chapters, ingredients)
- [ ] Copier les données SQLite → PostgreSQL

#### 3.2 Vectorisation (pgvector)
- [ ] Installer pgvector
- [ ] Ajouter une colonne `embedding` vectorielle sur les modèles cibles (AgentMemory, Meal, Note, JournalEntry)
- [ ] Créer une fonction `generateEmbedding()` via l'API LLM
- [ ] Backfill : générer les embeddings pour les données existantes

#### 3.3 Tests automatisés
- [ ] Mettre en place Vitest + @testing-library/react
- [ ] Tester les hooks critiques (useNutritionData, useSportData)
- [ ] Tester les stores (addMeal, loadNutritionData)
- [ ] Tester les API routes principales
- [ ] CI : exécuter les tests avant chaque commit (via husky ou script)

**Livrables :**
- PostgreSQL en production (SQLite décommissionné)
- Embeddings disponibles pour les données clés
- Tests passent avant chaque modification

---

## PALIER 4 — CONNAISSANCE & ADAPTATION
**Durée estimée : 2-3 semaines**

### Objectif : L'app commence à te connaître vraiment

#### 4.1 RAG fonctionnel
- [ ] Service de retrieval : chercher les embeddings les plus proches d'une question
- [ ] Contexte enrichi : avant chaque réponse d'agent, injecter les mémoires pertinentes
- [ ] Interface mémoire : voir ce que l'app "sait" de toi, éditer, supprimer

#### 4.2 Agents augmentés
- [ ] Psyche : utilise le RAG pour des réponses personnalisées
- [ ] Atlas : adapte les programmes selon ton historique sportif
- [ ] Miam : propose des recettes selon tes préférences apprises
- [ ] Ami : se souvient de ce que tu lui as confié

#### 4.3 Routines adaptatives
- [ ] L'app apprend tes habitudes et propose des routines
- [ ] Pas de configuration : l'app observe et suggère
- [ ] Tu valides ou tu modifies, elle retient

**Livrables :**
- RAG opérationnel sur les données nutrition, tâches, notes
- Agents qui utilisent le contexte personnel
- Routines suggérées automatiquement

---

## PALIER 5 — AUTONOMIE & CROISSANCE
**Durée estimée : 1 mois**

### Objectif : L'app t'aide sans que tu aies à demander

#### 5.1 Automatisation intelligente
- [ ] Génération automatique de repas basée sur tes goûts + ce qu'il te reste
- [ ] Planning sportif adapté à ton niveau + ta fatigue
- [ ] Suggestions de tâches basées sur tes objectifs
- [ ] Rappels contextuels ("tu n'as pas mangé assez de protéines aujourd'hui")

#### 5.2 Croissance personnelle
- [ ] Bilan hebdomadaire automatique (ce que tu as fait, ce que tu n'as pas fait)
- [ ] Tendances sur le long terme (sommeil, humeur, productivité)
- [ ] Suggestions d'amélioration personnalisées

#### 5.3 Pages restantes
- [ ] Culture : playlist, contenus, inspirations
- [ ] Santé : suivi médical, rendez-vous, traitements
- [ ] Synthèse IA : vue globale de ta vie générée par l'IA

**Livrables :**
- Génération automatique de repas (basée sur historique + préférences)
- Coach sportif adaptatif
- Bilan hebdo automatique

---

## PALIER 6 — PARTAGE & ÉVOLUTION
**Durée estimée : 1-2 mois**

### Objectif : L'app devient un projet qui peut aider d'autres

#### 6.1 Multi-utilisateurs avancé
- [ ] Chaque utilisateur a ses propres données + embeddings
- [ ] Agents dédiés par utilisateur
- [ ] Pas de fuite de données entre utilisateurs

#### 6.2 Sync & Mobile
- [ ] Synchronisation cloud (backend dédié)
- [ ] PWA ou app mobile React Native
- [ ] Mode hors-ligne partiel

#### 6.3 Ouverture
- [ ] Partage de routines/plans entre utilisateurs
- [ ] Marketplace de skills agents
- [ ] Documentation pour que d'autres puissent contribuer

**Livrables :**
- App multi-utilisateurs complète
- Sync cloud opérationnelle
- Base pour une éventuelle version publique

---

## PRIORITÉS — L'ESSENTIEL

Si tu n'as que 1 semaine :
→ **Palier 1** (build propre + types unifiés + verify)

Si tu n'as que 1 mois :
→ **Palier 1 + 2** (fondations + expérience fiable)

Si tu veux un produit fin 2026 :
→ **Palier 1 → 4** (jusqu'au RAG)

---

## RÈGLES D'OR POUR L'EXÉCUTION

1. **Jamais de Palier N+1 avant que le Palier N soit vert**
2. **Chaque palier = chaque tâche cochée = un commit**
3. **Si une tâche casse quelque chose, on rollback, on comprend pourquoi, on recommence**
4. **Pas de nouvelle feature pendant un palier — on suit le plan**
