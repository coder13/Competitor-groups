import { Activity, Room } from '@wca/helpers';
import { NatsHelperGroupExtensionData, NatsHelperStageExtensionData } from './types';

const namespace = 'org.cubingusa.natshelper.v1';

export const getNatsHelperRoomExtension = ({
  extensions,
}: Room): NatsHelperStageExtensionData | undefined => {
  const extension = extensions?.find(({ id }) => id === `${namespace}.Room`);

  if (!extension) {
    return undefined;
  }

  return extension?.data as NatsHelperStageExtensionData;
};

export const getNatsHelperGroupExtension = ({
  extensions,
}: Activity): NatsHelperGroupExtensionData | undefined => {
  const extension = extensions?.find(({ id }) => id === `${namespace}.Group`);

  if (!extension) {
    return undefined;
  }

  return extension?.data as NatsHelperGroupExtensionData;
};
