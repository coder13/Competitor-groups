import { Activity, AssignmentCode, Person } from '@wca/helpers';
import classNames from 'classnames';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getStationNumber } from '@/lib/activities';
import { AssignmentCodeRank } from '@/lib/assignments';
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

          const headerColorClassName = {
            'bg-yellow-100 dark:bg-yellow-900/60': assignmentCode === 'staff-scrambler',
            'bg-red-200 dark:bg-red-900/60': assignmentCode === 'staff-runner',
            'bg-blue-200 dark:bg-blue-900/60': assignmentCode.match(/judge/i),
            'bg-cyan-200 dark:bg-cyan-900/60': assignmentCode === 'staff-dataentry',
            'bg-violet-200 dark:bg-violet-900/60': assignmentCode === 'staff-announcer',
            'bg-purple-800 dark:bg-purple-900/50': assignmentCode === 'staff-stagelead',
            'bg-purple-200 dark:bg-purple-900/60': assignmentCode === 'staff-delegate',
            'bg-amber-500 dark:bg-amber-900/60': assignmentCode === 'staff-photo',
            'bg-pink-300 dark:bg-pink-900/60': assignmentCode === 'staff-stream',
            'bg-slate-200 dark:bg-slate-800/60': !AssignmentCodeRank.includes(assignmentCode),
            'bg-rose-200 dark:bg-rose-900/60': assignmentCode === 'staff-core',
          };
          const colorClassName = {
            'even:bg-yellow-50 even:dark:bg-yellow-950/50': assignmentCode === 'staff-scrambler',
            'even:bg-red-50 even:dark:bg-red-950/50': assignmentCode === 'staff-runner',
            'even:bg-blue-50 even:dark:bg-blue-950/50': assignmentCode.match(/judge/i),
            'even:bg-cyan-50 even:dark:bg-cyan-950/50': assignmentCode === 'staff-dataentry',
            'even:bg-violet-50 even:dark:bg-violet-950/50': assignmentCode === 'staff-announcer',
            'even:bg-fuchsia-50 even:dark:bg-fuchsia-950/50': assignmentCode === 'staff-stream',
            'even:bg-orange-50 even:dark:bg-orange-950/50': assignmentCode === 'staff-photo',
            'even:bg-purple-50 even:dark:bg-purple-950/50':
              assignmentCode === 'staff-stagelead' || assignmentCode === 'staff-delegate',
            'even:bg-slate-50 even:dark:bg-slate-800/50':
              !AssignmentCodeRank.includes(assignmentCode),
            'even:bg-rose-50 even:dark:bg-rose-950/50': assignmentCode === 'staff-core',
          };

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
                    'text-lg font-bold text-center shadow-md py-3 px-6 text-gray-900 dark:text-white dark:shadow-gray-800',
                    headerColorClassName,
                  )}>
                  {title} <span className="text-sm">({people.length})</span>
                </h4>
                {anyHasStationNumber ? (
                  <table className={'w-full text-left text-gray-900 dark:text-white'}>
                    <thead>
                      <tr
                        className={classNames(
                          'text-sm shadow-md dark:bg-gray-800 dark:text-white',
                          headerColorClassName,
                        )}>
                        <th className="px-6 pt-1 pb-3">{t('common.name')}</th>
                        <th className="px-6 pt-1 pb-3">
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
                        .map((person) => (
                          <Link
                            key={person.registrantId}
                            className={classNames(
                              'table-row',
                              'text-gray-900 dark:text-white',
                              'hover:brightness-125',
                              'dark:bg-gray-900',
                              colorClassName,
                            )}
                            to={`/competitions/${competitionId}/persons/${person.registrantId}`}>
                            <td className="px-6 py-2.5">{person.name}</td>
                            <td className="px-6 py-2.5">{person.stationNumber}</td>
                          </Link>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div>
                    {people.sort(byName).map((person) => (
                      <Link
                        key={person.registrantId}
                        className={classNames(
                          'p-2 py-2.5 block',
                          'text-gray-900 dark:text-white',
                          'hover:brightness-125',
                          'dark:bg-gray-900',
                          colorClassName,
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
