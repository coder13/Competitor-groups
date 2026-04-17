import type { Meta, StoryObj } from '@storybook/react';
import { makeAppContainerDecorator, storybookPinnedCompetitions } from '@/storybook/appStorybook';
import { PinnedCompetitions } from './PinnedCompetitions';

const meta = {
  title: 'Containers/App/Pinned Competitions',
  component: PinnedCompetitions,
  decorators: [makeAppContainerDecorator()],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PinnedCompetitions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  parameters: {
    pinnedCompetitions: [],
  },
};

export const MultipleBookmarks: Story = {
  parameters: {
    pinnedCompetitions: [
      ...storybookPinnedCompetitions,
      {
        ...storybookPinnedCompetitions[0],
        id: 'TacomaSpring2026',
        name: 'Tacoma Spring 2026',
        short_name: 'Tacoma Spring 2026',
        city: 'Tacoma, Washington',
        start_date: '2026-05-20',
        end_date: '2026-05-21',
        website: 'https://www.worldcubeassociation.org/competitions/TacomaSpring2026',
      },
    ],
  },
};
