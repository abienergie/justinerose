# Configuration Finale - Justine Rose Yoga Studio

Ce document résume toutes les configurations nécessaires pour que votre application fonctionne parfaitement.

---

## ✅ Checklist de Configuration

### 1. Base de Données (OBLIGATOIRE)

- [ ] Appliquer la migration principale: `migration_update_schema.sql`
- [ ] Appliquer la migration pour les avis Google: `migration_google_review.sql`

**Comment faire:**
1. Ouvrez https://supabase.com/dashboard/project/znoxebmkxzxtbkiikhzd
2. Allez dans **SQL Editor**
3. Créez une **New query**
4. Copiez-collez le contenu de `migration_update_schema.sql`
5. Cliquez sur **Run**
6. Répétez avec `migration_google_review.sql`

✅ Vous devriez voir "Success. No rows returned"

---

### 2. Configuration des Emails (RECOMMANDÉ)

- [ ] Désactiver la confirmation d'email
- [ ] OU Configurer les URLs de redirection

**Voir le fichier:** `CONFIGURATION_EMAILS.md`

**Option simple (recommandée):**
1. Allez dans **Authentication** > **Providers** > **Email**
2. Décochez "Enable email confirmation"
3. Cliquez sur **Save**

---

### 3. Configuration Stripe (OPTIONNEL - Pour paiements en ligne)

- [ ] Créer un compte Stripe
- [ ] Récupérer les clés API
- [ ] Configurer la clé publique dans `.env`
- [ ] Déployer les edge functions
- [ ] Configurer les secrets dans Supabase
- [ ] Configurer le webhook Stripe

**Voir le fichier:** `STRIPE_SETUP_GUIDE.md` (guide complet étape par étape)

---

## 🎯 Fonctionnalités Disponibles

### Interface Manager

✅ **Gestion des élèves**
- Créer des comptes élèves
- Voir la liste de tous les élèves
- Supprimer des élèves (avec confirmation)

✅ **Gestion des forfaits**
- 1 heure: 98€
- 5 heures: 450€
- 10 heures: 800€
- Forfait personnalisé avec tarif custom

✅ **Enregistrement des séances**
- Types de séances: Yoga traditionnel, Prénatal, Post-natal, Accompagnement, Stretching, Massage, Rebozo, Séance photo
- Durées: 1h, 2h, 3h, ou durée personnalisée
- Date sélectionnable

✅ **Statistiques**
- Revenus du mois et de l'année
- Nombre d'élèves actifs
- Taux de fréquentation
- Séances moyennes par élève

### Interface Élève

✅ **Vue d'ensemble**
- Solde de cours restants
- Historique des séances
- Liste des forfaits actifs

✅ **Achat en ligne** (si Stripe configuré)
- Acheter des forfaits directement
- Paiement sécurisé via Stripe
- Activation automatique du forfait

✅ **Popup d'avis Google**
- Apparaît automatiquement après la 2ème séance
- Lien direct vers Google Reviews
- Ne s'affiche qu'une seule fois
- Design élégant avec animations

---

## 🚀 Démarrage Rapide

### 1. Configuration Minimale (5 minutes)

Pour avoir une application fonctionnelle immédiatement:

1. ✅ Appliquer `migration_update_schema.sql`
2. ✅ Appliquer `migration_google_review.sql`
3. ✅ Désactiver la confirmation d'email
4. ✅ Lancer l'application

**C'est tout!** Vous pouvez maintenant:
- Créer des élèves
- Ajouter des forfaits manuellement (après paiement cash/virement)
- Enregistrer des séances
- Les élèves voient leurs forfaits et historique

### 2. Configuration Complète (30 minutes)

Pour activer les paiements en ligne:

1. ✅ Tout de la configuration minimale
2. ✅ Créer un compte Stripe
3. ✅ Suivre le guide `STRIPE_SETUP_GUIDE.md`
4. ✅ Tester un achat avec une carte de test

---

## 📝 Fichiers de Référence

