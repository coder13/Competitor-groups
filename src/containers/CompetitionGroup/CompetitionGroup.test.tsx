import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { Competition } from '@wca/helpers';
import { AnchorLink } from '@/lib/linkRenderer';
import { storybookCompetitionFixture } from '@/storybook/competitionFixtures';
import { CompetitionGroupContainer } from './CompetitionGroup';

const mockSetTitle = jest.fn();
const mockWcif = storybookCompetitionFixture as unknown as Competition;

jest.mock('@/i18n', () => ({
  __esModule: true,
  default: {
    t: (key: string, options?: Record<string, unknown>) =>
      key === 'common.activityCodeToName.group' ? `Group ${options?.groupNumber}` : key,
  },
}));

jest.mock('@/components', () => ({
  ActivityRow: () => <div />,
}));

jest.mock('@/components/AssignmentCodeCell', () => ({
  AssignmentCodeCell: ({ count }: { count: number }) => <div>{count}</div>,
}));

jest.mock('@/components/Breadcrumbs/Breadcrumbs', () => ({
  Breadcrumbs: () => <div />,
}));

jest.mock('@/components/Container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/CutoffTimeLimitPanel', () => ({
  CutoffTimeLimitPanel: () => <div />,
}));

jest.mock('@/providers/WCIFProvider', () => ({
  useWCIF: () => ({
    wcif: mockWcif,
    setTitle: mockSetTitle,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('CompetitionGroupContainer', () => {
  beforeEach(() => {
    mockSetTitle.mockClear();
  });

  it('navigates between groups with arrow keys', () => {
    const onNavigate = jest.fn();

    render(
      <CompetitionGroupContainer
        competitionId="SeattleSummerOpen2026"
        roundId="333-r1"
        groupNumber="1"
        LinkComponent={AnchorLink}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.keyDown(document, { key: 'ArrowRight' });

    expect(onNavigate).toHaveBeenCalledWith('/competitions/SeattleSummerOpen2026/events/333-r1/2');
  });

  it('does not navigate past the first group with the left arrow key', () => {
    const onNavigate = jest.fn();

    render(
      <CompetitionGroupContainer
        competitionId="SeattleSummerOpen2026"
        roundId="333-r1"
        groupNumber="1"
        LinkComponent={AnchorLink}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    expect(onNavigate).not.toHaveBeenCalled();
  });
});
