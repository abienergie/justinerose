# Configuration des Emails et Redirections

## Problème Actuel

1. **Email en anglais** : L'email "Confirm Your Signup" est en anglais
2. **Lien cassé** : Quand l'élève clique sur "Confirm your mail", il arrive sur "localhost not found"

## Solution Complète

### Étape 1: Désactiver la confirmation d'email (Recommandé pour simplicité)

**Option la plus simple** : Les élèves peuvent se connecter immédiatement après création.

1. Allez sur: https://supabase.com/dashboard/project/znoxebmkxzxtbkiikhzd
2. Cliquez sur **Authentication** > **Providers**
3. Cliquez sur **Email**
4. **Décochez** "Enable email confirmation"
5. Cliquez sur **Save**

✅ Plus d'email de confirmation envoyé, les élèves peuvent se connecter immédiatement!

---

### Étape 2: OU Configurer les URLs de redirection (Si vous gardez la confirmation)

Si vous voulez garder la confirmation d'email, configurez les URLs:

1. Allez dans **Authentication** > **URL Configuration**
2. Configurez:
   - **Site URL**: `http://localhost:5173` (dev) ou `https://votre-domaine.com` (prod)
   - **Redirect URLs**: Ajoutez:
     - `http://localhost:5173/**`
     - `https://votre-domaine.com/**` (pour production)
3. Cliquez sur **Save**

---

### Étape 3: Personnaliser l'email (Optionnel - Nécessite plan Pro)

⚠️ **Note**: Les templates d'email personnalisés nécessitent un abonnement Supabase Pro.

Si vous avez le plan Pro:

1. Allez dans **Authentication** > **Email Templates**
2. Sélectionnez **Confirm signup**
3. Modifiez le template:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #fb7185; font-size: 28px; margin: 0;">🧘‍♀️ Justine Rose Yoga</h1>
    </div>

    <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">Bienvenue !</h2>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Bonjour,
    </p>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
      Merci de vous être inscrit(e) à Justine Rose Yoga Studio. Pour activer votre compte et commencer votre voyage bien-être, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :
    </p>

    <div style="text-align: center; margin: 40px 0;">
      <a href="{{ .ConfirmationURL }}"
         style="display: inline-block; background: linear-gradient(to right, #fb7185, #ec4899); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(251, 113, 133, 0.3);">
        Confirmer mon email
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
      Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      © 2025 Justine Rose Yoga Studio. Tous droits réservés.
    </p>
  </div>
</body>
</html>
```

4. Cliquez sur **Save**

---

## Recommandation

**Pour une meilleure expérience utilisateur**, je recommande:

1. ✅ **Désactiver la confirmation d'email** (Étape 1)
   - Les élèves peuvent se connecter immédiatement
   - Pas de risque de lien cassé
   - Expérience plus fluide

2. ✅ **Le manager crée les comptes** avec un mot de passe temporaire
   - Il le communique à l'élève (SMS, WhatsApp, en personne)
   - L'élève peut ensuite changer son mot de passe

3. ✅ **Ou utiliser un mot de passe simple** comme "yoga2025"
   - Facile à communiquer
   - L'élève peut le changer après connexion

---

## Alternative: Réinitialisation de mot de passe

Au lieu de l'email de confirmation, vous pouvez:

1. Créer l'élève avec un mot de passe aléatoire
2. Utiliser la fonction "Reset Password" de Supabase
3. L'élève reçoit un email pour définir son propre mot de passe

Pour cela, après avoir créé l'élève, vous pouvez utiliser:

```typescript
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'http://localhost:5173/reset-password',
});
```

Cela enverra un email avec un lien pour définir le mot de passe.

---

## En Production

Quand vous déployez l'application:

1. Changez la **Site URL** vers votre domaine (ex: `https://app.justinerose.fr`)
2. Ajoutez votre domaine dans **Redirect URLs**
3. Configurez un email custom (ex: `noreply@justinerose.fr`) dans **Settings** > **Auth** > **SMTP Settings**
