import { Person } from '@wca/helpers';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AssignmentCodeCell } from '@/components/AssignmentCodeCell';

export interface CompetitorListItemProps {
  person: Person;
  currentAssignmentCode?: string;
  highlight?: boolean;
  bookmarked?: boolean;
}

export const CompetitorListItem = ({
  person,
  currentAssignmentCode,
  highlight = false,
  bookmarked = false,
}: CompetitorListItemProps) => {
  const { t } = useTranslation();

  return (
    <Link key={person.registrantId} to={`persons/${person.registrantId}`}>
      <li className="border bg-white list-none rounded-md flex justify-between cursor-pointer hover:bg-blue-200 group transition-colors my-1 flex-row min-h-[40px] items-center">
        <div className="flex space-x-1">
          {highlight && (
            <div className="flex flex-shrink">
              <img
                src={person.avatar?.thumbUrl}
                alt={person.name}
                width="60em"
                className="object-center rounded-l"
              />
            </div>
          )}
          <div className="flex flex-col justify-center p-1">
            <span className="text-lg">{person.name}</span>
            {highlight && (
              <span className="text-sm">
                {t('competition.competitors.viewMyAssignments')}{' '}
                <i className="text-xs fa fa-chevron-right" />
              </span>
            )}
          </div>
        </div>
        {bookmarked && !currentAssignmentCode && (
          <div className="flex flex-shrink text-2xl items-center px-2">
            <span className="fa fa-bookmark text-yellow-500" />
          </div>
        )}
        {currentAssignmentCode ? (
          <AssignmentCodeCell
            as="div"
            className="text-sm p-1 rounded-md text-gray-500"
            assignmentCode={currentAssignmentCode}
            grammar="verb"
          />
        ) : null}
      </li>
    </Link>
  );
};
