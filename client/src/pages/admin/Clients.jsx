import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Pencil, Trash2, MessageCircle, Users, Star, MessageSquareHeart } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { requestFeedback } from '@/utils/feedback';
import { PageHeader, Card, LoadingBlock, EmptyState, IconButton, Badge } from '@/components/admin/ui';
import Chips from '@/components/admin/Chips';
import Modal from '@/components/ui/Modal';
import { Field } from '@/components/ui/FormField';
import useFetch, { clearFetchCache, useDebounced } from '@/hooks/useFetch';
import { adminApi } from '@/api/admin';
import { clientSchema } from '@/schemas/admin.schema';
import { CLIENT_TAGS } from '@/utils/constants';
import { formatDay, isoToInputUTC } from '@/utils/format';
import { waLink, normalizeArPhone } from '@/utils/whatsapp';
import { confirmDelete, notifySuccess, toastSuccess, notifyError, handleFormError } from '@/utils/notify';

const tagOptions = Object.entries(CLIENT_TAGS).map(([value, label]) => ({ value, label }));
const TAG_TONES = { familia: 'blue', pareja: 'orange', eventos: 'yellow', mascota: 'green' };

export const prettyPhone = (p = '') => (p.startsWith('549') ? `+54 9 ${p.slice(3, 6)} ${p.slice(6, 9)}-${p.slice(9)}` : `+${p}`);

