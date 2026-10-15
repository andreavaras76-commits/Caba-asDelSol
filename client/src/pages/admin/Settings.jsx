import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2, Plus, Trash2, ExternalLink, Pencil } from 'lucide-react';
import { PageHeader, Card, LoadingBlock, Tabs, IconButton } from '@/components/admin/ui';
import SettingsImages from '@/components/admin/SettingsImages';
import { Field, Toggle } from '@/components/ui/FormField';
import { settingsSchema } from '@/schemas/admin.schema';
import { adminApi } from '@/api/admin';
import { useSettingsStore } from '@/store/settingsStore';
import { clearFetchCache } from '@/hooks/useFetch';
import Swal from '@/utils/swal';
import { notifySuccess, confirmDelete, handleFormError } from '@/utils/notify';
import { getIcon } from '@/utils/icons';

const ICON_HINTS = [
  [/sala|sill[oó]n|sof/i, 'Sofa'], [/silla/i, 'Armchair'], [/mesa|cubierto/i, 'Utensils'], [/vajilla|plato/i, 'UtensilsCrossed'],
  [/manteler/i, 'Layers'], [/quincho/i, 'Tent'], [/asad|parrill|fuego|le[nñ]a/i, 'Flame'], [/horno|cocina/i, 'CookingPot'],
  [/helader|freezer/i, 'Refrigerator'], [/ba[nñ]o/i, 'Bath'], [/pileta|piscina/i, 'Waves'], [/wifi|internet/i, 'Wifi'],
  [/estacion|auto/i, 'Car'], [/m[uú]sica|sonido|juego/i, 'Gamepad2'], [/caf[eé]|desayuno/i, 'Coffee'], [/bebida|vino|brindis/i, 'Wine'],
  [/ni[nñ]o|chic/i, 'Baby'], [/parque|jard[ií]n|verde/i, 'Trees'], [/aire|clima/i, 'AirVent'], [/ducha/i, 'ShowerHead'],
];
const guessIcon = (label, fallback = 'Sparkles') => ICON_HINTS.find(([re]) => re.test(label))?.[1] || fallback;

const askItem = async (title, value = '') => {
  const { value: text, isConfirmed } = await Swal.fire({
    titleText: title,
    input: 'text',
    inputValue: value,
    inputPlaceholder: 'Ej: Vajilla',
    inputAttributes: { maxlength: '60', autocapitalize: 'sentences' },
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    inputValidator: (v) => (!v.trim() ? 'Escribí el ítem' : undefined),
  });
  return isConfirmed ? text.trim() : null;
};

const TABS = [
  ['contacto', 'Contacto y redes'],
  ['ubicacion', 'Ubicación'],
  ['portada', 'Portada'],
  ['nosotros', 'Nosotros'],
  ['eventos', 'Eventos'],
];

const toForm = (s) => ({
  businessName: s.businessName || '',
  location: s.location || '',
  slogan: s.slogan || '',
  contact: { whatsapp: s.contact?.whatsapp || '', phoneDisplay: s.contact?.phoneDisplay || '', email: s.contact?.email || '', website: s.contact?.website || '' },
  social: { instagram: s.social?.instagram || '', threads: s.social?.threads || '', facebook: s.social?.facebook || '' },
  address: {
    street: s.address?.street || '',
    city: s.address?.city || '',
    postalCode: s.address?.postalCode || '',
    province: s.address?.province || '',
    country: s.address?.country || '',
    mapsUrl: s.address?.mapsUrl || '',
    lat: s.address?.lat ?? '',
    lng: s.address?.lng ?? '',
  },
  hero: { title: s.hero?.title || '', subtitle: s.hero?.subtitle || '' },
  about: { title: s.about?.title || '', text: s.about?.text || '', stats: (s.about?.stats || []).map((x) => ({ value: x.value, suffix: x.suffix || '', label: x.label })) },
  events: {
    title: s.events?.title || '',
    text: s.events?.text || '',
    capacity: s.events?.capacity || 30,
    includes: (s.events?.includes || []).map((i) => (typeof i === 'string' ? { label: i, icon: 'Sparkles', badge: '' } : { label: i.label, icon: i.icon || 'Sparkles', badge: i.badge || '' })),
    minHours: s.events?.minHours || 3,
    schedule: s.events?.schedule || 'A consultar',
    lodgingOptional: s.events?.lodgingOptional ?? true,
  },
  showPrices: Boolean(s.showPrices),
  seo: { title: s.seo?.title || '', description: s.seo?.description || '' },
});

