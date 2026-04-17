import type { Meta, StoryObj } from '@storybook/react';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { CompetitionPersonalBestsContainer } from './CompetitionPersonalBests';

const meta = {
  title: 'Containers/Competition/Personal Bests',
  component: CompetitionPersonalBestsContainer,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionPersonalBestsContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BlakeThompson: Story = {
  args: {
    wcaId: '2010THOM03',
  },
};
