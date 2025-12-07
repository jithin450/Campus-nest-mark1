import React from 'react';
import { expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

const cardsData = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'BLR Hostel Card',
    description: 'Hostel in Bengaluru',
    category: 'hostel',
    location: 'Bengaluru',
    image_url: null,
    meta: {},
    created_at: new Date().toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'BLR Restaurant Card',
    description: 'Restaurant in Bengaluru',
    category: 'restaurant',
    location: 'Bengaluru',
    image_url: null,
    meta: {},
    created_at: new Date().toISOString(),
  },
];

vi.mock('@/integrations/supabase/client', () => {
  const stub = {
    from: (_table: string) => ({
      select: () => ({
        eq: () => ({ range: async () => ({ data: [], error: null }) }),
      }),
    }),
    auth: {
      onAuthStateChange: (_cb: unknown) => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getSession: async () => ({ data: { session: null }, error: null }),
    },
  };
  return { supabase: stub };
});

vi.mock('@/utils/cardsApi', async (orig: () => Promise<unknown>) => {
  const mod = (await orig()) as Record<string, unknown>;
  return {
    ...mod,
    fetchCards: async (category: string, location: string) => {
      return cardsData.filter((c) => c.category === category && c.location === location);
    },
  };
});

// Simplify shadcn Select for tests to avoid Radix pointer interactions
vi.mock('@/components/ui/select', () => {
  const Ctx = React.createContext<{ label?: string }>({ label: undefined });
  return {
    Select: ({ value, onValueChange, children }: { value: string; onValueChange: (val: string) => void; children: React.ReactNode }) => {
      const { label } = React.useContext(Ctx);
      return React.createElement(
        'select',
        { 'aria-label': label || 'Select', value, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onValueChange(e.target.value) },
        children
      );
    },
    SelectTrigger: ({ children, 'aria-label': ariaLabel }: { children: React.ReactNode; 'aria-label'?: string }) =>
      React.createElement(Ctx.Provider, { value: { label: ariaLabel } }, children),
    SelectContent: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => React.createElement('option', { value }, children),
    SelectValue: ({ placeholder }: { placeholder?: string }) => React.createElement('span', null, placeholder),
  };
});

// Polyfill matchMedia for libraries that rely on it
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  } as unknown as MediaQueryList);
}
