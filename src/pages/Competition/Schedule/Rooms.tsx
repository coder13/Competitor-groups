import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Container } from '@/components/Container';
import { getLocalizedTimeZoneName } from '@/lib/time';
import { useWCIF } from '@/providers/WCIFProvider';

export function CompetitionRooms() {
  const { t } = useTranslation();

  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle(t('competition.rooms.title'));
  }, [setTitle, t]);

  return (
    <Container>
      <div className="flex flex-col p-1 text-gray-900 dark:text-white">
        {wcif?.schedule?.venues?.map((venue) => (
          <div key={venue.id} className="flex flex-col mb-4 space-y-2">
            <div className="flex flex-col">
              <span className="font-bold">{venue.name}</span>
              <span className="text-xs">{getLocalizedTimeZoneName(venue.timezone)}</span>
            </div>
            <div className="flex flex-col space-y-4">
              {venue.rooms.map((room) => (
                <Link key={room.id} to={`/competitions/${wcif.id}/rooms/${room.id}`}>
                  <div
                    className="flex flex-col w-full border border-gray-200 rounded shadow-md cursor-pointer dark:shadow-gray-800 hover:opacity-90 dark:border-gray-700"
                    style={{
                      backgroundColor: `${room?.color}70`,
                    }}>
                    <h3 className="w-full p-2 text-lg">{room.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
