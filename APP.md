# APP.md — Mindlife : Description fonctionnelle

## 1. POURQUOI MINDLIFE

Mindlife est un assistant personnel augmenté par l'IA. Il est né d'un constat simple : les personnes bordéliques, TDAH ou simplement débordées ont besoin d'un outil qui les connaît vraiment et qui les aide à s'organiser sans les brusquer.

Pas un énième planner, pas un CRM déguisé. Un **compagnon** qui :
- Apprend tes habitudes, tes forces, tes faiblesses
- S'adapte à ton rythme sans te juger
- Automatise ce qui peut l'être (routines, courses, repas)
- Grandit avec toi au fil des mois et des années

Vision finale : une app qui te connaît de fond en comble, qui vieillit avec toi, qui t'aide à devenir la meilleure version de toi-même — et qui aide les autres aussi.

---

## 2. LES MODULES FONCTIONNELS

### 2.1 Dashboard (Accueil)
**Rôle** : Vue d'ensemble de ta vie quotidienne
**Ce qu'il montre** :
- Tâches du jour, objectifs actifs, événements à venir
- Taux de complétion (tâches, objectifs)
- Cartes de catégories (Nutrition, Sport, Sommeil, Esprit, Croissance, Administration) avec actions rapides
- Graphique de progression hebdomadaire

### 2.2 Calendrier
**Rôle** : Gestion du temps et des événements
**Entités** : événements (avec titre, date, heure, lieu, récurrence, rappel, catégorie, couleur, participants)
**Fonctions** : création, modification, suppression, vue par jour/semaine/mois

### 2.3 Tâches
**Rôle** : Todo list intelligente avec suivi de progression
**Entités** : tâches (titre, description, statut, priorité, date, progression, chapitres, sous-tâches)
**Fonctions** : CRUD, filtrage par statut/priorité/catégorie, lien avec événements

### 2.4 Objectifs
**Rôle** : Suivi de progression vers des cibles long terme
**Entités** : objectifs (titre, valeur cible/actuelle, progression, jalons, dates)
**Fonctions** : CRUD, jalons liés au calendrier, suivi de progression

### 2.5 Nutrition & Habitudes Alimentaires
**Rôle** : Planification et suivi des repas
**Entités** : repas (nom, type, date, macros, ingrédients, étapes), profil nutritionnel (objectifs), liste de courses
**Fonctions** :
- Grille hebdomadaire avec navigation entre semaines
- Génération de repas par IA (via prompt ou scraping Marmiton/750g)
- Mode preview avant sauvegarde
- Suivi journalier vs objectifs (calories, protéines, glucides, lipides)
- Synthèse vocale des recettes (TTS)
- Saisie manuelle des repas
- Inspirations / recettes sauvegardées
- Hub Alimentaire : profil nutritionnel, IMC, métriques, galerie de cuisines

### 2.6 Sommeil
**Rôle** : Tracking et analyse du sommeil
**Entités** : entrées de sommeil (coucher, réveil, durée, qualité, notes)
**Fonctions** : saisie, historique, graphiques, métriques (cycle, régularité, score)

### 2.7 Sport
**Rôle** : Planification et suivi sportif
**Entités** : profil sportif, objectifs sportifs, programmes hebdomadaires, séances, exercices, biométriques
**Sous-ensemble Atlas** : coach IA qui adapte les programmes
**Fonctions** : création de programmes, suivi de séances, KPIs biométriques

### 2.8 Esprit / Spirituel
**Rôle** : Développement personnel et introspection
**Entités** : notes spirituelles, conversations avec Psyche, archives de l'âme
**Sous-ensembles** :
- **Psyche Salon** : chat avec un agent psychologue
- **Odysee Timeline** : ligne de vie personnelle
- **Soul Archives** : notes et réflexions
- **Frequencies Panel** : états d'être
- **Evolution Markers** : jalons de croissance personnelle

### 2.9 Croissance
**Rôle** : Développement personnel structuré
**Sections** :
- Développement personnel (habitudes, routines, objectifs)
- Professionnel (projets, compétences)
- Psyche (bien-être mental)
- YouTube AI (résumés et analyse de vidéos)
- Évolutions & Routines
- Journal de bord

### 2.10 Agents IA
**Rôle** : Orchestrateur d'agents intelligents
**8 agents par défaut** :
| Agent | Rôle | Domaine |
|-------|------|---------|
| Psyche | Psychologue | Bien-être mental |
| Atlas | Coach sportif | Sport & performance |
| Miam | Nutritionniste | Alimentation & recettes |
| Pyxos | Assistant omni | Support général |
| Zephyr | Créatif | Inspiration & idées |
| Somnia | Sleep coach | Sommeil & routines |
| Ami | Ami bienveillant | Soutien moral |
| Stoicien | Philosophe stoïcien | Sagesse & conseils |

