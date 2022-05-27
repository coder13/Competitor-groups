import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useWCIF } from '../WCIFProvider';
import { Container } from '../../../components/Grid';

const flatMap = (arr, fn) => arr.reduce((xs, x) => xs.concat(fn(x)), []);
const rooms = (wcif) => flatMap(wcif.schedule.venues, (venue) => venue.rooms);
const allActivities = (wcif) => {
  const allChildActivities = ({ childActivities }) =>
    childActivities.length > 0
      ? [...childActivities, ...flatMap(childActivities, allChildActivities)]
      : childActivities;
  const activities = flatMap(rooms(wcif), (room) => room.activities);
  return [...activities, ...flatMap(activities, allChildActivities)];
};

const Assignment = ({ assignment }) => {
  const { wcif } = useWCIF();
  const activity = allActivities(wcif).find(({ id }) => id === assignment.activityId);

  return (
    <tr>
      <td>{new Date(activity.startTime).toLocaleTimeString()}</td>
      <td>{activity.name}</td>
      <td>({assignment.assignmentCode})</td>
    </tr>
  );
};

export default function Person() {
  const { wcif } = useWCIF();
  const { registrantId } = useParams();

  const person = wcif.persons.find((p) => p.registrantId.toString() === registrantId);

  const _allActivities = useMemo(() => allActivities(wcif), [wcif]);

  if (!person) {
    return 'Loading...';
  }

  return (
    <Container column style={{ padding: '1em' }}>
      <h3>{person.name}</h3>
      <h4>Assignments</h4>
      <table>
        <tbody>
          {person.assignments
            .map((assignment) => ({
              ...assignment,
              activity: _allActivities.find(({ id }) => id === assignment.activityId),
            }))
            .sort((a, b) => new Date(a.activity.startTime) - new Date(b.activity.startTime))
            .map((assignment) => (
              <Assignment key={assignment.activityId} assignment={assignment} />
            ))}
        </tbody>
      </table>
    </Container>
  );
}
