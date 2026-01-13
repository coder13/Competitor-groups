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
      <li className="border border-tertiary-weak bg-panel list-none rounded-md flex justify-between cursor-pointer hover:bg-blue-200 dark:hover:bg-gray-700 group transition-colors my-1 flex-row min-h-[40px] items-center text-gray-900 dark:text-white type-body">
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
            <span className="type-heading">{person.name}</span>
            {highlight && (
              <span className="type-body-sm text-muted">
                {t('competition.competitors.viewMyAssignments')}{' '}
                <i className="type-meta fa fa-chevron-right" />
              </span>
            )}
          </div>
        </div>
        {bookmarked && !currentAssignmentCode && (
          <div className="flex items-center flex-shrink px-2 type-title">
            <span className="text-yellow-500 fa fa-bookmark" />
          </div>
        )}
        {currentAssignmentCode ? (
          <AssignmentCodeCell
            as="div"
            className="p-1 type-body-sm text-muted rounded-md"
            assignmentCode={currentAssignmentCode}
            grammar="verb"
          />
        ) : null}
      </li>
    </Link>
  );
};
