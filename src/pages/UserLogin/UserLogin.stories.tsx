import type { Meta, StoryObj } from '@storybook/react';
import { makeAppContainerDecorator } from '@/storybook/appStorybook';
import { makeRouteDecorator } from '@/storybook/competitionStorybook';
import UserLogin from './index';

const meta = {
  title: 'Pages/App/UserLogin',
  component: UserLogin,
  decorators: [
    makeAppContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/users/1001',
      routePath: '/users/:userId',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UserLogin>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
