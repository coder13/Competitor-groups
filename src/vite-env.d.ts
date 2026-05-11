/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare const __GIT_COMMIT__: string;
declare const __GIT_TAG__: string;

interface ImportMetaEnv {
  readonly VITE_NOTIFY_COMP_ORIGIN?: string;
}
