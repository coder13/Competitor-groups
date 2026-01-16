import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { VenueInformation } from './VenueInformation';

describe('VenueInformation', () => {
  it('renders venue details and map link', () => {
    render(
      <VenueInformation
        name="Community Hall"
        address="123 Main St"
        city="Springfield"
        details="Bring your own cube."
        mapUrl="https://maps.google.com/maps?q=Community%20Hall"
      />,
    );

    const venueLink = screen.getByRole('link');
    expect(venueLink).toHaveTextContent('Community Hall');
    expect(venueLink).toHaveTextContent('123 Main St');
    expect(venueLink).toHaveTextContent('Springfield');
    expect(screen.getByText('Bring your own cube.')).toBeInTheDocument();
    expect(venueLink).toHaveAttribute('href', 'https://maps.google.com/maps?q=Community%20Hall');
  });
});
