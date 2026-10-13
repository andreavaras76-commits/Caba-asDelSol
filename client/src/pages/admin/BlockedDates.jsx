import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarX2, Trash2, Plus, Loader2 } from 'lucide-react';
import { PageHeader, Card, LoadingBlock, EmptyState, IconButton } from '@/components/admin/ui';
import { Field } from '@/components/ui/FormField';
import useFetch, { clearFetchCache } from '@/hooks/useFetch';
import { adminApi } from '@/api/admin';
import { blockedDateSchema } from '@/schemas/admin.schema';
import { formatDay, todayISO, nightsBetween, isoToInputUTC } from '@/utils/format';
import { confirmDelete, notifySuccess, notifyError, handleFormError } from '@/utils/notify';

/** Rangos ocupados por cabaña: el formulario público muestra "sin disponibilidad" */
export default function BlockedDates() {
  const [onlyUpcoming, setOnlyUpcoming] = useState(true);
  const key = `admin-blocked-${onlyUpcoming}`;
  const { data, loading, reload } = useFetch(key, () => adminApi.blockedDates.list(onlyUpcoming ? { upcoming: 'true' } : undefined).then((r) => r.data));
  const { data: cabins = [] } = useFetch('admin-cabins', () => adminApi.cabins.list().then((r) => r.data));

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(blockedDateSchema), defaultValues: { cabin: '', startDate: '', endDate: '', reason: '' } });

  const refresh = () => {
    clearFetchCache('admin-blocked-true');
    clearFetchCache('admin-blocked-false');
    cabins.forEach((c) => clearFetchCache(`blocked-${c._id}`));
    reload();
  };

  const onSubmit = async (v) => {
    try {
      await adminApi.blockedDates.create(v);
      notifySuccess('Fechas bloqueadas');
      reset({ cabin: v.cabin, startDate: '', endDate: '', reason: '' });
      refresh();
    } catch (err) {
      handleFormError(err, setError);
    }
  };

  const remove = async (b) => {
    if (!(await confirmDelete('este bloqueo', 'Esas fechas vuelven a figurar como disponibles.'))) return;
    try {
      await adminApi.blockedDates.remove(b._id);
      notifySuccess('Bloqueo eliminado');
      refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  const start = watch('startDate');
  const end = watch('endDate');
  const nights = start && end && end > start ? nightsBetween(start, end) : 0;

  // Agrupado por cabaña
  const groups = (data || []).reduce((acc, b) => {
    const k = b.cabin?._id || 'x';
    (acc[k] ||= { cabin: b.cabin, items: [] }).items.push(b);
    return acc;
  }, {});

  return (
    <>
      <PageHeader title="Fechas bloqueadas" subtitle="Marcá rangos ocupados: el formulario de esa cabaña avisa que no hay disponibilidad." />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="mb-4 text-xl font-semibold text-cerro-profundo">Bloquear fechas</h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Field label="Cabaña" error={errors.cabin?.message}>
              {(a) => (
                <select className="input" {...a} {...register('cabin')}>
                  <option value="">Elegí una cabaña</option>
                  {cabins.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              )}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Entrada" error={errors.startDate?.message}>
                {(a) => <input type="date" min={todayISO()} className="input" {...a} {...register('startDate')} />}
              </Field>
              <Field label="Salida" error={errors.endDate?.message}>
                {(a) => <input type="date" min={start || todayISO()} className="input" {...a} {...register('endDate')} />}
              </Field>
            </div>
            {nights > 0 && <p className="text-sm font-semibold text-cerro">{nights} {nights === 1 ? 'noche bloqueada' : 'noches bloqueadas'} (el día de salida queda libre)</p>}
            <Field label="Motivo (opcional)" hint="Sólo lo ve el equipo." error={errors.reason?.message}>
              {(a) => <input className="input" placeholder="Ej: Reserva de Juan" maxLength={120} {...a} {...register('reason')} />}
            </Field>
            <button type="submit" disabled={isSubmitting} className="btn-cerro w-full">
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />} Bloquear
            </button>
          </form>
        </Card>

        <div>
          <label className="mb-4 inline-flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={onlyUpcoming} onChange={(e) => setOnlyUpcoming(e.target.checked)} className="h-4 w-4 accent-cerro" />
            Sólo próximos
          </label>
          {loading && !data ? (
            <LoadingBlock />
          ) : !data?.length ? (
            <EmptyState icon={CalendarX2} title="No hay fechas bloqueadas" text="Todas las cabañas figuran disponibles." />
          ) : (
            <div className="space-y-4">
              {Object.values(groups).map(({ cabin, items }) => (
                <Card key={cabin?._id || 'x'}>
                  <h3 className="mb-3 text-lg font-semibold text-cerro-profundo">{cabin?.name || 'Cabaña eliminada'}</h3>
                  <ul className="divide-y divide-crema-dark">
                    {items.map((b) => (
                      <li key={b._id} className="flex items-center justify-between gap-3 py-2.5">
                        <div>
                          <p className="font-semibold">
                            {formatDay(b.startDate)} → {formatDay(b.endDate)}
                          </p>
                          <p className="text-sm text-carbon-light">
                            {nightsBetween(isoToInputUTC(b.startDate), isoToInputUTC(b.endDate))} noches{b.reason ? ` · ${b.reason}` : ''}
                          </p>
                        </div>
                        <IconButton label="Eliminar bloqueo" tone="danger" onClick={() => remove(b)}>
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
