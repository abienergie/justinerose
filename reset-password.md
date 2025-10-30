# Réinitialisation du mot de passe

Pour vous connecter à l'application, vous devez utiliser :

**Email:** `contact@justinerose.fr`
**Mot de passe:** Celui que vous avez défini lors de la création du compte

## Si vous avez oublié votre mot de passe

Exécutez ce script SQL dans l'éditeur SQL de Supabase pour réinitialiser le mot de passe :

```sql
-- Mettre à jour le mot de passe de l'utilisateur manager
-- Remplacez 'VotreNouveauMotDePasse' par le mot de passe souhaité
SELECT
  update_password('750fea04-d3dc-4d5a-be7c-27bdc1a5ccc6', 'VotreNouveauMotDePasse');
```

Ou utilisez la fonctionnalité "Reset Password" dans le tableau de bord Supabase :
1. Allez dans Authentication > Users
2. Trouvez l'utilisateur `contact@justinerose.fr`
3. Cliquez sur les trois points > "Reset Password"
4. Choisissez un nouveau mot de passe

## Alternative : Créer un nouveau compte manager

Si vous préférez, vous pouvez créer un nouveau compte directement via le tableau de bord Supabase :

1. Allez dans Authentication > Users
2. Cliquez sur "Invite user" ou "Add user"
3. Entrez l'email et le mot de passe souhaités
4. Une fois l'utilisateur créé, notez son UUID
5. Ajoutez le profil dans la table `profiles` :

```sql
INSERT INTO profiles (id, email, full_name, role)
VALUES ('UUID-DE-L-UTILISATEUR-ICI', 'nouvel@email.fr', 'Votre Nom', 'manager');
```

## Test de connexion

Une fois le mot de passe réinitialisé :
1. Ouvrez l'application sur http://localhost:5173
2. Entrez votre email et votre nouveau mot de passe
3. Vous devriez accéder au tableau de bord manager
