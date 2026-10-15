import { useId, useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { compressImage } from '@/utils/bulkUpload';
import Swal from '@/utils/swal';

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
// Las fotos se achican en el navegador antes de subir (utils/bulkUpload), así que se aceptan originales más pesados
const ORIGINAL_MAX_MB = 40;

/**
 * Zona para arrastrar o elegir imágenes. Valida formato y tamaño antes de subir
 * `progress` ({ done, total }) muestra la barra de la carga masiva.
 */
export default function ImageDropzone({ onFiles, multiple = true, uploading = false, progress = null, label, compact = false }) {
  const text = label || (multiple ? 'Arrastrá todas las fotos que quieras o tocá para elegir' : 'Arrastrá una foto acá o tocá para elegir');
  const inputId = useId();
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);

  const handle = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const bad = files.filter((f) => !ACCEPT.includes(f.type) || f.size > ORIGINAL_MAX_MB * 1024 * 1024);
    if (bad.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Algunas fotos no se pueden subir',
        html: bad.map((f) => `<p>${escapeHtml(f.name)}: ${!ACCEPT.includes(f.type) ? 'formato no permitido' : `pesa más de ${ORIGINAL_MAX_MB} MB`}</p>`).join(''),
      });
    }
    const ok = files.filter((f) => !bad.includes(f));
    if (inputRef.current) inputRef.current.value = '';
    if (!ok.length) return;
    // Varias: las achica la carga masiva de a una. Una sola: se achica acá.
    onFiles(multiple ? ok : [await compressImage(ok[0])]);
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
      <span className="font-semibold text-carbon" aria-live="polite">
        {progress ? `Subiendo ${progress.done} de ${progress.total} fotos…` : uploading ? 'Subiendo…' : text}
      </span>
      {progress && (
        <span className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-piedra-light" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done}>
          <span className="block h-full rounded-full bg-cerro transition-all duration-300" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
        </span>
      )}
      {!compact && !progress && (
        <span className="text-xs text-carbon-light">
          JPG, PNG, WEBP o AVIF{multiple ? ' · podés elegir muchas juntas' : ''} · se achican solas para la web
        </span>
      )}
      <input ref={inputRef} id={inputId} type="file" accept={ACCEPT.join(',')} multiple={multiple} className="sr-only" onChange={(e) => handle(e.target.files)} disabled={uploading} />
    </label>
  );
}
