import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, MessageSquareText, Star, CalendarRange } from 'lucide-react';
import { PageHeader, Card, LoadingBlock, EmptyState, Badge, IconButton } from '@/components/admin/ui';
import CldImage from '@/components/ui/CldImage';
import useFetch, { clearFetchCache } from '@/hooks/useFetch';
import { adminApi } from '@/api/admin';
import { usePromoStore } from '@/store/promoStore';
import { confirmDelete, notifySuccess, notifyError } from '@/utils/notify';
import { formatDay, promoBadge } from '@/utils/format';
import { SEASONS } from '@/utils/constants';

export const promoStatus = (p, now = new Date()) => {
  if (!p.active) return ['Inactiva', 'gray'];
  if (p.startDate && new Date(p.startDate) > now) return ['Programada', 'blue'];
  if (p.endDate && new Date(p.endDate) < now) return ['Vencida', 'red'];
  return ['Vigente', 'green'];
};

export default function Promotions() {
  const { data, loading, reload } = useFetch('admin-promos', () => adminApi.promotions.list().then((r) => r.data));

  const refresh = () => {
    clearFetchCache('admin-promos');
    usePromoStore.setState({ loaded: false });
    reload();
  };

  const remove = async (p) => {
    if (!(await confirmDelete(`la promo “${p.title}”`, 'Se borra también su imagen. Las consultas que generó se conservan.'))) return;
    try {
      await adminApi.promotions.remove(p._id);
      notifySuccess('Promoción eliminada');
      refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <>
      <PageHeader
        title="Promociones"
        subtitle="Se activan y desactivan solas según sus fechas."
        actions={
          <Link to="/admin/promociones/nueva" className="btn-sol">
            <Plus className="h-5 w-5" aria-hidden="true" /> Nueva promo
          </Link>
        }
      />
      {loading && !data ? (
        <LoadingBlock />
      ) : !data?.length ? (
        <EmptyState title="Sin promociones" text="Creá la primera: aparece en el sitio con su propio botón de WhatsApp." action={<Link to="/admin/promociones/nueva" className="btn-sol">Crear promo</Link>} />
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.map((p) => {
            const [label, tone] = promoStatus(p);
            return (
              <li key={p._id}>
                <Card className="!p-0 flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-[16/9] bg-atardecer">
                    {p.image?.url && <CldImage src={p.image.url} alt={p.title} width={600} sizes="33vw" className="h-full w-full" />}
                    <span className="absolute left-3 top-3 rounded-full bg-sol px-3 py-1 font-serif font-bold shadow">{promoBadge(p)}</span>
                    <div className="absolute right-3 top-3 flex gap-1.5">
                      <Badge tone={tone}>{label}</Badge>
                      {p.featured && (
                        <Badge tone="yellow">
                          <Star className="h-3 w-3 fill-current" aria-hidden="true" /> Banner
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-xl font-semibold text-cerro-profundo">{p.title}</h2>
                    <ul className="mt-2 space-y-1 text-sm text-carbon-light">
                      <li className="flex items-center gap-1.5">
                        <CalendarRange className="h-4 w-4" aria-hidden="true" />
                        {p.startDate || p.endDate ? `${p.startDate ? formatDay(p.startDate, { day: 'numeric', month: 'short' }) : 'Ya'} → ${p.endDate ? formatDay(p.endDate, { day: 'numeric', month: 'short', year: 'numeric' }) : 'sin fecha de fin'}` : 'Sin fechas (siempre vigente)'}
                      </li>
                      <li>{p.appliesToAll ? 'Todas las cabañas' : p.cabins.map((c) => c.name).join(', ')} · {SEASONS[p.season]}</li>
                      <li className="flex items-center gap-1.5 font-semibold text-carbon">
                        <MessageSquareText className="h-4 w-4 text-tejido-ink" aria-hidden="true" /> {p.inquiriesCount} {p.inquiriesCount === 1 ? 'consulta' : 'consultas'}
                      </li>
                    </ul>
                    <div className="mt-auto flex justify-end gap-1 pt-4">
                      <Link to={`/admin/promociones/${p._id}`} className="btn-outline !px-4 !py-2 text-sm">
                        <Pencil className="h-4 w-4" aria-hidden="true" /> Editar
                      </Link>
                      <IconButton label="Eliminar" tone="danger" onClick={() => remove(p)}>
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
