import type { Meta, StoryObj } from '@storybook/react';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { CompetitionInformationContainer } from './CompetitionInformation';

const meta = {
  title: 'Containers/Competition/Information',
  component: CompetitionInformationContainer,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionInformationContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    competitionId: 'SeattleSummerOpen2026',
  },
};
