import { Link } from 'react-router-dom';
import { useCompetitionTabLinks } from '@/hooks/queries/useCompetitionTabs';

interface TabsDropdownListProps {
  competitionId: string;
  onNavigate: () => void;
}

export const TabsDropdownList = ({ competitionId, onNavigate }: TabsDropdownListProps) => {
  const { data: tabLinks } = useCompetitionTabLinks(competitionId);

  if (tabLinks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {tabLinks.map((tab) => (
        <Link
          key={tab.slug}
          to={tab.href}
          className="block rounded px-2 py-1 text-slate-700 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-gray-800"
          onClick={onNavigate}>
          {tab.text}
        </Link>
      ))}
    </div>
  );
};
