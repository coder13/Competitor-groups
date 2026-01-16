import classNames from 'classnames';
import { ReactNode } from 'react';

interface TabPanelProps {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export const TabPanel = ({ id, title, isOpen, onToggle, children }: TabPanelProps) => {
  const contentId = `${id}-content`;

  return (
    <section id={id} className="scroll-mt-16" aria-label={title}>
      <div className="flex flex-col p-3 space-y-3 bg-slate-100 border rounded border-slate-200 dark:border-gray-700 dark:bg-gray-800">
        <button
          type="button"
          className="flex items-center justify-between gap-3 text-left"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={onToggle}>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            {title}
          </h2>
          <i
            aria-hidden="true"
            className={classNames(
              'fa fa-chevron-down text-sm text-slate-500 transition-transform',
              {
                'rotate-180': isOpen,
              },
            )}
          />
        </button>
        <div id={contentId} hidden={!isOpen} className="space-y-3">
          {children}
        </div>
      </div>
    </section>
  );
};
