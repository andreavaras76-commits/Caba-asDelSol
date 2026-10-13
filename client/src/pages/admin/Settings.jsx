import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2, Plus, Trash2, ExternalLink } from 'lucide-react';
import { PageHeader, Card, LoadingBlock, Tabs, IconButton } from '@/components/admin/ui';
import SettingsImages from '@/components/admin/SettingsImages';
import { Field, Toggle } from '@/components/ui/FormField';
import { settingsSchema } from '@/schemas/admin.schema';
import { adminApi } from '@/api/admin';
import { useSettingsStore } from '@/store/settingsStore';
import { clearFetchCache } from '@/hooks/useFetch';
import { notifySuccess, handleFormError } from '@/utils/notify';

const TABS = [
  ['contacto', 'Contacto y redes'],
  ['ubicacion', 'Ubicación'],
  ['portada', 'Portada'],
  ['nosotros', 'Nosotros'],
  ['eventos', 'Eventos'],
  ['seo', 'SEO y precios'],
];

/** Settings del backend → valores del formulario */
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
    includes: (s.events?.includes || []).map((value) => ({ value })),
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
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (v) => {
    const payload = { ...v, events: { ...v.events, includes: v.events.includes.map((i) => i.value) } };
    try {
      const res = await adminApi.settings.update(payload);
      setSettings(res.data);
      reset(toForm(res.data));
      clearFetchCache();
      notifySuccess('Configuración guardada');
    } catch (err) {
      handleFormError(err, setError);
    }
  };

  // Ubica la pestaña del primer error para que no quede escondido
  const onInvalid = (errs) => {
    const first = Object.keys(errs)[0];
    const map = { contact: 'contacto', social: 'contacto', businessName: 'contacto', location: 'contacto', slogan: 'contacto', address: 'ubicacion', hero: 'portada', about: 'nosotros', events: 'eventos', seo: 'seo' };
    if (map[first]) setTab(map[first]);
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
            <Field label="Threads" error={err('social.threads')}>{(a) => <input type="url" className="input" {...a} {...register('social.threads')} />}</Field>
            <Field label="Facebook (opcional)" error={err('social.facebook')}>{(a) => <input type="url" className="input" {...a} {...register('social.facebook')} />}</Field>
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
            <SettingsImages group="heroVerano" title="Fotos del hero — Verano" hint="Pileta, sol, cerros verdes. Horizontales y en alta calidad. Si no hay fotos se muestra la ilustración animada." />
            <SettingsImages group="heroInvierno" title="Fotos del hero — Invierno" hint="Nieve, chimenea, quincho calentito." />
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
                    <input type="number" className="input" aria-label="Valor" {...register(`about.stats.${i}.value`)} />
                    <input className="input" placeholder="km" aria-label="Sufijo" {...register(`about.stats.${i}.suffix`)} />
                    <div>
                      <input className="input" placeholder="de la Villa" aria-label="Etiqueta" {...register(`about.stats.${i}.label`)} />
                      {err(`about.stats.${i}.label`) && <p className="error-text">{err(`about.stats.${i}.label`)}</p>}
                    </div>
                    <IconButton label="Quitar contador" tone="danger" className="mt-1.5" onClick={() => stats.remove(i)}>
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
            <div>
              <p className="label">Qué incluye</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {includes.fields.map((f, i) => (
                  <li key={f.id} className="flex items-start gap-2">
                    <div className="flex-1">
                      <input className="input" aria-label={`Ítem ${i + 1}`} {...register(`events.includes.${i}.value`)} />
                      {err(`events.includes.${i}.value`) && <p className="error-text">{err(`events.includes.${i}.value`)}</p>}
                    </div>
                    <IconButton label="Quitar" tone="danger" className="mt-1.5" onClick={() => includes.remove(i)}>
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => includes.append({ value: '' })} className="btn-outline mt-2 !py-2 text-sm">
                <Plus className="h-4 w-4" aria-hidden="true" /> Agregar ítem
              </button>
            </div>
            <Controller name="events.lodgingOptional" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Ofrecer hospedaje opcional" />} />
            <SettingsImages group="events" title="Fotos del quincho y la pileta (se usan las 3 primeras)" />
          </Card>
        )}

        {tab === 'seo' && (
          <Card className="space-y-5">
            <Controller
              name="showPrices"
              control={control}
              render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Mostrar precios de referencia en el sitio (interruptor general)" />}
            />
            <Field label="Título para Google (máx. 70)" error={err('seo.title')}>{(a) => <input className="input" maxLength={70} {...a} {...register('seo.title')} />}</Field>
            <Field label="Descripción para Google (máx. 160)" error={err('seo.description')}>{(a) => <textarea rows={3} maxLength={160} className="input" {...a} {...register('seo.description')} />}</Field>
            <SettingsImages group="og" single title="Imagen para compartir (WhatsApp, Instagram, Facebook)" hint="Ideal 1200 × 630 px. Si no hay, se usa la primera foto del hero de verano." />
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
