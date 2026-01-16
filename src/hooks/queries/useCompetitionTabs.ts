import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchCompetitionTabs } from '@/lib/api';

export interface CompetitionTabLink {
  href: string;
  text: string;
  slug: string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const sortTabsByOrder = (tabs: ApiCompetitionTab[]) =>
  [...tabs].sort((a, b) => a.display_order - b.display_order);

export const competitionTabsQuery = (competitionId: string) => ({
  queryKey: ['competitionTabs', competitionId],
  queryFn: async () => fetchCompetitionTabs(competitionId),
});

export const useCompetitionTabs = (competitionId?: string) => {
  return useQuery<ApiCompetitionTab[]>({
    ...competitionTabsQuery(competitionId ?? ''),
    networkMode: 'offlineFirst',
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    enabled: !!competitionId,
    select: (tabs) => sortTabsByOrder(tabs),
  });
};

export const useCompetitionTabLinks = (competitionId?: string) => {
  const { data, ...query } = useCompetitionTabs(competitionId);

  const links = useMemo<CompetitionTabLink[]>(() => {
    if (!data || !competitionId) {
      return [];
    }

    const slugCounts = new Map<string, number>();

    return data.map((tab) => {
      const baseSlug = slugify(tab.name || 'tab');
      const currentCount = slugCounts.get(baseSlug) ?? 0;
      const slug = currentCount ? `${baseSlug}-${currentCount + 1}` : baseSlug;
      slugCounts.set(baseSlug, currentCount + 1);
      return {
        href: `/competitions/${competitionId}/tabs#${slug}`,
        text: tab.name,
        slug,
      };
    });
  }, [competitionId, data]);

  return {
    ...query,
    data: links,
  };
};
