import { useState, ReactNode } from 'react';

import { GetServerSidePropsContext } from 'next';
import {
  createServerSupabaseClient,
  User
} from '@supabase/auth-helpers-nextjs';

import Button from './Button';
import { useUser } from '@/utils/useUser';
import { postData } from '@/utils/helpers';

import {useSupabaseClient } from '@supabase/auth-helpers-react';
import styles from "../settings.module.scss";

import {ListItem } from "../ui-lib";

import Pricing from './Pricing'
import { getActiveProductsWithPrices } from '@/utils/supabase-client';

interface Props {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

function Card({ title, description, footer, children }: Props) {
  return (
    <ListItem title= {title}>
      <div className="px-5 py-4">
        <p className="text-zinc-300">{description}</p>
        {children}
      </div>
      <div className="px-5 py-4">
        {footer}
      </div>
    </ListItem>

  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {

  //console.log(ctx.req.cookies)

  const supabase = createServerSupabaseClient(ctx);


  // Use the session ID to retrieve the session from Supabase
  let session;

  const { data: sessionData, error } = await supabase.auth.getSession();
  if (error) {
      console.error(error);
      return { notFound: true };
  }
  session = sessionData.session;

  //console.log(session)
  if (!session)
    return {
      redirect: {
        destination: '/signin',
        permanent: false
      }
    };

  return {
    props: {
      initialSession: session,
      user: session.user
    }
  };
};

async function getActiveProdcts(){
  const products = await getActiveProductsWithPrices();
  return products
}

export default async function Account() {
  
  const [loading, setLoading] = useState(false);
  const { isLoadings, subscription, userDetails } = useUser();

  const redirectToCustomerPortal = async () => {
    setLoading(true);
    try {
      const { url, error } = await postData({
        url: '/api/create-portal-link'
      });
      window.location.assign(url);
    } catch (error) {
      if (error) return alert((error as Error).message);
    }
    setLoading(false);
  };

  const subscriptionPrice =
    subscription &&
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: subscription?.prices?.currency,
      minimumFractionDigits: 0
    }).format((subscription?.prices?.unit_amount || 0) / 100);

    const supabaseClient = useSupabaseClient();
    const products = await getActiveProductsWithPrices();
    console.log("pr",products)

  return (

    <section className={styles["user-prompt-modal"]}>
        <div className={styles["user-prompt-header"]}>
            {userDetails ? (
              <span className={styles["user-prompt-buttons"]}
                //className={s.link}
                onClick={async () => {
                  await supabaseClient.auth.signOut();
                  //router.push('/signin');
                }}
              >
                登出
              </span>
            ) : (
              <div>
              </div>
            )}
        </div>  
       <div className={styles["user-prompt-header"]}>
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            账户
          </h1>
      </div>
      <div className={styles["user-prompt-header"]}>
      订阅
      </div>
      <div className="p-4">
        <Card
          title=""
          description={
            subscription
              ? `You are currently on the ${subscription?.prices?.products?.name} plan.`
              : ''
          }
          footer={
            <div className="flex items-start justify-between flex-col sm:flex-row sm:items-center">
              <p className="pb-4 sm:pb-0">
                管理订阅
              </p>
              <Button
                variant="slim"
                loading={loading}
                disabled={loading || !subscription}
                onClick={redirectToCustomerPortal}
              >
                打开订阅平台
              </Button>
            </div>
          }
        >
          <div className="text-xl mt-8 mb-4 font-semibold">
            {isLoadings ? (
              <div className="h-12 mb-6">
              </div>
            ) : subscription ? (
              `${subscriptionPrice}/${subscription?.prices?.interval}`
            ) : (
                <Pricing products={products}/>          
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
