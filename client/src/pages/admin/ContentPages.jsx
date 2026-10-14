import ContentCrud from '@/components/admin/ContentCrud';
import { adminApi } from '@/api/admin';
import { serviceSchema, attractionSchema, faqSchema, reviewSchema, nearbyPlaceSchema, specialEventSchema } from '@/schemas/admin.schema';
import { NEARBY_CATEGORIES, SERVICE_GROUPS } from '@/utils/constants';
import { getIcon } from '@/utils/icons';
import { isoToInputUTC, formatDayLong } from '@/utils/format';
import { Mountain, HelpCircle, Quote, PartyPopper } from 'lucide-react';

/** Páginas de contenido simple, todas sobre el mismo CRUD genérico */

export function ServicesPage() {
  return (
    <ContentCrud
      config={{
        key: 'admin-services',
        publicKey: 'services',
        title: 'Servicios',
        singular: 'Servicio',
        subtitle: 'Servicios del complejo y espacios comunes del predio (asadores, piletas, sala de estar). Arrastrá para ordenar.',
        emptyText: 'Agregá WiFi, pileta, desayuno…',
        api: adminApi.services,
        schema: serviceSchema,
        defaults: { name: '', icon: 'Sparkles', description: '', group: 'servicio', active: true },
        toForm: (s) => ({ name: s.name, icon: s.icon, description: s.description || '', group: s.group || 'servicio', active: s.active }),
        fields: [
          { name: 'group', label: 'Tipo', type: 'select', options: Object.entries(SERVICE_GROUPS) },
          { name: 'name', label: 'Nombre' },
          { name: 'icon', label: 'Ícono', type: 'icon' },
          { name: 'description', label: 'Descripción (opcional, aparece al pasar el mouse)' },
        ],
        summary: (s) => ({ title: s.name, subtitle: [SERVICE_GROUPS[s.group || 'servicio'], s.description].filter(Boolean).join(' · '), icon: getIcon(s.icon) }),
      }}
    />
  );
}

export function AttractionsPage() {
  return (
    <ContentCrud
      config={{
        key: 'admin-attractions',
        publicKey: 'attractions',
        title: 'Atractivos de Tafí',
        singular: 'Atractivo',
        subtitle: 'Lugares para conocer cerca del complejo.',
        emptyText: 'Sumá el dique, los menhires, el cerro…',
        withImage: true,
        api: adminApi.attractions,
        schema: attractionSchema,
        defaults: { name: '', description: '', distance: '', mapsUrl: '', active: true },
        toForm: (a) => ({ name: a.name, description: a.description || '', distance: a.distance || '', mapsUrl: a.mapsUrl || '', active: a.active }),
        fields: [
          { name: 'name', label: 'Nombre' },
          { name: 'distance', label: 'Distancia', placeholder: 'Ej: 5 km · 15 min en auto' },
          { name: 'description', label: 'Descripción', type: 'textarea', rows: 3 },
          { name: 'mapsUrl', label: 'Link de Google Maps (opcional)', type: 'url', placeholder: 'https://maps.app.goo.gl/…' },
        ],
        summary: (a) => ({ title: a.name, subtitle: [a.distance, a.description].filter(Boolean).join(' · '), image: a.image?.url, icon: Mountain }),
      }}
    />
  );
}

export function FaqsPage() {
  return (
    <ContentCrud
      config={{
        key: 'admin-faqs',
        publicKey: 'faqs',
        title: 'Preguntas frecuentes',
        singular: 'Pregunta',
        subtitle: 'El acordeón de la sección Preguntas frecuentes.',
        emptyText: 'Check-in, mascotas, seña…',
        api: adminApi.faqs,
        schema: faqSchema,
        defaults: { question: '', answer: '', active: true },
        toForm: (f) => ({ question: f.question, answer: f.answer, active: f.active }),
        fields: [
          { name: 'question', label: 'Pregunta' },
          { name: 'answer', label: 'Respuesta', type: 'textarea', rows: 5 },
        ],
        summary: (f) => ({ title: f.question, subtitle: f.answer, icon: HelpCircle }),
      }}
    />
  );
}

