import type { Meta, StoryObj } from '@storybook/react';
import { makeRouteDecorator } from '@/storybook/competitionStorybook';
import { StyledNavLink } from './StyledNavLink';

const meta = {
  title: 'Containers/Nav/StyledNavLink',
  component: StyledNavLink,
  decorators: [
    makeRouteDecorator({
      initialPath: '/competitions/SeattleSummerOpen2026/live',
      routePath: '/competitions/:competitionId/*',
    }),
    (Story) => (
      <div className="flex gap-2 bg-panel p-4">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof StyledNavLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    to: '/competitions/SeattleSummerOpen2026/live',
    text: 'Live',
  },
};

export const Inactive: Story = {
  args: {
    to: '/competitions/SeattleSummerOpen2026/information',
    text: 'Information',
  },
};
