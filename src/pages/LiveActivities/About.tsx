import { useEffect } from 'react';
import { Container } from '@/components';

const steps = [
  {
    title: 'Sign in to Remote',
    text: 'Live updates use a separate session to make sure only listed delegates and organizers can control them. Even if you are already signed into the site, you may need to sign in once more with your WCA account.',
  },
  {
    title: 'Import the competition',
    text: 'A listed delegate or organizer opens Remote and imports the published competition schedule.',
  },
  {
    title: 'Start the active group',
    text: 'Remote shows one row per activity code with room chips, so multi-room groups can be started together.',
  },
  {
    title: 'Keep the room display current',
    text: 'Start, stop, reset, and auto-advance controls update what competitors and staff see as currently running.',
  },
];

export default function LiveActivitiesAbout() {
  useEffect(() => {
    document.title = 'Live Activities - Competition Groups';
  }, []);

  return (
    <Container className="px-4 py-8">
      <div className="space-y-8">
        <section className="space-y-4">
          <div className="space-y-2">
            <h1 className="type-title">Live Activities</h1>
            <p className="max-w-3xl type-body text-subtle">
              Live Activities let delegates and organizers show what is happening right now at a
              competition. The Remote tab controls the live state from the schedule you already
              publish, with NotifyComp quietly handling the backend updates that keep displays in
              sync.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="type-heading">How it works</h2>
          <div className="divide-y divide-tertiary-weak">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-4 py-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tertiary type-label">
                  {index + 1}
                </span>
                <div className="space-y-1">
                  <h3 className="type-label">{step.title}</h3>
                  <p className="type-body-sm text-subtle">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="type-heading">What it looks like</h2>
          <div className="space-y-2 border-y border-tertiary-weak py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <i className="fa fa-tower-broadcast mr-1 text-green-500 type-heading" />
                <span className="type-heading">Live Activities </span>
                <span className="type-meta align-super">Powered by NotifyComp</span>
              </div>
              <span className="type-meta text-muted">Live view</span>
            </div>
            <div className="divide-y divide-tertiary-weak">
              <div className="flex flex-col p-2 type-body even:table-bg-row-alt">
                <span className="type-body">Clock, Round 1, Group 1</span>
                <span className="flex justify-between type-meta">
                  <span className="rounded bg-blue-200 px-1 text-gray-900">Main stage</span>
                  <span>Started 4 min ago</span>
                </span>
              </div>
              <div className="flex flex-col p-2 type-body even:table-bg-row-alt">
                <span className="type-body">3x3x3 Cube, Round 1, Group 2</span>
                <span className="flex justify-between type-meta">
                  <span className="rounded bg-green-200 px-1 text-gray-900">Side stage</span>
                  <span>Up next</span>
                </span>
              </div>
            </div>
          </div>
          <p className="type-body-sm text-subtle">
            Competitors can quickly see what is happening now and what is coming next, without
            needing to interpret the full schedule.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="type-heading">Who can use it</h2>
          <p className="type-body-sm text-subtle">
            Remote controls are available only to listed delegates and organizers for the
            competition. Sign in once with your WCA account, then use the Remote tab for any
            competition where you are listed.
          </p>
        </section>
      </div>
    </Container>
  );
}
