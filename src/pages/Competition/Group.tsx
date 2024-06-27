import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  activityCodeToName,
  allRoundActivities,
  nextActivityCode,
  prevActivityCode,
  rooms,
} from '../../lib/activities';
import { Container } from '../../components/Container';
import { ActivityCode } from '@wca/helpers';
import { useWCIF } from '../../providers/WCIFProvider';
import { SupportedAssignmentCode } from '../../lib/assignments';
import { AssignmentCodeCell } from '../../components/AssignmentCodeCell';
import { Fragment, useCallback, useEffect } from 'react';
import { byName, formatDateTimeRange } from '../../lib/utils';
import classNames from 'classnames';
import { CutoffTimeLimitPanel } from '../../components/CutoffTimeLimitPanel';

const useCommon = () => {
  const { wcif } = useWCIF();
  const { roundId, groupNumber } = useParams();
  const activityCode = `${roundId}-g${groupNumber}` as ActivityCode;

  const round = wcif?.events?.flatMap((e) => e.rounds).find((r) => r.id === roundId);

  const stages = wcif ? rooms(wcif) : [];
  const roundActivies = wcif ? allRoundActivities(wcif) : [];
  const multistage = stages.length > 1;

  // All activities that relate to the activityCode
  const childActivities = roundActivies
    ?.flatMap((activity) => activity.childActivities)
    .filter((ca) => ca.activityCode === activityCode);
  const childActivityIds = childActivities.map((ca) => ca.id);

  const personsInActivity = wcif?.persons
    ?.filter((person) => {
      return person.assignments?.some((assignment) =>
        childActivityIds.includes(assignment.activityId)
      );
    })
    .map((person) => {
      const assignment = person.assignments?.find((a) => childActivityIds.includes(a.activityId));
      const activity = childActivities.find((ca) => ca.id === assignment?.activityId);
      const stage = stages.find((stage) =>
        stage.activities.some((a) => a.childActivities.some((ca) => ca.id === activity?.id))
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
    roundActivies,
    multistage,
    childActivities,
    personsInActivity,
  };
};

export const GroupAssignmentCodeRank: SupportedAssignmentCode[] = [
  'staff-delegate',
  'staff-announcer',
  'staff-stagelead',
  'staff-dataentry',
  'staff-scrambler',
  'staff-runner',
  'staff-judge',
  'staff-other',
  'competitor',
];

export default function Group() {
  return (
    <>
      <MobileGroupView />
      <DesktopGroupView />
    </>
  );
}

export const GroupHeader = () => {
  const { round, activityCode, multistage, stages, childActivities } = useCommon();
  const minStartTime = childActivities?.map((a) => a.startTime).sort()[0];
  const maxEndTime = childActivities?.map((a) => a.endTime).sort()[childActivities.length - 1];

  return (
    <div className="p-2">
      <h3 className="text-2xl">{activityCodeToName(activityCode)}</h3>
      <div
        className="grid grid-cols-3"
        style={{
          gridTemplateRows: 'auto',
        }}>
        {stages
          ?.filter(
            (stage) =>
              !!stage.activities.find((a) =>
                a.childActivities.some((ca) => ca.activityCode === activityCode)
              )
          )
          .map((stage) => {
            const activity = stage.activities.find((a) =>
              a.childActivities.some((ca) => ca.activityCode === activityCode)
            );

            return (
              <Fragment key={stage.id}>
                {multistage && <div className="col-span-1">{stage.name}:</div>}
                <div
                  className={classNames({
                    'col-span-2': multistage,
                    'col-span-full': !multistage,
                  })}>
                  {activity && formatDateTimeRange(minStartTime, maxEndTime)}
                </div>
              </Fragment>
            );
          })}
      </div>
      <div className="flex flex-col space-y-1 mt-4">
        {round && <CutoffTimeLimitPanel round={round} className="-m-2" />}
      </div>
    </div>
  );
};

export const MobileGroupView = () => {
  const { wcif, personsInActivity, multistage } = useCommon();

  return (
    <Container className="space-y-2 md:hidden flex flex-col">
      <GroupHeader />
      <GroupButtonMenu />
      <div className="">
        {GroupAssignmentCodeRank.filter((assignmentCode) =>
          personsInActivity?.some((person) => person.assignment?.assignmentCode === assignmentCode)
        ).map((assignmentCode) => {
          const personsInActivityWithAssignment =
            personsInActivity?.filter(
              (person) => person.assignment?.assignmentCode === assignmentCode
            ) || [];

          return (
            <Fragment key={assignmentCode}>
              <div className="col-span-3 flex flex-col">
                <AssignmentCodeCell
                  as="div"
                  border
                  assignmentCode={assignmentCode}
                  count={personsInActivityWithAssignment.length}
                  className="p-1 mt-2 drop-shadow-lg font-bold"
                />
                <div className="">
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
      <GroupButtonMenu />
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
          personsInActivity?.some((person) => person.assignment?.assignmentCode === assignmentCode)
        ).map((assignmentCode) => {
          const personsInActivityWithAssignment =
            personsInActivity?.filter(
              (person) => person.assignment?.assignmentCode === assignmentCode
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
  }, [wcif, activityCode]);

  const goToNext = useCallback(() => {
    if (next) {
      navigate(nextUrl);
    }
  }, [wcif, activityCode]);

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
  }, [wcif, activityCode]);

  return (
    <div className="px-2 flex space-x-2">
      <Link
        to={prevUrl || ''}
        className={classNames(
          'w-full border rounded-md p-2 px-2 flex cursor-pointer transition-colors my-1 justify-end',
          {
            'pointer-events-none opacity-25': !prev,
            'hover:bg-slate-100 group cursor-pointer': prev,
          }
        )}>
        <span className="fa fa-arrow-left self-center mr-2 group-hover:-translate-x-2 transition-all" />
        Previous Group
      </Link>
      <Link
        to={nextUrl || ''}
        className={classNames(
          'w-full border rounded-md p-2 px-2 flex cursor-pointer group hover:bg-slate-100 transition-colors my-1',
          {
            'pointer-events-none opacity-25': !next,
            'hover:bg-slate-100 group': next,
          }
        )}>
        Next Group
        <span className="fa fa-arrow-right self-center ml-2 group-hover:translate-x-2 transition-all" />
      </Link>
    </div>
  );
};
