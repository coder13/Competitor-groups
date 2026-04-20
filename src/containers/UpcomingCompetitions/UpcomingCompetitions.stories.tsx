import type { Meta, StoryObj } from '@storybook/react';
import {
  makeAppContainerDecorator,
  storybookUpcomingCompetitionsPages,
} from '@/storybook/appStorybook';
import UpcomingCompetitions from './UpcomingCompetitions';

const meta = {
  title: 'Containers/App/Upcoming Competitions',
  component: UpcomingCompetitions,
  decorators: [makeAppContainerDecorator()],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UpcomingCompetitions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Offline: Story = {
  parameters: {
    online: false,
  },
};

export const Empty: Story = {
  parameters: {
    upcomingCompetitionsPages: [[]],
  },
};
