import { create } from 'zustand';
import { publicApi } from '@/api/public';

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

  forCabin: (cabinId) => get().promos.filter((p) => p.appliesToAll || p.cabins?.some((c) => (c._id || c) === cabinId)),
}));
