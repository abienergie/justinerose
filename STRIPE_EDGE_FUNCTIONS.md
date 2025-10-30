# Edge Functions Stripe à déployer

Ce document contient les 2 edge functions nécessaires pour l'intégration Stripe.

## Prérequis

1. Obtenez vos clés Stripe:
   - Allez sur https://dashboard.stripe.com/apikeys
   - Copiez la **Publishable key** (commence par `pk_test_`)
   - Copiez la **Secret key** (commence par `sk_test_`)

2. Configurez les variables d'environnement dans `.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle
   ```

3. Les secrets Stripe sont automatiquement configurés dans Supabase

---

## Fonction 1: create-checkout

Cette fonction crée une session de paiement Stripe.

### Code de la fonction:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "npm:stripe@14.10.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

serve(async (req: Request) => {
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

### Déploiement:

Vous devez déployer cette fonction via le dashboard Supabase ou utiliser le CLI Supabase.

---

## Fonction 2: stripe-webhook

Cette fonction reçoit les événements de Stripe et crée automatiquement les forfaits.

### Code de la fonction:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "npm:stripe@14.10.0"
import { createClient } from "npm:@supabase/supabase-js@2.39.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature",
}

serve(async (req: Request) => {
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

### Configuration du Webhook dans Stripe:

1. Allez sur https://dashboard.stripe.com/webhooks
2. Cliquez sur **Add endpoint**
3. URL du endpoint: `https://znoxebmkxzxtbkiikhzd.supabase.co/functions/v1/stripe-webhook`
4. Sélectionnez l'événement: `checkout.session.completed`
5. Cliquez sur **Add endpoint**
6. Copiez le **Signing secret** (commence par `whsec_`)
7. Configurez ce secret dans Supabase (voir ci-dessous)

---

## Configuration des Secrets dans Supabase

Les secrets sont déjà pré-configurés dans votre projet Supabase. Vous n'avez rien à faire!

Les secrets disponibles sont:
- `STRIPE_SECRET_KEY` - Votre clé secrète Stripe
- `STRIPE_WEBHOOK_SECRET` - Le secret de votre webhook Stripe
- `SUPABASE_URL` - URL de votre projet (automatique)
- `SUPABASE_SERVICE_ROLE_KEY` - Clé service role (automatique)

---

## Page de Succès

Créez une page `/success` pour confirmer le paiement à l'utilisateur.

---

## Test de l'Intégration

### Mode Test Stripe

Utilisez ces cartes de test:
- **Succès**: `4242 4242 4242 4242`
- **Échec**: `4000 0000 0000 0002`
- Date d'expiration: N'importe quelle date future
- CVC: N'importe quel 3 chiffres
- Code postal: N'importe quel code

### Vérifier le Webhook

1. Effectuez un paiement test
2. Allez dans Stripe Dashboard > Webhooks
3. Vérifiez que l'événement `checkout.session.completed` a été reçu
4. Vérifiez dans votre base Supabase que le forfait a été créé

---

## Déploiement

Pour déployer ces fonctions, vous devrez:

1. Les créer via le dashboard Supabase (SQL Editor > Functions)
2. Ou utiliser le Supabase CLI (non disponible dans cet environnement)

Je recommande de créer les fonctions via le dashboard pour plus de simplicité.

---

## Support

Si vous rencontrez des problèmes:
1. Vérifiez les logs de la fonction dans Supabase
2. Vérifiez les événements webhook dans Stripe Dashboard
3. Assurez-vous que les secrets sont bien configurés
