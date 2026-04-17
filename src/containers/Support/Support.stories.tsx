import type { Meta, StoryObj } from '@storybook/react';
import { SupportContainer } from './Support';

const meta = {
  title: 'Containers/App/Support',
  component: SupportContainer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SupportContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