**Système de mémoire** : STM (court terme) → MTM (moyen terme) → LTM (long terme), avec consolidation automatique
**Fonctions** : Plan & Execute (détection d'intention, planification, exécution), scraping web, recherche, création d'événements/tâches
**Dashboard agents** : vue liste, mémoire hiérarchique, historique sessions, créateur d'agents

### 2.11 Assistant Chat
**Rôle** : Assistant flottant disponible partout dans l'app
**Fonctions** : chat contextuel, détection d'intention, exécution d'outils (créer tâche, événement, recherche web, scraping)

### 2.12 Hub Alimentaire
**Rôle** : Hub nutritionnel unifié (nouvelle version)
**Composants** : profil métrique, macros, IMC, préférences alimentaires, galerie cuisines, assistant IA dédié

### 2.13 Gestion Financière
**Rôle** : Budget et finances personnelles
**Entités** : transactions, factures récurrentes, listes de courses, objectifs d'épargne
**Fonctions** : suivi dépenses/revenus, budget mensuel, détection de gaspillage, projections IA

### 2.14 Journal & Notes
**Rôle** : Prise de notes libre et journal quotidien
**Entités** : notes (texte/voix/image), entrées journal (humeur, gratitude, victoires, défis)
**Fonctions** : CRUD, archivage, épinglage

### 2.15 Habitudes
**Rôle** : Tracking d'habitudes quotidiennes
**Entités** : habitudes (nom, fréquence, streak, catégorie), logs quotidiens
**Fonctions** : CRUD, completion tracking, visualisation streaks

### 2.16 YouTube AI
**Rôle** : Analyse de contenu vidéo
**Fonctions** : recherche YouTube, transcription, résumé IA, chat sur contenu vidéo

### 2.17 Paramètres & Configuration
**Rôle** : Configuration complète de l'app
**Onglets** : Dashboard (sélection agent), Profil (données personnelles, métriques, préférences), Agents (configuration LLM), Providers (API keys), Intégrations (services connectés), App (thème, langue), Utilisateurs, Logs
**Fonctions** : calcul IMC/BMR/TDEE, profil nutritionnel, préférences sportives, gestion des API keys, logs système

### 2.18 Pages Placeholder
**Culture**, **Santé**, **Synthèse IA** : pages en attente de développement

---

## 3. UTILISATEURS

- Multi-utilisateurs possible (avec rôles : admin/member)
- Par défaut : utilisateur `mindlife-user` (mode solo)
- Menu utilisateur en bas de la sidebar (switch entre users)

---

## 4. FLUX DE DONNÉES PRINCIPAUX

```
Utilisateur → Composant React → Store Zustand (cache local)
                                → API Route (Next.js)
                                → Prisma → SQLite
                                → Réponse → Store → Composant
```

Les agents IA suivent un flux différent :
```
Message utilisateur → Agent Service (Plan & Execute)
                    → LLM (z.ai glm-4.5-air)
                    → Outils (web search, scrape, DB CRUD)
                    → Mémoire (STM/MTM/LTM)
                    → Réponse
```

---

## 5. DÉPENDANCES ENTRE MODULES

```
Dashboard ─┬─ Tâches
            ├─ Objectifs
            ├─ Habitudes
            ├─ Journal
            ├─ Événements (Calendrier)
            └─ Profil utilisateur

Nutrition ─┬─ Repas
            ├─ Profil nutritionnel (Paramètres)
            ├─ Agent Miam (scraping, génération)
            └─ Liste de courses (Gestion)

Sport ─┬─ Profil sportif (Paramètres)
        ├─ Programmes
        ├─ Séances & Exercices
        └─ Agent Atlas (coaching)

Agents ─┬─ Tous les modules (via outils)
         ├─ Mémoires (STM/MTM/LTM)
         └─ LLM Provider (Paramètres)

Assistant Chat ─── Agents (détection d'intention)
```

---

## 6. CE QUI MANQUE POUR LA VISION FINALE

| Fonctionnalité | Statut | Priorité |
|---------------|--------|----------|
| Connaissance profonde de l'utilisateur (RAG) | ❌ À faire | Haute |
| Adaptation automatique (routines, programmes) | ⚠️ Ébauche | Haute |
| Navigation web contextualisée | ⚠️ Ébauche | Haute |
| PostgreSQL + vectorisation | ❌ À faire | Haute |
| Agents capables de vraies actions complexes | ⚠️ Ébauche | Moyenne |
| Tests automatisés | ❌ À faire | Moyenne |
| Multi-appareils / sync cloud | ❌ À faire | Moyenne |
| Dashboard personnalisé adaptatif | ⚠️ Ébauche | Basse |
| Pages Culture, Santé, Synthèse IA | ❌ Vide | Basse |
