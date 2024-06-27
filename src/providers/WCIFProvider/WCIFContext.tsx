import { Competition } from '@wca/helpers';
import { createContext, useContext } from 'react';

export interface IWCIFContextType {
  wcif?: Competition;
  setTitle: (title: string) => void;
}

export const WCIFContext = createContext<IWCIFContextType>({
  wcif: {
    formatVersion: '1.0',
    id: '',
    name: '',
    shortName: '',
    events: [],
    persons: [],
    schedule: {
      numberOfDays: 0,
      startDate: '',
      venues: [],
    },
    competitorLimit: 0,
    extensions: [],
  },
  setTitle: () => {},
});

export const useWCIF = () => useContext(WCIFContext);

export const useWcifUtils = () => {
  const { wcif } = useWCIF();

  const rooms = wcif?.schedule?.venues?.flatMap((venue) => venue.rooms) || [];
  const roundActivies = rooms.flatMap((room) => room.activities);
  const childActivities = roundActivies.flatMap((activity) => activity.childActivities);
  const acceptedPersons =
    wcif?.persons?.filter((person) => person.registration?.status === 'accepted') || [];

  return { rooms, roundActivies, childActivities, acceptedPersons };
};
