import { NextRequest, NextResponse } from "next/server";

import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs';

import { stripe } from '@/utils/stripe';
import { createOrRetrieveCustomer } from '@/utils/supabase-admin';
import { getURL } from '@/utils/helpers';


export async function POST(req: NextRequest,res:NextResponse) {

  //console.log("xx",req)

  //return await CreatePortalLink(req,res)
  try {
    const supabase = createMiddlewareSupabaseClient({ req, res });

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) throw Error('Could not get user');
   
    const customer = await createOrRetrieveCustomer({
      uuid: user.id || '',
      email: user.email || ''
    });

/*     if (!customer) throw Error('Could not get customer');
     const { url } = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${getURL()}/account`
    }); 
 */
    return NextResponse.json({ customer });//url
  } catch (err: any) {
    console.log(err);
    return new NextResponse(null, { status: 500, statusText: err.text });
    //res
    //  .status(500)
    //  .json({ error: { statusCode: 500, message: err.message } });
  }

}

export const runtime = "edge";

