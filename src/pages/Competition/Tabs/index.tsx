import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Container } from '@/components/Container';
import { IconButton } from '@/components/IconButton/IconButton';
import { LinkButton } from '@/components/LinkButton';
import { MarkdownContent } from '@/components/MarkdownContent';
import { useCompetitionTabs } from '@/hooks/queries/useCompetitionTabs';
import {
  TabWithSlug,
  getInitialOpenState,
  getStorageKey,
  removeDuplicateTitleLine,
  slugifyTabName,
} from '@/lib/utils/competitionTabs';
import { useWCIF } from '@/providers/WCIFProvider';
import { TabPanel } from './TabPanel';

type TabWithSlugData = ApiCompetitionTab & TabWithSlug;

export default function CompetitionTabs() {
  const { t } = useTranslation();
  const { competitionId, setTitle } = useWCIF();
  const { hash } = useLocation();
  const { data: tabs, error, isLoading } = useCompetitionTabs(competitionId);

  const tabsWithSlugs = useMemo<TabWithSlugData[]>(() => {
    if (!tabs) {
      return [];
    }

    const slugCounts = new Map<string, number>();

    return tabs.map((tab) => {
      const baseSlug = slugifyTabName(tab.name || 'tab');
      const currentCount = slugCounts.get(baseSlug) ?? 0;
      const slug = currentCount ? `${baseSlug}-${currentCount + 1}` : baseSlug;
      slugCounts.set(baseSlug, currentCount + 1);
      return { ...tab, slug };
    });
  }, [tabs]);

  const [openTabs, setOpenTabs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!competitionId || tabsWithSlugs.length === 0) {
      return;
    }

    const initialState = getInitialOpenState(competitionId, tabsWithSlugs);
    const hashSlug = hash.replace(/^#/, '');

    if (hashSlug) {
      const matchingTab = tabsWithSlugs.find((tab) => tab.slug === hashSlug);
      if (matchingTab) {
        initialState[matchingTab.slug] = true;
      }
    }

    setOpenTabs(initialState);
  }, [competitionId, hash, tabsWithSlugs]);

  useEffect(() => {
    setTitle(t('competition.tabs.title'));
  }, [setTitle, t]);

  useEffect(() => {
    if (!hash) {
      return;
    }

    const hashSlug = hash.replace(/^#/, '');
    if (!hashSlug) {
      return;
    }

    const matchingTab = tabsWithSlugs.find((tab) => tab.slug === hashSlug);
    if (!matchingTab) {
      return;
    }

    setOpenTabs((prev) => {
      if (prev[matchingTab.slug]) {
        return prev;
      }

      const next = { ...prev, [matchingTab.slug]: true };
      if (competitionId) {
        localStorage.setItem(getStorageKey(competitionId), JSON.stringify(next));
      }
      return next;
    });
  }, [competitionId, hash, tabsWithSlugs, setOpenTabs]);

  const handleToggle = useCallback(
    (slug: string) => {
      setOpenTabs((prev) => {
        const next = { ...prev, [slug]: !prev[slug] };
        if (competitionId) {
          localStorage.setItem(getStorageKey(competitionId), JSON.stringify(next));
        }
        return next;
      });
    },
    [competitionId],
  );

  const handleCollapseAll = useCallback(() => {
    const nextState = Object.fromEntries(tabsWithSlugs.map((tab) => [tab.slug, false])) as Record<
      string,
      boolean
    >;
    setOpenTabs(nextState);
    if (competitionId) {
      localStorage.setItem(getStorageKey(competitionId), JSON.stringify(nextState));
    }
  }, [competitionId, tabsWithSlugs]);

  const handleExpandAll = useCallback(() => {
    const nextState = Object.fromEntries(tabsWithSlugs.map((tab) => [tab.slug, true])) as Record<
      string,
      boolean
    >;
    setOpenTabs(nextState);
    if (competitionId) {
      localStorage.setItem(getStorageKey(competitionId), JSON.stringify(nextState));
    }
  }, [competitionId, tabsWithSlugs]);

  if (isLoading) {
    return (
      <Container className="p-2">
        <p className="type-body">{t('common.loading')}</p>
      </Container>
    );
  }

  if (error || !tabs) {
    return (
      <Container className="p-2">
        <p className="type-body">{t('competition.tabs.error')}</p>
      </Container>
    );
  }

  return (
    <div className="flex justify-center w-full">
      <Container className="p-2 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 ml-auto">
            <IconButton
              type="button"
              variant="text"
              ariaLabel={t('competition.tabs.collapseAll')}
              title={t('competition.tabs.collapseAll')}
              onClick={handleCollapseAll}>
              <i className="fa fa-minus-square" aria-hidden="true" />
            </IconButton>
            <IconButton
              type="button"
              variant="text"
              ariaLabel={t('competition.tabs.expandAll')}
              title={t('competition.tabs.expandAll')}
              onClick={handleExpandAll}>
              <i className="fa fa-plus-square" aria-hidden="true" />
            </IconButton>
          </div>
        </div>
        {tabsWithSlugs.map((tab) => (
          <TabPanel
            key={tab.id}
            id={tab.slug}
            title={tab.name}
            isOpen={openTabs[tab.slug] ?? true}
            onToggle={() => handleToggle(tab.slug)}>
            <MarkdownContent content={removeDuplicateTitleLine(tab.content, tab.name)} />
          </TabPanel>
        ))}
        <LinkButton
          to={`/competitions/${competitionId}/information`}
          title={t('competition.competitors.viewCompetitionInformation')}
          variant="blue"
        />
      </Container>
    </div>
  );
}
