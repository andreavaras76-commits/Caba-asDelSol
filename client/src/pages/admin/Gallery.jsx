import { useEffect, useState } from 'react';
import { GripVertical, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader, Card, LoadingBlock, EmptyState, IconButton, Tabs, Badge } from '@/components/admin/ui';
import ImageDropzone from '@/components/admin/ImageDropzone';
import Sortable from '@/components/admin/Sortable';
import CldImage from '@/components/ui/CldImage';
import Modal from '@/components/ui/Modal';
import { Field, Toggle } from '@/components/ui/FormField';
import useFetch, { clearFetchCache } from '@/hooks/useFetch';
import { adminApi } from '@/api/admin';
import { galleryUpdateSchema } from '@/schemas/admin.schema';
import { GALLERY_CATEGORIES } from '@/utils/constants';
import { confirmDelete, notifySuccess, notifyError, handleFormError } from '@/utils/notify';

export default function Gallery() {
  const [tab, setTab] = useState('todas');
  const [uploadCategory, setUploadCategory] = useState('cabanas');
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null);
  const { data, loading, reload } = useFetch('admin-gallery', () => adminApi.gallery.list().then((r) => r.data));
  const [items, setItems] = useState([]);
  useEffect(() => setItems((data || []).map((i) => ({ ...i, id: i._id }))), [data]);

  const refresh = () => {
    clearFetchCache('admin-gallery');
    clearFetchCache('gallery');
    reload();
  };

  const visible = tab === 'todas' ? items : items.filter((i) => i.category === tab);

  const upload = async (files) => {
    setUploading(true);
    try {
      const res = await adminApi.gallery.upload(files, uploadCategory);
      notifySuccess(res.message);
      refresh();
    } catch (err) {
      notifyError(err, 'No se pudieron subir las fotos');
    } finally {
      setUploading(false);
    }
  };

  /** Reordena dentro del filtro actual manteniendo la posición del resto */
  const reorder = async (nextVisible) => {
    let k = 0;
    const visibleIds = new Set(visible.map((i) => i.id));
    const merged = items.map((i) => (visibleIds.has(i.id) ? nextVisible[k++] : i));
    setItems(merged);
    try {
      await adminApi.gallery.reorder(merged.map((i) => i._id));
      refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  const toggle = async (img) => {
    try {
      await adminApi.gallery.update(img._id, { active: !img.active });
      refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  const remove = async (img) => {
    if (!(await confirmDelete('esta foto', 'Se borra también de Cloudinary.'))) return;
    try {
      await adminApi.gallery.remove(img._id);
      notifySuccess('Foto eliminada');
      refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  const counts = Object.fromEntries(Object.keys(GALLERY_CATEGORIES).map((k) => [k, items.filter((i) => i.category === k).length]));

  return (
    <>
      <PageHeader title="Galería" subtitle="Fotos de la galería del sitio, con filtros por categoría. Arrastrá para ordenar." />
      <Card className="mb-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label htmlFor="upload-cat" className="label !mb-0">Subir a la categoría</label>
          <select id="upload-cat" className="input !w-auto" value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}>
            {Object.entries(GALLERY_CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <ImageDropzone onFiles={upload} uploading={uploading} />
      </Card>

      <Tabs tabs={[['todas', `Todas (${items.length})`], ...Object.entries(GALLERY_CATEGORIES).map(([k, v]) => [k, `${v} (${counts[k]})`])]} value={tab} onChange={setTab} />

      {loading && !data ? (
        <LoadingBlock />
      ) : !visible.length ? (
        <EmptyState title="Sin fotos en esta categoría" text="Subí fotos arriba: aparecen en la galería del sitio al instante." />
      ) : (
        <Sortable items={visible} onReorder={reorder} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(img, handle) => (
            <div className={`relative overflow-hidden rounded-2xl bg-white shadow-calida ${img.active ? '' : 'opacity-50'}`}>
              <CldImage src={img.url} alt={img.alt} width={400} sizes="20vw" className="aspect-square" />
              <button type="button" {...handle} className="absolute left-2 top-2 cursor-grab rounded-full bg-white/90 p-1.5 shadow" aria-label="Mover foto">
                <GripVertical className="h-4 w-4" />
              </button>
              <Badge tone="gray" className="absolute right-2 top-2 !bg-white/90">{GALLERY_CATEGORIES[img.category]}</Badge>
              <div className="flex justify-center gap-1 p-1.5">
                <IconButton label={img.active ? 'Ocultar' : 'Mostrar'} onClick={() => toggle(img)}>
                  {img.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </IconButton>
                <IconButton label="Editar" onClick={() => setEditing(img)}>
                  <Pencil className="h-4 w-4" />
                </IconButton>
                <IconButton label="Eliminar" tone="danger" onClick={() => remove(img)}>
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
          )}
        </Sortable>
      )}

      <EditModal img={editing} onClose={() => setEditing(null)} onSaved={refresh} />
    </>
  );
}

function EditModal({ img, onClose, onSaved }) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(galleryUpdateSchema), values: img ? { alt: img.alt || '', category: img.category, active: img.active } : undefined });

  const onSubmit = async (v) => {
    try {
      await adminApi.gallery.update(img._id, v);
      notifySuccess('Foto actualizada');
      onSaved();
      onClose();
    } catch (err) {
      handleFormError(err, setError);
    }
  };

  return (
    <Modal open={Boolean(img)} onClose={onClose} title="Editar foto">
      {img && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <CldImage src={img.url} alt={img.alt} width={700} className="aspect-video rounded-2xl" />
          <Field label="Descripción (qué se ve)" hint="Para accesibilidad y Google." error={errors.alt?.message}>
            {(a) => <input className="input" maxLength={160} {...a} {...register('alt')} />}
          </Field>
          <Field label="Categoría" error={errors.category?.message}>
            {(a) => (
              <select className="input" {...a} {...register('category')}>
                {Object.entries(GALLERY_CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            )}
          </Field>
          <Controller name="active" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Visible en el sitio" />} />
          <button type="submit" disabled={isSubmitting} className="btn-cerro w-full">Guardar</button>
        </form>
      )}
    </Modal>
  );
}
