import { useState } from 'react';
//import { useRouter } from 'next/router';
import cn from 'classnames';

import Button from './Button';
import { postData } from '@/utils/helpers';
import { getStripe } from '@/utils/stripe-client';
import { useUser } from '@/utils/useUser';

import { Price, ProductWithPrice } from '../../../types';

interface Props {
  products: ProductWithPrice[];
}

type BillingInterval = 'year' | 'month';
type BillingType = 'one_time' | 'recurring';

import subsstyles from './Pricing.module.scss';

export default function Pricing({ products }: Props) {
  //const router = useRouter();
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>('month');
  const [billingType, setBillingType] =
    useState<BillingType>('recurring');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const { user, isLoadings,subscription,one_time } = useUser();

  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);
    if (!user) {
    //  return router.push('/signin');
    }
    if (subscription) {
    //  return router.push('/account');
    }

    try {
      const stripe = await getStripe();
       await postData({
        url: '/api/create-checkout-session',
        data: { price }
      })
      .then(function(response) {
        return response;
      })
      .then(function(sessionId) {
        
        //stripe?.redirectToCheckout({ sessionId })
        console.log('ss',sessionId)
        return stripe?.redirectToCheckout({ sessionId: sessionId.sessionId });
      })    
      .then(function(result) {
        if (result?.error) {
          alert(result.error.message);
        }
      })

    } catch (error) {
      return alert((error as Error)?.message);
    } finally {
      setPriceIdLoading(undefined);
    }
  };

/*   if (!products.length)
    return (
      <section className="bg-black">
        <div className="max-w-6xl mx-auto py-8 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center"></div>
          <p className="text-6xl font-extrabold text-white sm:text-center sm:text-6xl">
            No subscription pricing plans found. Create them in your{' '}
            <a
              className="text-pink-500 underline"
              href="https://dashboard.stripe.com/products"
              rel="noopener noreferrer"
              target="_blank"
            >
              Stripe Dashboard
            </a>
            .
          </p>
        </div>
      </section>
    );
 */
  return (
    <section className={subsstyles['Navbar']}>
{/*       <div className="max-w-6xl mx-auto py-8 sm:py-24 px-4 sm:px-6 lg:px-8"> */}
         {<div className={subsstyles['Navbar-StepOne']}>
         {one_time?.status !=="trialing"&&subscription === null&&
         <button
              onClick={() => setBillingType('one_time')}
              type="button"
              className={subsstyles[`${billingType === 'one_time' ? 'BusinessModelButtonClicked' : 'BusinessModelButton'}`]}
            >
              <div  >
                  体验版{/* Yearly billing */}
              </div>
              
            </button>
          }   
          <button
              onClick={() => setBillingType('recurring')}
              type="button"
              className={subsstyles[`${billingType === 'recurring' ? 'BusinessModelButtonClicked' : 'BusinessModelButton'}`]} >
                <div  >
                按月{/* Monthly billing */}
                </div>
              
            </button>
           
        </div>}
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4">
          {products.map((product) => {
            const price = product?.prices
            ?.find((price) => price.type === billingType
            );
            if (!price) return null;
            const priceString = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: price.currency,
              minimumFractionDigits: 0
            }).format((price?.unit_amount || 0) / 100);
            return (
              <div
                key={product.id}
                className={cn(
                  'rounded-lg shadow-sm divide-y divide-zinc-600 bg-zinc-900',
                  {
                    'border border-pink-500': subscription
                      ? product.name === subscription?.prices?.products?.name
                      : product.name === 'Freelancer'
                  }
                )}
              >
                <div className="text-zinc-300">
                  <h2 className="text-2xl leading-6 font-semibold text-white">
                    {product.name}
                  </h2>
                  <p className="mt-4 text-zinc-300">{product.description}</p>
                  <p className="mt-8">
                    <span className="text-5xl font-extrabold white">
                      {priceString}
                    </span>
                  {billingType === 'recurring' ?
                    <span className="text-base font-medium text-zinc-100">
                      /{billingInterval}
                    </span>:<span>(30天)</span>}
                  <Button
                    variant="slim"
                    type="button"
                    disabled={isLoadings}
                    loading={priceIdLoading === price.id}
                    onClick={() => handleCheckout(price)}
                    className="mt-8 block w-full rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-zinc-900"
                  >
                    {product.name === subscription?.prices?.products?.name
                      ? '管理'
                      : '订阅'}
                  </Button>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
{/*       </div> */}
    </section>
  );
}
