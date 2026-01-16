import remarkGfm from 'remark-gfm';
import ReactMarkdown, { Components } from 'react-markdown';
import { getPreviewData } from '@/lib/utils/competitionTabs';

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

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent = ({ content }: MarkdownContentProps) => {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  );
};
