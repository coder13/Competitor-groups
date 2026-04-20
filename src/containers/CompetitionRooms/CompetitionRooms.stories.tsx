import type { Meta, StoryObj } from '@storybook/react';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { CompetitionRoomsContainer } from './CompetitionRooms';

const meta = {
  title: 'Containers/Competition/Rooms',
  component: CompetitionRoomsContainer,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionRoomsContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    competitionId: 'SeattleSummerOpen2026',
  },
};
