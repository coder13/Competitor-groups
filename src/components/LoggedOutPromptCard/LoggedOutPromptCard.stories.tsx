import type { Meta, StoryObj } from '@storybook/react';
import { LoggedOutPromptCard } from './LoggedOutPromptCard';

const meta = {
  title: 'Components/App/LoggedOutPromptCard',
  component: LoggedOutPromptCard,
  args: {
    onLogin: () => {},
  },
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LoggedOutPromptCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'androidTypical',
    },
  },
};

export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
  },
};
