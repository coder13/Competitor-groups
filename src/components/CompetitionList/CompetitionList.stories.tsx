import type { Meta, StoryObj } from '@storybook/react';
import { makeAppContainerDecorator, storybookPinnedCompetitions } from '@/storybook/appStorybook';
import { CompetitionListFragment } from './CompetitionList';

const meta = {
  title: 'Components/App/CompetitionList',
  component: CompetitionListFragment,
  decorators: [makeAppContainerDecorator()],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionListFragment>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Bookmarked Competitions',
    competitions: storybookPinnedCompetitions,
    loading: false,
    liveCompetitionIds: ['SeattleSummerOpen2026'],
  },
};

export const Loading: Story = {
  args: {
    title: 'Upcoming Competitions',
    competitions: [],
    loading: true,
    liveCompetitionIds: [],
  },
};
