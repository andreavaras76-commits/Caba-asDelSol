import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Download from 'yet-another-react-lightbox/plugins/download';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import { cld, cldDownload } from '@/utils/cloudinary';

/**
 * Lightbox de fotos con zoom, contador y botón "Descargar" (se importa con lazy()).
 * images: [{ url, alt, width, height, downloadName? }]
 * downloadName: nombre sin extensión, ej. "cabanas-del-sol-pileta-3"
 */
export default function PhotoLightbox({ images, index, onClose, downloadPrefix = 'foto' }) {
  const slides = images.map((img, i) => {
    const filename = img.downloadName || `cabanas-del-sol-${downloadPrefix}-${i + 1}`;
    return {
      src: cld(img.url, { width: 2000, crop: 'limit' }),
      alt: img.alt,
      width: img.width,
      height: img.height,
      srcSet: [800, 1400, 2000].map((w) => ({ src: cld(img.url, { width: w, crop: 'limit' }), width: w, height: img.height && img.width ? Math.round((img.height / img.width) * w) : w })),
      download: { url: cldDownload(img.url, filename), filename: `${filename}.jpg` },
    };
  });
  return (
    <Lightbox
      open={index >= 0}
      index={Math.max(0, index)}
      close={onClose}
      slides={slides}
      plugins={[Zoom, Counter, Download]}
      styles={{ container: { backgroundColor: 'rgba(28, 58, 36, 0.96)' } }}
      labels={{ Previous: 'Anterior', Next: 'Siguiente', Close: 'Cerrar', 'Zoom in': 'Acercar', 'Zoom out': 'Alejar', Download: 'Descargar' }}
    />
  );
}
