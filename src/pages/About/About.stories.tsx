import type { Meta, StoryObj } from '@storybook/react';
import About from './index';

const meta = {
  title: 'Pages/About',
  component: About,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof About>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
