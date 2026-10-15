import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, Eye, EyeOff, Trash2, Plus, MessageCircle, Copy, Info, Users } from 'lucide-react';
import { PageHeader, Card, LoadingBlock, EmptyState, Badge, IconButton, Tabs } from '@/components/admin/ui';
import Modal from '@/components/ui/Modal';
import { Field, Toggle } from '@/components/ui/FormField';
import useFetch, { clearFetchCache } from '@/hooks/useFetch';
import { adminApi } from '@/api/admin';
import { reviewSchema } from '@/schemas/admin.schema';
import { useSettingsStore } from '@/store/settingsStore';
import { formatDay } from '@/utils/format';
import { waLink } from '@/utils/whatsapp';
import { feedbackUrl, feedbackMessage } from '@/utils/feedback';
import { confirmDelete, notifySuccess, toastSuccess, notifyError, handleFormError } from '@/utils/notify';

const TABS = [
  ['respondida', 'Recibidas'],
  ['pendiente', 'Esperando respuesta'],
  ['publicada', 'Publicadas'],
  ['todas', 'Todas'],
];

const Stars = ({ value, size = 'h-4 w-4' }) => (
  <span className="inline-flex gap-0.5" aria-label={`${value} de 5 estrellas`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`${size} ${n <= value ? 'fill-sol text-sol' : 'text-piedra'}`} aria-hidden="true" />
    ))}
  </span>
);

