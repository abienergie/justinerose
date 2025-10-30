# Déploiement Stripe - Guide Rapide

## Problème Actuel

Quand vous cliquez sur "Acheter un forfait", rien ne se passe car les edge functions Stripe ne sont pas encore déployées.

---

## Solution Rapide (15 minutes)

### Étape 1: Récupérer votre Secret Key Stripe

1. Allez sur https://dashboard.stripe.com/apikeys
2. Cliquez sur **Reveal test key** (ou **Reveal live key** si vous êtes en production)
3. Copiez la **Secret key** (commence par `sk_live_` pour production ou `sk_test_` pour test)

**IMPORTANT**: Gardez cette clé secrète!

---

### Étape 2: Configurer le Secret dans Supabase

1. Allez sur https://supabase.com/dashboard/project/znoxebmkxzxtbkiikhzd
2. Cliquez sur **Edge Functions** dans le menu de gauche
3. Cliquez sur l'onglet **Secrets**
4. Cliquez sur **New secret**
5. Remplissez:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: Votre secret key Stripe (sk_live_... ou sk_test_...)
6. Cliquez sur **Create secret**

✅ Le secret est maintenant configuré!

---

### Étape 3: Déployer la fonction create-checkout

1. Dans Supabase, restez dans **Edge Functions**
2. Cliquez sur **Create function**
3. Function name: `create-checkout`
4. Copiez-collez ce code dans l'éditeur:

