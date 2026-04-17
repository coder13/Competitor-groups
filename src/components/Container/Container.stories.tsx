import type { Meta, StoryObj } from '@storybook/react';
import { Container } from './Container';

const meta = {
  title: 'Components/App/Container',
  component: Container,
  args: {
    children: (
      <div className="rounded-md bg-panel p-4">
        <div className="type-heading">Container content</div>
        <div className="type-body text-muted">This demonstrates the shared page width wrapper.</div>
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div className="flex w-full justify-center bg-app p-4">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
  },
};
