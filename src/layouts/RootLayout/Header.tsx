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

    const upcomingCompetitions =
      queryClient.getQueryData<CondensedApiCompetiton[]>(['upcomingCompetitions']) ?? [];
    const myCompetitions =
      queryClient.getQueryData<CondensedApiCompetiton[]>(['userCompetitions']) ?? [];

    const competition =
      upcomingCompetitions?.find((c) => c.id === competitionId) ||
      myCompetitions?.find((c) => c.id === competitionId);

    if (competition) {
      return competition.name;
    }

    return undefined;
  }, [comp, competitionId, queryClient, wcif]);

  return (
    <header className="flex w-full shadow-md p-2 h-12 items-center print:hidden z-20 bg-white">
      <div className="flex items-center space-x-1">
        <Link to="/" className="text-blue-500">
          <i className="fa fa-home" />
        </Link>
        <span>{' / '}</span>
        <Link to={`/competitions/${comp?.id || competitionId}`} className="text-blue-500">
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
              className="bg-white border-2 shadow-xl mt-2 z-50"
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}>
              <button onClick={signOut} className="text-blue-500 px-3 py-2 w-32 hover:bg-gray-100">
                Logout
              </button>
            </div>
          }>
          <div
            className="w-10 h-10 relative flex justify-center items-center rounded-full cursor-pointer"
            onClick={() => setIsPopoverOpen((prev) => !prev)}>
            <img src={user.avatar?.thumb_url || ''} alt={user.name} className="rounded-full" />
          </div>
        </Popover>
      ) : (
        <button onClick={signIn} className="text-blue-500 mx-2">
          {t('common.login')}
        </button>
      )}
    </header>
  );
}
