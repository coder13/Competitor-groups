import type { Meta, StoryObj } from '@storybook/react';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { CompetitionStatsContainer } from './CompetitionStats';

const meta = {
  title: 'Containers/Competition/Stats',
  component: CompetitionStatsContainer,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionStatsContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
