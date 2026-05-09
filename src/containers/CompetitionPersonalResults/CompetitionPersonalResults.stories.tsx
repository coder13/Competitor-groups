import type { Meta, StoryObj } from '@storybook/react';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { CompetitionPersonalResultsContainer } from './CompetitionPersonalResults';

const meta = {
  title: 'Containers/Competition/Personal Results',
  component: CompetitionPersonalResultsContainer,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionPersonalResultsContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Competitor: Story = {
  args: {
    registrantId: '1',
  },
};
