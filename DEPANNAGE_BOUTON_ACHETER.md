# Dépannage: Bouton "Acheter un forfait" ne fonctionne pas

## Symptôme

Quand vous cliquez sur "Acheter un forfait", rien ne se passe ou une erreur apparaît.

---

## Diagnostic: Ouvrez la Console du Navigateur

1. **Ouvrez la console**:
   - Chrome/Edge: Appuyez sur `F12` ou clic droit > "Inspecter" > onglet "Console"
   - Firefox: Appuyez sur `F12` > onglet "Console"
   - Safari: Développement > Afficher la console JavaScript

2. **Cliquez sur "Acheter un forfait"**

3. **Regardez les messages dans la console**

---

## Solutions par Type d'Erreur

### ❌ Erreur: "Failed to fetch" ou "Network error"

**Cause**: Les edge functions Stripe ne sont pas déployées.

**Solution**: Suivez le guide `DEPLOIEMENT_STRIPE_RAPIDE.md` pour déployer les fonctions.

---

### ❌ Erreur: "Invalid API key" ou "No API key provided"

**Cause 1**: La clé publique Stripe n'est pas dans `.env`

**Solution**:
1. Vérifiez que `.env` contient:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51HikwzEHnThbxHedC3ob6fbT89jK839KWQoXgD3pyNArR5c4HLtwpKsrsDlZiQbsKYwJFHOxYxpZ40JKL1QqG3Na00DVUANgrc
   ```
2. Redémarrez le serveur:
   ```bash
   # Arrêtez avec Ctrl+C
   npm run dev
   ```

**Cause 2**: Le secret Stripe n'est pas dans Supabase

**Solution**:
1. Allez dans Supabase > Edge Functions > Secrets
2. Vérifiez que `STRIPE_SECRET_KEY` existe
3. Si non, ajoutez-le (voir `DEPLOIEMENT_STRIPE_RAPIDE.md`)

---

### ❌ Erreur: "Stripe is not defined"

**Cause**: Le package Stripe n'est pas chargé correctement.

**Solution**:
```bash
npm install @stripe/stripe-js
npm run dev
```

---

### ❌ Le modal s'ouvre mais rien ne se passe au clic sur "Procéder au paiement"

**Cause**: Problème avec l'edge function `create-checkout`.

**Solutions à vérifier**:

1. **La fonction existe-t-elle?**
   - Allez dans Supabase > Edge Functions
   - Vérifiez que `create-checkout` est listée

2. **Le secret est-il configuré?**
   - Edge Functions > Secrets
   - Vérifiez `STRIPE_SECRET_KEY`

3. **La fonction a-t-elle été redéployée après ajout du secret?**
   - Cliquez sur la fonction
   - 3 points (...) > Redeploy

4. **Regardez les logs de la fonction**:
   - Cliquez sur `create-checkout`
   - Onglet **Logs**
   - Regardez les erreurs

---

### ❌ Le paiement fonctionne mais le forfait n'est pas créé

**Cause**: Le webhook Stripe n'est pas configuré ou ne fonctionne pas.

**Solutions**:

1. **Vérifiez le webhook dans Stripe**:
   - Allez sur https://dashboard.stripe.com/webhooks
   - Vérifiez qu'un webhook existe avec l'URL:
     ```
     https://znoxebmkxzxtbkiikhzd.supabase.co/functions/v1/stripe-webhook
     ```
   - Vérifiez que l'événement `checkout.session.completed` est activé

2. **Vérifiez le signing secret**:
   - Dans Supabase > Edge Functions > Secrets
   - Vérifiez que `STRIPE_WEBHOOK_SECRET` existe

3. **Vérifiez les logs du webhook**:
   - Stripe Dashboard > Webhooks > Cliquez sur votre webhook
   - Regardez les tentatives récentes
   - Statut devrait être "Succeeded"

4. **Vérifiez les logs de la fonction**:
   - Supabase > Edge Functions > `stripe-webhook` > Logs
   - Regardez si des erreurs apparaissent

---

### ❌ Rien ne se passe du tout (pas de modal, pas d'erreur)

**Causes possibles**:

1. **Le serveur dev n'est pas redémarré après modification de `.env`**
   ```bash
   # Arrêtez avec Ctrl+C
   npm run dev
   ```

2. **Erreur JavaScript silencieuse**
   - Ouvrez F12 > Console
   - Rechargez la page
   - Regardez les erreurs en rouge

3. **Le modal est masqué**
   - Essayez de faire défiler la page vers le haut
   - Vérifiez le z-index dans les outils de développement

---

## Checklist de Vérification Complète

Cochez chaque élément:

### Configuration de Base
- [ ] `.env` contient `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] La clé commence par `pk_live_` ou `pk_test_`
- [ ] Le serveur dev a été redémarré après modification de `.env`

### Configuration Supabase
- [ ] Edge function `create-checkout` est déployée
- [ ] Edge function `stripe-webhook` est déployée
- [ ] Secret `STRIPE_SECRET_KEY` existe dans Supabase
- [ ] Secret `STRIPE_WEBHOOK_SECRET` existe dans Supabase
- [ ] Les deux fonctions ont été redéployées après ajout des secrets

### Configuration Stripe
- [ ] Un webhook existe dans Stripe Dashboard
- [ ] L'URL du webhook est correcte
- [ ] L'événement `checkout.session.completed` est activé
- [ ] Le signing secret du webhook a été copié dans Supabase

### Tests
- [ ] La console du navigateur ne montre pas d'erreurs
- [ ] Le modal s'ouvre quand on clique sur "Acheter un forfait"
- [ ] Les 3 forfaits sont visibles dans le modal
- [ ] Le clic sur "Procéder au paiement" redirige vers Stripe

---

## Test Rapide: Vérifier que Stripe est chargé

Ouvrez la console du navigateur (F12) et tapez:
```javascript
console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
```

**Si vous voyez la clé**: ✅ La configuration côté client est OK

**Si vous voyez `undefined`**: ❌ Problème avec le `.env` - redémarrez le serveur

---

## Besoin d'Aide Supplémentaire?

1. **Vérifiez tous les logs**:
   - Console du navigateur (F12)
   - Supabase Edge Functions Logs
   - Stripe Dashboard Webhooks

2. **Testez étape par étape**:
   - D'abord, vérifiez que le modal s'ouvre
   - Ensuite, vérifiez que le clic appelle l'API
   - Ensuite, vérifiez que Stripe répond
   - Enfin, vérifiez que le webhook fonctionne

3. **Consultez la documentation**:
   - `DEPLOIEMENT_STRIPE_RAPIDE.md` - Déploiement des fonctions
   - `STRIPE_SETUP_GUIDE.md` - Guide complet
   - `CONFIGURATION_FINALE.md` - Vue d'ensemble

---

## Pour Rappel: Architecture du Flux

```
Clic sur "Acheter un forfait"
  ↓
Modal s'ouvre (React)
  ↓
Clic sur "Procéder au paiement"
  ↓
Appel à l'edge function create-checkout
  ↓
Création d'une session Stripe
  ↓
Redirection vers Stripe Checkout
  ↓
Paiement sur Stripe
  ↓
Stripe envoie un webhook
  ↓
Edge function stripe-webhook reçoit l'événement
  ↓
Création du forfait dans Supabase
  ↓
Redirection vers /success
  ↓
✅ Forfait activé!
```

Si une étape ne fonctionne pas, le problème est à cette étape-là.
