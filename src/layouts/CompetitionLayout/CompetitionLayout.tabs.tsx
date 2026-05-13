import { Competition } from '@wca/helpers';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { streamActivities } from '@/lib/activities';
import { isCompetitionDelegateOrOrganizer } from '@/lib/competitionAuthorization';
import { isStaff } from '@/lib/person';
import { useAuth } from '@/providers/AuthProvider';

interface CompetitionLayoutTabsProps {
  competitionId: string;
  wcif?: Competition;
}

export interface CompetitionLayoutTab {
  href: string;
  text: string;
  end?: boolean;
  hiddenOnMobile?: boolean;
}

interface CompetitionLayoutTabs {
  tabs: CompetitionLayoutTab[];
  adminTabs: CompetitionLayoutTab[];
}

export const useCompetitionLayoutTabs = ({ competitionId, wcif }: CompetitionLayoutTabsProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id;

  return useMemo<CompetitionLayoutTabs>(() => {
    const hasStream = wcif && streamActivities(wcif).length > 0;
    const person = wcif?.persons.find((p) => p.wcaUserId === userId);
    const isPersonStaff = person && isStaff(person);
    const canManageRemote = isCompetitionDelegateOrOrganizer(wcif, userId ? { id: userId } : null);

    const _tabs: CompetitionLayoutTab[] = [];
    const _adminTabs: CompetitionLayoutTab[] = [];

    _tabs.push({
      href: `/competitions/${competitionId}`,
      text: t('header.tabs.groups'),
      hiddenOnMobile: true,
    });

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
      {
        href: `/competitions/${competitionId}/results`,
        text: t('header.tabs.results'),
      },
    );

    if (isPersonStaff) {
      _adminTabs.push({
        href: `/competitions/${competitionId}/admin/scramblers`,
        text: t('header.tabs.scramblers'),
      });
    }

    if (canManageRemote) {
      _adminTabs.push({
        href: `/competitions/${competitionId}/admin/remote`,
        text: t('header.tabs.remote', {
          defaultValue: 'Remote',
        }),
      });
    }

    if (hasStream) {
      _tabs.push({
        href: `/competitions/${competitionId}/stream`,
        text: t('header.tabs.stream'),
      });
    }

    if (isPersonStaff || canManageRemote) {
      _adminTabs.push(
        {
          href: `/competitions/${competitionId}/admin/sum-of-ranks`,
          text: t('header.tabs.sumOfRanks', {
            defaultValue: 'Sum of Rankings',
          }),
        },
        {
          href: `/competitions/${competitionId}/admin/stats`,
          text: t('header.tabs.stats', {
            defaultValue: 'Stats',
          }),
        },
      );
    }

    if (_adminTabs.length > 0) {
      _tabs.push({
        href: `/competitions/${competitionId}/admin`,
        text: t('header.tabs.admin'),
        end: false,
      });
    }

    return {
      tabs: _tabs,
      adminTabs: _adminTabs,
    };
  }, [wcif, competitionId, userId, t]);
};
