import remarkGfm from 'remark-gfm';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown, { Components } from 'react-markdown';
import { Container } from '@/components/Container';
import { useCompetitionTabs } from '@/hooks/queries/useCompetitionTabs';
import { useWCIF } from '@/providers/WCIFProvider';

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

  const preview = getPreviewData(href, children);

  return (
    <span className="inline-block w-full">
      <a className="link-inline" href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
      {preview && (
        <span className="block mt-2 rounded border border-slate-200 bg-slate-50 p-2 text-sm dark:border-gray-700 dark:bg-gray-900">
          <span className="block text-xs uppercase tracking-wide text-slate-500 dark:text-gray-400">
            {preview.host}
          </span>
          <span className="block font-semibold type-body-sm">{preview.title}</span>
          <span className="block break-all text-xs text-slate-600 dark:text-gray-300">
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
  p: ({ children }) => <p className="type-body">{children}</p>,
  ul: ({ children }) => <ul className="space-y-1 list-disc pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="space-y-1 list-decimal pl-6">{children}</ol>,
  li: ({ children }) => <li className="type-body">{children}</li>,
  a: ({ href, children }) => <MarkdownLink href={href}>{children}</MarkdownLink>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
};

export default function CompetitionTabs() {
  const { t } = useTranslation();
  const { competitionId, setTitle } = useWCIF();
  const { data: tabs, error, isLoading } = useCompetitionTabs(competitionId);

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
    <Container className="p-2 space-y-4">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className="flex flex-col p-3 space-y-3 bg-white border rounded border-slate-100 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="type-title">{tab.name}</h2>
          <div className="space-y-3">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {tab.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </Container>
  );
}
