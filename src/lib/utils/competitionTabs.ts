import { ReactNode } from 'react';

export interface TabWithSlug {
  slug: string;
}

export const slugifyTabName = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const removeDuplicateTitleLine = (content: string, title: string) => {
  const lines = content.split(/\r?\n/);
  const firstContentIndex = lines.findIndex((line) => line.trim().length > 0);

  if (firstContentIndex === -1) {
    return content;
  }

  const headingMatch = lines[firstContentIndex].match(/^#{1,6}\s*(.+)$/);
  if (!headingMatch) {
    return content;
  }

  const headingText = headingMatch[1].trim();
  if (slugifyTabName(headingText) !== slugifyTabName(title)) {
    return content;
  }

  const remainingLines = lines.slice(firstContentIndex + 1);
  if (remainingLines[0]?.trim() === '') {
    remainingLines.shift();
  }

  return remainingLines.join('\n');
};

export const getStorageKey = (competitionId: string) => `competition-tabs-open-${competitionId}`;

export const getInitialOpenState = (competitionId: string | undefined, tabs: TabWithSlug[]) => {
  if (!competitionId) {
    return Object.fromEntries(tabs.map((tab) => [tab.slug, true]));
  }

  const stored = localStorage.getItem(getStorageKey(competitionId));
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Record<string, boolean>;
      return Object.fromEntries(tabs.map((tab) => [tab.slug, parsed[tab.slug] ?? true]));
    } catch {
      return Object.fromEntries(tabs.map((tab) => [tab.slug, true]));
    }
  }

  return Object.fromEntries(tabs.map((tab) => [tab.slug, true]));
};

export const getLinkText = (children: ReactNode): string | null => {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children
      .map((child) => getLinkText(child as ReactNode))
      .filter((value): value is string => Boolean(value))
      .join('');
  }

  return null;
};

export const getPreviewData = (href?: string, children?: ReactNode) => {
  if (!href || !(href.startsWith('http://') || href.startsWith('https://'))) {
    return null;
  }

  try {
    const url = new URL(href);
    return {
      host: url.hostname.replace(/^www\./, ''),
      url: href,
      title: getLinkText(children) || href,
    };
  } catch {
    return null;
  }
};
