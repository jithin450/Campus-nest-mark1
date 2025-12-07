import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

type Location = 'Rajampeta' | 'Bengaluru' | null;

interface LocationContextValue {
  location: Location;
  setLocation: (loc: Location) => void;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocationState] = useState<Location>('Rajampeta');

  useEffect(() => {
    const saved = localStorage.getItem('selectedLocation');
    if (saved === 'Rajampeta' || saved === 'Bengaluru') {
      setLocationState(saved as Location);
    }
  }, []);

  const setLocation = (loc: Location) => {
    setLocationState(loc);
    if (loc) {
      localStorage.setItem('selectedLocation', loc);
    } else {
      localStorage.removeItem('selectedLocation');
    }
  };

  const value = useMemo(() => ({ location, setLocation }), [location]);

  return (
    <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationContext must be used within LocationProvider');
  return ctx;
};
