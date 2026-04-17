import type { Meta, StoryObj } from '@storybook/react';
import { makeAppContainerDecorator } from '@/storybook/appStorybook';
import {
  makeCompetitionContainerDecorator,
  makeRouteDecorator,
} from '@/storybook/competitionStorybook';
import Header from './Header';

const meta = {
  title: 'Layouts/RootLayout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'androidTypical',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoggedOutHome: Story = {
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

export const CompetitionHeader: Story = {
  decorators: [
    makeCompetitionContainerDecorator(),
    makeRouteDecorator({
      initialPath: '/competitions/SeattleSummerOpen2026/live',
      routePath: '/competitions/:competitionId/*',
    }),
  ],
};
