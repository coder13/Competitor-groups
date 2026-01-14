import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Popover } from 'react-tiny-popover';
import { useCompetition } from '@/hooks/queries/useCompetition';
import { useAuth } from '@/providers/AuthProvider';
import { useWCIF } from '@/providers/WCIFProvider';

export default function Header() {
  const { t } = useTranslation();
  const { user, signIn, signOut } = useAuth();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { competitionId } = useParams();

  const queryClient = useQueryClient();

  const { data: comp } = useCompetition(competitionId);
  const { wcif } = useWCIF();

  const competitioName = useMemo(() => {
    if (comp?.name) {
      return comp.name;
    }
    if (wcif?.name) {
      return wcif.name;
    }

    const upcomingCompetitions = queryClient.getQueryData<{ pages: CondensedApiCompetiton[][] }>([
      'upcomingCompetitions',
    ]);
    const myCompetitions = queryClient.getQueryData<{ pages: CondensedApiCompetiton[][] }>([
      'userCompetitions',
    ]);

    const allCompetitions = [
      ...(upcomingCompetitions?.pages?.flat() || []),
      ...(myCompetitions?.pages?.flat() || []),
    ];

    const competition = allCompetitions?.find((c) => c.id === competitionId);

    if (competition) {
      return competition.name;
    }

    return undefined;
  }, [comp, competitionId, queryClient, wcif]);

  return (
    <header className="z-20 flex items-center w-full h-12 p-2 shadow-md print:hidden bg-panel">
      <div className="flex items-center space-x-1">
        <Link to="/" className="link-inline">
          <i className="fa fa-home" />
        </Link>
        {competitionId && <span className="text-tertiary">{' / '}</span>}
        <Link to={`/competitions/${comp?.id || competitionId}`} className="link-inline">
          {competitioName}
        </Link>
      </div>
      <div className="flex flex-1" />
      {user ? (
        <Popover
          isOpen={isPopoverOpen}
          positions={['bottom']} // if you'd like, you can limit the positions
          align="end"
          onClickOutside={() => setIsPopoverOpen(false)} // handle click events outside of the popover/target here!
          containerStyle={{
            zIndex: '50',
          }} // a style object to be applied to the popover container
          content={
            <div
              className="z-50 mt-2 border-2 shadow-xl bg-panel border-tertiary-weak"
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}>
              <Link to="/settings" className="block w-32 px-3 py-2 link-inline hover-bg-tertiary">
                Settings
              </Link>
              <button
                onClick={signOut}
                className="w-32 px-3 py-2 text-left link-inline hover-bg-tertiary">
                Logout
              </button>
            </div>
          }>
          <div
            className="relative flex items-center justify-center w-10 h-10 rounded-full cursor-pointer"
            onClick={() => setIsPopoverOpen((prev) => !prev)}>
            <img src={user.avatar?.thumb_url || ''} alt={user.name} className="rounded-full" />
          </div>
        </Popover>
      ) : (
        <div className="flex items-center space-x-2">
          <Link to="/settings" className="link-inline">
            <i className="fa fa-gear" />
          </Link>
          <button onClick={signIn} className="mx-2 link-inline">
            {t('common.login')}
          </button>
        </div>
      )}
    </header>
  );
}
