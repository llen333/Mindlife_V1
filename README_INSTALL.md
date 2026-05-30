# 🦞 MindLife V1.1

**Application de Gestion de Vie Personnelle**

---

## 📦 Installation Rapide

### Prérequis
- **Bun** installé sur votre machine ([Installer Bun](https://bun.sh))

### Commandes d'installation

```bash
# 1. Installer les dépendances et initialiser la base de données
bun install
bun run setup

# 2. Démarrer l'application
bun run dev
```

### Accès
Ouvrez votre navigateur sur: **http://localhost:3000**

---

## 🎯 Fonctionnalités

### Modules Principaux
- **Dashboard** - Vue d'ensemble de votre activité
- **Calendrier** - Gestion des événements et rendez-vous
- **Tâches** - Liste de tâches avec priorités
- **Objectifs** - Suivi d'objectifs avec étapes (milestones)

### Modules Alimentation
- **Hub Alimentaire** - Profil nutritionnel et calculs IMC/BMR/TDEE
- **Nutrition** - Génération de repas et planification

### Modules Bien-être
- **Esprit** - Chat IA spirituel et archétypes
- **Sport** - Programmes d'entraînement et suivi

### Autres
- **Paramètres** - Configuration du profil et préférences

---

## 🗄️ Base de Données

La base de données SQLite est stockée dans `./db/mindlife.db`.

### Réinitialiser les données
```bash
bun run seed
```

---

## 🛠️ Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `bun run dev` | Démarre le serveur de développement |
| `bun run build` | Compile l'application pour la production |
| `bun run start` | Démarre le serveur de production |
| `bun run setup` | Installation complète (dépendances + BDD) |
| `bun run seed` | Repeuple la base de données |
| `bun run lint` | Vérifie la qualité du code |

---

## 📱 Utilisateur par Défaut

Après le seed, connectez-vous avec:
- **Nom**: NICO 🦞
- **Email**: nico@mindlife.app

---

## 🏗️ Structure du Projet

```
mindlife/
├── src/
│   ├── app/              # Pages Next.js et API routes
│   ├── components/       # Composants React
│   ├── lib/              # Stores Zustand et utilitaires
│   └── hooks/            # Hooks personnalisés
├── prisma/
│   ├── schema.prisma     # Schéma de la base de données
│   └── seed.ts           # Script de peuplement
├── public/               # Assets statiques
└── db/                   # Base de données SQLite
```

---

## ⚠️ Notes d'Installation macOS

1. Si vous avez une erreur avec Sharp, installez les outils Xcode:
   ```bash
   xcode-select --install
   ```

2. Si Bun n'est pas dans votre PATH après l'installation:
   ```bash
   source ~/.bashrc  # ou ~/.zshrc
   ```

3. Pour les problèmes de permissions:
   ```bash
   chmod +x setup.sh
   ```

---

**BIZ FREROT! 🦞**
