import { useEffect, useState, createContext, useContext } from 'react';
import {
  useUser as useSupaUser,
  useSessionContext,
  User
} from '@supabase/auth-helpers-react';

import { UserDetails, Subscription,One_time } from '../types';
import { compileString } from 'sass';

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoadings: boolean;
  subscription: Subscription | null;
  one_time:One_time | null;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  [propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
  const {
    session,
    isLoading: isLoadingUser,
    supabaseClient: supabase
  } = useSessionContext();
  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;
  const [isLoadingData, setIsloadingData] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [one_time,setOne_time] = useState<One_time| null>(null);

  const getUserDetails = () => supabase.from('users').select('*').single();
  
  const getSubscription = () =>
    supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .single();
  
  const getOne_time = () =>
    supabase
      .from('one_time')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .single();
      

  useEffect(() => {
    if (user && !isLoadingData && !userDetails && (!subscription||!one_time)) {
      setIsloadingData(true);
      Promise.allSettled([getUserDetails(), getSubscription(),getOne_time()]).then(
        (results) => {
          const userDetailsPromise = results[0];
          const subscriptionPromise = results[1];
          const one_timePromise = results[2];
          //console.log('result', results)

          if (userDetailsPromise.status === 'fulfilled')
            setUserDetails(userDetailsPromise.value.data as UserDetails);

          if (subscriptionPromise.status === 'fulfilled')
            setSubscription(subscriptionPromise.value.data as Subscription);

          if (one_timePromise.status === 'fulfilled')
            setOne_time(one_timePromise.value.data as One_time);

          setIsloadingData(false);
        }
      );
    } else if (!user && !isLoadingUser && !isLoadingData) {
      setUserDetails(null);
      setSubscription(null);
      setOne_time(null)
    }
  }, [user, isLoadingUser]);

  const value = {
    accessToken,
    user,
    userDetails,
    isLoadings: isLoadingUser || isLoadingData,
    subscription,
    one_time
  };
  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a MyUserContextProvider.`);
  }
  return context;
};
