import { Extension } from '@wca/helpers/lib/models/extension';
import { WorldAssignmentsExtension } from './types';

export const getWorldAssignmentsExtension = (
  extensions: Extension[],
): WorldAssignmentsExtension => {
  const extension = extensions?.find(({ id }) => id === 'com.competitiongroups.worldsassignments');

  if (!extension) {
    return { assignments: [] };
  }

  return extension?.data as WorldAssignmentsExtension;
};
