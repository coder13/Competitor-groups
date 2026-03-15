import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { Round } from '@wca/helpers';
import { MemoryRouter } from 'react-router-dom';
import { CutoffTimeLimitPanel } from './CutoffTimeLimitPanel';

jest.mock('react-tiny-popover', () => ({
  Popover: ({
    children,
    content,
    isOpen,
  }: {
    children: React.ReactNode;
    content: React.ReactNode;
    isOpen: boolean;
  }) => (
    <div>
      {children}
      {isOpen ? content : null}
    </div>
  ),
}));

jest.mock('react-i18next', () => ({
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/providers/WCIFProvider', () => ({
  useWCIF: () => ({
    competitionId: 'TestComp2026',
    wcif: {
      id: 'TestComp2026',
      schedule: { venues: [] },
    },
    setTitle: () => {},
  }),
}));

const round = {
  id: '333-r1',
  cutoff: {
    numberOfAttempts: 2,
    attemptResult: 1200,
  },
  timeLimit: null,
  advancementCondition: null,
} as unknown as Round;

function renderPanel() {
  return render(
    <MemoryRouter>
      <CutoffTimeLimitPanel round={round} />
    </MemoryRouter>,
  );
}

describe('CutoffTimeLimitPanel', () => {
  it('uses theme-aware popover classes for help content', () => {
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: /help/i }));

    const popoverContent = screen
      .getByText(/common\.cutoffTimeLimitPopover\.timeLimits/i)
      .closest('div');

    expect(popoverContent).toHaveClass('bg-panel');
    expect(popoverContent).toHaveClass('text-default');
    expect(popoverContent).not.toHaveClass('bg-white');
  });
});
