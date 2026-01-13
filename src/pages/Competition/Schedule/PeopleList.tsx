import { Activity, AssignmentCode, Person } from '@wca/helpers';
import classNames from 'classnames';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getStationNumber } from '@/lib/activities';
import { AssignmentCodeRank } from '@/lib/assignments';
import { getAssignmentColorClasses } from '@/lib/colors';
import { byName } from '@/lib/utils';

export interface PeopleListProps {
  competitionId: string;
  activity: Activity;
  peopleByAssignmentCode: Record<AssignmentCode, Person[]>;
}

export const PeopleList = ({
  competitionId,
  activity,
  peopleByAssignmentCode,
}: PeopleListProps) => {
  const { t } = useTranslation();

  return (
    <>
      {Object.keys(peopleByAssignmentCode)
        .sort((a, b) => {
          const aRank = AssignmentCodeRank.indexOf(a);
          const bRank = AssignmentCodeRank.indexOf(b);
          return (
            (aRank >= 0 ? aRank : AssignmentCodeRank.length) -
            (bRank >= 0 ? bRank : AssignmentCodeRank.length)
          );
        })
        .map((assignmentCode) => {
          const people = peopleByAssignmentCode[assignmentCode];

          const anyHasStationNumber = people.some(getStationNumber(assignmentCode, activity));

          // Use the centralized assignment color system
          const colorClasses = getAssignmentColorClasses(assignmentCode);

          const assignmentCodeTitleKey = `common.assignments.${assignmentCode}.noun`;
          const title = t(assignmentCodeTitleKey, {
            count: people.length,
            defaultValue: assignmentCode.replace('staff-', ''),
          });

          return (
            <Fragment key={assignmentCode}>
              <hr className="mb-2 border-t border-gray-200 dark:border-gray-700" />
              <div>
                <h4
                  className={classNames(
                    'type-heading font-bold text-center shadow-md py-3 px-6 text-default dark:shadow-gray-800',
                    colorClasses.bg,
                  )}>
                  {title} <span className="type-body-sm">({people.length})</span>
                </h4>
                {anyHasStationNumber ? (
                  <table className="text-left table-base type-body">
                    <thead>
                      <tr
                        className={classNames(
                          'type-body-sm shadow-md text-default',
                          colorClasses.bg,
                        )}>
                        <th className="table-header-cell">{t('common.name')}</th>
                        <th className="table-header-cell">
                          {t('competition.eventActivity.stationNumber')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {people
                        .map((i) => ({
                          ...i,
                          stationNumber: getStationNumber(assignmentCode, activity)(i),
                        }))
                        .sort((a, b) => {
                          if (
                            a.stationNumber &&
                            b.stationNumber &&
                            a.stationNumber - b.stationNumber !== 0
                          ) {
                            return a.stationNumber - b.stationNumber;
                          }

                          return byName(a, b);
                        })
                        .map((person, index) => (
                          <Link
                            key={person.registrantId}
                            className={classNames(
                              'table-row cursor-pointer transition-colors',
                              'type-body',
                              index % 2 === 0 ? colorClasses.tableRow : colorClasses.tableRowAlt,
                              `hover:${colorClasses.tableRowHover}`,
                            )}
                            to={`/competitions/${competitionId}/persons/${person.registrantId}`}>
                            <td className="table-cell">{person.name}</td>
                            <td className="table-cell">{person.stationNumber}</td>
                          </Link>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div>
                    {people.sort(byName).map((person, index) => (
                      <Link
                        key={person.registrantId}
                        className={classNames(
                          'p-2 py-2.5 block cursor-pointer transition-colors',
                          'type-body',
                          index % 2 === 0 ? colorClasses.tableRow : colorClasses.tableRowAlt,
                          `hover:${colorClasses.tableRowHover}`,
                        )}
                        to={`/competitions/${competitionId}/persons/${person.registrantId}`}>
                        {person.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </Fragment>
          );
        })}
    </>
  );
};