export default function Clients() {
  const [q, setQ] = useState('');
  const [tags, setTags] = useState([]);
  const [editing, setEditing] = useState(null);
  const query = useDebounced(q);
  const params = { q: query || undefined, tags: tags.join(',') || undefined, limit: 100 };
  const key = `admin-clients-${JSON.stringify(params)}`;
  const { data, loading, reload } = useFetch(key, () => adminApi.clients.list(params).then((r) => r.data));
  const { data: cabins = [] } = useFetch('admin-cabins', () => adminApi.cabins.list().then((r) => r.data));

  const refresh = () => {
    clearFetchCache(key);
    reload();
  };

  const businessName = useSettingsStore((s) => s.settings.businessName);
  const askFeedback = async (c) => {
    try {
      await requestFeedback(c, businessName);
      toastSuccess(`Pedido de opinión enviado a ${c.name.split(' ')[0]}`);
      refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  const remove = async (c) => {
    if (!(await confirmDelete(`a ${c.name}`, 'Se borra de la base de clientes.'))) return;
    try {
      await adminApi.clients.remove(c._id);
      notifySuccess('Cliente eliminado');
      refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle="Tu base de huéspedes. También podés crearlos desde una consulta con un clic."
        actions={
          <button type="button" className="btn-sol" onClick={() => setEditing('new')}>
            <Plus className="h-5 w-5" aria-hidden="true" /> Nuevo cliente
          </button>
        }
      />
      <Card className="mb-6 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-carbon-light" aria-hidden="true" />
          <input className="input pl-10" placeholder="Buscar por nombre, teléfono o notas" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar clientes" />
        </div>
        <Chips options={tagOptions} value={tags} onChange={setTags} label="Filtrar por etiqueta" />
      </Card>

      {loading && !data ? (
        <LoadingBlock />
      ) : !data?.items.length ? (
        <EmptyState icon={Users} title={q || tags.length ? 'Nadie con esos filtros' : 'Todavía no hay clientes'} text="Cargalos a mano o convertí una consulta en cliente desde Consultas." />
      ) : (
        <>
          <p className="mb-3 text-sm text-carbon-light">{data.total} {data.total === 1 ? 'cliente' : 'clientes'}</p>
          <ul className="grid gap-3 md:grid-cols-2">
            {data.items.map((c) => (
              <li key={c._id}>
                <Card className="flex h-full flex-col !p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-serif text-lg font-semibold text-cerro-profundo">{c.name}</p>
                      <p className="text-sm text-carbon-light">{prettyPhone(c.phone)}</p>
                    </div>
                    <div className="flex">
                      <a href={waLink(c.phone, `¡Hola ${c.name.split(' ')[0]}! 👋`)} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#1da851] hover:bg-cerro-50" aria-label={`Escribirle a ${c.name}`} title="WhatsApp">
                        <MessageCircle className="h-4 w-4" />
                      </a>
                      <IconButton label="Editar" onClick={() => setEditing(c)}>
                        <Pencil className="h-4 w-4" />
                      </IconButton>
                      <IconButton label="Eliminar" tone="danger" onClick={() => remove(c)}>
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.tags.map((t) => (
                      <Badge key={t} tone={TAG_TONES[t]}>{CLIENT_TAGS[t]}</Badge>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-carbon-light">
                    {[c.cabin?.name && `🏡 ${c.cabin.name}`, c.lastStay && `Última estadía: ${formatDay(c.lastStay, { day: 'numeric', month: 'short', year: 'numeric' })}`, c.promotionsSent.length && `${c.promotionsSent.length} promos enviadas`].filter(Boolean).join(' · ')}
                  </p>
                  {c.notes && <p className="mt-2 line-clamp-2 rounded-xl bg-crema p-2 text-sm">📝 {c.notes}</p>}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-crema-dark pt-3">
                    <span className="text-xs text-carbon-light">
                      {c.lastRating ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-carbon">
                          <Star className="h-3.5 w-3.5 fill-sol text-sol" aria-hidden="true" /> {c.lastRating}/5
                          <span className="font-normal text-carbon-light">· opinó el {formatDay(c.lastFeedbackAt, { day: 'numeric', month: 'short' })}</span>
                        </span>
                      ) : c.feedbackRequestedAt ? (
                        `Opinión pedida el ${formatDay(c.feedbackRequestedAt, { day: 'numeric', month: 'short' })}`
                      ) : (
                        'Sin opinión todavía'
                      )}
                    </span>
                    <button type="button" onClick={() => askFeedback(c)} className="btn !px-3 !py-1.5 bg-sol-100 text-sm text-madera hover:bg-sol-200">
                      <MessageSquareHeart className="h-4 w-4" aria-hidden="true" /> {c.feedbackRequestedAt && !c.lastRating ? 'Volver a pedir' : 'Pedir opinión'}
                    </button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
      <ClientModal client={editing} cabins={cabins} onClose={() => setEditing(null)} onSaved={refresh} />
    </>
  );
}

function ClientModal({ client, cabins, onClose, onSaved }) {
  const isNew = client === 'new';
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(clientSchema),
    values: client
      ? isNew
        ? { name: '', phone: '', cabin: '', lastStay: '', notes: '', tags: [] }
        : { name: client.name, phone: client.phone, cabin: client.cabin?._id || '', lastStay: isoToInputUTC(client.lastStay), notes: client.notes || '', tags: client.tags }
      : undefined,
  });

  const onSubmit = async (v) => {
    const payload = { ...v, phone: normalizeArPhone(v.phone), cabin: v.cabin || null, lastStay: v.lastStay || null };
    try {
      const res = isNew ? await adminApi.clients.create(payload) : await adminApi.clients.update(client._id, payload);
      notifySuccess(res.message);
      onSaved();
      onClose();
    } catch (err) {
      handleFormError(err, setError);
    }
  };

  return (
    <Modal open={Boolean(client)} onClose={onClose} title={isNew ? 'Nuevo cliente' : 'Editar cliente'} size="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field label="Nombre" error={errors.name?.message}>
          {(a) => <input className="input" {...a} {...register('name')} />}
        </Field>
        <Field label="WhatsApp" hint="Como lo tengas: (0381) 15-555-5555 o 5493815555555. Lo pasamos al formato de WhatsApp." error={errors.phone?.message}>
          {(a) => <input type="tel" className="input" {...a} {...register('phone')} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cabaña en la que se hospedó" error={errors.cabin?.message}>
            {(a) => (
              <select className="input" {...a} {...register('cabin')}>
                <option value="">—</option>
                {cabins.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Última estadía" error={errors.lastStay?.message}>
            {(a) => <input type="date" className="input" {...a} {...register('lastStay')} />}
          </Field>
        </div>
        <div>
          <p className="label">Etiquetas</p>
          <Controller name="tags" control={control} render={({ field }) => <Chips options={tagOptions} value={field.value} onChange={field.onChange} label="Etiquetas" />} />
        </div>
        <Field label="Notas" error={errors.notes?.message}>
          {(a) => <textarea rows={3} className="input" {...a} {...register('notes')} />}
        </Field>
        <button type="submit" disabled={isSubmitting} className="btn-cerro w-full">{isNew ? 'Guardar cliente' : 'Guardar cambios'}</button>
      </form>
    </Modal>
  );
}
