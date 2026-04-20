import type { Meta, StoryObj } from '@storybook/react';
import {
  makeAppContainerDecorator,
  storybookPinnedCompetitions,
  storybookUserCompetitions,
} from '@/storybook/appStorybook';
import { MyCompetitions } from './MyCompetitions';

const meta = {
  title: 'Containers/App/My Competitions',
  component: MyCompetitions,
  decorators: [makeAppContainerDecorator()],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MyCompetitions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnlyPinned: Story = {
  parameters: {
    currentUser: undefined,
    userCompetitions: {
      upcoming_competitions: [],
      ongoing_competitions: [],
    },
    pinnedCompetitions: storybookPinnedCompetitions,
  },
};

export const UpcomingAndOngoing: Story = {
  parameters: {
    pinnedCompetitions: [],
    userCompetitions: storybookUserCompetitions,
  },
};
