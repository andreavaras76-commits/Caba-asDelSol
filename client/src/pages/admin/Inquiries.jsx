import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageCircle, UserPlus, Trash2, StickyNote, ChevronDown, Search, FilterX, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, Card, LoadingBlock, EmptyState, IconButton } from '@/components/admin/ui';
import { InquirySummary } from '@/components/admin/InquiryRow';
import Modal from '@/components/ui/Modal';
import { Field } from '@/components/ui/FormField';
import useFetch, { clearFetchCache, useDebounced } from '@/hooks/useFetch';
import { adminApi } from '@/api/admin';
import { useSettingsStore } from '@/store/settingsStore';
import { inquiryUpdateSchema } from '@/schemas/admin.schema';
import { INQUIRY_STATUS } from '@/utils/constants';
import { replyLink, normalizeArPhone } from '@/utils/whatsapp';
import { confirmDelete, notifySuccess, notifyError, handleFormError } from '@/utils/notify';
import Swal from '@/utils/swal';

const EMPTY = { status: '', type: '', cabin: '', promotion: '', from: '', to: '', q: '' };

export default function Inquiries() {
  const [filters, setFilters] = useState(EMPTY);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const businessName = useSettingsStore((s) => s.settings.businessName);

  const q = useDebounced(filters.q);
  const params = { ...Object.fromEntries(Object.entries({ ...filters, q }).filter(([, v]) => v)), page, limit: 20 };
  const key = `admin-inquiries-${JSON.stringify(params)}`;
  const { data, loading, reload } = useFetch(key, () => adminApi.inquiries.list(params).then((r) => r.data));
  const { data: cabins = [] } = useFetch('admin-cabins', () => adminApi.cabins.list().then((r) => r.data));
  const { data: promos = [] } = useFetch('admin-promos', () => adminApi.promotions.list().then((r) => r.data));

  const refresh = () => {
    clearFetchCache(key);
    clearFetchCache('admin-stats');
    reload();
  };
  const setFilter = (k) => (e) => {
    setPage(1);
    setFilters((f) => ({ ...f, [k]: e.target.value }));
  };

  const changeStatus = async (inq, status) => {
    try {
      await adminApi.inquiries.update(inq._id, { status });
      notifySuccess(`Marcada como "${INQUIRY_STATUS[status]}"`);
      refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  const remove = async (inq) => {
    if (!(await confirmDelete(`la consulta de ${inq.name}`))) return;
    try {
      await adminApi.inquiries.remove(inq._id);
      notifySuccess('Consulta eliminada');
      refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  /** Pasar a cliente: si la consulta no trae teléfono, lo pedimos */
  const toClient = async (inq) => {
    let phone = normalizeArPhone(inq.phone);
    if (!/^\d{10,15}$/.test(phone)) {
      const { value, isConfirmed } = await Swal.fire({
        titleText: `WhatsApp de ${inq.name}`,
        text: 'La consulta no trae teléfono. Copialo del chat de WhatsApp para guardar el cliente.',
        input: 'tel',
        inputPlaceholder: '(0381) 15-555-5555',
        showCancelButton: true,
        confirmButtonText: 'Crear cliente',
        cancelButtonText: 'Cancelar',
        inputValidator: (v) => (/^\d{10,15}$/.test(normalizeArPhone(v)) ? undefined : 'Ingresá un WhatsApp válido, con código de área'),
      });
      if (!isConfirmed) return;
      phone = normalizeArPhone(value);
    }
    try {
      const res = await adminApi.clients.fromInquiry(inq._id, phone);
      notifySuccess(res.message);
      refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  const active = Object.values(filters).some(Boolean);

  return (
    <>
      <PageHeader title="Consultas" subtitle="Cada consulta que alguien envió por WhatsApp desde el sitio." />

      <Card className="mb-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-carbon-light" aria-hidden="true" />
            <input className="input pl-10" placeholder="Buscar por nombre, cabaña, promo…" value={filters.q} onChange={setFilter('q')} aria-label="Buscar" />
          </div>
          <select className="input" value={filters.status} onChange={setFilter('status')} aria-label="Estado">
            <option value="">Todos los estados</option>
            {Object.entries(INQUIRY_STATUS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select className="input" value={filters.type} onChange={setFilter('type')} aria-label="Tipo">
            <option value="">Todos los tipos</option>
            <option value="cabana">Cabaña</option>
            <option value="promo">Promo</option>
            <option value="evento">Evento</option>
            <option value="general">General</option>
          </select>
          <select className="input" value={filters.cabin} onChange={setFilter('cabin')} aria-label="Cabaña">
            <option value="">Todas las cabañas</option>
            {cabins.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <select className="input" value={filters.promotion} onChange={setFilter('promotion')} aria-label="Promoción">
            <option value="">Todas las promos</option>
            {promos.map((p) => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <span className="shrink-0 text-carbon-light">Desde</span>
            <input type="date" className="input" value={filters.from} onChange={setFilter('from')} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="shrink-0 text-carbon-light">Hasta</span>
            <input type="date" className="input" value={filters.to} onChange={setFilter('to')} />
          </label>
        </div>
        {active && (
          <button type="button" onClick={() => setFilters(EMPTY)} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-tejido-ink hover:underline">
            <FilterX className="h-4 w-4" aria-hidden="true" /> Limpiar filtros
          </button>
        )}
      </Card>

      {loading && !data ? (
        <LoadingBlock />
      ) : !data?.items.length ? (
        <EmptyState title={active ? 'Nada con esos filtros' : 'Todavía no hay consultas'} text={active ? 'Probá cambiando o limpiando los filtros.' : 'Cuando alguien consulte desde el sitio, la vas a ver acá.'} />
      ) : (
        <>
          <p className="mb-3 text-sm text-carbon-light">{data.total} {data.total === 1 ? 'consulta' : 'consultas'}</p>
          <ul className="space-y-3">
            {data.items.map((inq) => {
              const reply = replyLink(inq, businessName);
              const open = expanded === inq._id;
              return (
                <li key={inq._id}>
                  <Card className="!p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <InquirySummary inquiry={inq} />
                      <div className="flex flex-wrap items-center gap-1">
                        <select className="input !w-auto !py-2 text-sm" value={inq.status} onChange={(e) => changeStatus(inq, e.target.value)} aria-label={`Estado de la consulta de ${inq.name}`}>
                          {Object.entries(INQUIRY_STATUS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                        {reply ? (
                          <a href={reply} target="_blank" rel="noopener noreferrer" className="btn !px-3 !py-2 bg-[#25D366] text-sm text-white hover:brightness-95">
                            <MessageCircle className="h-4 w-4" aria-hidden="true" /> Responder
                          </a>
                        ) : (
                          <span className="px-2 text-xs text-carbon-light" title="La persona te escribió directo por WhatsApp: respondé en ese chat">Respondé en su chat</span>
                        )}
                        <IconButton label={inq.client ? 'Ya es cliente (actualizar)' : 'Pasar a cliente'} tone="success" onClick={() => toClient(inq)}>
                          <UserPlus className="h-4 w-4" />
                        </IconButton>
                        <IconButton label="Notas internas" onClick={() => setEditing(inq)}>
                          <StickyNote className={`h-4 w-4 ${inq.notes ? 'fill-sol-200' : ''}`} />
                        </IconButton>
                        <IconButton label={open ? 'Ocultar mensaje' : 'Ver mensaje'} onClick={() => setExpanded(open ? null : inq._id)} aria-expanded={open}>
                          <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
                        </IconButton>
                        <IconButton label="Eliminar" tone="danger" onClick={() => remove(inq)}>
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </div>
                    {open && (
                      <div className="mt-4 grid gap-3 border-t border-crema-dark pt-4 md:grid-cols-2">
                        <pre className="whitespace-pre-wrap rounded-2xl bg-crema p-4 font-sans text-sm">{inq.message}</pre>
                        <div className="text-sm text-carbon-light">
                          <p>Recibida: {new Date(inq.createdAt).toLocaleString('es-AR')}</p>
                          {inq.phone && <p>Teléfono: {inq.phone}</p>}
                          {inq.notes && <p className="mt-2 rounded-2xl bg-sol-50 p-3 text-carbon">📝 {inq.notes}</p>}
                        </div>
                      </div>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
          {data.pages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Paginación">
              <IconButton label="Página anterior" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-5 w-5" />
              </IconButton>
              <span className="text-sm font-semibold">Página {data.page} de {data.pages}</span>
              <IconButton label="Página siguiente" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-5 w-5" />
              </IconButton>
            </nav>
          )}
        </>
      )}

      <NotesModal inquiry={editing} onClose={() => setEditing(null)} onSaved={refresh} />
    </>
  );
}

function NotesModal({ inquiry, onClose, onSaved }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(inquiryUpdateSchema), values: inquiry ? { status: inquiry.status, notes: inquiry.notes || '' } : undefined });

  const onSubmit = async (values) => {
    try {
      await adminApi.inquiries.update(inquiry._id, values);
      notifySuccess('Consulta actualizada');
      onSaved();
      onClose();
    } catch (err) {
      handleFormError(err, setError);
    }
  };

  return (
    <Modal open={Boolean(inquiry)} onClose={onClose} title={inquiry ? `Consulta de ${inquiry.name}` : ''}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field label="Estado" error={errors.status?.message}>
          {(a) => (
            <select className="input" {...a} {...register('status')}>
              {Object.entries(INQUIRY_STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Notas internas" hint="Sólo las ve el equipo." error={errors.notes?.message}>
          {(a) => <textarea rows={4} className="input" {...a} {...register('notes')} />}
        </Field>
        <button type="submit" className="btn-cerro w-full" disabled={isSubmitting}>
          Guardar
        </button>
      </form>
    </Modal>
  );
}