export default function Reviews() {
  const [tab, setTab] = useState('respondida');
  const [adding, setAdding] = useState(false);
  const businessName = useSettingsStore((s) => s.settings.businessName);
  const key = `admin-feedback-${tab}`;
  const { data, loading, reload } = useFetch(key, () => adminApi.feedback.list(tab === 'todas' ? undefined : { status: tab }).then((r) => r.data));
  const { data: all } = useFetch('admin-feedback-todas', () => adminApi.feedback.list().then((r) => r.data));

  const refresh = () => {
    ['respondida', 'pendiente', 'publicada', 'todas'].forEach((t) => clearFetchCache(`admin-feedback-${t}`));
    clearFetchCache('reviews');
    reload();
  };

  const togglePublish = async (r) => {
    try {
      await adminApi.reviews.update(r._id, { active: !r.active });
      notifySuccess(r.active ? 'Reseña ocultada del sitio' : 'Reseña publicada en el sitio');
      refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  const remove = async (r) => {
    if (!(await confirmDelete(`la opinión de ${r.author}`))) return;
    try {
      await adminApi.reviews.remove(r._id);
      notifySuccess('Opinión eliminada');
      refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  const copyLink = async (r) => {
    await navigator.clipboard?.writeText(feedbackUrl(r.token));
    toastSuccess('Link copiado');
  };

  const stats = all?.stats;
  const items = data?.items || [];

  return (
    <>
      <PageHeader
        title="Reseñas y opiniones"
        subtitle="Pedí la opinión de cada huésped al terminar su estadía y hacé el seguimiento acá."
        actions={
          <button type="button" className="btn-outline" onClick={() => setAdding(true)}>
            <Plus className="h-5 w-5" aria-hidden="true" /> Cargar reseña a mano
          </button>
        }
      />

      <Card className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 text-sm text-carbon-light">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-cielo" aria-hidden="true" />
          <p>
            Para pedir una opinión andá a <Link to="/admin/clientes" className="font-semibold text-cielo hover:underline">Clientes</Link> y tocá <b>“Pedir opinión”</b>: se abre WhatsApp con un link personal donde el huésped puntúa y comenta. Las respuestas llegan acá y vos elegís cuáles publicar en el sitio.
          </p>
        </div>
        {stats && (
          <div className="flex shrink-0 gap-6 text-center">
            <div>
              <p className="font-serif text-3xl font-semibold text-cerro-profundo">{stats.average ? stats.average.toLocaleString('es-AR') : '—'}</p>
              <p className="text-xs text-carbon-light">promedio</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-semibold text-cerro-profundo">{stats.answered}</p>
              <p className="text-xs text-carbon-light">opiniones</p>
            </div>
          </div>
        )}
      </Card>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {loading && !data ? (
        <LoadingBlock />
      ) : !items.length ? (
        <EmptyState
          icon={Users}
          title={tab === 'pendiente' ? 'No hay pedidos esperando respuesta' : 'Todavía no hay opiniones acá'}
          text="Pedí la opinión de tus huéspedes desde Clientes."
          action={<Link to="/admin/clientes" className="btn-sol">Ir a Clientes</Link>}
        />
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {items.map((r) => {
            const pending = r.status === 'pendiente';
            return (
              <li key={r._id}>
                <Card className={`flex h-full flex-col !p-5 ${r.active ? 'ring-2 ring-cerro/30' : ''}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-serif text-lg font-semibold text-cerro-profundo">{r.author}</p>
                      <p className="text-xs text-carbon-light">
                        {[r.cabin?.name, r.origin, r.kind === 'manual' ? r.source || 'Carga manual' : null].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {pending ? <Badge tone="yellow">Esperando respuesta</Badge> : r.active ? <Badge tone="green">Publicada</Badge> : <Badge tone="blue">Recibida</Badge>}
                    </div>
                  </div>
                  {pending ? (
                    <p className="mt-3 text-sm text-carbon-light">
                      Pedida el {formatDay(r.requestedAt, { day: 'numeric', month: 'short', year: 'numeric' })}. Todavía no respondió.
                    </p>
                  ) : (
                    <>
                      <div className="mt-3 flex items-center gap-2">
                        {r.rating ? <Stars value={r.rating} /> : null}
                        {(r.submittedAt || r.date) && <span className="text-xs text-carbon-light">{formatDay(r.submittedAt || r.date, { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      </div>
                      {r.text ? <p className="mt-2 whitespace-pre-line text-carbon">“{r.text}”</p> : <p className="mt-2 text-sm italic text-carbon-light">Sólo dejó la puntuación.</p>}
                    </>
                  )}
                  <div className="mt-auto flex flex-wrap items-center justify-end gap-1 pt-4">
                    {pending && r.client?.phone && (
                      <a
                        href={waLink(r.client.phone, feedbackMessage(r.author, feedbackUrl(r.token), businessName))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn !px-3 !py-2 bg-[#25D366] text-sm text-white hover:brightness-95"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" /> Recordar
                      </a>
                    )}
                    {pending && r.token && (
                      <IconButton label="Copiar link" onClick={() => copyLink(r)}>
                        <Copy className="h-4 w-4" />
                      </IconButton>
                    )}
                    {!pending && (
                      <button
                        type="button"
                        onClick={() => togglePublish(r)}
                        disabled={!r.active && !r.text}
                        title={!r.active && !r.text ? 'Sin comentario no se puede publicar' : undefined}
                        className={`btn !px-3 !py-2 text-sm ${r.active ? 'btn-outline' : 'bg-cerro-profundo text-crema hover:bg-cerro-noche'}`}
                      >
                        {r.active ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                        {r.active ? 'Ocultar del sitio' : 'Publicar en el sitio'}
                      </button>
                    )}
                    <IconButton label="Eliminar" tone="danger" onClick={() => remove(r)}>
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
      <ManualModal open={adding} onClose={() => setAdding(false)} onSaved={refresh} />
    </>
  );
}

function ManualModal({ open, onClose, onSaved }) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(reviewSchema), defaultValues: { author: '', origin: '', rating: 5, text: '', source: '', date: '', active: true } });

  const onSubmit = async (v) => {
    try {
      await adminApi.reviews.create(v);
      notifySuccess('Reseña guardada');
      reset();
      onSaved();
      onClose();
    } catch (err) {
      handleFormError(err, setError);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Cargar reseña a mano" size="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field label="Nombre del huésped" error={errors.author?.message}>{(a) => <input className="input" {...a} {...register('author')} />}</Field>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <div>
              <p className="label">Puntuación</p>
              <div role="radiogroup" aria-label="Puntuación" className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={field.value === n} aria-label={`${n} estrellas`} onClick={() => field.onChange(n)} className="p-1">
                    <Star className={`h-7 w-7 ${n <= field.value ? 'fill-sol text-sol' : 'text-piedra'}`} />
                  </button>
                ))}
              </div>
            </div>
          )}
        />
        <Field label="Reseña" error={errors.text?.message}>{(a) => <textarea rows={4} className="input" {...a} {...register('text')} />}</Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="De dónde es (opcional)" error={errors.origin?.message}>{(a) => <input className="input" {...a} {...register('origin')} />}</Field>
          <Field label="Fuente (opcional)" error={errors.source?.message}>{(a) => <input className="input" placeholder="Google, Booking…" {...a} {...register('source')} />}</Field>
        </div>
        <Field label="Fecha (opcional)" error={errors.date?.message}>{(a) => <input type="date" className="input" {...a} {...register('date')} />}</Field>
        <Controller name="active" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Publicar en el sitio" />} />
        <button type="submit" disabled={isSubmitting} className="btn-cerro w-full">Guardar</button>
      </form>
    </Modal>
  );
}
