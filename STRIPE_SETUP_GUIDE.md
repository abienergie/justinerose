# Guide de Configuration Stripe - Justine Rose Yoga

Ce guide vous explique comment configurer Stripe pour permettre à vos élèves d'acheter des forfaits en ligne.

## Étape 1: Créer un compte Stripe

1. Allez sur https://dashboard.stripe.com/register
2. Créez votre compte Stripe
3. Validez votre email

✅ Vous êtes maintenant sur le dashboard Stripe en **mode test**

---

## Étape 2: Récupérer vos clés API

### 2A. Clé Publishable (Publique)

1. Dans le dashboard Stripe, allez dans **Developers** > **API keys**
2. Trouvez la section "Standard keys"
3. Copiez la **Publishable key** (commence par `pk_test_`)
4. Collez-la dans votre fichier `.env`:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_ici
```

### 2B. Clé Secret

1. Dans la même page, cliquez sur **Reveal test key** pour la **Secret key**
2. Copiez la **Secret key** (commence par `sk_test_`)
3. **IMPORTANT**: Gardez cette clé secrète, ne la partagez jamais!

⚠️ Vous utiliserez cette clé à l'étape 4 pour configurer Supabase

---

## Étape 3: Déployer les Edge Functions

Les edge functions permettent de créer des sessions de paiement sécurisées.

### 3A. Fonction create-checkout

1. Allez sur: https://supabase.com/dashboard/project/znoxebmkxzxtbkiikhzd
2. Cliquez sur **Edge Functions** dans le menu
3. Cliquez sur **Create a new function**
4. Nom: `create-checkout`
5. Copiez-collez le code depuis `STRIPE_EDGE_FUNCTIONS.md` (section "Fonction 1")
6. Cliquez sur **Deploy**

### 3B. Fonction stripe-webhook

1. Cliquez à nouveau sur **Create a new function**
2. Nom: `stripe-webhook`
3. Copiez-collez le code depuis `STRIPE_EDGE_FUNCTIONS.md` (section "Fonction 2")
4. Cliquez sur **Deploy**

✅ Vos 2 fonctions sont maintenant déployées!

---

## Étape 4: Configurer les Secrets dans Supabase

Les secrets permettent aux edge functions d'accéder à Stripe de manière sécurisée.

### 4A. Secret Stripe

1. Dans Supabase, allez dans **Settings** > **Vault** (ou **Edge Functions** > **Secrets**)
2. Cliquez sur **New secret**
3. Name: `STRIPE_SECRET_KEY`
4. Value: Collez votre Secret key de l'étape 2B (commence par `sk_test_`)
5. Cliquez sur **Create secret**

### 4B. Redéployez les fonctions

**IMPORTANT**: Après avoir ajouté le secret, vous devez redéployer les fonctions:

1. Allez dans **Edge Functions**
2. Pour chaque fonction (`create-checkout` et `stripe-webhook`):
   - Cliquez sur les 3 points
   - Cliquez sur **Redeploy**

---

## Étape 5: Configurer le Webhook Stripe

Le webhook permet à Stripe de notifier votre application après un paiement réussi.

1. Dans Stripe, allez dans **Developers** > **Webhooks**
2. Cliquez sur **Add endpoint**
3. Endpoint URL:
   ```
   https://znoxebmkxzxtbkiikhzd.supabase.co/functions/v1/stripe-webhook
   ```
4. Description: `Justine Rose Yoga - Package purchases`
5. **Select events to listen to**: Cliquez sur **Select events**
6. Cochez uniquement: `checkout.session.completed`
7. Cliquez sur **Add events** puis **Add endpoint**

### 5B. Récupérer le Signing Secret

1. Cliquez sur le webhook que vous venez de créer
2. Dans la section **Signing secret**, cliquez sur **Reveal**
3. Copiez le secret (commence par `whsec_`)
4. Retournez dans Supabase > **Settings** > **Vault**
5. Créez un nouveau secret:
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: Collez le signing secret
   - Cliquez sur **Create secret**

### 5C. Redéployez la fonction webhook

1. Allez dans **Edge Functions**
2. Cliquez sur `stripe-webhook`
3. Cliquez sur les 3 points > **Redeploy**

✅ Le webhook est maintenant configuré!

---

## Étape 6: Tester l'Intégration

### 6A. Cartes de test Stripe

Utilisez ces numéros de carte pour tester:

- **Paiement réussi**: `4242 4242 4242 4242`
- **Paiement échoué**: `4000 0000 0000 0002`
- **Authentification 3D Secure**: `4000 0025 0000 3155`

Pour tous les tests:
- Date d'expiration: N'importe quelle date future (ex: 12/25)
- CVC: N'importe quel 3 chiffres (ex: 123)
- Code postal: N'importe lequel (ex: 75001)

### 6B. Effectuer un achat test

1. Lancez votre application
2. Connectez-vous avec un compte élève
3. Cliquez sur **Acheter un forfait**
4. Sélectionnez un forfait
5. Cliquez sur **Procéder au paiement**
6. Vous êtes redirigé vers Stripe Checkout
7. Entrez une carte de test (ex: `4242 4242 4242 4242`)
8. Validez le paiement

### 6C. Vérifier le webhook

1. Dans Stripe Dashboard, allez dans **Developers** > **Webhooks**
2. Cliquez sur votre webhook
3. Vous devriez voir l'événement `checkout.session.completed`
4. Le statut doit être **Succeeded**

### 6D. Vérifier la base de données

1. Allez dans Supabase > **Table Editor**
2. Ouvrez la table `course_packages`
3. Vous devriez voir le nouveau forfait créé pour l'élève

✅ **Bravo! L'intégration Stripe fonctionne!**

---

## Étape 7: Passer en Production

Quand vous êtes prêt à accepter de vrais paiements:

### 7A. Activer votre compte Stripe

1. Dans Stripe Dashboard, cliquez sur **Activate your account**
2. Remplissez les informations demandées:
   - Informations sur votre entreprise
   - Détails bancaires pour les virements
   - Vérification d'identité

### 7B. Récupérer les clés de production

1. Dans Stripe Dashboard, **désactivez** le mode test (toggle en haut à droite)
2. Allez dans **Developers** > **API keys**
3. Copiez la **Publishable key** de production (commence par `pk_live_`)
4. Copiez la **Secret key** de production (commence par `sk_live_`)

### 7C. Mettre à jour les configurations

1. Dans votre fichier `.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_production
   ```

2. Dans Supabase > **Settings** > **Vault**:
   - Modifiez `STRIPE_SECRET_KEY` avec la clé de production
   - Redéployez les fonctions

3. Créez un nouveau webhook avec l'URL de production
4. Mettez à jour `STRIPE_WEBHOOK_SECRET` avec le nouveau signing secret

---

## Tarifs Stripe

Stripe prélève des frais sur chaque transaction:

- **En France**: 1,5% + 0,25€ par transaction réussie
- **Pas de frais d'abonnement mensuel**
- **Pas de frais de mise en place**

Exemples:
- Forfait 1h (98€): Frais Stripe = 1,72€ → Vous recevez 96,28€
- Forfait 5h (450€): Frais Stripe = 6,00€ → Vous recevez 444,00€
- Forfait 10h (800€): Frais Stripe = 12,25€ → Vous recevez 787,75€

---

## Support

### Problèmes courants

**"Invalid API key"**
- Vérifiez que vous avez bien copié la clé complète
- Assurez-vous d'utiliser la bonne clé (test vs production)
- Redéployez les edge functions après avoir ajouté le secret

**"Webhook signature verification failed"**
- Vérifiez que le `STRIPE_WEBHOOK_SECRET` est correct
- Assurez-vous que l'URL du webhook est exacte
- Redéployez la fonction webhook

**"Le forfait n'est pas créé après paiement"**
- Vérifiez les logs du webhook dans Stripe Dashboard
- Vérifiez les logs de la fonction dans Supabase
- Assurez-vous que l'événement `checkout.session.completed` est sélectionné

### Ressources

- Documentation Stripe: https://stripe.com/docs
- Support Stripe: https://support.stripe.com
- Dashboard Stripe: https://dashboard.stripe.com