export function ReviewsPage() {
  return (
    <ContentCrud
      config={{
        key: 'admin-reviews',
        publicKey: 'reviews',
        title: 'Reseñas',
        singular: 'Reseña',
        subtitle: 'Sólo reseñas reales de huéspedes. Si no hay ninguna visible, la sección no aparece en el sitio.',
        emptyText: 'Copiá reseñas reales de Google, Booking o Instagram.',
        api: adminApi.reviews,
        schema: reviewSchema,
        defaults: { author: '', origin: '', rating: 5, text: '', source: '', date: '', active: true },
        toForm: (r) => ({ author: r.author, origin: r.origin || '', rating: r.rating, text: r.text, source: r.source || '', date: isoToInputUTC(r.date), active: r.active }),
        fields: [
          { name: 'author', label: 'Nombre del huésped' },
          { name: 'origin', label: 'De dónde es (opcional)', placeholder: 'Ej: San Miguel de Tucumán' },
          { name: 'rating', label: 'Puntuación', type: 'rating' },
          { name: 'text', label: 'Reseña', type: 'textarea', rows: 5 },
          { name: 'source', label: 'Fuente (opcional)', placeholder: 'Google, Booking, Instagram…' },
          { name: 'date', label: 'Fecha (opcional)', type: 'date' },
        ],
        summary: (r) => ({ title: `${'★'.repeat(r.rating)} ${r.author}`, subtitle: r.text, icon: Quote }),
      }}
    />
  );
}

export function NearbyPlacesPage() {
  return (
    <ContentCrud
      config={{
        key: 'admin-nearby-places',
        publicKey: 'nearby-places',
        title: 'Todo cerca tuyo',
        singular: 'Lugar',
        subtitle: 'Delivery, súper, estación de servicio y más, con sus teléfonos. Los que estén ocultos no se ven en el sitio.',
        emptyText: 'Cargá los lugares cercanos con su teléfono.',
        withImage: true,
        api: adminApi.nearbyPlaces,
        schema: nearbyPlaceSchema,
        defaults: { name: '', category: 'delivery', description: '', phone: '', whatsapp: '', address: '', mapsUrl: '', active: true },
        toForm: (p) => ({
          name: p.name,
          category: p.category,
          description: p.description || '',
          phone: p.phone || '',
          whatsapp: p.whatsapp || '',
          address: p.address || '',
          mapsUrl: p.mapsUrl || '',
          active: p.active,
        }),
        fields: [
          { name: 'name', label: 'Nombre' },
          { name: 'category', label: 'Categoría', type: 'select', options: Object.entries(NEARBY_CATEGORIES).map(([k, c]) => [k, c.label]) },
          { name: 'description', label: 'Descripción corta', type: 'textarea', rows: 2 },
          { name: 'phone', label: 'Teléfono (botón “Llamar”)', type: 'tel', placeholder: '(03867) 42-1234' },
          { name: 'whatsapp', label: 'WhatsApp (opcional)', type: 'tel', hint: 'Con código de país, ej: 5493815555555', placeholder: '5493815555555' },
          { name: 'address', label: 'Dirección o referencia (opcional)' },
          { name: 'mapsUrl', label: 'Link de Google Maps (opcional)', type: 'url', placeholder: 'https://maps.app.goo.gl/…' },
        ],
        summary: (p) => ({
          title: p.name,
          subtitle: [NEARBY_CATEGORIES[p.category]?.label, p.phone || 'sin teléfono'].filter(Boolean).join(' · '),
          image: p.image?.url,
          icon: getIcon(NEARBY_CATEGORIES[p.category]?.icon),
        }),
      }}
    />
  );
}

export function SpecialEventsPage() {
  return (
    <ContentCrud
      config={{
        key: 'admin-special-events',
        publicKey: 'special-events',
        title: 'Eventos especiales',
        singular: 'Evento',
        subtitle: 'Navidad, Año Nuevo y fiestas de temporada. Activalos o desactivalos cada año.',
        emptyText: 'Creá la fiesta de Navidad o de Año Nuevo.',
        withImage: true,
        api: adminApi.specialEvents,
        schema: specialEventSchema,
        defaults: { title: '', description: '', date: '', active: true },
        toForm: (e) => ({ title: e.title, description: e.description || '', date: isoToInputUTC(e.date), active: e.active }),
        fields: [
          { name: 'title', label: 'Título', placeholder: 'Fiesta de Navidad' },
          { name: 'description', label: 'Descripción', type: 'textarea', rows: 3 },
          { name: 'date', label: 'Fecha (opcional)', type: 'date' },
        ],
        summary: (e) => ({ title: e.title, subtitle: [e.date && formatDayLong(e.date), e.description].filter(Boolean).join(' · '), image: e.image?.url, icon: PartyPopper }),
      }}
    />
  );
}
