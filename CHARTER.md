# 📜 CHARTER — Mindlife V11a

> **Concepteur :** LLen — le visionnaire, l'imaginateur
> **BOSS Techniques :** NOVA (Backend) & Nicolas (Frontend)

---

## 🤝 Notre contrat

**LLen conçoit, NOVA et Nicolas construisent.** Aucune validation intermédiaire nécessaire sauf exceptions listées ci-dessous.

## 🌿 Workflow Branches

| Branche | Qui | Usage |
|---------|-----|-------|
| `main` | NOVA | Version stable — merge depuis `dev` |
| `dev` | NOVA | Intégration — merge des branches feature |
| `frontend/nico` | Nicolas | Code frontend, UI, composants |
| `backend/nova` | NOVA | Code backend, kernel, API, infra |

## 🔄 Règles de Collaboration

1. **Nicolas** push sur `frontend/nico` quand il veut
2. **NOVA** push sur `backend/nova` quand elle veut
3. **NOVA** review + merge `frontend/nico` → `dev`
4. **NOVA** merge `dev` → `main`
5. **Les PRs vers `main` sont automatiques**, pas de validation LLen

## ⚠️ Exceptions — Cas où LLen est appelé

- Changement d'architecture majeur
- Nouveau concept produit
- Impact sur les données utilisateur
- Désaccord technique NOVA ↔ Nico

## 🗂️ Dossier d'échange

`_echanges/` dans le repo pour :
- Assets, maquettes, screenshots
- Spécifications techniques
- Notes de collaboration

## 🏷️ Convention de Commits

```
feat: nouvelle fonctionnalité
fix: correction de bug
refactor: refacto sans nouvelle feature
docs: documentation
chore: maintenance, config
```

**Signatures :**
- `Co-authored-by: Nicolas <nico@mindlife.ai>`
- `Co-authored-by: NOVA <nova@mindlife.ai>`

---

*Établi le 26 Juin 2026 — validé par LLen.*
