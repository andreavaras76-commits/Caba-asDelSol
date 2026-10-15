import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Plus, Trash2, Save, Loader2, Info } from 'lucide-react';
import { PageHeader, Card, LoadingBlock, IconButton } from '@/components/admin/ui';
import CabinGallery from '@/components/admin/CabinGallery';
import Chips from '@/components/admin/Chips';
import { Field, Toggle } from '@/components/ui/FormField';
import { cabinSchema } from '@/schemas/admin.schema';
import { adminApi } from '@/api/admin';
import { clearFetchCache } from '@/hooks/useFetch';
import { useSettingsStore } from '@/store/settingsStore';
import { AMENITIES, BED_TYPES, BED_LOCATIONS, CABIN_TYPES, SLEEPING_OPTIONS } from '@/utils/constants';
import { getIcon } from '@/utils/icons';
import slugify from '@/utils/slugify';
import { notifySuccess, notifyError, handleFormError } from '@/utils/notify';

const DEFAULTS = {
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  capacity: 2,
  rooms: 1,
  bathrooms: 1,
  type: 'dormitorio',
  beds: [
    { type: 'matrimonial', quantity: 1, location: 'dormitorio' },
    { type: 'marinera', quantity: 1, location: 'cocina_comedor' },
  ],
  privateBathroom: true,
  electricWaterHeater: true,
  sleepingOptions: ['matrimonial', 'individuales'],
  amenities: ['wifi', 'tv'],
  price: { amount: '', show: false },
  featured: false,
  active: true,
  order: 0,
};

const toForm = (c) => ({
  name: c.name,
  slug: c.slug,
  shortDescription: c.shortDescription || '',
  description: c.description || '',
  capacity: c.capacity,
  rooms: c.rooms,
  bathrooms: c.bathrooms,
  type: c.type || 'dormitorio',
  beds: (c.beds || []).map((b) => ({ type: b.type, quantity: b.quantity, location: b.location || 'dormitorio' })),
  privateBathroom: c.privateBathroom ?? true,
  electricWaterHeater: c.electricWaterHeater ?? true,
  sleepingOptions: c.sleepingOptions || [],
  amenities: c.amenities || [],
  price: { amount: c.price?.amount ?? '', show: Boolean(c.price?.show) },
  featured: c.featured,
  active: c.active,
  order: c.order,
});

