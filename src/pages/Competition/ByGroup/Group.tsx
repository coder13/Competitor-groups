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
import {
  getAllRoundActivities,
  getRooms,
  getVenueForActivity,
  hasActivities,
} from '@/lib/activities';
import {
  activityCodeToName,
  matchesActivityCode,
  nextActivityCode,
  prevActivityCode,
  toRoundAttemptId,
} from '@/lib/activityCodes';
import { GroupAssignmentCodeRank } from '@/lib/constants';
import { getAllEvents } from '@/lib/events';
import { formatDateTimeRange } from '@/lib/time';
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
  const stages = wcif
    ? getRooms(wcif).filter((room) =>
        room.activities.some((a) => AllRoundActivities.some((b) => a.id === b.id)),
      )
    : [];
  const multistage = stages.length > 1;

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
      const stage = stages.find((stage) =>
        stage.activities.some((a) => a.childActivities.some((ca) => ca.id === activity?.id)),
      );

      return {
        wcif,
        ...person,
        assignment,
        activity,
        stage,
      };
    });

  return {
    wcif,
    round,
    roundId,
    groupNumber,
    activityCode,
    stages,
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
  const { wcif, competitionId } = useWCIF();
  const { round, activityCode, multistage, stages, childActivities } = useCommon();
  const minStartTime = childActivities?.map((a) => a.startTime).sort()[0];
  const maxEndTime = childActivities?.map((a) => a.endTime).sort()[childActivities.length - 1];

  const activityName = activityCodeToName(activityCode);
  const activityNameSplit = activityName.split(', ');

  const roundName = activityNameSplit.slice(0, 2).join(', ');
  const groupName = activityNameSplit ? activityNameSplit.slice(-1).join('') : undefined;
  const getVenue = wcif && getVenueForActivity(wcif);

  return (
    <div className="p-2 space-y-2">
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
        {stages?.filter(hasActivities(activityCode)).map((stage) => {
          const activity = stage.activities.find((a) =>
            a.childActivities.some((ca) => ca.activityCode === activityCode),
          );
          if (!activity) {
            return null;
          }
          const venue = stage.venue;
          const timeZone = venue.timezone;

          return (
            <Fragment key={stage.id}>
              {/* {multistage && <div className="col-span-1">{stage.name}:</div>}
              <div
                className={classNames({
                  'col-span-2': multistage,
                  'col-span-full': !multistage,
                })}>
                {activity && formatDateTimeRange(minStartTime, maxEndTime)}
              </div> */}
              <ActivityRow activity={activity} stage={stage} timeZone={timeZone} />
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
    <Container className="space-y-2 md:hidden flex flex-col ">
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
              <div className="flex flex-col space-y-2">
                <div>
                  <AssignmentCodeCell
                    as="div"
                    border
                    assignmentCode={assignmentCode}
                    count={personsInActivityWithAssignment.length}
                    className="p-1 drop-shadow-lg font-bold"
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
                          className="grid grid-cols-3 grid-rows-1 hover:opacity-80">
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
  const { stages, personsInActivity } = useCommon();

  return (
    <Container className="space-y-2 md:w-2/3 hidden md:flex flex-col" fullWidth>
      <GroupHeader />
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${stages.length}, 1fr)`,
        }}>
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="py-3 px-2 text-center flex-1 col-span-1"
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
                className="p-1 col-span-full drop-shadow-lg font-bold mt-4"
              />

              {stages.map((stage) => (
                <div key={stage.id} className="col-span-1 grid grid-cols-2 gap-x-4 gap-y-1">
                  {personsInActivityWithAssignment
                    ?.filter((person) => person.stage?.id === stage.id)
                    ?.sort(byName)
                    .map((person) => (
                      <Link
                        key={person.registrantId}
                        to={`/competitions/${person.wcif?.id}/persons/${person.registrantId}`}
                        className="hover:opacity-80 hover:bg-slate-100 col-span-1 p-1 transition-colors duration-150">
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
          'w-full border rounded-md p-2 px-2 flex cursor-pointer transition-colors my-1 justify-end',
          {
            'pointer-events-none opacity-25': !prev,
            'hover:bg-slate-100 group cursor-pointer': prev,
          },
        )}>
        <span className="fa fa-arrow-left self-center mr-2 group-hover:-translate-x-2 transition-all" />
        {t('competition.groups.previousGroup')}
      </Link>
      <Link
        to={nextUrl || ''}
        className={classNames(
          'w-full border rounded-md p-2 px-2 flex cursor-pointer group hover:bg-slate-100 transition-colors my-1',
          {
            'pointer-events-none opacity-25': !next,
            'hover:bg-slate-100 group': next,
          },
        )}>
        {t('competition.groups.nextGroup')}
        <span className="fa fa-arrow-right self-center ml-2 group-hover:translate-x-2 transition-all" />
      </Link>
    </div>
  );
};
