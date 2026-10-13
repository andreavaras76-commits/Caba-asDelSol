import { useEffect, useState } from 'react';
import { GripVertical, Star, Trash2, Pencil } from 'lucide-react';
import Sortable from './Sortable';
import ImageDropzone from './ImageDropzone';
import { Card, IconButton } from './ui';
import CldImage from '@/components/ui/CldImage';
import { adminApi } from '@/api/admin';
import { confirmDelete, notifySuccess, notifyError } from '@/utils/notify';
import Swal from '@/utils/swal';

/** Galería de una cabaña: subir varias, reordenar con drag & drop, elegir portada, alt y borrar */
export default function CabinGallery({ cabin, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState([]);
  useEffect(() => setItems(cabin.images.map((img) => ({ ...img, id: img._id }))), [cabin.images]);

  const coverId = cabin.cover?._id;

  const upload = async (files) => {
    setUploading(true);
    try {
      const res = await adminApi.cabins.uploadImages(cabin._id, files);
      notifySuccess(res.message);
      onChange(res.data);
    } catch (err) {
      notifyError(err, 'No se pudieron subir las fotos');
    } finally {
      setUploading(false);
    }
  };

  const reorder = async (next, cover = coverId) => {
    setItems(next);
    try {
      const res = await adminApi.cabins.reorderImages(cabin._id, next.map((i) => i._id), cover);
      onChange(res.data);
    } catch (err) {
      notifyError(err);
    }
  };

  const setCover = async (img) => {
    await reorder(items, img._id);
    notifySuccess('Portada actualizada');
  };

  const editAlt = async (img) => {
    const { value, isConfirmed } = await Swal.fire({
      title: 'Descripción de la foto',
      text: 'Se usa para accesibilidad y SEO (qué se ve en la foto).',
      input: 'text',
      inputValue: img.alt,
      inputAttributes: { maxlength: 160 },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
    });
    if (!isConfirmed) return;
    try {
      const res = await adminApi.cabins.updateImage(cabin._id, img._id, { alt: value });
      onChange(res.data);
    } catch (err) {
      notifyError(err);
    }
  };

  const remove = async (img) => {
    if (!(await confirmDelete('esta foto', 'Se borra también de Cloudinary.'))) return;
    try {
      const res = await adminApi.cabins.deleteImage(cabin._id, img._id);
      notifySuccess('Foto eliminada');
      onChange(res.data);
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold text-cerro-profundo">Fotos</h2>
      <p className="mb-4 text-sm text-carbon-light">Arrastrá para ordenar. La estrella marca la portada (si no elegís, se usa la primera).</p>
      <ImageDropzone onFiles={upload} uploading={uploading} />
      {items.length > 0 && (
        <Sortable items={items} onReorder={(next) => reorder(next)} className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {(img, handle, dragging) => {
            const isCover = img._id === coverId;
            return (
              <div className={`group relative overflow-hidden rounded-2xl bg-crema-dark ${isCover ? 'ring-4 ring-sol' : ''} ${dragging ? 'scale-105' : ''}`}>
                <CldImage src={img.url} alt={img.alt || cabin.name} width={400} sizes="25vw" className="aspect-square" />
                <button type="button" {...handle} className="absolute left-2 top-2 cursor-grab rounded-full bg-white/90 p-1.5 shadow" aria-label="Mover foto">
                  <GripVertical className="h-4 w-4" />
                </button>
                {isCover && <span className="absolute right-2 top-2 rounded-full bg-sol px-2 py-0.5 text-xs font-bold">Portada</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-carbon/80 to-transparent p-2 pt-6">
                  <IconButton label="Usar como portada" className="!h-8 !w-8 bg-white/90" onClick={() => setCover(img)}>
                    <Star className={`h-4 w-4 ${isCover ? 'fill-sol text-sol' : ''}`} />
                  </IconButton>
                  <IconButton label="Editar descripción" className="!h-8 !w-8 bg-white/90" onClick={() => editAlt(img)}>
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                  <IconButton label="Eliminar foto" tone="danger" className="!h-8 !w-8 bg-white/90" onClick={() => remove(img)}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
            );
          }}
        </Sortable>
      )}
    </Card>
  );
}
