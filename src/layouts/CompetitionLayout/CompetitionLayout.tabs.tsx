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

interface CompetitionLayoutTabItem {
  href: string;
  text: string;
}

interface CompetitionLayoutTabsResult {
  desktopTabs: CompetitionLayoutTabItem[];
  mobileTabs: CompetitionLayoutTabItem[];
  overflowTabs: CompetitionLayoutTabItem[];
}

export const useCompetitionLayoutTabs = ({
  competitionId,
  wcif,
}: CompetitionLayoutTabsProps): CompetitionLayoutTabsResult => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return useMemo(() => {
    const hasStream = wcif && streamActivities(wcif).length > 0;
    const person = wcif?.persons.find((p) => p.wcaUserId === user?.id);
    const isPersonStaff = person && isStaff(person);

    const desktopTabs: CompetitionLayoutTabItem[] = [
      {
        href: `/competitions/${competitionId}`,
        text: t('header.tabs.groups'),
      },
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
    ];

    if (isPersonStaff) {
      desktopTabs.push({
        href: `/competitions/${competitionId}/scramblers`,
        text: t('header.tabs.scramblers'),
      });
    }

    if (hasStream) {
      desktopTabs.push({
        href: `/competitions/${competitionId}/stream`,
        text: t('header.tabs.stream'),
      });
    }

    desktopTabs.push(
      {
        href: `/competitions/${competitionId}/information`,
        text: t('header.tabs.information'),
      },
      {
        href: `/competitions/${competitionId}/tabs`,
        text: t('header.tabs.extraInfo'),
      },
    );

    const mobileTabs: CompetitionLayoutTabItem[] = [
      {
        href: `/competitions/${competitionId}`,
        text: t('header.tabs.groups'),
      },
      {
        href: `/competitions/${competitionId}/events`,
        text: t('header.tabs.events'),
      },
      {
        href: `/competitions/${competitionId}/activities`,
        text: t('header.tabs.schedule'),
      },
    ];

    const overflowTabs: CompetitionLayoutTabItem[] = [
      {
        href: `/competitions/${competitionId}/psych-sheet`,
        text: t('header.tabs.rankings'),
      },
    ];

    if (isPersonStaff) {
      overflowTabs.push({
        href: `/competitions/${competitionId}/scramblers`,
        text: t('header.tabs.scramblers'),
      });
    }

    if (hasStream) {
      overflowTabs.push({
        href: `/competitions/${competitionId}/stream`,
        text: t('header.tabs.stream'),
      });
    }

    overflowTabs.push(
      {
        href: `/competitions/${competitionId}/information`,
        text: t('header.tabs.information'),
      },
      {
        href: `/competitions/${competitionId}/tabs`,
        text: t('header.tabs.extraInfo'),
      },
    );

    return { desktopTabs, mobileTabs, overflowTabs };
  }, [wcif, competitionId, user?.id, t]);
};
