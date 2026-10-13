import { create } from 'zustand';
import { publicApi } from '@/api/public';

/** Promos vigentes (las usa el banner, la sección de promos y los formularios) */
export const usePromoStore = create((set, get) => ({
  promos: [],
  loaded: false,
  loading: false,

  fetchPromos: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    try {
      set({ promos: await publicApi.promotions(), loaded: true });
    } catch {
      set({ promos: [], loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  /** Promos que aplican a una cabaña puntual */
  forCabin: (cabinId) => get().promos.filter((p) => p.appliesToAll || p.cabins?.some((c) => (c._id || c) === cabinId)),
}));
