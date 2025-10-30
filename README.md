# Justine Rose Yoga Studio - Application de Gestion

Application complète de gestion pour le studio de yoga de Justine Rose, permettant la gestion des élèves, forfaits, séances et paiements en ligne.

## 🚀 Démarrage Rapide

### Configuration Obligatoire (5 minutes)

1. **Appliquer les migrations SQL** dans Supabase:
   - `migration_update_schema.sql`
   - `migration_google_review.sql`

2. **Désactiver la confirmation d'email** dans Supabase:
   - Authentication > Providers > Email
   - Décocher "Enable email confirmation"

3. **Lancer l'application**:
   ```bash
   npm run dev
   ```

✅ Votre application est prête à être utilisée!

---

## 📚 Guides Disponibles

| Fichier | Quand l'utiliser |
|---------|------------------|
| **`CONFIGURATION_FINALE.md`** | 📖 Guide principal - À lire en premier |
| `SETUP_GUIDE.md` | Installation initiale de la base de données |
| `CONFIGURATION_EMAILS.md` | Configuration des emails et redirections |
| `STRIPE_SETUP_GUIDE.md` | Activer les paiements en ligne (optionnel) |
| `clean-test-users.md` | Supprimer des utilisateurs test |
| `reset-password.md` | Réinitialiser le mot de passe manager |

---

## ✨ Fonctionnalités

### Interface Manager

- ✅ Gestion complète des élèves
- ✅ Création et gestion des forfaits (98€, 450€, 800€, personnalisé)
- ✅ Enregistrement des séances avec types et durées
- ✅ Statistiques détaillées (revenus, fréquentation)
- ✅ Suppression d'élèves avec confirmation

### Interface Élève

- ✅ Vue des cours restants
- ✅ Historique des séances
- ✅ Achat de forfaits en ligne (avec Stripe)
- ✅ Popup d'avis Google après la 2ème séance

---

## 🎯 Connexion

**Manager:**
- Email: contact@justinerose.fr
- Mot de passe: Votre mot de passe

**Élèves:**
- Les comptes sont créés par le manager

---

## 🔧 Technologies

- React + TypeScript
- Vite
- Supabase (BaaS)
- Stripe (Paiements)
- Tailwind CSS
- React Router

---

## 📝 Notes Importantes

1. **Migrations SQL**: Obligatoires pour que l'app fonctionne
2. **Email de confirmation**: Recommandé de le désactiver pour simplicité
3. **Stripe**: Optionnel, uniquement si vous voulez les paiements en ligne
4. **Build**: `npm run build` pour vérifier que tout fonctionne

---

## 🆘 Problème?

Consultez `CONFIGURATION_FINALE.md` qui contient:
- ✅ Checklist complète
- ✅ Solutions aux problèmes courants
- ✅ Guides de configuration
- ✅ Références à tous les fichiers

---

## 📞 Support

Pour toute question, référez-vous aux fichiers de documentation dans le projet.

Bonne gestion! 🧘‍♀️
