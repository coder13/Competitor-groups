import type { Meta, StoryObj } from '@storybook/react';
import { AppUpdatePrompt } from './AppUpdatePrompt';

const meta = {
  title: 'Components/AppUpdatePrompt',
  component: AppUpdatePrompt,
  args: {
    onUpdate: () => {},
  },
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AppUpdatePrompt>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
