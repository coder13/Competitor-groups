import remarkGfm from 'remark-gfm';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown, { Components } from 'react-markdown';
import { Container } from '@/components/Container';
import { LinkButton } from '@/components/LinkButton';
import { useCompetitionTabs } from '@/hooks/queries/useCompetitionTabs';
import { useWCIF } from '@/providers/WCIFProvider';

type TabWithSlug = ApiCompetitionTab & { slug: string };

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const removeDuplicateTitleLine = (content: string, title: string) => {
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
  if (slugify(headingText) !== slugify(title)) {
    return content;
  }

  const remainingLines = lines.slice(firstContentIndex + 1);
  if (remainingLines[0]?.trim() === '') {
    remainingLines.shift();
  }

  return remainingLines.join('\n');
};

const getLinkText = (children: React.ReactNode): string | null => {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children
      .map((child) => getLinkText(child as React.ReactNode))
      .filter((value): value is string => Boolean(value))
      .join('');
  }

  return null;
};

const getPreviewData = (href?: string, children?: React.ReactNode) => {
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

const MarkdownLink = ({ href, children }: { href?: string; children: React.ReactNode }) => {
  if (!href) {
    return <span>{children}</span>;
  }

  const showLinkPreview = false;
  const preview = showLinkPreview ? getPreviewData(href, children) : null;

  return (
    <span className="inline-block w-full">
      <a className="break-words link-inline" href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
      {preview && (
        <span
          className="block p-3 mt-2 text-sm border rounded border-slate-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-900"
          role="group"
          aria-label={`Link preview for ${preview.host}`}>
          <span className="block text-xs tracking-wide uppercase text-slate-500 dark:text-gray-400">
            {preview.host}
          </span>
          <span className="block font-semibold type-body-sm">{preview.title}</span>
          <span className="block text-xs break-all text-slate-600 dark:text-gray-300">
            {preview.url}
          </span>
        </span>
      )}
    </span>
  );
};

const markdownComponents: Components = {
  h1: ({ children }) => <h3 className="type-title">{children}</h3>,
  h2: ({ children }) => <h3 className="type-heading">{children}</h3>,
  h3: ({ children }) => <h4 className="type-heading">{children}</h4>,
  p: ({ children }) => <p className="leading-relaxed type-body">{children}</p>,
  ul: ({ children }) => <ul className="pl-6 space-y-1 list-disc">{children}</ul>,
  ol: ({ children }) => <ol className="pl-6 space-y-1 list-decimal">{children}</ol>,
  li: ({ children }) => <li className="type-body">{children}</li>,
  a: ({ href, children }) => <MarkdownLink href={href}>{children}</MarkdownLink>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="pl-4 border-l-4 border-slate-200 text-slate-600 dark:border-gray-700 dark:text-gray-300">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-slate-200 dark:border-gray-700" />,
  code: ({ children }) => (
    <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs dark:bg-gray-900">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="p-3 overflow-x-auto text-xs rounded bg-slate-100 dark:bg-gray-900">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 font-semibold border-b border-slate-200 dark:border-gray-700">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 border-b border-slate-100 dark:border-gray-800">{children}</td>
  ),
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt || ''}
      className="max-w-full border rounded border-slate-200 dark:border-gray-700"
    />
  ),
};

export default function CompetitionTabs() {
  const { t } = useTranslation();
  const { competitionId, setTitle } = useWCIF();
  const { data: tabs, error, isLoading } = useCompetitionTabs(competitionId);

  const tabsWithSlugs = useMemo<TabWithSlug[]>(() => {
    if (!tabs) {
      return [];
    }

    const slugCounts = new Map<string, number>();

    return tabs.map((tab) => {
      const baseSlug = slugify(tab.name || 'tab');
      const currentCount = slugCounts.get(baseSlug) ?? 0;
      const slug = currentCount ? `${baseSlug}-${currentCount + 1}` : baseSlug;
      slugCounts.set(baseSlug, currentCount + 1);
      return { ...tab, slug };
    });
  }, [tabs]);

  useEffect(() => {
    setTitle(t('competition.tabs.title'));
  }, [setTitle, t]);

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
    <div className="flex w-full justify-center">
      <Container className="p-2 space-y-4">
        <div className="flex">
          <LinkButton
            to={`/competitions/${competitionId}/information`}
            title={t('competition.competitors.viewCompetitionInformation')}
            variant="blue"
          />
        </div>
        {tabsWithSlugs.map((tab) => (
          <section key={tab.id} id={tab.slug} className="scroll-mt-16" aria-label={tab.name}>
            <div className="flex flex-col p-3 space-y-3 bg-white border rounded border-slate-100 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="type-title">{tab.name}</h2>
              <div className="space-y-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {removeDuplicateTitleLine(tab.content, tab.name)}
                </ReactMarkdown>
              </div>
            </div>
          </section>
        ))}
      </Container>
    </div>
  );
}
