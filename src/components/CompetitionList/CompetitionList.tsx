import { useTranslation } from 'react-i18next';
import { BarLoader } from 'react-spinners';
import { usePinnedCompetitions } from '@/hooks/UsePinnedCompetitions';
import { CompetitionListItem } from '../CompetitionListItem';
import { LastFetchedAt } from '../LastFetchedAt';

interface CompetitionListFragmentProps {
  title: string;
  competitions: Pick<
    ApiCompetition,
    'id' | 'name' | 'start_date' | 'end_date' | 'city' | 'country_iso2'
  >[];
  loading: boolean;
  liveCompetitionIds: string[];
  lastFetchedAt?: number;
}

export function CompetitionListFragment({
  title,
  competitions,
  loading,
  liveCompetitionIds,
  lastFetchedAt,
}: CompetitionListFragmentProps) {
  const { t } = useTranslation();
  const { pinnedCompetitions } = usePinnedCompetitions();

  if (!competitions.length && !loading) {
    return null;
  }

  return (
    <div className="w-full p-2">
      <span className="text-sm text-blue-800">{title}</span>
      {loading ? <BarLoader width="100%" /> : <div style={{ height: '4px' }} />}
      {!!competitions.length && (
        <ul className="px-0">
          {competitions.map((comp) => (
            <CompetitionListItem
              key={comp.id}
              {...comp}
              isLive={liveCompetitionIds.includes(comp.id)}
              isBookmarked={pinnedCompetitions.some((pinned) => pinned.id === comp.id)}
            />
          ))}
        </ul>
      )}
      {!!lastFetchedAt && <LastFetchedAt lastFetchedAt={new Date(lastFetchedAt)} />}
      {!loading && !competitions.length && (
        <div className="text-center text-gray-500">{t('common.competitionList.noneFound')}</div>
      )}
    </div>
  );
}
