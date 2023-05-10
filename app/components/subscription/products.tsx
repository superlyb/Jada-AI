import { GetStaticPropsResult } from 'next';

import Pricing from './Pricing';
import { getActiveProductsWithPrices ,} from '@/utils/supabase-client';
import { Product,ProductWithPrice } from '../../../types';
//import {useSupabaseClient } from '@supabase/auth-helpers-react';

interface Props {
  products: Product[];
}

export default function PricingPage({ products }: Props) {
  return <Pricing products={products} />;
}

/* export const getAProductsWithPrices = async (): Promise<
  ProductWithPrice[]
> => {
  const supabaseClient = useSupabaseClient();
  const { data, error } = await supabaseClient
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .eq('type','one_time')
    .order('metadata->index')
    .order('unit_amount', { foreignTable: 'prices' });

  if (error) {
    console.log(error.message);
  }
  // TODO: improve the typing here.
  return (data as any) || [];
};
 */

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {

  const products = await getActiveProductsWithPrices();
  //const products = await getAProductsWithPrices();

  return {
    props: {
      products
    },
    revalidate: 60
  };
}
