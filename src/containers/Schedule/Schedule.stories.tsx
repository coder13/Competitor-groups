import type { Meta, StoryObj } from '@storybook/react';
import { storybookCompetitionFixture } from '@/storybook/competitionFixtures';
import { ScheduleContainer } from './Schedule';

const meta = {
  title: 'Containers/Competition/Schedule List',
  component: ScheduleContainer,
  parameters: { layout: 'fullscreen' },
  args: {
    wcif: storybookCompetitionFixture,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScheduleContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
