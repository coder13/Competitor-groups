import type { Meta, StoryObj } from '@storybook/react';
import { BaseAssignmentPill, BreadcrumbPill, Pill, RoomPill } from './Pill';

const meta = {
  title: 'Components/App/Pill',
  component: Pill,
  decorators: [
    (Story) => (
      <div className="flex flex-wrap gap-3 p-4">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Pill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'General pill',
  },
};

export const Breadcrumb: Story = {
  render: () => <BreadcrumbPill>Round 1</BreadcrumbPill>,
};

export const Assignment: Story = {
  render: () => (
    <BaseAssignmentPill className="bg-green-100 text-green-900">Judge</BaseAssignmentPill>
  ),
};

export const Room: Story = {
  render: () => <RoomPill>Main Stage</RoomPill>,
};
