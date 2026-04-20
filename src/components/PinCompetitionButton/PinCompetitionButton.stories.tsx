import type { Meta, StoryObj } from '@storybook/react';
import { makeAppContainerDecorator, storybookPinnedCompetitions } from '@/storybook/appStorybook';
import { PinCompetitionButton } from './PinCompetitionButton';

const meta = {
  title: 'Components/App/PinCompetitionButton',
  component: PinCompetitionButton,
  decorators: [
    makeAppContainerDecorator(),
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof PinCompetitionButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unpinned: Story = {
  args: {
    competitionId: 'PortlandAutumn2026',
  },
  parameters: {
    competitionDetails: [
      {
        ...storybookPinnedCompetitions[0],
        id: 'PortlandAutumn2026',
        name: 'Portland Autumn 2026',
        short_name: 'Portland Autumn 2026',
        city: 'Portland, Oregon',
        start_date: '2026-10-10',
        end_date: '2026-10-11',
        website: 'https://www.worldcubeassociation.org/competitions/PortlandAutumn2026',
      },
    ],
    pinnedCompetitions: [],
  },
};

export const Pinned: Story = {
  args: {
    competitionId: 'SeattleSummerOpen2026',
  },
  parameters: {
    competitionDetails: storybookPinnedCompetitions,
    pinnedCompetitions: storybookPinnedCompetitions,
  },
};
