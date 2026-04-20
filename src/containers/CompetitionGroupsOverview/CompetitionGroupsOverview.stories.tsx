import type { Meta, StoryObj } from '@storybook/react';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { CompetitionGroupsOverviewContainer } from './CompetitionGroupsOverview';

const meta = {
  title: 'Containers/Competition/Groups Overview',
  component: CompetitionGroupsOverviewContainer,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionGroupsOverviewContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
