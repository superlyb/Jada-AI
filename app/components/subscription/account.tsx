import { useState, ReactNode,useEffect } from 'react';

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
import { ProductWithPrice } from '../../../types';

import accountstyle from './account.module.scss'

interface Props {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

function Card({ title, description, footer, children }: Props) {
  return (
    <section>
      <div className="text-xl mt-8 mb-4 font-semibold">
        <p className="pb-4 sm:pb-0">{description}</p>
        {children}
      </div>
      <div className="px-5 py-4">
        {footer}
      </div>
    </section>

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

function Account() {
  
  const [loading, setLoading] = useState(false);
  const { isLoadings, subscription, userDetails,one_time } = useUser();
  const [products, setProducts] = useState<ProductWithPrice[]>([])


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

    useEffect(() => {
      getActiveProdcts().then(products => {
        setProducts(products)
      })
    }, [])

    //products = await getActiveProductsWithPrices()
    //console.log("pr",subscription)

  return (

    <section className={styles["user-prompt-modal"]}>
        <div className={accountstyle["Navbar"]}>
          <div className={accountstyle["Navbar-ColumnLeft"]}>
            账户
          </div>
            {userDetails ? (
              <div className={accountstyle["Navbar-ColumnRight"]}
                //className={s.link}
                onClick={async () => {
                  await supabaseClient.auth.signOut();
                  //router.push('/signin');
                }}
              >
                登出
              </div>
            ) : (
              <div>
              </div>
            )}
      </div>
      <div>
      <p>
      订阅
      </p>
      </div>
      <div className='max-w-6xl mx-auto py-8 sm:py-24 px-4 sm:px-6 lg:px-8'>
        <Card
            title=""
            description={
              subscription
                ? `当前订阅:${subscription?.prices?.products?.name}`
                : one_time?'当前是体验版':''
            }
            footer={
              <div className="flex ">
                <p className="">
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
            <div>
              {isLoadings ? (
                <div >
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
export default Account