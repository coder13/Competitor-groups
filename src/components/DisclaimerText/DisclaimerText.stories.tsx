import type { Meta, StoryObj } from '@storybook/react';
import { DisclaimerText } from './DisclaimerText';

const meta = {
  title: 'Components/DisclaimerText',
  component: DisclaimerText,
  args: {
    className: 'max-w-xl',
  },
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DisclaimerText>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