export default function Settings() {
  const { settings, loaded, setSettings, fetchSettings } = useSettingsStore();
  const [tab, setTab] = useState('contacto');
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(settingsSchema), defaultValues: toForm(settings) });
  const stats = useFieldArray({ control, name: 'about.stats' });
  const includes = useFieldArray({ control, name: 'events.includes' });

  useEffect(() => {
    fetchSettings({ force: true });
  }, [fetchSettings]);
  useEffect(() => {
    if (loaded) reset(toForm(settings));
  }, [loaded]);

  const onSubmit = async (v, msg) => {
    const payload = v;
    try {
      const res = await adminApi.settings.update(payload);
      setSettings(res.data);
      reset(toForm(res.data));
      clearFetchCache();
      notifySuccess(typeof msg === 'string' ? msg : 'Configuración guardada');
    } catch (err) {
      handleFormError(err, setError);
    }
  };

  const onInvalid = (errs) => {
    const first = Object.keys(errs)[0];
    const map = { contact: 'contacto', social: 'contacto', businessName: 'contacto', location: 'contacto', slogan: 'contacto', showPrices: 'contacto', seo: 'contacto', address: 'ubicacion', hero: 'portada', about: 'nosotros', events: 'eventos' };
    if (map[first]) setTab(map[first]);
  };

  const persist = (msg) => handleSubmit((v) => onSubmit(v, msg), onInvalid)();

  const addInclude = async () => {
    const label = await askItem('Nuevo ítem');
    if (!label) return;
    includes.append({ label, icon: guessIcon(label), badge: '' });
    persist('Ítem agregado');
  };
  const editInclude = async (i) => {
    const current = watch(`events.includes.${i}`);
    const label = await askItem('Editar ítem', current.label);
    if (!label || label === current.label) return;
    includes.update(i, { ...current, label, icon: guessIcon(label, current.icon) });
    persist('Ítem actualizado');
  };
  const removeInclude = async (i) => {
    if (!(await confirmDelete(`“${watch(`events.includes.${i}.label`)}”`, 'Deja de mostrarse en la sección de eventos.'))) return;
    includes.remove(i);
    persist('Ítem eliminado');
  };
  const removeStat = async (i) => {
    if (!(await confirmDelete('este contador', 'Deja de mostrarse en la sección Nosotros.'))) return;
    stats.remove(i);
    persist('Contador eliminado');
  };

  if (!loaded) return <LoadingBlock />;
  const err = (path) => path.split('.').reduce((o, k) => o?.[k], errors)?.message;
  const mapsUrl = watch('address.mapsUrl');

  return (
    <>
      <PageHeader title="Configuración general" subtitle="Datos del negocio y textos del sitio. Todo lo que cambies acá se ve al instante en la web." />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-6 pb-24">
        {tab === 'contacto' && (
          <Card className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre del negocio" error={err('businessName')}>{(a) => <input className="input" {...a} {...register('businessName')} />}</Field>
            <Field label="Localidad" error={err('location')}>{(a) => <input className="input" {...a} {...register('location')} />}</Field>
            <Field label="Slogan" error={err('slogan')} className="sm:col-span-2">{(a) => <input className="input" {...a} {...register('slogan')} />}</Field>
            <Field label="WhatsApp de reservas" hint="Formato wa.me: código de país + área + número, sin 0 ni 15. Ej: 5493815027738" error={err('contact.whatsapp')}>
              {(a) => <input className="input" inputMode="numeric" {...a} {...register('contact.whatsapp')} />}
            </Field>
            <Field label="Teléfono visible" hint="Como se muestra en el sitio." error={err('contact.phoneDisplay')}>{(a) => <input className="input" {...a} {...register('contact.phoneDisplay')} />}</Field>
            <Field label="Email (opcional)" error={err('contact.email')}>{(a) => <input type="email" className="input" {...a} {...register('contact.email')} />}</Field>
            <Field label="Web" error={err('contact.website')}>{(a) => <input type="url" className="input" {...a} {...register('contact.website')} />}</Field>
            <Field label="Instagram" error={err('social.instagram')}>{(a) => <input type="url" className="input" placeholder="https://www.instagram.com/…" {...a} {...register('social.instagram')} />}</Field>
            <Field label="Facebook" error={err('social.facebook')}>{(a) => <input type="url" className="input" placeholder="https://www.facebook.com/…" {...a} {...register('social.facebook')} />}</Field>
            <div className="sm:col-span-2">
              <Controller
                name="showPrices"
                control={control}
                render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Mostrar precios de referencia en el sitio" />}
              />
            </div>
          </Card>
        )}

        {tab === 'ubicacion' && (
          <Card className="grid gap-4 sm:grid-cols-2">
            <Field label="Dirección" error={err('address.street')} className="sm:col-span-2">{(a) => <input className="input" {...a} {...register('address.street')} />}</Field>
            <Field label="Ciudad" error={err('address.city')}>{(a) => <input className="input" {...a} {...register('address.city')} />}</Field>
            <Field label="Código postal" error={err('address.postalCode')}>{(a) => <input className="input" {...a} {...register('address.postalCode')} />}</Field>
            <Field label="Provincia" error={err('address.province')}>{(a) => <input className="input" {...a} {...register('address.province')} />}</Field>
            <Field label="País" error={err('address.country')}>{(a) => <input className="input" {...a} {...register('address.country')} />}</Field>
            <Field label="Link de Google Maps (botón “Cómo llegar”)" error={err('address.mapsUrl')} className="sm:col-span-2">
              {(a) => (
                <div className="flex gap-2">
                  <input type="url" className="input" {...a} {...register('address.mapsUrl')} />
                  {mapsUrl && (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-outline shrink-0 !px-4" aria-label="Probar el link">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </Field>
            <Field label="Latitud (mapa embebido y clima)" error={err('address.lat')}>{(a) => <input type="number" step="any" className="input" {...a} {...register('address.lat')} />}</Field>
            <Field label="Longitud" error={err('address.lng')}>{(a) => <input type="number" step="any" className="input" {...a} {...register('address.lng')} />}</Field>
          </Card>
        )}

        {tab === 'portada' && (
          <Card className="space-y-5">
            <Field label="Título del hero" error={err('hero.title')}>{(a) => <input className="input" {...a} {...register('hero.title')} />}</Field>
            <Field label="Subtítulo" error={err('hero.subtitle')}>{(a) => <textarea rows={2} className="input" {...a} {...register('hero.subtitle')} />}</Field>
            <SettingsImages group="heroVerano" title="Fotos de fondo de la portada" hint="Subí fotos de las cabañas, la pileta o el entorno (horizontales y en buena calidad): se muestran en carrusel. Si no hay ninguna, se usan las portadas de las cabañas, y si tampoco hay, la ilustración animada." />
          </Card>
        )}

        {tab === 'nosotros' && (
          <Card className="space-y-5">
            <Field label="Título" error={err('about.title')}>{(a) => <input className="input" {...a} {...register('about.title')} />}</Field>
            <Field label="Texto institucional" error={err('about.text')}>{(a) => <textarea rows={6} className="input" {...a} {...register('about.text')} />}</Field>
            <div>
              <p className="label">Contadores animados</p>
              <p className="-mt-1 mb-2 text-xs text-carbon-light">La cantidad de cabañas se agrega sola.</p>
              <ul className="space-y-2">
                {stats.fields.map((f, i) => (
                  <li key={f.id} className="grid grid-cols-[90px_80px_1fr_auto] items-start gap-2">
                    <input type="number" step="any" className="input" aria-label="Valor" {...register(`about.stats.${i}.value`)} />
                    <input className="input" placeholder="km" aria-label="Sufijo" {...register(`about.stats.${i}.suffix`)} />
                    <div>
                      <input className="input" placeholder="de la Villa" aria-label="Etiqueta" {...register(`about.stats.${i}.label`)} />
                      {err(`about.stats.${i}.label`) && <p className="error-text">{err(`about.stats.${i}.label`)}</p>}
                    </div>
                    <IconButton label="Quitar contador" tone="danger" className="mt-1.5" onClick={() => removeStat(i)}>
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </li>
                ))}
              </ul>
              {stats.fields.length < 6 && (
                <button type="button" onClick={() => stats.append({ value: 0, suffix: '', label: '' })} className="btn-outline mt-2 !py-2 text-sm">
                  <Plus className="h-4 w-4" aria-hidden="true" /> Agregar contador
                </button>
              )}
            </div>
            <SettingsImages group="about" title="Fotos del collage (se usan las 3 primeras)" />
          </Card>
        )}

        {tab === 'eventos' && (
          <Card className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
              <Field label="Título" error={err('events.title')}>{(a) => <input className="input" {...a} {...register('events.title')} />}</Field>
              <Field label="Capacidad (personas)" error={err('events.capacity')}>{(a) => <input type="number" className="input" {...a} {...register('events.capacity')} />}</Field>
            </div>
            <Field label="Texto" error={err('events.text')}>{(a) => <textarea rows={4} className="input" {...a} {...register('events.text')} />}</Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mínimo de horas" hint="Se valida en el formulario de eventos." error={err('events.minHours')}>{(a) => <input type="number" min={1} max={24} className="input" {...a} {...register('events.minHours')} />}</Field>
              <Field label="Horarios" hint="Ej: A consultar · De 12 a 20 hs" error={err('events.schedule')}>{(a) => <input className="input" maxLength={60} {...a} {...register('events.schedule')} />}</Field>
            </div>
            <div>
              <p className="label">Qué incluye</p>
              <p className="-mt-1 mb-2 text-xs text-carbon-light">El ícono se elige solo según el texto. Los cambios se guardan al instante.</p>
              <ul className="divide-y divide-madera/10 rounded-2xl ring-1 ring-madera/10">
                {includes.fields.map((f, i) => {
                  const item = watch(`events.includes.${i}`) || f;
                  const Icon = getIcon(item.icon);
                  return (
                    <li key={f.id} className="flex items-center gap-3 px-3 py-2.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sol text-carbon" aria-hidden="true">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1 font-semibold text-carbon">{item.label}</span>
                      <IconButton label={`Editar ${item.label}`} onClick={() => editInclude(i)}>
                        <Pencil className="h-4 w-4" />
                      </IconButton>
                      <IconButton label={`Eliminar ${item.label}`} tone="danger" onClick={() => removeInclude(i)}>
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </li>
                  );
                })}
              </ul>
              <button type="button" onClick={addInclude} className="btn-outline mt-3 !py-2 text-sm">
                <Plus className="h-4 w-4" aria-hidden="true" /> Agregar ítem
              </button>
            </div>
            <Controller name="events.lodgingOptional" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Ofrecer hospedaje opcional" />} />
            <SettingsImages group="events" title="Fotos del quincho y la pileta (se usan las 3 primeras)" />
          </Card>
        )}

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-madera/10 bg-crema/90 px-4 py-3 backdrop-blur lg:pl-[17rem]">
          <div className="mx-auto flex max-w-7xl items-center justify-end gap-3">
            {isDirty && <span className="text-sm font-semibold text-tejido-ink">Tenés cambios sin guardar</span>}
            <button type="submit" disabled={isSubmitting || !isDirty} className="btn-sol">
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Guardar configuración
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
