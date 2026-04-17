import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import RoomSelector from './RoomSelector';

const venues = [
  {
    id: 1,
    name: 'Seattle Center',
    rooms: [
      { id: 10, name: 'Main Stage' },
      { id: 11, name: 'Side Stage' },
    ],
  },
  {
    id: 2,
    name: 'Annex Hall',
    rooms: [
      { id: 20, name: 'Practice Room' },
      { id: 21, name: 'Finals Stage' },
    ],
  },
];

function RoomSelectorStory() {
  const [currentVenue, setCurrentVenue] = useState(1);
  const [currentRoom, setCurrentRoom] = useState(10);

  const handleVenueChange = (venue: (typeof venues)[number]) => {
    setCurrentVenue(venue.id);
    setCurrentRoom(venue.rooms[0].id);
  };

  const handleRoomChange = (room: (typeof venues)[number]['rooms'][number]) => {
    setCurrentRoom(room.id);
  };

  return (
    <RoomSelector
      venues={venues}
      currentVenue={currentVenue}
      currentRoom={currentRoom}
      onVenueChange={handleVenueChange}
      onRoomChange={handleRoomChange}
    />
  );
}

const meta = {
  title: 'Components/Competition/RoomSelector',
  component: RoomSelector,
  decorators: [
    (Story) => (
      <div className="max-w-xl p-4">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof RoomSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    venues,
    currentVenue: 1,
    currentRoom: 10,
    onVenueChange: () => {},
    onRoomChange: () => {},
  },
  render: () => <RoomSelectorStory />,
};
