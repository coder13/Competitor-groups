import { Link } from 'react-router-dom';
import { useWCIF } from './WCIFProvider';
import { useEffect } from 'react';

export default function Rooms() {
  const { wcif, setTitle } = useWCIF();

  useEffect(() => {
    setTitle('Rooms');
  }, [setTitle]);

  return (
    <div className="flex flex-col p-1">
      {wcif?.schedule?.venues?.map((venue) => (
        <div key={venue.id} className="flex flex-col mb-4">
          <p>
            <span className="font-bold">{venue.name}</span> ({venue.timezone})
          </p>
          <br />
          <div className="flex flex-col space-y-4">
            {venue.rooms.map((room) => (
              <Link to={`/competitions/${wcif.id}/rooms/${room.id}`}>
                <div
                  key={room.id}
                  className="flex flex-col shadow-md w-full cursor-pointer hover:opacity-90 rounded"
                  style={{
                    backgroundColor: `${room?.color}70`,
                  }}>
                  <h3 className="text-lg w-full p-2">{room.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
