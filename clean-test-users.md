# Nettoyer les utilisateurs test

Si vous avez créé des utilisateurs test et souhaitez les supprimer pour refaire des tests propres:

## Méthode 1: Via l'interface Supabase (Recommandé)

1. Allez sur: https://supabase.com/dashboard/project/znoxebmkxzxtbkiikhzd
2. Cliquez sur **Authentication** > **Users**
3. Trouvez l'utilisateur test (par exemple `ilan.yvel@gmail.com`)
4. Cliquez sur les 3 points à droite > **Delete user**
5. Confirmez la suppression

✅ **C'est tout!** Les données associées (profil, forfaits, séances) seront automatiquement supprimées grâce aux contraintes `ON DELETE CASCADE`.

## Méthode 2: Via SQL

Si vous préférez utiliser SQL:

```sql
-- Supprimer un utilisateur spécifique
DELETE FROM auth.users WHERE email = 'ilan.yvel@gmail.com';
```

La suppression dans `auth.users` supprimera automatiquement:
- Le profil dans `profiles`
- Tous les forfaits dans `course_packages`
- Toutes les séances dans `sessions`
- Tous les documents dans `documents`

## Supprimer plusieurs utilisateurs test à la fois

```sql
-- Supprimer tous les utilisateurs sauf le manager
DELETE FROM auth.users 
WHERE email != 'contact@justinerose.fr';
```

⚠️ **Attention**: Cette commande supprimera TOUS les utilisateurs sauf le manager!

## Vérifier les utilisateurs restants

```sql
-- Voir tous les utilisateurs
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;
```

## Nettoyer uniquement les profils (sans supprimer les comptes auth)

Si vous voulez garder les comptes auth mais supprimer uniquement les profils:

```sql
-- Supprimer un profil spécifique
DELETE FROM profiles WHERE email = 'ilan.yvel@gmail.com';
```

⚠️ **Note**: Ceci laissera le compte dans `auth.users` mais il ne pourra pas se connecter à l'application car il n'aura plus de profil.
