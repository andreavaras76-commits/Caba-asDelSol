import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Loader2, Trash2, Eye } from 'lucide-react';
import { PageHeader, Card, LoadingBlock, Badge } from '@/components/admin/ui';
import ImageDropzone from '@/components/admin/ImageDropzone';
import Chips from '@/components/admin/Chips';
import PromoCard from '@/components/public/PromoCard';
import { Field, Toggle } from '@/components/ui/FormField';
import { promotionSchema } from '@/schemas/admin.schema';
import { adminApi } from '@/api/admin';
import useFetch, { clearFetchCache } from '@/hooks/useFetch';
import { usePromoStore } from '@/store/promoStore';
import { PROMO_TYPES, SEASONS } from '@/utils/constants';
import { dayStartAR, dayEndAR, isoToInputAR } from '@/utils/format';
import { notifySuccess, notifyError, handleFormError, confirmDelete } from '@/utils/notify';
import { promoStatus } from './Promotions';

const DEFAULTS = {
  title: '',
  description: '',
  type: 'porcentaje',
  value: 15,
  valueText: '',
  appliesToAll: true,
  cabins: [],
  startDate: '',
  endDate: '',
  minNights: 2,
  season: 'todo_el_anio',
  featured: false,
  active: true,
};

const toForm = (p) => ({
  title: p.title,
  description: p.description || '',
  type: p.type,
  value: p.value ?? '',
  valueText: p.valueText || '',
  appliesToAll: p.appliesToAll,
  cabins: (p.cabins || []).map((c) => c._id || c),
  startDate: isoToInputAR(p.startDate),
  endDate: isoToInputAR(p.endDate),
  minNights: p.minNights,
  season: p.season,
  featured: p.featured,
  active: p.active,
});

