import type { Meta, StoryObj } from '@storybook/react';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { CompetitionRoomContainer } from './CompetitionRoom';

const meta = {
  title: 'Containers/Competition/Room',
  component: CompetitionRoomContainer,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionRoomContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MainStage: Story = {
  args: {
    competitionId: 'SeattleSummerOpen2026',
    roomId: '10',
  },
};

export const SideStage: Story = {
  args: {
    competitionId: 'SeattleSummerOpen2026',
    roomId: '11',
  },
};
