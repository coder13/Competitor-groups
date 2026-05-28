import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, NoteBox } from '@/components';
import { useCompetitionLayoutTabs } from '@/layouts/CompetitionLayout/CompetitionLayout.tabs';
import { useWCIF } from '@/providers/WCIFProvider';

const adminDescriptions: Record<string, string> = {
  scramblers: 'View scrambler assignments by event and round.',
  remote: 'Control Live Activities updates for the competition.',
  webhooks: 'Send Live Activities updates to external services.',
  'sum-of-ranks': 'Review competitor rankings across completed rounds.',
  stats: 'View competition registration and event counts.',
};

const adminItemId = (href: string) => href.split('/').pop() ?? href;

export default function CompetitionAdmin() {
  const { competitionId, wcif, setTitle } = useWCIF();
  const { adminTabs } = useCompetitionLayoutTabs({ competitionId, wcif });

  useEffect(() => {
    setTitle('Admin');
  }, [setTitle]);

  return (
    <Container className="space-y-4 p-2 pt-4">
      <h1 className="type-heading">Admin</h1>
      {adminTabs.length === 0 ? (
        <NoteBox text="No admin tools are available for your account at this competition." />
      ) : (
        <div className="space-y-2">
          {adminTabs.map((tab) => {
            const itemId = adminItemId(tab.href);

            return (
              <Link
                key={tab.href}
                to={tab.href}
                className="block rounded-md border border-tertiary-weak bg-panel px-4 py-3 shadow-sm hover-bg-tertiary">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <div className="type-label text-default">{tab.text}</div>
                    {adminDescriptions[itemId] && (
                      <div className="type-body-sm text-subtle">{adminDescriptions[itemId]}</div>
                    )}
                  </div>
                  <i className="fa fa-chevron-right shrink-0 text-muted" aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}
