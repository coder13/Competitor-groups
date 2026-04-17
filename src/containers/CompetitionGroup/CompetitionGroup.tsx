import { ActivityCode } from '@wca/helpers';
import classNames from 'classnames';
import { Fragment, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityRow } from '@/components';
import { AssignmentCodeCell } from '@/components/AssignmentCodeCell';
import { Breadcrumbs } from '@/components/Breadcrumbs/Breadcrumbs';
import { Container } from '@/components/Container';
import { CutoffTimeLimitPanel } from '@/components/CutoffTimeLimitPanel';
import { getAllRoundActivities, getRoomData, getRooms, hasActivities } from '@/lib/activities';
import {
  activityCodeToName,
  matchesActivityCode,
  nextActivityCode,
  prevActivityCode,
  toRoundAttemptId,
} from '@/lib/activityCodes';
import { GroupAssignmentCodeRank } from '@/lib/constants';
import { getAllEvents } from '@/lib/events';
import { AnchorLink, LinkRenderer } from '@/lib/linkRenderer';
import { byName } from '@/lib/utils';
import { useWCIF } from '@/providers/WCIFProvider';

export interface CompetitionGroupContainerProps {
  competitionId: string;
  roundId: string;
  groupNumber: string;
  LinkComponent?: LinkRenderer;
}

