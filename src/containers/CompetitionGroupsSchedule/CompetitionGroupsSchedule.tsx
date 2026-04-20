import { Container } from '@/components/Container';

export function CompetitionGroupsScheduleContainer() {
  return (
    <Container>
      <div>
        <br />
        <div className="rounded-md border border-gray-300 shadow-md">
          <table className="w-full text-left">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3">Stage</th>
                <th className="px-6 py-3 text-center">Activity</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}
