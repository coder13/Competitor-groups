/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare const __GIT_COMMIT__: string;
declare const __GIT_TAG__: string;
declare const __APP_ENV__: string;

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_UMAMI_SRC?: string;
  readonly VITE_UMAMI_WEBSITE_ID?: string;
  readonly VITE_NOTIFY_COMP_ORIGIN?: string;
  readonly VITE_NOTIFYCOMP_API_ORIGIN?: string;
  readonly VITE_NOTIFYCOMP_WS_ORIGIN?: string;
  readonly VITE_FEATURE_PERSONAL_USER_PAGE?: string;
}
