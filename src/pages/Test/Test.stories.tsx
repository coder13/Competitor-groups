import type { Meta, StoryObj } from '@storybook/react';
import { makeAppContainerDecorator } from '@/storybook/appStorybook';
import { makeRouteDecorator } from '@/storybook/competitionStorybook';
import Test from './index';

const meta = {
  title: 'Pages/App/Test',
  component: Test,
  decorators: [
    makeAppContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/test',
      routePath: '/test',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Test>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
