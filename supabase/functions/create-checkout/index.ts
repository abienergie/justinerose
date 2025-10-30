import Stripe from 'npm:stripe@17.5.0';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
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
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-11-20.acacia',
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { packageType, packageName, price, sessions, userId, userEmail } = await req.json();

    console.log('Creating checkout for:', { packageType, packageName, price, sessions, userId, userEmail });

    // Récupérer l'origine de la requête
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://znoxebmkxzxtbkiikhzd.supabase.co';
    console.log('Using origin:', origin);

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: packageName,
              description: `${sessions} heure${sessions > 1 ? 's' : ''} de cours de yoga`,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/student`,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        userId,
        packageType,
        sessions: sessions.toString(),
        price: price.toString(),
      },
    });

    console.log('Stripe session created:', session.id);

    // Créer une entrée pending dans la base de données
    const packageData = {
      student_id: userId,
      package_type: packageType,
      total_sessions: sessions,
      remaining_sessions: sessions,
      amount_paid: price,
      stripe_session_id: session.id,
      status: 'pending',
    };

    console.log('Inserting package data:', packageData);

    const { data: insertedData, error: dbError } = await supabase
      .from('course_packages')
      .insert(packageData)
      .select();

    if (dbError) {
      console.error('Database error details:', {
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        code: dbError.code
      });
      throw new Error(`Database error: ${dbError.message} (${dbError.code})`);
    }

    console.log('Package inserted successfully:', insertedData);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
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