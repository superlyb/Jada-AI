import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoreKey } from "../constant";

import { BOT_HELLO } from "./chat";

export interface AccessControlStore {
  accessCode: string;
  token: string;

  needCode: boolean;


  //updateToken: (_: string) => void;
  //updateCode: (_: string) => void;
  enabledAccessControl: () => boolean;
  isAuthorized: () => boolean;
  fetch: () => void;
}

let fetchState = 0; // 0 not fetch, 1 fetching, 2 done

export const useAccessStore = create<AccessControlStore>()(
  persist(
    (set, get) => ({
      token: "",
      accessCode: "",
      needCode: true,
      enabledAccessControl() {
        get().fetch();

        return get().needCode;
      },
/*       updateCode(code: string) {
        set((state) => ({ accessCode: code }));
      },
      updateToken(token: string) {
        set((state) => ({ token }));
      }, */
      isAuthorized() {
        //getSupabaseFromSession()
        // has token or has code or disabled access control
        //console.log('xx',getSupabaseFromSession())
        //console.log("xx",client)
        return (
          false//!!get().token || !!get().accessCode || !get().enabledAccessControl()
        );
      },
      fetch() {
        if (fetchState > 0) return;
        fetchState = 1;
        fetch("/api/config", {
          method: "post",
          body: null,
        })
          .then((res) => res.json())
          .then((res: DangerConfig) => {
      //      console.log("[Config] got config from server", res);
            set(() => ({ ...res }));

            if ((res as any).botHello) {
              BOT_HELLO.content = (res as any).botHello;
            }
          })
          .catch(() => {
            console.error("[Config] failed to fetch config");
          })
          .finally(() => {
            fetchState = 2;
          });
      },
    }),
    {
      name: StoreKey.Access,
      version: 1,
    },
  ),
);
