import { ActivityCode } from '@wca/helpers';
import classNames from 'classnames';
import { Fragment, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
import { byName } from '@/lib/utils';
import { useWCIF } from '@/providers/WCIFProvider';

const useCommon = () => {
  const { wcif } = useWCIF();
  const { roundId, groupNumber } = useParams();
  const activityCode = `${roundId}-g${groupNumber}` as ActivityCode;

  const events = wcif ? getAllEvents(wcif) : [];

  const rounds = events.flatMap((e) => e.rounds);
  const round = rounds.find((r) => r.id === roundId);

  const AllRoundActivities = wcif
    ? getAllRoundActivities(wcif).filter((a) => {
        return !!rounds.some((r) => r.id === toRoundAttemptId(a.activityCode));
      })
    : [];
  const rooms = wcif
    ? getRooms(wcif).filter((room) =>
        room.activities.some((a) => AllRoundActivities.some((b) => a.id === b.id)),
      )
    : [];
  const multistage = rooms.length > 1;

  // All activities that relate to the activityCode
  const childActivities = AllRoundActivities?.flatMap(
    (activity) => activity.childActivities,
  ).filter((ca) => matchesActivityCode(activityCode)(ca.activityCode));

  const childActivityIds = childActivities.map((ca) => ca.id);

  const personsInActivity = wcif?.persons
    ?.filter((person) => {
      return person.assignments?.some((assignment) =>
        childActivityIds.includes(assignment.activityId),
      );
    })
    .map((person) => {
      const assignment = person.assignments?.find((a) => childActivityIds.includes(a.activityId));
      const activity = childActivities.find((ca) => ca.id === assignment?.activityId);
      const room = rooms.find((room) =>
        room.activities.some((a) => a.childActivities.some((ca) => ca.id === activity?.id)),
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

  return {
    wcif,
    round,
    roundId,
    groupNumber,
    activityCode,
    rooms,
    multistage,
    childActivities,
    personsInActivity,
  };
};

export default function Group() {
  return (
    <>
      <MobileGroupView />
      <DesktopGroupView />
    </>
  );
}

export const GroupHeader = () => {
  const { competitionId } = useWCIF();
  const { round, activityCode, rooms } = useCommon();

  const activityName = activityCodeToName(activityCode);
  const activityNameSplit = activityName.split(', ');

  const roundName = activityNameSplit.slice(0, 2).join(', ');
  const groupName = activityNameSplit ? activityNameSplit.slice(-1).join('') : undefined;

  return (
    <div className="p-2 space-y-2 type-body">
      <div className="space-x-1">
        <Breadcrumbs
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

      <GroupButtonMenu />
      <div className="flex flex-col space-y-1">
        {round && <CutoffTimeLimitPanel round={round} className="" />}
      </div>
      <div className="flex flex-col -mx-2">
        {rooms?.filter(hasActivities(activityCode)).map((room) => {
          const activity = room.activities
            .flatMap((ra) => ra.childActivities)
            .find((a) => a.activityCode === activityCode);

          if (!activity) {
            return null;
          }
          const venue = room.venue;
          const timeZone = venue.timezone;

          return (
            <Fragment key={room.id}>
              {/* {multistage && <div className="col-span-1">{stage.name}:</div>}
              <div
                className={classNames({
                  'col-span-2': multistage,
                  'col-span-full': !multistage,
                })}>
                {activity && formatDateTimeRange(minStartTime, maxEndTime)}
              </div> */}
              <ActivityRow activity={activity} stage={room} timeZone={timeZone} />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export const MobileGroupView = () => {
  const { wcif, personsInActivity, multistage } = useCommon();

  return (
    <Container className="flex flex-col space-y-2 md:hidden">
      <GroupHeader />
      <div>
        {GroupAssignmentCodeRank.filter((assignmentCode) =>
          personsInActivity?.some((person) => person.assignment?.assignmentCode === assignmentCode),
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
                        const stageSort = (a.stage?.name || '').localeCompare(b.stage?.name || '');
                        return stageSort !== 0 ? stageSort : byName(a, b);
                      })
                      ?.map((person) => (
                        <Link
                          key={person.registrantId}
                          to={`/competitions/${wcif?.id}/persons/${person.registrantId}`}
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
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
    </Container>
  );
};

const DesktopGroupView = () => {
  const { rooms, personsInActivity } = useCommon();

  return (
    <Container className="flex-col hidden space-y-2 md:w-2/3 md:flex" fullWidth>
      <GroupHeader />
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${rooms.length}, 1fr)`,
        }}>
        {rooms.map((stage) => (
          <div
            key={stage.id}
            className="flex-1 col-span-1 px-2 py-3 text-center dark:text-white"
            style={{
              backgroundColor: `${stage.color}4f`,
            }}>
            {stage.name}
          </div>
        ))}
        {GroupAssignmentCodeRank.filter((assignmentCode) =>
          personsInActivity?.some((person) => person.assignment?.assignmentCode === assignmentCode),
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
                className="p-1 mt-4 font-bold col-span-full drop-shadow-lg dark:text-white"
              />

              {rooms.map((room) => (
                <div key={room.id} className="grid grid-cols-2 col-span-1 gap-x-4 gap-y-1">
                  {personsInActivityWithAssignment
                    ?.filter((person) => person.room?.id === room.id)
                    ?.sort(byName)
                    .map((person) => (
                      <Link
                        key={person.registrantId}
                        to={`/competitions/${person.wcif?.id}/persons/${person.registrantId}`}
                        className="col-span-1 p-1 transition-colors duration-150 hover:opacity-80 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white">
                        {person.name}
                      </Link>
                    ))}
                </div>
              ))}
            </Fragment>
          );
        })}
      </div>
    </Container>
  );
};

export const GroupButtonMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { competitionId } = useParams();
  const { wcif, activityCode } = useCommon();

  const prev = wcif && prevActivityCode(wcif, activityCode);
  const next = wcif && nextActivityCode(wcif, activityCode);

  const prevUrl = `/competitions/${competitionId}/events/${prev?.split?.('-g')?.[0]}/${
    prev?.split?.('-g')?.[1]
  }`;
  const nextUrl = `/competitions/${competitionId}/events/${next?.split?.('-g')?.[0]}/${
    next?.split?.('-g')?.[1]
  }`;

  const goToPrev = useCallback(() => {
    if (prev) {
      navigate(prevUrl);
    }
  }, [prev, navigate, prevUrl]);

  const goToNext = useCallback(() => {
    if (next) {
      navigate(nextUrl);
    }
  }, [next, navigate, nextUrl]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrev();
      }

      if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [wcif, activityCode, goToPrev, goToNext]);

  return (
    <div className="flex space-x-2">
      <Link
        to={prevUrl || ''}
        className={classNames(
          'w-full border border-tertiary-weak rounded-md p-2 px-2 flex cursor-pointer transition-colors my-1 justify-end',
          {
            'pointer-events-none opacity-25': !prev,
            'hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer': prev,
          },
        )}>
        <span className="self-center mr-2 transition-all fa fa-arrow-left group-hover:-translate-x-2" />
        {t('competition.groups.previousGroup')}
      </Link>
      <Link
        to={nextUrl || ''}
        className={classNames(
          'w-full border border-tertiary-weak rounded-md p-2 px-2 flex cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors my-1',
          {
            'pointer-events-none opacity-25': !next,
            'hover:bg-gray-100 dark:hover:bg-gray-700 group': next,
          },
        )}>
        {t('competition.groups.nextGroup')}
        <span className="self-center ml-2 transition-all fa fa-arrow-right group-hover:translate-x-2" />
      </Link>
    </div>
  );
};
