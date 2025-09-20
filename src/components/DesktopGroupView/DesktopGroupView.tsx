import { Person, Room } from '@wca/helpers';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { AssignmentCodeCell } from '@/components/AssignmentCodeCell';
import { Container } from '@/components/Container';
import { GroupAssignmentCodeRank } from '@/lib/constants';
import { byName } from '@/lib/utils';

interface DesktopGroupViewProps {
  rooms: Room[];
  personsInActivity: Person[];
  children?: React.ReactNode;
}

export const DesktopGroupView = ({ rooms, personsInActivity, children }: DesktopGroupViewProps) => {
  return (
    <Container className="space-y-2 md:w-2/3 hidden md:flex flex-col" fullWidth>
      {children}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${rooms.length}, 1fr)`,
        }}>
        {rooms.map((stage) => (
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

              {rooms.map((room) => (
                <div key={room.id} className="col-span-1 grid grid-cols-2 gap-x-4 gap-y-1">
                  {personsInActivityWithAssignment
                    ?.filter((person) => person.room?.id === room.id)
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
