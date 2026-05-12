/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare const __GIT_COMMIT__: string;
declare const __GIT_TAG__: string;

interface ImportMetaEnv {
  readonly VITE_NOTIFY_COMP_ORIGIN?: string;
  readonly VITE_NOTIFYCOMP_AUTH_ORIGIN?: string;
  readonly VITE_NOTIFYCOMP_API_ORIGIN?: string;
  readonly VITE_NOTIFYCOMP_WS_ORIGIN?: string;
}
