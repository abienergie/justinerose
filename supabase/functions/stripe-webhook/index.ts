import Stripe from 'npm:stripe@17.5.0';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-12-18.acacia',
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event: Stripe.Event;

    // Vérifier la signature du webhook si le secret est configuré
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return new Response(
          JSON.stringify({ error: 'Webhook signature verification failed' }),
          { status: 400, headers: corsHeaders }
        );
      }
    } else {
      // En mode test/développement, parser directement le body
      event = JSON.parse(body);
    }

    console.log('Webhook event received:', event.type);

    // Gérer les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);

        // Mettre à jour le statut du package à 'completed'
        const { error: updateError } = await supabase
          .from('course_packages')
          .update({ status: 'completed' })
          .eq('stripe_session_id', session.id);

        if (updateError) {
          console.error('Error updating package status:', updateError);
          throw updateError;
        }

        console.log('Package status updated to completed for session:', session.id);
        break;
      }

      case 'checkout.session.expired':
      case 'payment_intent.payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Payment failed or expired:', session.id);

        // Mettre à jour le statut du package à 'cancelled'
        const { error: updateError } = await supabase
          .from('course_packages')
          .update({ status: 'cancelled' })
          .eq('stripe_session_id', session.id);

        if (updateError) {
          console.error('Error updating package status:', updateError);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});