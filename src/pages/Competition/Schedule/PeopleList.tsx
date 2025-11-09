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
            'bg-yellow-100': assignmentCode === 'staff-scrambler',
            'bg-red-200': assignmentCode === 'staff-runner',
            'bg-blue-200': assignmentCode.match(/judge/i),
            'bg-cyan-200': assignmentCode === 'staff-dataentry',
            'bg-violet-200': assignmentCode === 'staff-announcer',
            'bg-purple-800': assignmentCode === 'staff-stagelead',
            'bg-purple-200': assignmentCode === 'staff-delegate',
            'bg-amber-500': assignmentCode === 'staff-photo',
            'bg-pink-300': assignmentCode === 'staff-stream',
            'bg-slate-200': !AssignmentCodeRank.includes(assignmentCode),
            'bg-rose-200': assignmentCode === 'staff-core',
          };
          const colorClassName = {
            'even:bg-yellow-50': assignmentCode === 'staff-scrambler',
            'even:bg-red-50': assignmentCode === 'staff-runner',
            'even:bg-blue-50': assignmentCode.match(/judge/i),
            'even:bg-cyan-50': assignmentCode === 'staff-dataentry',
            'even:bg-violet-50': assignmentCode === 'staff-announcer',
            'even:bg-fuchsia-50': assignmentCode === 'staff-stream',
            'even:bg-orange-50': assignmentCode === 'staff-photo',
            'even:bg-purple-50':
              assignmentCode === 'staff-stagelead' || assignmentCode === 'staff-delegate',
            'even:bg-slate-50': !AssignmentCodeRank.includes(assignmentCode),
            'even:bg-rose-50': assignmentCode === 'staff-core',
          };

          const assignmentCodeTitleKey = `common.assignments.${assignmentCode}.noun`;
          const title = t(assignmentCodeTitleKey, {
            count: people.length,
            defaultValue: assignmentCode.replace('staff-', ''),
          });

          return (
            <Fragment key={assignmentCode}>
              <hr className="mb-2" />
              <div>
                <h4
                  className={classNames(
                    'text-lg font-bold text-center shadow-md py-3 px-6',
                    headerColorClassName,
                  )}>
                  {title} <span className="text-sm">({people.length})</span>
                </h4>
                {anyHasStationNumber ? (
                  <table className={'w-full text-left'}>
                    <thead>
                      <tr className={classNames(' text-sm shadow-md', headerColorClassName)}>
                        <th className="pt-1 pb-3 px-6">{t('common.name')}</th>
                        <th className="pt-1 pb-3 px-6">
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
                            className={classNames('table-row  hover:opacity-80', colorClassName)}
                            to={`/competitions/${competitionId}/persons/${person.registrantId}`}>
                            <td className="py-3 px-6">{person.name}</td>
                            <td className="py-3 px-6">{person.stationNumber}</td>
                          </Link>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="hover:opacity-80">
                    {people.sort(byName).map((person) => (
                      <Link
                        key={person.registrantId}
                        className={classNames(`p-2 block`, colorClassName)}
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
