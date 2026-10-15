import { motion } from 'framer-motion';
import { Users, BedDouble, Clock, Hourglass, Sparkles, MessageCircle, CalendarDays } from 'lucide-react';
import Reveal, { staggerContainer, fadeUp } from '@/components/ui/Reveal';
import CldImage from '@/components/ui/CldImage';
import MountainDivider from '@/components/ui/MountainDivider';
import EventForm from './EventForm';
import useFetch from '@/hooks/useFetch';
import { publicApi } from '@/api/public';
import { useSettingsStore } from '@/store/settingsStore';
import { getIcon } from '@/utils/icons';
import { waLink } from '@/utils/whatsapp';
import { formatDayLong } from '@/utils/format';
import { EVENT_MIN_HOURS } from '@/utils/constants';

const normalizeIncludes = (list = []) => list.map((i) => (typeof i === 'string' ? { label: i, icon: 'Sparkles', badge: '' } : i));

export default function Events() {
  const { events, contact, businessName } = useSettingsStore((s) => s.settings);
  const { data: specials = [] } = useFetch('special-events', publicApi.specialEvents);
  const images = events.images || [];
  const includes = normalizeIncludes(events.includes);
  const minHours = events.minHours || EVENT_MIN_HOURS;

  const conditions = [
    { Icon: Users, label: 'Capacidad', value: `Hasta ${events.capacity || 30} personas` },
    { Icon: Hourglass, label: 'Mínimo', value: `${minHours} horas` },
    { Icon: Clock, label: 'Horarios', value: events.schedule || 'A consultar' },
    ...(events.lodgingOptional ? [{ Icon: BedDouble, label: 'Hospedaje', value: 'Opcional' }] : []),
  ];

  return (
    <section id="eventos" className="relative overflow-hidden bg-madera-dark text-crema">
      <MountainDivider from="#FBF6EC" to="#55331C" accent="#7A4A2A" />
      <div className="textura-tejido absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-tejido/25 blur-3xl" aria-hidden="true" />

      <div className="container-sol relative grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.05fr_1fr] lg:items-start">
        <div>
          <Reveal>
            <p className="font-script text-3xl text-sol-200">Cumpleaños, juntadas y asados</p>
            <h2 className="mt-1 text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl">{events.title}</h2>
            <p className="mt-5 max-w-xl whitespace-pre-line text-lg text-crema/85">{events.text}</p>
          </Reveal>

          <Reveal delay={0.1} className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {conditions.map(({ Icon, label, value }) => (
              <div key={label} className="rounded-3xl bg-crema/10 p-4 ring-1 ring-crema/15">
                <Icon className="h-5 w-5 text-sol" aria-hidden="true" />
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-crema/60">{label}</p>
                <p className="font-serif text-lg font-semibold leading-tight">{value}</p>
              </div>
            ))}
          </Reveal>

          {includes.length > 0 && (
            <>
              <p className="mt-10 font-script text-2xl text-sol-200">Incluye</p>
              <motion.ul
                className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"
                variants={staggerContainer(0.04)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                aria-label="Qué incluye"
              >
                {includes.map((inc) => {
                  const Icon = getIcon(inc.icon);
                  return (
                    <motion.li key={inc.label} variants={fadeUp} className="flex items-center gap-2.5 rounded-2xl bg-crema/10 px-3 py-2.5 ring-1 ring-crema/15">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sol text-carbon">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 font-semibold leading-tight">
                        {inc.label}
                        {inc.badge && <span className="mt-0.5 block w-fit rounded-full bg-cielo px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">{inc.badge}</span>}
                      </span>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </>
          )}

          {images.length > 0 && (
            <div className="mt-10 grid grid-cols-3 gap-3">
              {images.slice(0, 3).map((img, i) => (
                <Reveal key={img._id} delay={i * 0.1} className={`overflow-hidden rounded-3xl ${i === 1 ? 'translate-y-6' : ''}`}>
                  <CldImage src={img.url} alt={img.alt || 'Quincho y pileta de Cabañas del Sol'} width={600} sizes="30vw" className="aspect-[3/4]" />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <Reveal delay={0.15} className="lg:sticky lg:top-24">
          <EventForm capacity={events.capacity || 30} lodgingOptional={events.lodgingOptional} minHours={minHours} />
        </Reveal>
      </div>

      {specials.length > 0 && (
        <div className="container-sol relative pb-16 sm:pb-24">
          <Reveal className="mb-6 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-sol" aria-hidden="true" />
            <h3 className="font-serif text-3xl font-semibold">Fiestas de temporada</h3>
          </Reveal>
          <motion.ul className="grid gap-5 md:grid-cols-2" variants={staggerContainer(0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}>
            {specials.map((ev, i) => (
              <motion.li key={ev._id} variants={fadeUp}>
                <SpecialEventCard ev={ev} index={i} whatsapp={contact.whatsapp} businessName={businessName} />
              </motion.li>
            ))}
          </motion.ul>
        </div>
      )}
      <MountainDivider from="transparent" to="#FBF6EC" accent="#E8893A" className="relative" />
    </section>
  );
}

const FESTIVE = ['from-cerro-profundo via-cerro-noche to-[#0f2416]', 'from-cielo-800 via-[#1b2f55] to-cerro-noche'];

function SpecialEventCard({ ev, index, whatsapp, businessName }) {
  const msg = `¡Hola ${businessName}! 👋 Quiero consultar por la ${ev.title}${ev.date ? ` (${formatDayLong(ev.date)})` : ''}.`;
  return (
    <article className={`group relative flex h-full flex-col overflow-hidden rounded-4xl bg-gradient-to-br ${FESTIVE[index % FESTIVE.length]} shadow-calida-lg ring-1 ring-sol/30`}>
      {ev.image?.url ? (
        <CldImage src={ev.image.url} alt={ev.image.alt || ev.title} width={900} sizes="(max-width: 768px) 100vw, 50vw" className="aspect-[16/9]" imgClassName="transition-transform duration-[1.2s] group-hover:scale-105" />
      ) : (
        <Garland />
      )}
      <div className="relative flex flex-1 flex-col p-6 sm:p-7">
        <p className="font-script text-2xl text-sol-200">Evento especial</p>
        <h4 className="font-serif text-3xl font-semibold leading-tight">{ev.title}</h4>
        {ev.date && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-sol">
            <CalendarDays className="h-4 w-4" aria-hidden="true" /> {formatDayLong(ev.date)}
          </p>
        )}
        {ev.description && <p className="mt-3 text-crema/85">{ev.description}</p>}
        <a href={waLink(whatsapp, msg)} target="_blank" rel="noopener noreferrer" className="btn-sol mt-6 w-full sm:mt-auto sm:w-fit">
          <MessageCircle className="h-5 w-5" aria-hidden="true" /> Consultar por WhatsApp
        </a>
      </div>
    </article>
  );
}

function Garland() {
  const colors = ['#F6B23C', '#F2C230', '#E8893A', '#FBF6EC'];
  return (
    <svg viewBox="0 0 400 90" className="h-24 w-full" aria-hidden="true">
      <path d="M0 18 Q100 60 200 22 T400 20" fill="none" stroke="#FBF6EC" strokeOpacity="0.35" strokeWidth="1.5" />
      {Array.from({ length: 14 }, (_, i) => {
        const x = 14 + i * 28;
        const y = 22 + Math.sin((x / 400) * Math.PI * 2) * -14 + (x < 200 ? (x / 200) * 18 : ((400 - x) / 200) * 14);
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y + 8}
            r="5"
            fill={colors[i % colors.length]}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: (i % 4) * 0.5 }}
          />
        );
      })}
    </svg>
  );
}
