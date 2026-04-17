import type { Meta, StoryObj } from '@storybook/react';
import { NoteBox } from './Notebox';

const meta = {
  title: 'Components/App/Notebox',
  component: NoteBox,
  decorators: [
    (Story) => (
      <div className="max-w-xl p-4">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof NoteBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'This app is operating in offline mode. Some data may be outdated.',
  },
};

export const WithoutPrefix: Story = {
  args: {
    text: 'Live activity support is currently unavailable for this competition.',
    prefix: '',
  },
};
