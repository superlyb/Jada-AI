import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from "next/server";

import { stripe } from '@/utils/stripe';
import { createOrRetrieveCustomer } from '@/utils/supabase-admin';
import { getURL } from '@/utils/helpers';

export async function POST(req: NextRequest,res:NextResponse) {
     const body = await req.text();
     const context = JSON.parse(body)
    // const { context} = JSON.parse(body);
    
   
    
    const { price, quantity = 1, metadata = {} } = context;
    try {
      const supabase = createMiddlewareSupabaseClient({ req, res });
      const {
        data: { user }
      } = await supabase.auth.getUser();

      console.log('user',user)

      const customer = await createOrRetrieveCustomer({
        uuid: user?.id || '',
        email: user?.email || ''
      });
      console.log('customer',customer)
      
/*       const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        customer,
        line_items: [
          {
            price: price.id,
            quantity
          }
        ],
        mode: 'subscription',
        allow_promotion_codes: true,
        subscription_data: {
          trial_from_plan: true,
          metadata
        },
        success_url: `${getURL()}/settings`,
        cancel_url: `${getURL()}/`
      }); */

      //return NextResponse.json({ sessionId: session.id });
      return NextResponse.json({ sessionId: customer});
    } catch (err: any) {
      console.log(err);

    }

};

export const runtime = "edge";
