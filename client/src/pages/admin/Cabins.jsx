import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, GripVertical, Pencil, Trash2, Star, Eye, EyeOff, Users, ExternalLink, Images } from 'lucide-react';
import { PageHeader, Card, LoadingBlock, EmptyState, Badge, IconButton } from '@/components/admin/ui';
import Sortable from '@/components/admin/Sortable';
import CldImage from '@/components/ui/CldImage';
import CabinIllustration from '@/components/illustrations/CabinIllustration';
import useFetch, { clearFetchCache } from '@/hooks/useFetch';
import { adminApi } from '@/api/admin';
import { confirmDelete, notifySuccess, notifyError } from '@/utils/notify';
import { formatPrice } from '@/utils/format';

export default function Cabins() {
  const { data, loading, reload } = useFetch('admin-cabins', () => adminApi.cabins.list().then((r) => r.data));
  const [items, setItems] = useState([]);
  useEffect(() => setItems((data || []).map((c) => ({ ...c, id: c._id }))), [data]);

  const refresh = () => {
    clearFetchCache('admin-cabins');
    clearFetchCache('cabins');
    reload();
  };

  const reorder = async (next) => {
    setItems(next);
    try {
      // Pocas cabañas: actualizamos sólo las que cambiaron de posición
      await Promise.all(next.map((c, order) => (c.order !== order ? adminApi.cabins.update(c._id, { order }) : null)));
      notifySuccess('Orden guardado');
      refresh();
    } catch (err) {
      notifyError(err);
      refresh();
    }
  };

  const toggle = async (cabin, field) => {
    try {
      await adminApi.cabins.update(cabin._id, { [field]: !cabin[field] });
      refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  const remove = async (cabin) => {
    if (!(await confirmDelete(cabin.name, 'Se borran también todas sus fotos de Cloudinary. Esta acción no se puede deshacer.'))) return;
    try {
      await adminApi.cabins.remove(cabin._id);
      notifySuccess('Cabaña eliminada');
      refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <>
      <PageHeader
        title="Cabañas"
        subtitle="Arrastrá las tarjetas para cambiar el orden en el que aparecen en el sitio."
        actions={
          <Link to="/admin/cabanas/nueva" className="btn-sol">
            <Plus className="h-5 w-5" aria-hidden="true" /> Nueva cabaña
          </Link>
        }
      />
      {loading && !data ? (
        <LoadingBlock />
      ) : !items.length ? (
        <EmptyState title="Todavía no hay cabañas" text="Cargá la primera para que aparezca en el sitio." action={<Link to="/admin/cabanas/nueva" className="btn-sol">Crear cabaña</Link>} />
      ) : (
        <Sortable items={items} onReorder={reorder} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {(cabin, handle, dragging) => (
            <Card className={`!p-0 overflow-hidden ${dragging ? 'ring-2 ring-sol' : ''} ${cabin.active ? '' : 'opacity-70'}`}>
              <div className="relative aspect-[16/10]">
                {cabin.cover ? (
                  <CldImage src={cabin.cover.url} alt={cabin.name} width={600} sizes="33vw" className="h-full w-full" />
                ) : (
                  <CabinIllustration variant={cabin.order} className="h-full w-full" />
                )}
                <button type="button" {...handle} className="absolute left-3 top-3 cursor-grab rounded-full bg-white/90 p-2 shadow active:cursor-grabbing" aria-label={`Mover ${cabin.name}`}>
                  <GripVertical className="h-4 w-4" />
                </button>
                <div className="absolute right-3 top-3 flex gap-1.5">
                  {cabin.featured && <Badge tone="yellow">Destacada</Badge>}
                  {!cabin.active && <Badge tone="gray">Oculta</Badge>}
                </div>
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-carbon/70 px-2.5 py-1 text-xs font-semibold text-white">
                  <Images className="h-3.5 w-3.5" aria-hidden="true" /> {cabin.images.length} fotos
                </span>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-semibold text-cerro-profundo">{cabin.name}</h2>
                <p className="mt-1 flex items-center gap-3 text-sm text-carbon-light">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-4 w-4" aria-hidden="true" /> Hasta {cabin.capacity}
                  </span>
                  {cabin.price?.amount ? <span>{formatPrice(cabin.price.amount)}/noche {cabin.price.show ? '' : '(oculto)'}</span> : null}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-crema-dark pt-3">
                  <div className="flex">
                    <IconButton label={cabin.featured ? 'Quitar de destacadas' : 'Destacar'} onClick={() => toggle(cabin, 'featured')}>
                      <Star className={`h-4 w-4 ${cabin.featured ? 'fill-sol text-sol' : ''}`} />
                    </IconButton>
                    <IconButton label={cabin.active ? 'Ocultar del sitio' : 'Mostrar en el sitio'} onClick={() => toggle(cabin, 'active')}>
                      {cabin.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </IconButton>
                    <a href={`/cabanas/${cabin.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-carbon-light hover:bg-crema-dark" aria-label="Ver en el sitio" title="Ver en el sitio">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <div className="flex">
                    <Link to={`/admin/cabanas/${cabin._id}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-carbon-light hover:bg-crema-dark" aria-label={`Editar ${cabin.name}`} title="Editar">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <IconButton label="Eliminar" tone="danger" onClick={() => remove(cabin)}>
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </Sortable>
      )}
    </>
  );
}
