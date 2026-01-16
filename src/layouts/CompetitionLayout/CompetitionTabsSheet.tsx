import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';

interface CompetitionTabsSheetProps {
  open: boolean;
  onClose: () => void;
  tabs: {
    href: string;
    text: string;
  }[];
  tabPanels?: {
    href: string;
    text: string;
  }[];
  tabPanelsTitle?: string;
  title: string;
}

export const CompetitionTabsSheet = ({
  open,
  onClose,
  tabs,
  tabPanels,
  tabPanelsTitle,
  title,
}: CompetitionTabsSheetProps) => {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>
        <div className="fixed inset-x-0 bottom-0 flex w-full justify-center">
          <Transition.Child
            as={Fragment}
            enter="transition duration-200 ease-out"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="transition duration-150 ease-in"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full">
            <Dialog.Panel className="w-full max-w-screen-md rounded-t-2xl bg-panel p-4 shadow-xl max-h-[60vh]">
              <div className="flex items-center justify-between pb-2">
                <Dialog.Title className="text-sm font-semibold text-slate-600 dark:text-gray-300">
                  {title}
                </Dialog.Title>
                <button
                  type="button"
                  className="text-sm text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={onClose}>
                  Close
                </button>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto pb-6">
                {tabs.map((tab) => (
                  <Link key={tab.href} to={tab.href} className="link-card" onClick={onClose}>
                    {tab.text}
                  </Link>
                ))}
                {tabPanels && tabPanels.length > 0 && (
                  <div className="mt-2 space-y-2 rounded-lg border border-tertiary-weak bg-white/70 px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                    {tabPanelsTitle && (
                      <div className="px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                        {tabPanelsTitle}
                      </div>
                    )}
                    {tabPanels.map((tab) => (
                      <Link
                        key={tab.href}
                        to={tab.href}
                        className="block rounded px-2 py-1 text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        onClick={onClose}>
                        {tab.text}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
