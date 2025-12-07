import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocationContext } from '@/context/LocationContext';

const LocationSelector = () => {
  const { location, setLocation } = useLocationContext();

  return (
    <div aria-label="Select location" aria-live="polite">
      <Select value={location ?? undefined} onValueChange={(val) => setLocation(val as string)}>
        <SelectTrigger aria-label="Location">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Rajampeta">Rajampeta</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationSelector;
