import type { Meta, StoryObj } from '@storybook/react';
import { makeAppContainerDecorator } from '@/storybook/appStorybook';
import { makeRouteDecorator } from '@/storybook/competitionStorybook';
import Home from './index';

const meta = {
  title: 'Pages/App/Home',
  component: Home,
  decorators: [
    makeAppContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/',
      routePath: '/',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Home>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LoggedOut: Story = {
  decorators: [
    makeAppContainerDecorator({
      currentUser: null,
    }),
    makeRouteDecorator({
      initialPath: '/',
      routePath: '/',
    }),
  ],
};
