import type { Meta, StoryObj } from '@storybook/react';
import { makeAppContainerDecorator } from '@/storybook/appStorybook';
import { makeRouteDecorator } from '@/storybook/competitionStorybook';
import SupportPage from './index';

const meta = {
  title: 'Pages/App/Support',
  component: SupportPage,
  decorators: [
    makeAppContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/support',
      routePath: '/support',
    }),
  ],
} satisfies Meta<typeof SupportPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
