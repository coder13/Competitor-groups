import type { Meta, StoryObj } from '@storybook/react';
import { LinkButton } from './LinkButton';

const meta = {
  title: 'Components/App/LinkButton',
  component: LinkButton,
  args: {
    to: '/support',
    title: 'Support the project',
    variant: 'blue',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LinkButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    title: 'Read the docs',
    variant: 'light',
  },
};
