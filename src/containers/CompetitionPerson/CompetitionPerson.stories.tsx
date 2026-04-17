import type { Meta, StoryObj } from '@storybook/react';
import { makeCompetitionContainerDecorator } from '@/storybook/competitionStorybook';
import { CompetitionPersonContainer } from './CompetitionPerson';

const meta = {
  title: 'Containers/Competition/Person',
  component: CompetitionPersonContainer,
  decorators: [makeCompetitionContainerDecorator()],
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof CompetitionPersonContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Competitor: Story = {
  args: {
    registrantId: '1',
  },
};

export const Delegate: Story = {
  args: {
    registrantId: '6',
  },
};
