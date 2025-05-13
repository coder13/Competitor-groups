import { Competition } from '@wca/helpers';
import { useMemo } from 'react';
import { streamActivities } from '../../lib/activities';
import { useAuth } from '../../providers/AuthProvider';
import { isStaff } from '../../lib/person';

interface CompetitionLayoutTabsProps {
  competitionId: string;
  wcif?: Competition;
}

export const useCompetitionLayoutTabs = ({ competitionId, wcif }: CompetitionLayoutTabsProps) => {
  const { user } = useAuth();

  return useMemo(() => {
    const hasStream = wcif && streamActivities(wcif).length > 0;
    const person = wcif?.persons.find((p) => p.wcaUserId === user?.id);
    const isPersonStaff = person && isStaff(person);

    const _tabs: {
      href: string;
      text: string;
    }[] = [];

    if (!isPersonStaff) {
      _tabs.push({
        href: `/competitions/${wcif?.id}`,
        text: 'Groups',
      });
    }

    _tabs.push(
      {
        href: `/competitions/${competitionId}/events`,
        text: 'Events',
      },
      {
        href: `/competitions/${competitionId}/activities`,
        text: 'Schedule',
      },
      {
        href: `/competitions/${competitionId}/psych-sheet`,
        text: 'Rankings',
      }
    );

    if (isPersonStaff) {
      _tabs.push({
        href: `/competitions/${competitionId}/scramblers`,
        text: 'Scramblers',
      });
    }

    if (hasStream) {
      _tabs.push({
        href: `/competitions/${competitionId}/stream`,
        text: 'Stream',
      });
    }

    return _tabs;
  }, [wcif, competitionId]);
};