export function CompetitionGroupContainer({
  competitionId,
  roundId,
  groupNumber,
  LinkComponent = AnchorLink,
}: CompetitionGroupContainerProps) {
  const { t } = useTranslation();
  const { wcif, setTitle } = useWCIF();
  const activityCode = `${roundId}-g${groupNumber}` as ActivityCode;

  const events = wcif ? getAllEvents(wcif) : [];
  const rounds = events.flatMap((e) => e.rounds);
  const round = rounds.find((r) => r.id === roundId);

  useEffect(() => {
    setTitle(activityCodeToName(activityCode));
  }, [activityCode, setTitle]);

  const allRoundActivities = wcif
    ? getAllRoundActivities(wcif).filter((a) =>
        rounds.some((r) => r.id === toRoundAttemptId(a.activityCode)),
      )
    : [];

  const rooms = wcif
    ? getRooms(wcif).filter((room) =>
        room.activities.some((a) => allRoundActivities.some((b) => a.id === b.id)),
      )
    : [];

  const multistage = rooms.length > 1;
  const childActivities = allRoundActivities
    .flatMap((activity) => activity.childActivities)
    .filter((ca) => matchesActivityCode(activityCode)(ca.activityCode));
  const childActivityIds = childActivities.map((ca) => ca.id);

  const personsInActivity = wcif?.persons
    ?.filter((person) =>
      person.assignments?.some((assignment) => childActivityIds.includes(assignment.activityId)),
    )
    .map((person) => {
      const assignment = person.assignments?.find((a) => childActivityIds.includes(a.activityId));
      const activity = childActivities.find((ca) => ca.id === assignment?.activityId);
      const room = rooms.find((candidateRoom) =>
        candidateRoom.activities.some((a) =>
          a.childActivities.some((ca) => ca.id === activity?.id),
        ),
      );
      const stage = room && activity && getRoomData(room, activity);

      return {
        wcif,
        ...person,
        assignment,
        activity,
        room,
        stage,
      };
    });

  const activityName = activityCodeToName(activityCode);
  const activityNameSplit = activityName.split(', ');
  const roundName = activityNameSplit.slice(0, 2).join(', ');
  const groupName = activityNameSplit.slice(-1).join('') || undefined;

  const prev = wcif && prevActivityCode(wcif, activityCode);
  const next = wcif && nextActivityCode(wcif, activityCode);
  const prevUrl = `/competitions/${competitionId}/events/${prev?.split?.('-g')?.[0]}/${
    prev?.split?.('-g')?.[1]
  }`;
  const nextUrl = `/competitions/${competitionId}/events/${next?.split?.('-g')?.[0]}/${
    next?.split?.('-g')?.[1]
  }`;

  return (
    <>
      <Container className="flex flex-col space-y-2 md:hidden">
        <div className="space-y-2 p-2 type-body">
          <div className="space-x-1">
            <Breadcrumbs
              LinkComponent={LinkComponent}
              breadcrumbs={[
                {
                  href: `/competitions/${competitionId}/events/${round?.id}`,
                  label: roundName || '',
                },
                {
                  label: groupName || '',
                },
              ]}
            />
          </div>
          <div className="flex space-x-2">
            <LinkComponent
              to={prevUrl || ''}
              className={classNames(
                'my-1 flex w-full justify-end rounded-md border border-tertiary-weak p-2 px-2 transition-colors',
                {
                  'pointer-events-none opacity-25': !prev,
                  'group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700': prev,
                },
              )}>
              <span className="fa fa-arrow-left self-center mr-2 transition-all group-hover:-translate-x-2" />
              {t('competition.groups.previousGroup')}
            </LinkComponent>
            <LinkComponent
              to={nextUrl || ''}
              className={classNames(
                'group my-1 flex w-full rounded-md border border-tertiary-weak p-2 px-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700',
                {
                  'pointer-events-none opacity-25': !next,
                },
              )}>
              {t('competition.groups.nextGroup')}
              <span className="fa fa-arrow-right self-center ml-2 transition-all group-hover:translate-x-2" />
            </LinkComponent>
          </div>
          <div className="flex flex-col space-y-1">
            {round && <CutoffTimeLimitPanel round={round} />}
          </div>
          <div className="flex flex-col -mx-2">
            {rooms.filter(hasActivities(activityCode)).map((room) => {
              const activity = room.activities
                .flatMap((ra) => ra.childActivities)
                .find((a) => a.activityCode === activityCode);

              if (!activity) {
                return null;
              }

              return (
                <Fragment key={room.id}>
                  <ActivityRow
                    activity={activity}
                    competitionId={competitionId}
                    LinkComponent={LinkComponent}
                    stage={room}
                    timeZone={room.venue.timezone}
                  />
                </Fragment>
              );
            })}
          </div>
        </div>
        <div>
          {GroupAssignmentCodeRank.filter((assignmentCode) =>
            personsInActivity?.some(
              (person) => person.assignment?.assignmentCode === assignmentCode,
            ),
          ).map((assignmentCode) => {
            const personsInActivityWithAssignment =
              personsInActivity?.filter(
                (person) => person.assignment?.assignmentCode === assignmentCode,
              ) || [];

            return (
              <Fragment key={assignmentCode}>
                <div className="flex flex-col space-y-2 dark:text-white">
                  <div>
                    <AssignmentCodeCell
                      as="div"
                      border
                      assignmentCode={assignmentCode}
                      count={personsInActivityWithAssignment.length}
                      className="p-1 font-bold drop-shadow-lg"
                    />
                    <div>
                      {personsInActivityWithAssignment
                        .sort((a, b) => {
                          const stageSort = (a.stage?.name || '').localeCompare(
                            b.stage?.name || '',
                          );
                          return stageSort !== 0 ? stageSort : byName(a, b);
                        })
                        .map((person) => (
                          <LinkComponent
                            key={person.registrantId}
                            to={`/competitions/${competitionId}/persons/${person.registrantId}`}
                            className="grid grid-cols-3 grid-rows-1 hover:bg-tertiary dark:hover:bg-gray-700">
                            <div className="col-span-2 p-1">{person.name}</div>
                            {multistage && (
                              <div
                                className="col-span-1 p-1"
                                style={{
                                  backgroundColor: person.stage?.color
                                    ? `${person.stage?.color}7f`
                                    : undefined,
                                }}>
                                {person.stage && person.stage.name}
                              </div>
                            )}
                          </LinkComponent>
                        ))}
                    </div>
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      </Container>
      <Container className="hidden flex-col space-y-2 md:flex md:w-2/3" fullWidth>
        <div className="space-y-2 p-2 type-body">
          <div className="space-x-1">
            <Breadcrumbs
              LinkComponent={LinkComponent}
              breadcrumbs={[
                {
                  href: `/competitions/${competitionId}/events/${round?.id}`,
                  label: roundName || '',
                },
                {
                  label: groupName || '',
                },
              ]}
            />
          </div>
          <div className="flex space-x-2">
            <LinkComponent
              to={prevUrl || ''}
              className={classNames(
                'my-1 flex w-full justify-end rounded-md border border-tertiary-weak p-2 px-2 transition-colors',
                {
                  'pointer-events-none opacity-25': !prev,
                  'group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700': prev,
                },
              )}>
              <span className="fa fa-arrow-left self-center mr-2 transition-all group-hover:-translate-x-2" />
              {t('competition.groups.previousGroup')}
            </LinkComponent>
            <LinkComponent
              to={nextUrl || ''}
              className={classNames(
                'group my-1 flex w-full rounded-md border border-tertiary-weak p-2 px-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700',
                {
                  'pointer-events-none opacity-25': !next,
                },
              )}>
              {t('competition.groups.nextGroup')}
              <span className="fa fa-arrow-right self-center ml-2 transition-all group-hover:translate-x-2" />
            </LinkComponent>
          </div>
          <div className="flex flex-col -mx-2">
            {rooms.filter(hasActivities(activityCode)).map((room) => {
              const activity = room.activities
                .flatMap((ra) => ra.childActivities)
                .find((a) => a.activityCode === activityCode);

              if (!activity) {
                return null;
              }

              return (
                <Fragment key={room.id}>
                  <ActivityRow
                    activity={activity}
                    competitionId={competitionId}
                    LinkComponent={LinkComponent}
                    stage={room}
                    timeZone={room.venue.timezone}
                  />
                </Fragment>
              );
            })}
          </div>
        </div>
        {round && <CutoffTimeLimitPanel round={round} />}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${rooms.length}, 1fr)`,
          }}>
          {rooms.map((stage) => (
            <div
              key={stage.id}
              className="col-span-1 flex-1 px-2 py-3 text-center dark:text-white"
              style={{
                backgroundColor: `${stage.color}4f`,
              }}>
              {stage.name}
            </div>
          ))}
          {GroupAssignmentCodeRank.filter((assignmentCode) =>
            personsInActivity?.some(
              (person) => person.assignment?.assignmentCode === assignmentCode,
            ),
          ).map((assignmentCode) => {
            const personsInActivityWithAssignment =
              personsInActivity?.filter(
                (person) => person.assignment?.assignmentCode === assignmentCode,
              ) || [];
            return (
              <Fragment key={assignmentCode}>
                <AssignmentCodeCell
                  as="div"
                  border
                  assignmentCode={assignmentCode}
                  count={personsInActivityWithAssignment.length}
                  className="col-span-full mt-4 p-1 font-bold drop-shadow-lg dark:text-white"
                />
                {rooms.map((room) => (
                  <div key={room.id} className="col-span-1 grid grid-cols-2 gap-x-4 gap-y-1">
                    {personsInActivityWithAssignment
                      .filter((person) => person.room?.id === room.id)
                      .sort(byName)
                      .map((person) => (
                        <LinkComponent
                          key={person.registrantId}
                          to={`/competitions/${competitionId}/persons/${person.registrantId}`}
                          className="col-span-1 p-1 transition-colors duration-150 hover:bg-gray-100 hover:opacity-80 dark:text-white dark:hover:bg-gray-700">
                          {person.name}
                        </LinkComponent>
                      ))}
                  </div>
                ))}
              </Fragment>
            );
          })}
        </div>
      </Container>
    </>
  );
}
