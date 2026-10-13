import ContentCrud from '@/components/admin/ContentCrud';
import { adminApi } from '@/api/admin';
import { serviceSchema, attractionSchema, faqSchema, reviewSchema } from '@/schemas/admin.schema';
import { getIcon } from '@/utils/icons';
import { isoToInputUTC } from '@/utils/format';
import { Mountain, HelpCircle, Quote } from 'lucide-react';

/** Páginas de contenido simple, todas sobre el mismo CRUD genérico */

export function ServicesPage() {
  return (
    <ContentCrud
      config={{
        key: 'admin-services',
        publicKey: 'services',
        title: 'Servicios',
        singular: 'Servicio',
        subtitle: 'Los íconos de la sección Servicios. Arrastrá para ordenar.',
        emptyText: 'Agregá WiFi, pileta, desayuno…',
        api: adminApi.services,
        schema: serviceSchema,
        defaults: { name: '', icon: 'Sparkles', description: '', active: true },
        toForm: (s) => ({ name: s.name, icon: s.icon, description: s.description || '', active: s.active }),
        fields: [
          { name: 'name', label: 'Nombre (texto manuscrito)' },
          { name: 'icon', label: 'Ícono', type: 'icon' },
          { name: 'description', label: 'Descripción (opcional, aparece al pasar el mouse)' },
        ],
        summary: (s) => ({ title: s.name, subtitle: s.description, icon: getIcon(s.icon) }),
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
