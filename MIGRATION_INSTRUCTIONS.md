# Instructions de migration et configuration

## 1. Appliquer la migration de base de données

Le fichier `migration_update_schema.sql` contient les modifications nécessaires pour supporter:
- Les forfaits personnalisés (avec champ personnalisé pour le nombre d'heures et le tarif)
- Les types de séances (Yoga traditionnel, Yoga prénatal, etc.)

### Comment appliquer la migration:

1. Connectez-vous à votre dashboard Supabase: https://supabase.com/dashboard/project/znoxebmkxzxtbkiikhzd
2. Allez dans l'éditeur SQL (SQL Editor) dans le menu de gauche
3. Cliquez sur **New query**
4. Copiez-collez le contenu complet de `migration_update_schema.sql`
5. Cliquez sur **Run** pour exécuter la requête
6. Vous devriez voir "Success. No rows returned"

## 2. Corriger le problème d'activation des comptes étudiants

### Le problème

Lorsqu'un nouvel élève est créé et reçoit un email d'activation, le lien pointe vers `localhost:3000` au lieu de votre URL de développement réelle (`localhost:5173` pour Vite).

Quand l'élève clique sur le lien, il arrive sur une page "not found" avec l'erreur:
```
#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
```

### Solution complète:

1. **Allez dans votre dashboard Supabase**: https://supabase.com/dashboard/project/znoxebmkxzxtbkiikhzd

2. **Naviguez vers Authentication > URL Configuration** (dans le menu de gauche)

3. **Configurez les URL suivantes**:
   - **Site URL**: `http://localhost:5173` (l'URL de votre serveur de développement Vite)
   - **Redirect URLs**: Ajoutez `http://localhost:5173/**` dans la liste

4. **Cliquez sur Save** en bas de la page

### Vérifier que ça fonctionne:

1. Créez un nouvel élève dans l'application
2. L'élève devrait recevoir un email avec un lien d'activation
3. Le lien devrait maintenant pointer vers `http://localhost:5173`
4. Quand l'élève clique sur le lien, il devrait être redirigé vers votre application avec sa session active

### Configuration pour la production:

Quand vous déployez en production, n'oubliez pas de mettre à jour:
- **Site URL**: Votre URL de production (ex: `https://votredomaine.com`)
- **Redirect URLs**: `https://votredomaine.com/**`

## 3. Alternative: Désactiver la confirmation d'email (non recommandé)

Si vous voulez que les élèves puissent se connecter immédiatement sans confirmation par email:

1. Allez dans **Authentication** > **Providers** > **Email**
2. Désactivez l'option **Confirm email**
3. Cliquez sur **Save**

⚠️ **Attention**: Cette option n'est **pas recommandée** pour la production car:
- Les élèves pourraient utiliser une fausse adresse email
- Vous ne pourrez pas vérifier que l'email est valide
- Cela pourrait causer des problèmes de sécurité

## Résumé des modifications effectuées

Les modifications suivantes ont été apportées à l'application:

1. **Vue d'ensemble des statistiques**:
   - Changé de "7 jours" à "Ce mois" et "Cette année"
   - Les revenus sont maintenant affichés en €

2. **Forfaits**:
   - 1 heure à 98€
   - 5 heures à 450€
   - 10 heures à 800€
   - Forfait personnalisé avec champs pour le nombre d'heures et le tarif

3. **Ajout de séance**:
   - Retiré le champ "Sélectionner un forfait"
   - Ajouté le champ "Type de séance" (optionnel) avec menu déroulant:
     - Yoga traditionnel
     - Yoga prénatal
     - Yoga post natal
     - Accompagnement
     - Stretching
     - Massage
     - Rebozo
     - Séance photo

4. **Gestion des élèves**:
   - Ajouté un bouton pour supprimer un élève
   - Message de confirmation avant suppression pour éviter les erreurs
   - L'historique des cours affiche maintenant le type de séance

5. **Gestion des erreurs d'authentification**:
   - Ajouté une page d'erreur pour les liens d'activation invalides ou expirés
