import { Competition } from '@wca/helpers';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { streamActivities } from '@/lib/activities';
import { isStaff } from '@/lib/person';
import { useAuth } from '@/providers/AuthProvider';

interface CompetitionLayoutTabsProps {
  competitionId: string;
  wcif?: Competition;
}

export const useCompetitionLayoutTabs = ({ competitionId, wcif }: CompetitionLayoutTabsProps) => {
  const { t } = useTranslation();
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
        href: `/competitions/${competitionId}`,
        text: t('header.tabs.groups'),
      });
    }

    _tabs.push(
      {
        href: `/competitions/${competitionId}/events`,
        text: t('header.tabs.events'),
      },
      {
        href: `/competitions/${competitionId}/activities`,
        text: t('header.tabs.schedule'),
      },
      {
        href: `/competitions/${competitionId}/psych-sheet`,
        text: t('header.tabs.rankings'),
      },
    );

    if (isPersonStaff) {
      _tabs.push({
        href: `/competitions/${competitionId}/scramblers`,
        text: t('header.tabs.scramblers'),
      });
    }

    if (hasStream) {
      _tabs.push({
        href: `/competitions/${competitionId}/stream`,
        text: t('header.tabs.stream'),
      });
    }

    return _tabs;
  }, [wcif, competitionId, user?.id, t]);
};
