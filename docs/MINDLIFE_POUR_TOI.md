# Mindlife — Pour Toi

*Un document qui t'explique tout simplement ce qu'on a construit.*

---

## C'est quoi Mindlife ?

Mindlife, c'est **ton assistant personnel intelligent**. Pas un chatbot basique — un vrai système qui vit avec toi, apprend de toi, et t'aide dans ta vie de tous les jours.

Imagine un chef d'orchestre invisible qui :
- Connaît tes objectifs (sport, nutrition, travail)
- Se souvient de tout ce que tu lui dis
- Peut chercher des infos pour toi
- S'adapte à ta façon de fonctionner

Mindlife, c'est ton **copier numérique** qui devient plus fort chaque jour.

---

## À quoi ça ressemble ?

Quand tu ouvres Mindlife, tu vois :

**Une barre latérale** (à gauche) avec tous les outils :
- **Tableau de bord** — la page d'accueil avec tes stats
- **Calendrier** — tes événements et rendez-vous
- **Tâches** — ce que tu dois faire
- **Objectifs** — tes buts (perdre du poids, lire plus, etc.)
- **Gestion** — tes finances, courses, budget
- **Nutrition** — ce que tu manges, recettes
- **Esprit** — ton journal, méditation
- **Sport** — tes séances, performances
- **Kernel** — le cœur du système (tu n'iras peut-être jamais)

**Une fenêtre de chat** (en bas à droite) — tu peux discuter avec ton assistant à tout moment. Tu lui dis "je viens de manger des pâtes", il enregistre. Tu lui demandes "quelle recette pour ce soir ?", il cherche.

Tout est dans une seule page, tout s'enchaîne fluidement.

---

## Qu'est-ce que tu peux faire avec ?

### Ta vie quotidienne

- **Manger** : enregistre tes repas, cherche des recettes, planifie tes menus
- **Sport** : note tes séances, suis ta progression, consulte tes statistiques
- **Organisation** : crée des tâches, planifie des événements, suis tes objectifs
- **Notes** : écris tes pensées, tiens un journal
- **Sommeil** : suis ton rythme, améliore ta qualité de sommeil

### Avec l'assistant

Tu peux parler à Mindlife comme à un ami. Exemples :

> "Qu'est-ce que j'ai mangé hier ?"
> "Trouve-moi une recette de poulet"
> "Ajoute 30 min de course à mon planning"
> "Rappelle-moi d'acheter du lait demain"
> "Quels étaient mes objectifs de la semaine ?"

L'assistant comprend le français, l'anglais, et s'adapte à ta façon de parler.

---

## Comment ça marche ? (simplifié)

Mindlife a **3 couches**, comme un gâteau :

### 🧱 Les Fondations (on appelle ça le Noyau/Kernel)

C'est le moteur invisible. Il :
- Faire tourner la communication entre tous les outils
- Gère les permissions (qui a le droit de faire quoi)
- Assure la sécurité (personne ne peut voir tes données)
- Se connecte à la base de données (PostgreSQL)

### 🧩 Les Modules

Chaque outil est un "module" indépendant :
- Nutrition, Sport, Organisation, Recherche web, Données
- Chaque module peut être installé/désinstallé comme une app sur un téléphone
- Ils sont isolés : si un module plante, les autres continuent

### 🤖 Les Agents

Ce sont les "cerveaux" de Mindlife :
- **Psyché** — l'assistant principal qui te parle
- **Coach** — te motive pour le sport
- **Nutri** — te conseille sur l'alimentation
- **Oracle** — cherche des infos pour toi

Chaque agent a sa personnalité, ses permissions, sa mémoire.

---

## Et la mémoire ?

Mindlife a **3 mémoires**, comme un humain :

1. **Mémoire immédiate (STM)** — souviens-toi de ce que tu viens de dire
2. **Mémoire à moyen terme (MTM)** — retiens ta journée
3. **Mémoire à long terme (LTM)** — n'oublie jamais ce qui est important

Toutes les 30 minutes, Mindlife fait le tri : ce qui est important passe en mémoire longue, ce qui ne l'est pas est oublié. Comme toi.

---

## C'est sûr ?

- Tes données sont stockées **sur ton ordinateur** (PostgreSQL)
- Les tokens d'accès sont chiffrés
- Chaque module a des permissions limitées
- Tout est audité : on sait qui a fait quoi et quand
- Les backups sont automatiques

---

## Ce qui arrive bientôt

- **Installer des modules depuis le store** — comme des apps
- **Multi-appareils** — Mindlife sur ton téléphone et ton ordi synchronisés
- **Plugins utilisateur** — toi-même tu pourras créer tes propres outils

---

## En résumé

Mindlife = **un OS pour ta vie**.

Pas une app de plus. Pas un gadget IA. Un vrai système qui vit avec toi, apprend de toi, et devient chaque jour plus intelligent.

Tu lui donnes de l'attention → il te donne du temps.

---

*Fait avec ❤️ par NOVA pour LLEN — Juin 2026*
