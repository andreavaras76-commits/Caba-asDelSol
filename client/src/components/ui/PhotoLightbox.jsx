import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import { cld } from '@/utils/cloudinary';

/**
 * Lightbox de fotos (se importa con lazy() para no cargarlo hasta que se abre).
 * images: [{ url, alt, width, height }]
 */
export default function PhotoLightbox({ images, index, onClose }) {
  const slides = images.map((img) => ({
    src: cld(img.url, { width: 2000, crop: 'limit' }),
    alt: img.alt,
    width: img.width,
    height: img.height,
    srcSet: [800, 1400, 2000].map((w) => ({ src: cld(img.url, { width: w, crop: 'limit' }), width: w, height: img.height && img.width ? Math.round((img.height / img.width) * w) : w })),
  }));
  return (
    <Lightbox
      open={index >= 0}
      index={Math.max(0, index)}
      close={onClose}
      slides={slides}
      plugins={[Zoom, Counter]}
      styles={{ container: { backgroundColor: 'rgba(28, 58, 36, 0.96)' } }}
      labels={{ Previous: 'Anterior', Next: 'Siguiente', Close: 'Cerrar', 'Zoom in': 'Acercar', 'Zoom out': 'Alejar' }}
    />
  );
}