const amenityOptions = Object.entries(AMENITIES).map(([value, a]) => ({ value, label: a.label, icon: getIcon(a.icon) }));
const sleepingOptions = Object.entries(SLEEPING_OPTIONS).map(([value, label]) => ({ value, label }));
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function CabinForm() {
  const { id } = useParams();
  const isNew = id === 'nueva';
  const navigate = useNavigate();
  const showPricesGlobal = useSettingsStore((s) => s.settings.showPrices);
  const [cabin, setCabin] = useState(null);
  const [loading, setLoading] = useState(!isNew);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
  } = useForm({ resolver: zodResolver(cabinSchema), defaultValues: DEFAULTS });
  const beds = useFieldArray({ control, name: 'beds' });

  useEffect(() => {
    if (isNew) return;
    adminApi.cabins
      .get(id)
      .then((r) => {
        setCabin(r.data);
        reset(toForm(r.data));
      })
      .catch((err) => {
        notifyError(err);
        navigate('/admin/cabanas');
      })
      .finally(() => setLoading(false));
  }, [id, isNew, reset, navigate]);

  const name = watch('name');
  useEffect(() => {
    if (isNew && !dirtyFields.slug) setValue('slug', slugify(name || ''));
  }, [name, isNew, dirtyFields.slug, setValue]);

  const onSubmit = async (values) => {
    const payload = { ...values, price: { amount: values.price.amount ?? null, show: values.price.show } };
    try {
      const res = isNew ? await adminApi.cabins.create(payload) : await adminApi.cabins.update(id, payload);
      clearFetchCache('admin-cabins');
      clearFetchCache('cabins');
      notifySuccess(res.message);
      if (isNew) navigate(`/admin/cabanas/${res.data._id}`, { replace: true });
      else {
        setCabin(res.data);
        reset(toForm(res.data));
      }
    } catch (err) {
      handleFormError(err, setError);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <>
      <Link to="/admin/cabanas" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-carbon-light hover:text-carbon">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Cabañas
      </Link>
      <PageHeader title={isNew ? 'Nueva cabaña' : cabin?.name} subtitle={isNew ? 'Primero guardá los datos; después vas a poder subir las fotos.' : undefined} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" error={errors.name?.message}>
              {(a) => <input className="input" {...a} {...register('name')} />}
            </Field>
            <Field label="Slug (URL)" hint={`/cabanas/${watch('slug') || '…'}`} error={errors.slug?.message}>
              {(a) => <input className="input" {...a} {...register('slug')} />}
            </Field>
            <Field label="Descripción corta" hint="Aparece en la tarjeta (1 o 2 líneas)." error={errors.shortDescription?.message} className="sm:col-span-2">
              {(a) => <input className="input" maxLength={300} {...a} {...register('shortDescription')} />}
            </Field>
            <Field label="Descripción completa" error={errors.description?.message} className="sm:col-span-2">
              {(a) => <textarea rows={6} className="input" {...a} {...register('description')} />}
            </Field>
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-semibold text-cerro-profundo">Distribución y camas</h2>
            <Field label="Tipo de cabaña" error={errors.type?.message} className="mb-4">
              {(a) => (
                <select className="input" {...a} {...register('type')}>
                  {Object.entries(CABIN_TYPES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              )}
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Huéspedes máx." error={errors.capacity?.message}>
                {(a) => <input type="number" inputMode="numeric" min={1} max={30} className="input" {...a} {...register('capacity')} />}
              </Field>
              <Field label="Ambientes" error={errors.rooms?.message}>
                {(a) => <input type="number" inputMode="numeric" min={1} className="input" {...a} {...register('rooms')} />}
              </Field>
              <Field label="Baños" error={errors.bathrooms?.message}>
                {(a) => <input type="number" inputMode="numeric" min={0} className="input" {...a} {...register('bathrooms')} />}
              </Field>
            </div>
            <p className="label mt-5">Camas</p>
            <ul className="space-y-2">
              {beds.fields.map((f, i) => (
                <li key={f.id} className="flex flex-wrap items-start gap-2 sm:flex-nowrap">
                  <select className="input min-w-0 flex-1" aria-label={`Ambiente de la cama ${i + 1}`} {...register(`beds.${i}.location`)}>
                    {Object.entries(BED_LOCATIONS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <select className="input min-w-0 flex-1" aria-label={`Tipo de cama ${i + 1}`} {...register(`beds.${i}.type`)}>
                    {Object.entries(BED_TYPES).map(([k, b]) => (
                      <option key={k} value={k}>{cap(b.label)}</option>
                    ))}
                  </select>
                  <input type="number" min={1} max={10} className="input !w-20" aria-label="Cantidad" {...register(`beds.${i}.quantity`)} />
                  <IconButton label="Quitar cama" tone="danger" className="mt-1.5" onClick={() => beds.remove(i)}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </li>
              ))}
            </ul>
            {errors.beds && <p className="error-text">{errors.beds.message || errors.beds.find?.((b) => b)?.quantity?.message}</p>}
            <button type="button" onClick={() => beds.append({ type: 'individual', quantity: 1, location: watch('type') === 'monoambiente' ? 'monoambiente' : 'dormitorio' })} className="btn-outline mt-3 !py-2 text-sm">
              <Plus className="h-4 w-4" aria-hidden="true" /> Agregar cama
            </button>

            <div className="mt-6 grid gap-3 border-t border-crema-dark pt-5 sm:grid-cols-2">
              <Controller name="privateBathroom" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Baño privado" />} />
              <Controller name="electricWaterHeater" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Termotanque eléctrico" />} />
            </div>
            <p className="mt-2 text-xs text-carbon-light">Con cualquiera de los dos activos, el sitio muestra “Baño privado · Termotanque eléctrico · Todo individual”.</p>

            <p className="label mt-5">Opciones de cama al consultar</p>
            <p className="-mt-1 mb-2 text-xs text-carbon-light">Lo que el huésped puede elegir en “¿Cómo preferís dormir?”. Sin opciones, el selector no aparece.</p>
            <Controller name="sleepingOptions" control={control} render={({ field }) => <Chips options={sleepingOptions} value={field.value} onChange={field.onChange} label="Opciones de cama" />} />
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-semibold text-cerro-profundo">Comodidades</h2>
            <Controller name="amenities" control={control} render={({ field }) => <Chips options={amenityOptions} value={field.value} onChange={field.onChange} label="Comodidades" />} />
          </Card>

          {!isNew && cabin && <CabinGallery cabin={cabin} onChange={(c) => { setCabin(c); clearFetchCache('admin-cabins'); clearFetchCache('cabins'); }} />}
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-cerro-profundo">Publicación</h2>
            <Controller name="active" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Visible en el sitio" />} />
            <Controller name="featured" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Destacada" />} />
          </Card>
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-cerro-profundo">Precio de referencia</h2>
            <Field label="Desde $ por noche (opcional)" error={errors.price?.amount?.message}>
              {(a) => <input type="number" inputMode="numeric" min={0} className="input" placeholder="Ej: 45000" {...a} {...register('price.amount')} />}
            </Field>
            <Controller name="price.show" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Mostrar el precio" />} />
            {!showPricesGlobal && (
              <p className="flex gap-2 rounded-2xl bg-cielo-50 p-3 text-xs text-cielo-700">
                <Info className="h-4 w-4 shrink-0" aria-hidden="true" /> Los precios están ocultos en todo el sitio desde Configuración. Aunque actives este switch, no se van a ver hasta habilitarlos ahí.
              </p>
            )}
          </Card>
          <button type="submit" disabled={isSubmitting || (!isNew && !isDirty)} className="btn-sol w-full !py-4">
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {isNew ? 'Crear cabaña' : isDirty ? 'Guardar cambios' : 'Sin cambios'}
          </button>
        </div>
      </form>
    </>
  );
}
