import { create } from 'zustand';
import { publicApi } from '@/api/public';

const DEFAULT_SETTINGS = {
  businessName: 'Cabañas del Sol',
  location: 'Tafí del Valle',
  slogan: 'En las coordenadas ideales para disfrutar de la placidez y el esparcimiento en los Valles.',
  contact: { whatsapp: '5493815027738', phoneDisplay: '(0381) 15-502-7738', email: '', website: 'https://delsoltafidelvalle.com.ar' },
  social: { instagram: 'https://www.instagram.com/delsolcabanas', facebook: '' },
  address: {
    street: 'Ruta 307 – Km 60, por calle Rosendo Contreras (al final)',
    city: 'Tafí del Valle',
    postalCode: '4137',
    province: 'Tucumán',
    country: 'Argentina',
    mapsUrl: 'https://maps.app.goo.gl/2kcL473RB16yd4FR9',
    lat: -26.8596544,
    lng: -65.6869324,
  },
  hero: { title: 'Amanece en los Valles', subtitle: '', imagesVerano: [] },
  about: { title: 'El complejo', text: '', images: [], stats: [] },
  events: { title: 'Eventos y días de campo', text: '', capacity: 30, includes: [], lodgingOptional: true, images: [] },
  showPrices: false,
  seo: { title: '', description: '', ogImage: null },
};

export const useSettingsStore = create((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  error: null,

  fetchSettings: async ({ force = false } = {}) => {
    if (get().loaded && !force) return;
    try {
      const data = await publicApi.settings();
      set({ settings: { ...DEFAULT_SETTINGS, ...data }, loaded: true, error: null });
    } catch (error) {
      set({ loaded: true, error: error.message });
    }
  },

  setSettings: (settings) => set({ settings }),
}));
