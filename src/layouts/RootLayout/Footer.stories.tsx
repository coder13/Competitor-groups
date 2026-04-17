import type { Meta, StoryObj } from '@storybook/react';
import Footer from './Footer';

const meta = {
  title: 'Layouts/RootLayout/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'androidTypical',
    },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen flex-col bg-app text-default">
        <div className="flex-1" />
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Footer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
