import type { Meta, StoryObj } from '@storybook/react';
import { RoundActionPicker } from './RoundActionPicker';
import { RoundActionPickerEvent } from './types';

const events: RoundActionPickerEvent[] = [
  {
    id: '333',
    name: '3x3x3 Cube',
    rounds: [
      { id: '333-r1', roundNumber: 1, groupCount: 5, resultStatus: 'now' },
      { id: '333-r2', roundNumber: 2, groupCount: 3 },
      { id: '333-r3', roundNumber: 3, groupCount: 1 },
    ],
  },
  {
    id: '444',
    name: '4x4x4 Cube',
    rounds: [
      { id: '444-r1', roundNumber: 1, groupCount: 4, resultStatus: 'done' },
      { id: '444-r2', roundNumber: 2, groupCount: 1 },
    ],
  },
  {
    id: '555',
    name: '5x5x5 Cube',
    rounds: [{ id: '555-r1', roundNumber: 1, groupCount: 3, resultStatus: 'done' }],
  },
  {
    id: '333bf',
    name: '3x3x3 Blindfolded',
    rounds: [
      { id: '333bf-r1', roundNumber: 1, groupCount: 2, resultStatus: 'done' },
      { id: '333bf-r2', roundNumber: 2, groupCount: 1 },
    ],
  },
];

const meta = {
  title: 'Components/Competition/RoundActionPicker',
  component: RoundActionPicker,
  decorators: [
    (Story) => (
      <div className="w-full max-w-5xl p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    events,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RoundActionPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Groups: Story = {
  args: {
    mode: 'groups',
  },
};

export const Results: Story = {
  args: {
    mode: 'results',
  },
};
