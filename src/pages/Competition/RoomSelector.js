import styled from 'styled-components'
import React from 'react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: white;
  width: 100%;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-evenly;
`;

const Button = styled.div`
  display: flex;
  flex: 1;
  background-color: ${props => props.highlight ? '#ABB2B9' : 'white'};
  justify-content: center;
`;

export default function RoomSelector({ venues, currentVenue, currentRoom, onVenueChange, onRoomChange }) {
  const rooms = venues.find(({ id }) => id === currentVenue).rooms;

  return (
    <Container>
      <Row>
        {rooms.map((room, index) => (
          <Button
            key={room.id}
            onClick={() => onRoomChange(room)}
            highlight={room.id === currentRoom}
          >
            {room.name}
          </Button>
        ))}
      </Row>
      <Row>
        {venues.map((venue) => (
          <Button
            key={venue.id}
            onClick={() => onVenueChange(venue)}
            highlight={venue.id === currentVenue}
          >
            {venue.name}
          </Button>
        ))}
      </Row>
    </Container>
  );
}
