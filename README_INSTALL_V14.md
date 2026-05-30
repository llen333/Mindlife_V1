# 🦞 MINDLIFE V14 - Installation Mac Intel

## Installation Rapide (2 commandes)

```bash
chmod +x install.sh
./install.sh
```

C'est tout ! L'application sera prête.

---

## Lancer l'application

```bash
bun run dev
```

Ouvre ensuite : **http://localhost:3000**

---

## Fonctionnalités

### 🎭 5 Personas IA (100% Local)

| Persona | Commande exemple |
|---------|-----------------|
| Assistant | "bonjour" |
| Coach Sport | "exercice muscle" |
| Nutrition | "recette de crêpes" |
| Productivité | "procrastination" |
| Bien-être | "stress" |

### ⚡ Actions Intelligentes

| Commande | Action |
|----------|--------|
| "rdv demain à 14h" | ✅ Crée un rendez-vous |
| "recette de crêpes" | ✅ Scrape Marmiton |
| "tâche acheter du lait" | ✅ Crée une tâche |
| "objectif courir 10km" | ✅ Crée un objectif |

---

## Convex Local (Optionnel)

Pour activer le temps réel :

```bash
# Terminal 1
npx convex dev --local

# Terminal 2  
bun run dev
```

Convex est **100% local** - pas de compte cloud nécessaire !

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Next.js 16    │ ←→  │     SQLite      │
│   Frontend      │     │    Prisma       │
└─────────────────┘     └─────────────────┘
         ↓
┌─────────────────┐     ┌─────────────────┐
│  Smart Agent    │ ←→  │  Convex Local   │
│   (Actions)     │     │  (Optionnel)    │
└─────────────────┘     └─────────────────┘
```

---

## Dépannage

**Erreur de port 3000 :**
```bash
lsof -ti:3000 | xargs kill -9
bun run dev
```

**Reset base de données :**
```bash
rm -rf db/
bun run setup
```

---

## Fichiers Importants

- `.env` → Configuration SQLite
- `prisma/schema.prisma` → Modèles de données
- `convex/` → Schema Convex (optionnel)

---

**🦞 BIZ FREROT !** 

*V14 - 21 Avril 2025*
