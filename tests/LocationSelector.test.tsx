import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LocationSelector from '@/components/Header/LocationSelector';
import { LocationProvider, useLocationContext } from '@/context/LocationContext';

const Probe = () => {
  const { location } = useLocationContext();
  return <div data-testid="loc">{location}</div>;
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <LocationProvider>
    {children}
    <Probe />
  </LocationProvider>
);

it('renders and switches location', async () => {
  const user = userEvent.setup();
  render(<LocationSelector />, { wrapper: Wrapper });
  expect(screen.getByTestId('loc')).toHaveTextContent('Rajampeta');
  const container = screen.getByLabelText(/Select location/i);
  await user.selectOptions(within(container).getByRole('combobox'), 'Bengaluru');
  expect(screen.getByTestId('loc')).toHaveTextContent('Bengaluru');
});
