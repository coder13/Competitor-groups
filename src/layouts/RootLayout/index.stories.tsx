import type { Meta, StoryObj } from '@storybook/react';
import { Route, Routes } from 'react-router-dom';
import { makeAppContainerDecorator, storybookAppUser } from '@/storybook/appStorybook';
import { RootLayout } from './index';

const RootLayoutStoryFrame = () => (
  <Routes>
    <Route path="/" element={<RootLayout />}>
      <Route
        index
        element={
          <div className="flex w-full justify-center p-6">
            <div className="w-full max-w-screen-md rounded-md bg-panel p-6">
              Root layout outlet content
            </div>
          </div>
        }
      />
    </Route>
  </Routes>
);

const meta = {
  title: 'Layouts/RootLayout',
  component: RootLayout,
  decorators: [makeAppContainerDecorator(), (Story) => <Story />],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RootLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <RootLayoutStoryFrame />,
};

export const LoggedOut: Story = {
  decorators: [
    makeAppContainerDecorator({
      currentUser: null,
    }),
  ],
  render: () => <RootLayoutStoryFrame />,
};