| Fichier | Description |
|---------|-------------|
| `SETUP_GUIDE.md` | Guide complet d'installation |
| `CONFIGURATION_EMAILS.md` | Configuration des emails et redirections |
| `STRIPE_SETUP_GUIDE.md` | Configuration Stripe étape par étape |
| `STRIPE_EDGE_FUNCTIONS.md` | Code des fonctions Stripe |
| `migration_update_schema.sql` | Migration principale (OBLIGATOIRE) |
| `migration_google_review.sql` | Migration avis Google (OBLIGATOIRE) |
| `clean-test-users.md` | Nettoyer les utilisateurs test |
| `reset-password.md` | Réinitialiser le mot de passe manager |

---

## 🎨 Nouvelles Fonctionnalités

### 1. Types de Séances

Les séances peuvent maintenant avoir un type:
- Yoga traditionnel
- Yoga prénatal
- Yoga post natal
- Accompagnement
- Stretching
- Massage
- Rebozo
- Séance photo

Le type est affiché dans l'historique de l'élève.

### 2. Durées Personnalisées

Menu simplifié: 1h, 2h, 3h, ou durée personnalisée pour les cas particuliers.

### 3. Forfaits Personnalisés

Le manager peut créer des forfaits sur-mesure:
- Nombre d'heures personnalisé
- Tarif personnalisé
- Idéal pour les forfaits spéciaux ou promotions

### 4. Achat en Ligne (avec Stripe)

Les élèves peuvent acheter leurs forfaits directement:
- Interface d'achat élégante
- Paiement sécurisé par carte bancaire
- Activation automatique du forfait
- Page de confirmation après paiement

### 5. Popup d'Avis Google

Système intelligent pour demander des avis:
- S'affiche automatiquement après la 2ème séance uniquement
- Design moderne avec animations
- Lien direct vers Google Reviews
- Ne s'affiche qu'une seule fois par élève
- Possibilité de "Peut-être plus tard"

### 6. Suppression d'Élèves

Le manager peut maintenant supprimer des élèves:
- Bouton de suppression dans la liste
- Message de confirmation pour éviter les erreurs
- Suppression automatique de tous les forfaits et séances associés

---

## 🔒 Sécurité

Toutes les fonctionnalités sont sécurisées:
- ✅ Row Level Security (RLS) activé sur toutes les tables
- ✅ Les élèves ne voient que leurs propres données
- ✅ Les managers ont accès complet
- ✅ Les clés API Stripe ne sont jamais exposées
- ✅ Les paiements sont gérés par Stripe (PCI-DSS compliant)

---

## 📱 Responsive Design

L'application s'adapte à tous les écrans:
- ✅ Desktop
- ✅ Tablette
- ✅ Mobile

---

## 🎯 Prochaines Étapes Possibles

Fonctionnalités que vous pourriez ajouter plus tard:
- Génération automatique de factures PDF
- Envoi d'emails de rappel avant les cours
- Système de réservation en ligne avec calendrier
- Upload et gestion de documents (certificats, attestations fiscales)
- Programme de parrainage
- Notifications push

---

## ❓ Besoin d'Aide?

### Problèmes Courants

**"Could not find the 'session_type' column"**
→ Vous devez appliquer la migration `migration_update_schema.sql`

**"Email en anglais / Lien cassé"**
→ Suivez le guide `CONFIGURATION_EMAILS.md`

**"Cet email est déjà utilisé"**
→ Supprimez l'ancien utilisateur test (voir `clean-test-users.md`)

**"Stripe ne fonctionne pas"**
→ Vérifiez le guide `STRIPE_SETUP_GUIDE.md` étape par étape

### Vérifications de Base

1. ✅ Les deux migrations SQL ont été appliquées
2. ✅ La confirmation d'email est désactivée OU les URLs sont configurées
3. ✅ Les clés Stripe sont dans `.env` (si vous utilisez Stripe)
4. ✅ Les edge functions sont déployées (si vous utilisez Stripe)
5. ✅ Le webhook Stripe est configuré (si vous utilisez Stripe)

---

## 🎉 Félicitations!

Votre plateforme Justine Rose Yoga Studio est maintenant prête à être utilisée!

Connectez-vous avec:
- **Email**: contact@justinerose.fr
- **Mot de passe**: Votre mot de passe manager

Bonne gestion! 🧘‍♀️
