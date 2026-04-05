import type { Meta, StoryObj } from '@storybook/react';
import Support from './index';

const meta = {
  title: 'Pages/Support',
  component: Support,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Support>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
