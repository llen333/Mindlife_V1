# 🧠 MindLife - Application de Productivité Personnelle

## 🚀 Installation Rapide

### Prérequis
- **Bun** (gestionnaire de paquets JavaScript ultra-rapide)

Installer Bun:
```bash
# Linux/macOS
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

### Installation

1. **Extraire le ZIP** dans le dossier de votre choix

2. **Ouvrir un terminal** dans le dossier extrait

3. **Lancer l'installation automatique**:
```bash
bun run setup
```

4. **Démarrer l'application**:
```bash
bun run dev
```

5. **Ouvrir dans le navigateur**: http://localhost:3000

---

## 📱 Fonctionnalités

| Module | Description |
|--------|-------------|
| 🏠 **Dashboard** | Vue d'ensemble de votre activité |
| 📅 **Calendrier** | Planification et événements |
| ✅ **Tâches** | Gestion des tâches avec sous-étapes |
| 🎯 **Objectifs** | Suivi des objectifs multi-périodes |
| 🍽️ **Nutrition** | Planification des repas et recettes |
| 🏋️ **Sport** | Programme d'entraînement personnalisé |
| 🧘 **Esprit** | Méditation et bien-être mental |
| 😴 **Sommeil** | Suivi de la qualité du sommeil |
| 📝 **Notes** | Prise de notes organisée |
| 🔄 **Habitudes** | Suivi des habitudes quotidiennes |
| 📔 **Journal** | Journal personnel avec humeur |
| ⚙️ **Paramètres** | Configuration du profil |

---

## 👤 Comptes de Test

| Email | Rôle |
|-------|------|
| admin@mindlife.app | Administrateur |
| john@mindlife.app | Membre |
| mike@mindlife.app | Membre |
| sarah@mindlife.app | Membre |
| emma@mindlife.app | Membre |

---

## 🔧 Configuration AI (Optionnel)

L'application fonctionne en **mode local** par défaut, avec des réponses intelligentes intégrées.

Pour activer les fonctionnalités AI avancées (chat, génération de recettes, etc.):

1. Créer un compte sur [Groq](https://console.groq.com) (gratuit)
2. Copier votre clé API
3. Modifier le fichier `.env`:
```env
GROQ_API_KEY=your-key-here
AI_PROVIDER=groq
```
4. Redémarrer l'application

---

## 📂 Structure du Projet

```
mindlife/
├── src/
│   ├── app/                 # Pages Next.js
│   ├── components/          # Composants React
│   │   ├── ui/             # Composants UI réutilisables
│   │   ├── nutrition/      # Module Nutrition
│   │   ├── goals/          # Module Objectifs
│   │   └── ...             # Autres modules
│   └── lib/                # Utilitaires et stores
│       ├── stores/         # Stores Zustand
│       ├── hooks/          # Hooks personnalisés
│       └── data/           # Données statiques
├── prisma/
│   └── schema.prisma       # Schéma base de données
├── db/
│   └── custom.db           # Base SQLite
├── scripts/
│   ├── setup-fresh.ts      # Script d'installation
│   └── seed-db.ts          # Données initiales
└── package.json
```

---

## 🛠️ Commandes Disponibles

| Commande | Description |
|----------|-------------|
| `bun run dev` | Démarrer en développement |
| `bun run build` | Compiler pour production |
| `bun run lint` | Vérifier le code |
| `bun run setup` | Installation fraîche |
| `bun run db:push` | Mettre à jour la DB |

---

## 💡 Technologies

- **Next.js 16** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS 4** - Styles
- **shadcn/ui** - Composants UI
- **Prisma** - ORM base de données
- **Zustand** - Gestion d'état
- **Framer Motion** - Animations
- **SQLite** - Base de données locale

---

## 📞 Support

En cas de problème:
1. Vérifiez que Bun est bien installé: `bun --version`
2. Supprimez le dossier `node_modules` et relancez `bun run setup`
3. Vérifiez le fichier `.env`

---

**Bon courage avec MindLife ! 🚀**
