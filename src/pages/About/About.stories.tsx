import type { Meta, StoryObj } from '@storybook/react';
import { makeAppContainerDecorator } from '@/storybook/appStorybook';
import { makeRouteDecorator } from '@/storybook/competitionStorybook';
import AboutPage from './index';

const meta = {
  title: 'Pages/App/About',
  component: AboutPage,
  decorators: [
    makeAppContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/about',
      routePath: '/about',
    }),
  ],
} satisfies Meta<typeof AboutPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
