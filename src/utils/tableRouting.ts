export function getHostelSourceByLocation(location: string) {
  const loc = location.trim().toLowerCase();
  return { schema: 'public', table: 'hostels' };
}

export function getRestaurantsSourceByLocation(location: string) {
  const loc = location.trim().toLowerCase();
  return { schema: 'public', table: 'restaurants' };
}

export function getPlacesSourceByLocation(location: string) {
  const loc = location.trim().toLowerCase();
  return { schema: 'public', table: 'places_to_visit' };
}
