import { Person } from '@wca/helpers';
import { useTranslation } from 'react-i18next';
import { DisclaimerText } from '@/components';
import { useWCIF } from '@/providers/WCIFProvider';
import { Assignments } from './Assignments';
import { PersonHeader } from './PersonHeader';

export interface PersonalScheduleContainerProps {
  person: Person;
}

export function PersonalScheduleContainer({ person }: PersonalScheduleContainerProps) {
  const { t } = useTranslation();

  const { wcif, competitionId } = useWCIF();

  const anyAssignmentsHasStationNumber = !!person.assignments?.some((a) => a.stationNumber);

  return (
    <div className="flex flex-col pt-1">
      <PersonHeader competitionId={competitionId} person={person} />

      <hr className="my-2" />
      <DisclaimerText />
      <hr className="my-2" />

      {wcif && (
        <>
          {person.assignments && person.assignments.length > 0 ? (
            <Assignments
              wcif={wcif}
              person={person}
              showStationNumber={anyAssignmentsHasStationNumber}
            />
          ) : (
            <div className="p-2">
              <p>{t('competition.personalSchedule.noAssignments.line1')}</p>
              <p>{t('competition.personalSchedule.noAssignments.line2')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
