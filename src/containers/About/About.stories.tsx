import type { Meta, StoryObj } from '@storybook/react';
import { AboutContainer } from './About';

const meta = {
  title: 'Containers/App/About',
  component: AboutContainer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AboutContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