```typescript
import Stripe from "npm:stripe@14.10.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
      apiVersion: "2023-10-16",
    })

    const { packageType, packageName, price, sessions, userId, userEmail } = await req.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: packageName,
              description: `Forfait ${sessions} séance${sessions > 1 ? 's' : ''} de yoga`,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/`,
      client_reference_id: userId,
      customer_email: userEmail,
      metadata: {
        packageType,
        sessions: sessions.toString(),
        userId,
      },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    )
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    )
  }
})
```

5. Cliquez sur **Deploy function**

✅ La première fonction est déployée!

---

### Étape 4: Déployer la fonction stripe-webhook

1. Cliquez à nouveau sur **Create function**
2. Function name: `stripe-webhook`
3. Copiez-collez ce code:

```typescript
import Stripe from "npm:stripe@14.10.0"
import { createClient } from "npm:@supabase/supabase-js@2.39.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature",
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
      apiVersion: "2023-10-16",
    })

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const signature = req.headers.get("stripe-signature")
    const body = await req.text()
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")

    let event: Stripe.Event

    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)
    } else {
      event = JSON.parse(body)
    }

    console.log("Webhook event:", event.type)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      const userId = session.metadata?.userId || session.client_reference_id
      const packageType = session.metadata?.packageType
      const sessions = parseInt(session.metadata?.sessions || "1")

      if (!userId || !packageType) {
        throw new Error("Missing required metadata")
      }

      const { error: insertError } = await supabase
        .from("course_packages")
        .insert({
          student_id: userId,
          package_type: packageType,
          total_sessions: sessions,
          remaining_sessions: sessions,
          purchase_date: new Date().toISOString(),
        })

      if (insertError) {
        console.error("Error inserting package:", insertError)
        throw insertError
      }

      console.log("Package created successfully for user:", userId)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    )
  } catch (error) {
    console.error("Webhook error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    )
  }
})
```

4. Cliquez sur **Deploy function**

✅ La deuxième fonction est déployée!

---

### Étape 5: Configurer le Webhook Stripe

1. Allez sur https://dashboard.stripe.com/webhooks
2. Cliquez sur **Add endpoint**
3. **Endpoint URL**:
   ```
   https://znoxebmkxzxtbkiikhzd.supabase.co/functions/v1/stripe-webhook
   ```
4. **Description**: `Justine Rose Yoga - Package purchases`
5. Cliquez sur **Select events**
6. Cherchez et cochez: `checkout.session.completed`
7. Cliquez sur **Add events**
8. Cliquez sur **Add endpoint**

✅ Le webhook est configuré!

---

### Étape 6: Ajouter le Webhook Secret

1. Dans Stripe, cliquez sur le webhook que vous venez de créer
2. Dans la section **Signing secret**, cliquez sur **Reveal**
3. Copiez le secret (commence par `whsec_`)
4. Retournez dans Supabase > **Edge Functions** > **Secrets**
5. Cliquez sur **New secret**:
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: Le signing secret que vous venez de copier
6. Cliquez sur **Create secret**

---

### Étape 7: Redéployer les fonctions

**IMPORTANT**: Après avoir ajouté les secrets, vous devez redéployer les fonctions pour qu'elles puissent les utiliser.

1. Dans Supabase > **Edge Functions**
2. Pour chaque fonction (`create-checkout` et `stripe-webhook`):
   - Cliquez sur la fonction
   - Cliquez sur les 3 points (...) en haut à droite
   - Cliquez sur **Redeploy**

✅ Les fonctions sont maintenant opérationnelles!

---

## Tester l'Intégration

### 1. Redémarrer votre application

Si vous avez changé le fichier `.env`, redémarrez l'application:
```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm run dev
```

### 2. Test avec une carte

1. Connectez-vous avec un compte élève
2. Cliquez sur **Acheter un forfait**
3. Sélectionnez un forfait
4. Cliquez sur **Procéder au paiement**
5. Vous devriez être redirigé vers Stripe Checkout

**Cartes de test** (si vous êtes en mode test):
- **Succès**: `4242 4242 4242 4242`
- Date: N'importe quelle date future
- CVC: N'importe quel 3 chiffres

**En production** (avec votre clé live):
- Utilisez une vraie carte bancaire

### 3. Vérifier le résultat

Après le paiement:
- Vous êtes redirigé vers la page de succès
- Le forfait apparaît dans votre dashboard
- Dans Stripe Dashboard > Webhooks, vous voyez l'événement avec statut "Succeeded"

---

## Dépannage

### "Invalid API key"
- Vérifiez que vous avez bien ajouté `STRIPE_SECRET_KEY` dans les secrets
- Redéployez les fonctions après avoir ajouté le secret
- Vérifiez que la clé commence par `sk_live_` (production) ou `sk_test_` (test)

### Le modal ne s'ouvre pas
- Vérifiez la console du navigateur (F12)
- Assurez-vous que `VITE_STRIPE_PUBLISHABLE_KEY` est dans `.env`
- Redémarrez le serveur de dev après avoir modifié `.env`

### "Function not found"
- Vérifiez que les fonctions sont bien déployées dans Supabase
- Vérifiez les noms exacts: `create-checkout` et `stripe-webhook`

### Le forfait n'est pas créé après paiement
- Vérifiez les logs du webhook dans Stripe Dashboard
- Vérifiez que `STRIPE_WEBHOOK_SECRET` est configuré
- Vérifiez les logs de la fonction dans Supabase > Edge Functions > stripe-webhook > Logs

---

## Récapitulatif

✅ **Ce que vous avez fait:**
1. Clé Stripe publique dans `.env`
2. Secret Stripe dans Supabase
3. 2 edge functions déployées
4. Webhook Stripe configuré
5. Webhook secret dans Supabase

✅ **Ce qui fonctionne maintenant:**
- Élèves peuvent acheter des forfaits en ligne
- Paiement sécurisé via Stripe
- Activation automatique du forfait
- Page de confirmation

---

## Support

Si vous rencontrez des problèmes, vérifiez:
1. Les logs des fonctions dans Supabase
2. Les événements webhook dans Stripe Dashboard
3. La console du navigateur (F12)
4. Que tous les secrets sont configurés
5. Que les fonctions ont été redéployées après ajout des secrets

Temps total: **15 minutes** ⏱️
