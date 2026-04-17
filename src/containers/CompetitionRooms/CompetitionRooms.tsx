import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { getLocalizedTimeZoneName } from '@/lib/time';
import { useWCIF } from '@/providers/WCIFProvider';

export interface CompetitionRoomsContainerProps {
  competitionId: string;
  LinkComponent?: LinkRenderer;
}

export function CompetitionRoomsContainer({
  competitionId,
  LinkComponent = AnchorLink,
}: CompetitionRoomsContainerProps) {
  const { t } = useTranslation();
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle(t('competition.rooms.title'));
  }, [setTitle, t]);

  return (
    <Container>
      <div className="flex flex-col p-1 type-body">
        {wcif?.schedule?.venues?.map((venue) => (
          <div key={venue.id} className="mb-4 flex flex-col space-y-2">
            <div className="flex flex-col">
              <span className="font-bold">{venue.name}</span>
              <span className="type-meta">{getLocalizedTimeZoneName(venue.timezone)}</span>
            </div>
            <div className="flex flex-col space-y-4">
              {venue.rooms.map((room) => (
                <LinkComponent key={room.id} to={`/competitions/${competitionId}/rooms/${room.id}`}>
                  <div
                    className="flex w-full cursor-pointer flex-col rounded border border-tertiary-weak shadow-md shadow-tertiary-dark hover:opacity-90 dark:border-gray-700"
                    style={{
                      backgroundColor: `${room?.color}70`,
                    }}>
                    <h3 className="w-full p-2 type-heading">{room.name}</h3>
                  </div>
                </LinkComponent>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
