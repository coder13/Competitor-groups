type RegisterSWOptions = {
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
};

export function registerSW(_options?: RegisterSWOptions) {
  return async (_reloadPage?: boolean) => {};
}
