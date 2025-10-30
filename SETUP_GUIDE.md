# Guide de Configuration - Justine Rose Yoga Studio

## ⚠️ ACTION REQUISE: Appliquer la Migration

**Si vous voyez l'erreur "Could not find the 'session_type' column"**, suivez ces étapes:

### Étape 1: Appliquer la migration SQL (OBLIGATOIRE)

1. Ouvrez: https://supabase.com/dashboard/project/znoxebmkxzxtbkiikhzd
2. Cliquez sur **SQL Editor** dans le menu
3. Cliquez sur **New query**
4. Copiez-collez le contenu de `migration_update_schema.sql`
5. Cliquez sur **Run**
6. Attendez le message "Success. No rows returned"

✅ La migration ajoute:
- Support des forfaits personnalisés
- Colonne session_type pour les types de séances
- Politique de suppression des profils

### Étape 2: Configurer les URLs d'activation (RECOMMANDÉ)

1. Dans Supabase, allez dans **Authentication** > **URL Configuration**
2. Configurez:
   - **Site URL**: `http://localhost:5173`
   - **Redirect URLs**: `http://localhost:5173/**`
3. Cliquez sur **Save**

✅ Les liens d'activation des comptes élèves fonctionneront correctement

---

## Phase 1: Configuration de Base (Complétée)

Cette phase inclut:
- Structure de base de l'application
- Authentification avec Supabase
- Dashboards Manager et Élève
- Gestion des élèves, forfaits et séances
- Types de séances et durées personnalisées

## Installation de la Base de Données

### Étape 1: Accéder au SQL Editor Supabase

1. Connectez-vous à votre compte Supabase: https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Dans le menu latéral, cliquez sur "SQL Editor"

### Étape 2: Exécuter le Script de Migration

1. Copiez tout le contenu du fichier `database_setup.sql`
2. Collez-le dans l'éditeur SQL
3. Cliquez sur "Run" pour exécuter le script
4. Vérifiez qu'il n'y a pas d'erreurs (toutes les commandes devraient s'exécuter avec succès)

### Étape 3: Créer le Compte Manager

**IMPORTANT** : Pour créer un utilisateur, vous devez TOUJOURS suivre ces 2 étapes :

#### 3A. Créer l'utilisateur dans Authentication

1. Dans Supabase, allez dans **Authentication** > **Users**
2. Cliquez sur **Add user**
3. Remplissez le formulaire :
   - Email: `contact@justinerose.fr`
   - Password: `VotreMotDePasse` (choisissez un mot de passe sécurisé)
   - **Auto Confirm User** : ✓ Cochez cette case
4. Cliquez sur **Create user**
5. **NOTEZ L'UUID** qui apparaît (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

#### 3B. Créer le profil dans la base de données

1. Retournez dans **SQL Editor**
2. Exécutez cette commande (remplacez `USER_UUID` par l'UUID noté à l'étape 3A):

```sql
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'USER_UUID',  -- Remplacez par l'UUID de l'étape 3A
  'contact@justinerose.fr',  -- Le même email qu'à l'étape 3A
  'Justine Rose',
  'manager'
);
```

**POURQUOI CES 2 ÉTAPES ?**
- L'étape 3A crée le compte utilisateur et le mot de passe (dans `auth.users`)
- L'étape 3B crée le profil avec le rôle manager/student (dans `profiles`)
- Les deux sont nécessaires pour que la connexion fonctionne !

### Étape 4: Désactiver la Confirmation Email (Important)

Pour permettre la création de comptes élèves sans validation email:

1. Allez dans "Authentication" > "Email Auth"
2. Décochez "Enable email confirmations"
3. Sauvegardez les modifications

## Structure de l'Application

### Pages Principales

- **LoginForm** (`src/components/LoginForm.tsx`): Page de connexion élégante
- **ManagerDashboard** (`src/pages/ManagerDashboard.tsx`): Interface manager complète
- **StudentDashboard** (`src/pages/StudentDashboard.tsx`): Interface élève

### Composants Manager

- **StatisticsPanel**: Vue d'ensemble avec statistiques (revenus, fréquentation, etc.)
- **StudentManagement**: Gestion complète des élèves
- **AddStudentModal**: Création de nouveaux comptes élèves
- **AddPackageModal**: Ajout de forfaits pour les élèves
- **AddSessionModal**: Enregistrement des cours effectués

### Fonctionnalités Actuelles

#### Interface Manager
- Connexion avec contact@justinerose.fr / 24043110
- Dashboard avec statistiques filtrables (7j, 30j, 1an)
- Création de comptes élèves
- Ajout manuel de forfaits (Cours unique, Carte 5, Carte 10)
- Enregistrement des séances avec date et durée
- Vue détaillée par élève avec historique complet

#### Interface Élève
- Connexion sécurisée individuelle
- Vue du solde de cours en temps réel
- Liste des forfaits actifs
- Historique complet des cours suivis
- Section documents (prête pour Phase 2)

## Prochaines Étapes - Phase 2

La Phase 2 ajoutera:
- Intégration complète de Stripe pour achats en ligne
- Génération automatique de factures PDF
- Webhooks Supabase pour confirmation de paiement
- Upload et gestion de documents

## Design

L'application utilise:
- Gradients rose/pink inspirés de www.justinerose.fr
- Tailwind CSS pour le styling
- Lucide React pour les icônes
- Design Apple-like avec backdrop-blur et ombres élégantes
- Responsive mobile-first

## Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Isolation complète entre comptes élèves
- Managers ont accès complet, élèves uniquement à leurs données
- Fonctions helper SQL pour vérification des permissions
- Authentification Supabase sécurisée

## Test de l'Application

1. Lancez l'application (le dev server démarre automatiquement)
2. Connectez-vous en tant que manager avec contact@justinerose.fr / 24043110
3. Créez un compte élève de test
4. Ajoutez un forfait à cet élève
5. Enregistrez une séance
6. Déconnectez-vous et connectez-vous avec le compte élève créé
7. Vérifiez que l'élève voit uniquement ses propres données

## Variables d'Environnement

Les variables suivantes sont déjà configurées dans `.env`:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_STRIPE_PUBLISHABLE_KEY (pour Phase 2)

## Support

Pour toute question ou problème, vérifiez:
1. Que le script SQL s'est exécuté sans erreurs
2. Que le compte manager existe dans la table profiles avec role='manager'
3. Que la confirmation email est désactivée dans Supabase
4. Les logs de la console navigateur pour les erreurs JavaScript
5. Les logs Supabase pour les erreurs de base de données
