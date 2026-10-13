import { useEffect, useMemo, useState } from 'react';
import { Send, CheckCircle2, Undo2, Info, Users } from 'lucide-react';
import { PageHeader, Card, LoadingBlock, EmptyState, Badge } from '@/components/admin/ui';
import Chips from '@/components/admin/Chips';
import useFetch, { clearFetchCache } from '@/hooks/useFetch';
import { adminApi } from '@/api/admin';
import { useSettingsStore } from '@/store/settingsStore';
import { CLIENT_TAGS } from '@/utils/constants';
import { promoBadge, formatDayLong } from '@/utils/format';
import { waLink } from '@/utils/whatsapp';
import { notifyError } from '@/utils/notify';
import { promoStatus } from './Promotions';
import { prettyPhone } from './Clients';

const tagOptions = Object.entries(CLIENT_TAGS).map(([value, label]) => ({ value, label }));

const defaultTemplate = (promo, businessName) =>
  [
    `¡Hola {nombre}! ☀️ Te escribimos de ${businessName}.`,
    `Tenemos una promo pensada para vos: *${promo.title}* — ${promoBadge(promo)}.`,
    promo.description,
    promo.endDate && `Válida hasta el ${formatDayLong(promo.endDate)}.`,
    '¿Te gustaría que te pasemos disponibilidad? 🏡',
  ]
    .filter(Boolean)
    .join('\n');

/**
 * Envío de promociones cliente por cliente (sin API de Meta, sin envíos masivos):
 * cada botón abre WhatsApp con el mensaje personalizado y marca al cliente como enviado.
 */
export default function PromoSender() {
  const businessName = useSettingsStore((s) => s.settings.businessName);
  const { data: promos } = useFetch('admin-promos', () => adminApi.promotions.list().then((r) => r.data));
  const [promoId, setPromoId] = useState('');
  const [tags, setTags] = useState([]);
  const [pendingOnly, setPendingOnly] = useState(true);
  const [template, setTemplate] = useState('');

  const usable = useMemo(() => (promos || []).filter((p) => promoStatus(p)[0] !== 'Vencida'), [promos]);
  const promo = usable.find((p) => p._id === promoId);

  useEffect(() => {
    if (!promoId && usable.length) setPromoId(usable[0]._id);
  }, [usable, promoId]);
  useEffect(() => {
    if (promo) setTemplate(defaultTemplate(promo, businessName));
  }, [promo?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const params = promoId ? { promotion: promoId, tags: tags.join(',') || undefined, pending: pendingOnly ? 'true' : undefined, limit: 100 } : null;
  const key = params ? `admin-send-${JSON.stringify(params)}` : null;
  const { data, loading, reload } = useFetch(key, () => adminApi.clients.list(params).then((r) => r.data));
  const [local, setLocal] = useState({}); // marcas optimistas

  useEffect(() => setLocal({}), [key]);

  const mark = async (client, sent) => {
    setLocal((l) => ({ ...l, [client._id]: sent }));
    try {
      await adminApi.clients.markSent(client._id, promoId, sent);
      clearFetchCache(key);
    } catch (err) {
      setLocal((l) => ({ ...l, [client._id]: !sent }));
      notifyError(err);
    }
  };

  const send = (client) => {
    const msg = template.replaceAll('{nombre}', client.name.split(' ')[0]);
    window.open(waLink(client.phone, msg), '_blank', 'noopener');
    mark(client, true);
  };

  if (!promos) return <LoadingBlock />;
  if (!usable.length) return <EmptyState title="No hay promos para enviar" text="Creá una promoción vigente o programada en Promociones." />;

  const items = data?.items || [];
  const sentCount = items.filter((c) => local[c._id] ?? c.sent).length;

  return (
    <>
      <PageHeader title="Enviar promos" subtitle="Elegí una promo, filtrá clientes y enviá uno por uno por WhatsApp." />
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <div className="space-y-6">
          <Card className="space-y-4">
            <div>
              <label htmlFor="promo" className="label">Promoción</label>
              <select id="promo" className="input" value={promoId} onChange={(e) => setPromoId(e.target.value)}>
                {usable.map((p) => (
                  <option key={p._id} value={p._id}>{p.title} — {promoStatus(p)[0]}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="label">Clientes con etiqueta</p>
              <Chips options={tagOptions} value={tags} onChange={setTags} label="Etiquetas" />
              <p className="mt-1 text-xs text-carbon-light">Sin etiquetas = todos los clientes.</p>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={pendingOnly} onChange={(e) => setPendingOnly(e.target.checked)} className="h-4 w-4 accent-cerro" />
              Ocultar a quienes ya se les envió
            </label>
          </Card>
          <Card>
            <label htmlFor="tpl" className="label">Mensaje</label>
            <textarea id="tpl" rows={9} className="input text-sm" value={template} onChange={(e) => setTemplate(e.target.value)} />
            <p className="mt-2 flex gap-1.5 text-xs text-carbon-light">
              <Info className="h-4 w-4 shrink-0" aria-hidden="true" /> <span><code>{'{nombre}'}</code> se reemplaza por el nombre de cada cliente. *Texto* sale en negrita en WhatsApp.</span>
            </p>
          </Card>
        </div>

        <div>
          {loading && !data ? (
            <LoadingBlock />
          ) : !items.length ? (
            <EmptyState icon={Users} title={pendingOnly ? '¡Ya se la enviaste a todos! 🎉' : 'No hay clientes con esos filtros'} text={pendingOnly ? 'Destildá "Ocultar…" para ver a quiénes se les mandó.' : 'Probá con otras etiquetas.'} />
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-carbon-light">{items.length} clientes</span>
                <Badge tone="green">{sentCount} enviados</Badge>
              </div>
              <ul className="space-y-2">
                {items.map((c) => {
                  const sent = local[c._id] ?? c.sent;
                  return (
                    <li key={c._id}>
                      <Card className={`flex flex-wrap items-center justify-between gap-3 !p-4 ${sent ? 'bg-cerro-50/60' : ''}`}>
                        <div>
                          <p className="font-semibold">{c.name}</p>
                          <p className="text-sm text-carbon-light">{prettyPhone(c.phone)} {c.tags.map((t) => CLIENT_TAGS[t]).join(' · ')}</p>
                        </div>
                        {sent ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-cerro-600">
                              <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> Enviado
                            </span>
                            <button type="button" onClick={() => mark(c, false)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-carbon-light hover:bg-crema-dark">
                              <Undo2 className="h-3.5 w-3.5" aria-hidden="true" /> Deshacer
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => send(c)} className="btn !px-4 !py-2 bg-[#25D366] text-sm text-white hover:brightness-95">
                            <Send className="h-4 w-4" aria-hidden="true" /> Enviar
                          </button>
                        )}
                      </Card>
                    </li>
                  );
                })}
              </ul>
              <button type="button" onClick={() => { clearFetchCache(key); reload(); }} className="mt-4 text-sm font-semibold text-tejido-ink hover:underline">
                Actualizar lista
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
