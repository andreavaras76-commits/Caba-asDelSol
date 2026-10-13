import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Hemisferio sur: de mayo a septiembre arrancamos en "invierno" */
const initialSeason = () => {
  const month = new Date().getMonth(); // 0 = enero
  return month >= 4 && month <= 8 ? 'invierno' : 'verano';
};

export const useSeasonStore = create(
  persist(
    (set) => ({
      season: initialSeason(),
      setSeason: (season) => set({ season }),
      toggle: () => set((s) => ({ season: s.season === 'verano' ? 'invierno' : 'verano' })),
    }),
    { name: 'cds_season' }
  )
);
