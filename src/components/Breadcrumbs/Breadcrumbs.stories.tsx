import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumbs } from './Breadcrumbs';

const meta = {
  title: 'Components/Competition/Breadcrumbs',
  component: Breadcrumbs,
  decorators: [
    (Story) => (
      <div className="bg-panel p-4">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Breadcrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LinkedTrail: Story = {
  args: {
    breadcrumbs: [
      {
        label: '3x3x3 Cube, Round 1',
        href: '/competitions/SeattleSummerOpen2026/events/333-r1',
      },
      {
        label: 'Group 1',
      },
    ],
  },
};

export const MultipleLinks: Story = {
  args: {
    breadcrumbs: [
      {
        label: 'Schedule',
        href: '/competitions/SeattleSummerOpen2026/activities',
      },
      {
        label: 'Main Stage',
        href: '/competitions/SeattleSummerOpen2026/rooms/10',
      },
      {
        label: '3x3x3 Cube, Round 1',
      },
    ],
  },
};
