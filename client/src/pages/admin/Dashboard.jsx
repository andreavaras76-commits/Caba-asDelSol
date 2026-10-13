import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, CalendarRange, CalendarClock, Inbox, Home, Gift, ArrowRight, RefreshCw } from 'lucide-react';
import { PageHeader, Card, LoadingBlock, EmptyState, Badge, INQUIRY_TONES } from '@/components/admin/ui';
import { InquirySummary } from '@/components/admin/InquiryRow';
import useFetch from '@/hooks/useFetch';
import { adminApi } from '@/api/admin';
import { INQUIRY_STATUS } from '@/utils/constants';

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch('admin-stats', () => adminApi.inquiries.stats().then((r) => r.data));

  if (loading && !data) return <LoadingBlock />;
  if (error && !data) return <EmptyState title="No pudimos cargar el resumen" text={error.message} action={<button className="btn-sol" onClick={reload}>Reintentar</button>} />;

  const { counts, byStatus, topCabins, topPromos, latest } = data;
  const cards = [
    { label: 'Hoy', value: counts.today, icon: CalendarDays, color: 'bg-sol text-carbon' },
    { label: 'Esta semana', value: counts.week, icon: CalendarRange, color: 'bg-cielo text-white' },
    { label: 'Este mes', value: counts.month, icon: CalendarClock, color: 'bg-cerro text-white' },
    { label: 'Total', value: counts.total, icon: Inbox, color: 'bg-madera text-crema' },
  ];
  const totalStatus = Object.values(byStatus).reduce((a, b) => a + b, 0) || 1;

  return (
    <>
      <PageHeader
        title="Resumen"
        subtitle="Así vienen las consultas que llegan desde el sitio."
        actions={
          <button type="button" onClick={reload} className="btn-outline !py-2 text-sm">
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Actualizar
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="flex items-center gap-4">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${c.color}`}>
                <c.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="font-serif text-3xl font-semibold leading-none">{c.value}</p>
                <p className="mt-1 text-sm text-carbon-light">{c.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="text-xl font-semibold text-cerro-profundo">Estado de las consultas</h2>
          <ul className="mt-4 space-y-3">
            {Object.entries(INQUIRY_STATUS).map(([key, label]) => {
              const n = byStatus[key] || 0;
              return (
                <li key={key}>
                  <div className="flex justify-between text-sm">
                    <Badge tone={INQUIRY_TONES[key]}>{label}</Badge>
                    <span className="font-semibold">{n}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-crema-dark">
                    <motion.div className="h-full rounded-full bg-sol" initial={{ width: 0 }} animate={{ width: `${(n / totalStatus) * 100}%` }} transition={{ duration: 0.8 }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
        <TopList title="Cabaña más consultada" icon={Home} items={topCabins} empty="Todavía no hay consultas por cabañas." />
        <TopList title="Promo más consultada" icon={Gift} items={topPromos} empty="Ninguna promo recibió consultas todavía." />
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-cerro-profundo">Últimas consultas</h2>
          <Link to="/admin/consultas" className="inline-flex items-center gap-1 text-sm font-bold text-tejido-ink hover:underline">
            Ver todas <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {latest.length ? (
          <ul className="divide-y divide-crema-dark">
            {latest.map((inq) => (
              <li key={inq._id} className="py-3">
                <InquirySummary inquiry={inq} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState inline title="Sin consultas todavía" text="Cuando alguien consulte desde el sitio, aparece acá." />
        )}
      </Card>
    </>
  );
}

function TopList({ title, icon: Icon, items, empty }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <Card>
      <h2 className="flex items-center gap-2 text-xl font-semibold text-cerro-profundo">
        <Icon className="h-5 w-5 text-tejido-ink" aria-hidden="true" /> {title}
      </h2>
      <p className="text-xs text-carbon-light">Últimos 30 días</p>
      {items.length ? (
        <ol className="mt-4 space-y-3">
          {items.map((it, i) => (
            <li key={it._id}>
              <div className="flex justify-between gap-2 text-sm">
                <span className={`truncate ${i === 0 ? 'font-bold' : ''}`}>
                  {i === 0 && '🏆 '}
                  {it.name || '(eliminada)'}
                </span>
                <span className="font-semibold">{it.count}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-crema-dark">
                <motion.div className={`h-full rounded-full ${i === 0 ? 'bg-cerro' : 'bg-cerro/40'}`} initial={{ width: 0 }} animate={{ width: `${(it.count / max) * 100}%` }} transition={{ duration: 0.8 }} />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-6 text-sm text-carbon-light">{empty}</p>
      )}
    </Card>
  );
}
