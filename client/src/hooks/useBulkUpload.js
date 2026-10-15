import { useState } from 'react';
import { bulkUpload } from '@/utils/bulkUpload';
import { notifySuccess } from '@/utils/notify';
import Swal from '@/utils/swal';

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/**
 * Carga masiva para el panel: sube de a una con `sendOne(file)`, muestra el progreso
 * y al final avisa cuántas subieron y cuáles fallaron.
 * `onDone(responses)` recibe las respuestas exitosas (para refrescar la pantalla).
 */
export default function useBulkUpload(sendOne, onDone) {
  const [progress, setProgress] = useState(null); // { done, total } mientras sube

  const upload = async (files) => {
    const { ok, failed } = await bulkUpload(files, sendOne, setProgress);
    setProgress(null);
    if (ok.length) onDone?.(ok);

    if (!failed.length) {
      notifySuccess(ok.length === 1 ? 'Foto subida' : `${ok.length} fotos subidas`);
    } else {
      Swal.fire({
        icon: ok.length ? 'warning' : 'error',
        titleText: ok.length ? `Se subieron ${ok.length} de ${files.length} fotos` : 'No se pudieron subir las fotos',
        html: `<p>Estas no se subieron, probá de nuevo con ellas:</p>${failed
          .slice(0, 10)
          .map((f) => `<p><b>${escapeHtml(f.name)}</b>: ${escapeHtml(f.message)}</p>`)
          .join('')}${failed.length > 10 ? `<p>…y ${failed.length - 10} más</p>` : ''}`,
        confirmButtonText: 'Entendido',
      });
    }
  };

  return { upload, progress, uploading: Boolean(progress) };
}
