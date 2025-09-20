import { Competition } from '@wca/helpers';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { AssignmentCodeCell } from '@/components/AssignmentCodeCell';
import { Container } from '@/components/Container';
import { GroupAssignmentCodeRank } from '@/lib/constants';
import { byName } from '@/lib/utils';
import { ExtendedPerson } from '@/types/group.types';

interface MobileGroupViewProps {
  wcif?: Competition;
  personsInActivity: ExtendedPerson[];
  multistage: boolean;
  children?: React.ReactNode;
}

export const MobileGroupView = ({
  wcif,
  personsInActivity,
  multistage,
  children,
}: MobileGroupViewProps) => {
  return (
    <Container className="space-y-2 md:hidden flex flex-col ">
      {children}
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