export default function PromotionForm() {
  const { id } = useParams();
  const isNew = id === 'nueva';
  const navigate = useNavigate();
  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [pendingFile, setPendingFile] = useState(null); // imagen elegida antes de crear
  const [uploading, setUploading] = useState(false);
  const { data: cabins = [] } = useFetch('admin-cabins', () => adminApi.cabins.list().then((r) => r.data));

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(promotionSchema), defaultValues: DEFAULTS });

  useEffect(() => {
    if (isNew) return;
    adminApi.promotions
      .get(id)
      .then((r) => {
        setPromo(r.data);
        reset(toForm(r.data));
      })
      .catch((err) => {
        notifyError(err);
        navigate('/admin/promociones');
      })
      .finally(() => setLoading(false));
  }, [id, isNew, reset, navigate]);

  const values = watch();
  const type = values.type;
  const previewUrl = useMemo(() => (pendingFile ? URL.createObjectURL(pendingFile) : null), [pendingFile]);
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const preview = {
    ...values,
    value: Number(values.value) || 0,
    endDate: values.endDate ? dayEndAR(values.endDate) : null,
    cabins: cabins.filter((c) => values.cabins.includes(c._id)),
    image: previewUrl ? { url: previewUrl } : promo?.image,
  };

  const invalidate = () => {
    clearFetchCache('admin-promos');
    usePromoStore.setState({ loaded: false });
  };

  const uploadImage = async (promoId, file) => {
    setUploading(true);
    try {
      const res = await adminApi.promotions.uploadImage(promoId, file);
      setPromo(res.data);
      setPendingFile(null);
      return res.data;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (v) => {
    const payload = {
      ...v,
      value: ['porcentaje', 'precio_especial'].includes(v.type) ? v.value : null,
      cabins: v.appliesToAll ? [] : v.cabins,
      startDate: dayStartAR(v.startDate),
      endDate: dayEndAR(v.endDate),
    };
    try {
      const res = isNew ? await adminApi.promotions.create(payload) : await adminApi.promotions.update(id, payload);
      if (pendingFile) await uploadImage(res.data._id, pendingFile);
      invalidate();
      notifySuccess(res.message);
      if (isNew) navigate(`/admin/promociones/${res.data._id}`, { replace: true });
      else setPromo((p) => ({ ...res.data, image: p?.image ?? res.data.image }));
    } catch (err) {
      handleFormError(err, setError);
    }
  };

  const onImage = async ([file]) => {
    if (isNew) return setPendingFile(file); // se sube al crear
    try {
      await uploadImage(id, file);
      invalidate();
      notifySuccess('Imagen actualizada');
    } catch (err) {
      notifyError(err);
    }
  };

  const removeImage = async () => {
    if (pendingFile) return setPendingFile(null);
    if (!(await confirmDelete('la imagen'))) return;
    try {
      const res = await adminApi.promotions.deleteImage(id);
      setPromo(res.data);
      invalidate();
    } catch (err) {
      notifyError(err);
    }
  };

  if (loading) return <LoadingBlock />;
  const [statusLabel, statusTone] = promoStatus({ ...preview, startDate: dayStartAR(values.startDate) });

  return (
    <>
      <Link to="/admin/promociones" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-carbon-light hover:text-carbon">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Promociones
      </Link>
      <PageHeader title={isNew ? 'Nueva promoción' : promo?.title} actions={<Badge tone={statusTone}>{statusLabel}</Badge>} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="grid gap-4 sm:grid-cols-2">
            <Field label="Título" error={errors.title?.message} className="sm:col-span-2">
              {(a) => <input className="input" placeholder="Ej: Escapada de invierno" {...a} {...register('title')} />}
            </Field>
            <Field label="Descripción" error={errors.description?.message} className="sm:col-span-2">
              {(a) => <textarea rows={3} className="input" {...a} {...register('description')} />}
            </Field>
            <Field label="Tipo de promo" error={errors.type?.message}>
              {(a) => (
                <select className="input" {...a} {...register('type')}>
                  {Object.entries(PROMO_TYPES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              )}
            </Field>
            {type === 'porcentaje' && (
              <Field label="Descuento (%)" error={errors.value?.message}>
                {(a) => <input type="number" min={1} max={100} className="input" {...a} {...register('value')} />}
              </Field>
            )}
            {type === 'precio_especial' && (
              <Field label="Precio especial por noche ($)" error={errors.value?.message}>
                {(a) => <input type="number" min={1} className="input" {...a} {...register('value')} />}
              </Field>
            )}
            {(type === 'texto' || type === 'noche_gratis') && (
              <Field label={type === 'texto' ? 'Beneficio' : 'Texto del beneficio (opcional)'} hint={type === 'noche_gratis' ? 'Ej: 3x2 · 4 noches pagando 3' : 'Ej: Late check-out de regalo'} error={errors.valueText?.message}>
                {(a) => <input className="input" maxLength={80} {...a} {...register('valueText')} />}
              </Field>
            )}
          </Card>

          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-cerro-profundo">Condiciones</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Desde (opcional)" error={errors.startDate?.message}>
                {(a) => <input type="date" className="input" {...a} {...register('startDate')} />}
              </Field>
              <Field label="Hasta (opcional)" error={errors.endDate?.message}>
                {(a) => <input type="date" className="input" {...a} {...register('endDate')} />}
              </Field>
              <Field label="Mínimo de noches" error={errors.minNights?.message}>
                {(a) => <input type="number" min={1} max={30} className="input" {...a} {...register('minNights')} />}
              </Field>
              <Field label="Temporada" error={errors.season?.message}>
                {(a) => (
                  <select className="input" {...a} {...register('season')}>
                    {Object.entries(SEASONS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                )}
              </Field>
            </div>
            <p className="text-xs text-carbon-light">Sin fechas, la promo está vigente mientras esté activa. Con fechas, se prende y se apaga sola.</p>
            <Controller name="appliesToAll" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Aplica a todas las cabañas" />} />
            {!values.appliesToAll && (
              <div>
                <Controller
                  name="cabins"
                  control={control}
                  render={({ field }) => <Chips options={cabins.map((c) => ({ value: c._id, label: c.name }))} value={field.value} onChange={field.onChange} label="Cabañas aplicables" />}
                />
                {errors.cabins && <p className="error-text">{errors.cabins.message}</p>}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 text-xl font-semibold text-cerro-profundo">Imagen</h2>
            <ImageDropzone onFiles={onImage} multiple={false} uploading={uploading} compact={Boolean(preview.image)} label={preview.image ? 'Reemplazar imagen' : 'Arrastrá la imagen de la promo'} />
            {preview.image && (
              <button type="button" onClick={removeImage} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline">
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Quitar imagen
              </button>
            )}
            {pendingFile && <p className="mt-2 text-xs text-carbon-light">Se va a subir al guardar la promo.</p>}
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card className="space-y-4">
            <Controller name="active" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Activa" />} />
            <Controller name="featured" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Destacada en el banner" />} />
          </Card>
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-carbon-light">
              <Eye className="h-4 w-4" aria-hidden="true" /> Vista previa en el sitio
            </p>
            <div className="pointer-events-none" aria-hidden="true">
              <PromoCard promo={preview} preview />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting || uploading} className="btn-sol w-full !py-4">
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {isNew ? 'Crear promoción' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </>
  );
}
