import { BarLoader } from 'react-spinners';
import CompetitionLink from './CompetitionLink';

interface CompetitionListFragmentProps {
  title: string;
  competitions: Pick<
    ApiCompetition,
    'id' | 'name' | 'start_date' | 'end_date' | 'city' | 'country_iso2'
  >[];
  loading: boolean;
  liveCompetitionIds: string[];
}

export default function CompetitionListFragment({
  title,
  competitions,
  loading,
  liveCompetitionIds,
}: CompetitionListFragmentProps) {
  return (
    <div className="w-full p-1">
      <h3 className="text-2xl mb-2">{title}</h3>
      {loading ? <BarLoader width="100%" /> : <div style={{ height: '4px' }} />}
      {!!competitions.length && (
        <ul className="px-0">
          {competitions.map((comp) => (
            <CompetitionLink key={comp.id} {...comp} live={liveCompetitionIds.includes(comp.id)} />
          ))}
        </ul>
      )}
      {!loading && !competitions.length && (
        <div className="text-center text-gray-500">No competitions found.</div>
      )}
    </div>
  );
}
