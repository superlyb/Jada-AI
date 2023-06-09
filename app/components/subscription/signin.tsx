//import { useState } from 'react';
//import { useEffect } from 'react';
import {useSupabaseClient } from '@supabase/auth-helpers-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

import { useUser } from '@/utils/useUser';


//import LoadingDots from '@/components/ui/LoadingDots';
//import Logo from '@/components/icons/Logo';
//import { getURL } from '@/utils/helpers';
const SignIn = (props: { onClose?: () => void }) => {
    const {userDetails} = useUser();
    const supabaseClient = useSupabaseClient();
    //console.log('111supabaseClient,',accessToken);
    //console.log('xxx',subscription)

    if (!userDetails)
      return (
        <div className="flex justify-center height-screen-helper">
          <div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80 ">
            <div className="flex flex-col space-y-4">
             <Auth
                supabaseClient={supabaseClient}
                providers={['google']}
                //redirectTo={getURL()}
                magicLink={true}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#404040',
                        brandAccent: '#52525b'
                      }
                    }
                  }
                }}
                localization={{
                  variables: {
                    sign_up: {
                      email_label: '邮箱(!激活邮件可能在垃圾邮件里!)',
                      password_label: '密码',
                      button_label:'注册',
                      link_text:'还没有账户?点击注册',
                      confirmation_text:'已注册，请去邮箱激活,如果没有收到请检查垃圾邮件'
                   },
                    sign_in: {
                      email_label: '邮箱',
                      password_label: '密码',
                      button_label:'登录',
                      link_text:'已有账号？登录',
                    },
                    forgotten_password: {
                      email_label:'邮箱',
                      password_label: '密码',
                      button_label:'发送',
                      link_text:'忘记密码？'
                    },
                  },
                }}
                theme="light"
              /> 
            </div>
          </div>
        </div>
      );
      return (
        <div className="m-6">
        </div>
      ); 
};

export default SignIn;
