import type { Meta, StoryObj } from '@storybook/react';
import { makeAppContainerDecorator } from '@/storybook/appStorybook';
import { makeRouteDecorator } from '@/storybook/competitionStorybook';
import Settings from './index';

const meta = {
  title: 'Pages/App/Settings',
  component: Settings,
  decorators: [
    makeAppContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/settings',
      routePath: '/settings',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Settings>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
