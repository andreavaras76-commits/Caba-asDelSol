import { useEffect, useState } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import Sortable from './Sortable';
import ImageDropzone from './ImageDropzone';
import { IconButton } from './ui';
import CldImage from '@/components/ui/CldImage';
import { adminApi } from '@/api/admin';
import { useSettingsStore } from '@/store/settingsStore';
import { confirmDelete, notifySuccess, notifyError } from '@/utils/notify';

const PATHS = {
  heroVerano: (s) => s.hero.imagesVerano,
  heroInvierno: (s) => s.hero.imagesInvierno,
  about: (s) => s.about.images,
  events: (s) => s.events.images,
  og: (s) => (s.seo.ogImage ? [s.seo.ogImage] : []),
};

/** Fotos de un grupo de la configuración (hero por temporada, nosotros, eventos, Open Graph) */
export default function SettingsImages({ group, title, hint, single = false }) {
  const { settings, setSettings } = useSettingsStore();
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState([]);
  const images = PATHS[group](settings) || [];
  // Firma estable: el array se recrea en cada render (sobre todo el de la imagen OG)
  const signature = images.map((i) => i._id).join(",");
  useEffect(() => setItems(images.map((i) => ({ ...i, id: i._id || i.public_id }))), [signature]); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = (res) => setSettings(res.data);

  const upload = async (files) => {
    setUploading(true);
    try {
      apply(await adminApi.settings.uploadImages(group, files));
      notifySuccess(single ? 'Imagen actualizada' : 'Fotos subidas');
    } catch (err) {
      notifyError(err, 'No se pudieron subir las fotos');
    } finally {
      setUploading(false);
    }
  };

  const reorder = async (next) => {
    setItems(next);
    try {
      apply(await adminApi.settings.reorderImages(group, next.map((i) => i._id)));
    } catch (err) {
      notifyError(err);
    }
  };

  const remove = async (img) => {
    if (!(await confirmDelete('esta foto', 'Se borra también de Cloudinary.'))) return;
    try {
      apply(await adminApi.settings.deleteImage(group, img._id || 'actual'));
      notifySuccess('Foto eliminada');
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <div>
      <p className="label">{title}</p>
      {hint && <p className="-mt-1 mb-2 text-xs text-carbon-light">{hint}</p>}
      <ImageDropzone onFiles={upload} uploading={uploading} multiple={!single} compact label={single && items.length ? 'Reemplazar imagen' : single ? 'Subir imagen' : 'Subir fotos'} />
      {items.length > 0 && (
        <Sortable items={items} onReorder={reorder} className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {(img, handle) => (
            <div className="relative overflow-hidden rounded-xl">
              <CldImage src={img.url} alt="" width={300} sizes="15vw" className="aspect-square" />
              {!single && (
                <button type="button" {...handle} className="absolute left-1 top-1 cursor-grab rounded-full bg-white/90 p-1 shadow" aria-label="Mover foto">
                  <GripVertical className="h-3.5 w-3.5" />
                </button>
              )}
              <IconButton label="Eliminar foto" tone="danger" className="absolute right-1 top-1 !h-7 !w-7 bg-white/90" onClick={() => remove(img)}>
                <Trash2 className="h-3.5 w-3.5" />
              </IconButton>
            </div>
          )}
        </Sortable>
      )}
    </div>
  );
}
