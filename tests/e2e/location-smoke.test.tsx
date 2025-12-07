import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

beforeEach(() => {
  localStorage.setItem('selectedLocation', 'Rajampeta');
  window.history.pushState({}, '', '/restaurants');
});

it('switching location to Bengaluru updates Restaurants cards', async () => {
  const user = userEvent.setup();
  render(<App />);
  const container = await screen.findByLabelText(/Select location/i);
  const dropdown = within(container).getByRole('combobox');
  await user.selectOptions(dropdown, 'Bengaluru');
  expect(await screen.findByText('BLR Restaurant Card')).toBeInTheDocument();
});
