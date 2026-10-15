import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, GripVertical, Pencil, Trash2, Eye, EyeOff, Loader2, Star, ImagePlus } from 'lucide-react';
import { PageHeader, Card, LoadingBlock, EmptyState, IconButton } from './ui';
import Sortable from './Sortable';
import ImageDropzone from './ImageDropzone';
import Modal from '@/components/ui/Modal';
import CldImage from '@/components/ui/CldImage';
import { Field, Toggle } from '@/components/ui/FormField';
import useFetch, { clearFetchCache } from '@/hooks/useFetch';
import { ICONS, getIcon } from '@/utils/icons';
import { confirmDelete, notifySuccess, notifyError, handleFormError } from '@/utils/notify';

export default function ContentCrud({ config }) {
  const { key, publicKey, title, subtitle, singular, api, summary, withImage } = config;
  const { data, loading, reload } = useFetch(key, () => api.list().then((r) => r.data));
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  useEffect(() => setItems((data || []).map((i) => ({ ...i, id: i._id }))), [data]);

  const refresh = () => {
    clearFetchCache(key);
    if (publicKey) clearFetchCache(publicKey);
    reload();
  };

  const reorder = async (next) => {
    setItems(next);
    try {
      await api.reorder(next.map((i) => i._id));
      refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  const toggle = async (item) => {
    try {
      await api.update(item._id, { active: !item.active });
      refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  const remove = async (item) => {
    if (!(await confirmDelete(`“${summary(item).title}”`))) return;
    try {
      await api.remove(item._id);
      notifySuccess(`${singular} eliminado`);
      refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <button type="button" className="btn-sol" onClick={() => setEditing('new')}>
            <Plus className="h-5 w-5" aria-hidden="true" /> Agregar
          </button>
        }
      />
      {loading && !data ? (
        <LoadingBlock />
      ) : !items.length ? (
        <EmptyState title={`Sin ${title.toLowerCase()}`} text={config.emptyText} action={<button className="btn-sol" onClick={() => setEditing('new')}>Agregar</button>} />
      ) : (
        <Sortable items={items} onReorder={reorder} layout="list" className="space-y-2">
          {(item, handle) => {
            const s = summary(item);
            return (
              <Card className={`flex items-center gap-3 !p-3 sm:!p-4 ${item.active ? '' : 'opacity-60'}`}>
                <button type="button" {...handle} className="cursor-grab rounded-full p-2 text-carbon-light hover:bg-crema-dark" aria-label={`Mover ${s.title}`}>
                  <GripVertical className="h-5 w-5" />
                </button>
                {s.image ? (
                  <CldImage src={s.image} alt="" width={120} sizes="56px" className="h-14 w-14 shrink-0 rounded-2xl" />
                ) : s.icon ? (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cerro-50 text-cerro-profundo">
                    <s.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{s.title}</p>
                  {s.subtitle && <p className="line-clamp-1 text-sm text-carbon-light">{s.subtitle}</p>}
                </div>
                <IconButton label={item.active ? 'Ocultar del sitio' : 'Mostrar en el sitio'} onClick={() => toggle(item)}>
                  {item.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </IconButton>
                <IconButton label="Editar" onClick={() => setEditing(item)}>
                  <Pencil className="h-4 w-4" />
                </IconButton>
                <IconButton label="Eliminar" tone="danger" onClick={() => remove(item)}>
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </Card>
            );
          }}
        </Sortable>
      )}
      <ItemModal config={config} item={editing} onClose={() => setEditing(null)} onSaved={refresh} withImage={withImage} />
    </>
  );
}

function ItemModal({ config, item, onClose, onSaved, withImage }) {
  const isNew = item === 'new';
  const [current, setCurrent] = useState(null);
  const [uploading, setUploading] = useState(false);
  useEffect(() => setCurrent(item && !isNew ? item : null), [item, isNew]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(config.schema), defaultValues: config.defaults });

  useEffect(() => {
    if (item) reset(isNew ? config.defaults : config.toForm(item));
  }, [item]);

  const onSubmit = async (values) => {
    try {
      const res = isNew ? await config.api.create(values) : await config.api.update(item._id, values);
      notifySuccess(res.message);
      onSaved();
      if (withImage && isNew) setCurrent(res.data);
      else onClose();
    } catch (err) {
      handleFormError(err, setError);
    }
  };

  const uploadImage = async ([file]) => {
    setUploading(true);
    try {
      const res = await config.api.uploadImage(current._id, file);
      setCurrent(res.data);
      notifySuccess('Imagen actualizada');
      onSaved();
    } catch (err) {
      notifyError(err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    try {
      const res = await config.api.deleteImage(current._id);
      setCurrent(res.data);
      onSaved();
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <Modal open={Boolean(item)} onClose={onClose} title={isNew && !current ? `Nuevo: ${config.singular.toLowerCase()}` : `Editar ${config.singular.toLowerCase()}`} size="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {config.fields.map((f) => (
          <FieldControl key={f.name} f={f} register={register} control={control} error={f.name.split('.').reduce((o, k) => o?.[k], errors)?.message} />
        ))}
        <Controller name="active" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Visible en el sitio" />} />
        <button type="submit" disabled={isSubmitting} className="btn-cerro w-full">
          {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />} {isNew && !current ? 'Crear' : 'Guardar'}
        </button>
      </form>

      {withImage && (
        <div className="mt-6 border-t border-crema-dark pt-5">
          <p className="label flex items-center gap-1.5">
            <ImagePlus className="h-4 w-4" aria-hidden="true" /> Imagen (opcional)
          </p>
          {current ? (
            <>
              {current.image?.url && <CldImage src={current.image.url} alt="" width={600} className="mb-3 aspect-video rounded-2xl" />}
              <ImageDropzone onFiles={uploadImage} multiple={false} uploading={uploading} compact label={current.image?.url ? 'Reemplazar imagen' : 'Subir imagen'} />
              {current.image?.url && (
                <button type="button" onClick={removeImage} className="mt-2 text-sm font-semibold text-red-600 hover:underline">Quitar imagen</button>
              )}
            </>
          ) : (
            <p className="text-sm text-carbon-light">Guardá primero para poder subir la imagen.</p>
          )}
        </div>
      )}
    </Modal>
  );
}

function FieldControl({ f, register, control, error }) {
  if (f.type === 'icon') {
    return (
      <Field label={f.label} error={error}>
        {() => (
          <Controller
            name={f.name}
            control={control}
            render={({ field }) => (
              <div role="radiogroup" aria-label={f.label} className="grid grid-cols-7 gap-2 sm:grid-cols-10">
                {Object.keys(ICONS).map((name) => {
                  const Icon = getIcon(name);
                  const on = field.value === name;
                  return (
                    <button key={name} type="button" role="radio" aria-checked={on} aria-label={name} title={name} onClick={() => field.onChange(name)} className={`flex aspect-square items-center justify-center rounded-xl ring-1 transition ${on ? 'bg-cerro-profundo text-crema ring-cerro-profundo' : 'bg-white text-carbon-light ring-piedra hover:ring-cerro'}`}>
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            )}
          />
        )}
      </Field>
    );
  }
  if (f.type === 'rating') {
    return (
      <Field label={f.label} error={error}>
        {() => (
          <Controller
            name={f.name}
            control={control}
            render={({ field }) => (
              <div role="radiogroup" aria-label={f.label} className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={Number(field.value) === n} aria-label={`${n} estrellas`} onClick={() => field.onChange(n)} className="p-1">
                    <Star className={`h-7 w-7 ${n <= field.value ? 'fill-sol text-sol' : 'text-piedra'}`} />
                  </button>
                ))}
              </div>
            )}
          />
        )}
      </Field>
    );
  }
  if (f.type === 'select') {
    return (
      <Field label={f.label} hint={f.hint} error={error}>
        {(a) => (
          <select className="input" {...a} {...register(f.name)}>
            {f.options.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        )}
      </Field>
    );
  }
  return (
    <Field label={f.label} hint={f.hint} error={error}>
      {(a) =>
        f.type === 'textarea' ? (
          <textarea rows={f.rows || 4} className="input" {...a} {...register(f.name)} />
        ) : (
          <input type={f.type || 'text'} className="input" placeholder={f.placeholder} {...a} {...register(f.name)} />
        )
      }
    </Field>
  );
}
