import type { Meta, StoryObj } from '@storybook/react';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { CompetitionPsychSheetEventContainer } from './CompetitionPsychSheetEvent';

const meta = {
  title: 'Containers/Competition/Psych Sheet Event',
  component: CompetitionPsychSheetEventContainer,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionPsychSheetEventContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Average: Story = {
  args: {
    competitionId: 'SeattleSummerOpen2026',
    eventId: '333',
    resultType: 'average',
    onEventChange: () => {},
    onResultTypeChange: () => {},
  },
};

export const Single: Story = {
  args: {
    competitionId: 'SeattleSummerOpen2026',
    eventId: '333',
    resultType: 'single',
    onEventChange: () => {},
    onResultTypeChange: () => {},
  },
};
