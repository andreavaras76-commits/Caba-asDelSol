import { useId, useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { LIMITS } from '@/utils/constants';
import Swal from '@/utils/swal';

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/**
 * Zona para arrastrar o elegir imágenes. Valida formato y tamaño antes de subir
 * (mismas reglas que el middleware de multer en el backend).
 */
export default function ImageDropzone({ onFiles, multiple = true, uploading = false, label = 'Arrastrá fotos acá o tocá para elegir', compact = false }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);

  const handle = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const bad = files.filter((f) => !ACCEPT.includes(f.type) || f.size > LIMITS.IMAGE_MAX_MB * 1024 * 1024);
    if (bad.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Algunas fotos no se pueden subir',
        html: bad.map((f) => `<p>${escapeHtml(f.name)}: ${!ACCEPT.includes(f.type) ? 'formato no permitido' : `pesa más de ${LIMITS.IMAGE_MAX_MB} MB`}</p>`).join(''),
      });
    }
    const ok = files.filter((f) => !bad.includes(f));
    if (ok.length) onFiles(multiple ? ok : ok.slice(0, 1));
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <label
      htmlFor={inputId}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!uploading) handle(e.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed text-center transition ${
        compact ? 'p-4' : 'p-8'
      } ${over ? 'border-sol bg-sol-50' : 'border-piedra bg-crema hover:border-sol hover:bg-sol-50'} ${uploading ? 'pointer-events-none opacity-70' : ''}`}
    >
      {uploading ? <Loader2 className="h-8 w-8 animate-spin text-madera" aria-hidden="true" /> : <ImagePlus className="h-8 w-8 text-madera" aria-hidden="true" />}
      <span className="font-semibold text-carbon">{uploading ? 'Subiendo…' : label}</span>
      {!compact && <span className="text-xs text-carbon-light">JPG, PNG, WEBP o AVIF · hasta {LIMITS.IMAGE_MAX_MB} MB cada una</span>}
      <input ref={inputRef} id={inputId} type="file" accept={ACCEPT.join(',')} multiple={multiple} className="sr-only" onChange={(e) => handle(e.target.files)} disabled={uploading} />
    </label>
  );
}
