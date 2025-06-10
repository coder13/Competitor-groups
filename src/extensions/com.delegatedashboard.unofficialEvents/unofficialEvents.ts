import { Extension } from '@wca/helpers/lib/models/extension';
import { UnofficialEventsExtensionData } from './types';

export const getUnofficialEventsExtension = (
  extensions: Extension[],
): UnofficialEventsExtensionData => {
  const extension = extensions?.find(({ id }) => id === 'delegateDashboard2.UnofficialEvents');

  if (!extension) {
    return { events: [] };
  }

  return extension?.data as UnofficialEventsExtensionData;
};
