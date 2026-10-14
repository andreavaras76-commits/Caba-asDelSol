import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarX2, Loader2, MessageCircle } from 'lucide-react';
import { Field, YesNoSelect } from '@/components/ui/FormField';
import Magnetic from '@/components/ui/Magnetic';
import { makeStaySchema } from '@/schemas/inquiry.schema';
import useWhatsAppInquiry from '@/hooks/useWhatsAppInquiry';
import useFetch from '@/hooks/useFetch';
import { publicApi } from '@/api/public';
import { usePromoStore } from '@/store/promoStore';
import { todayISO, addDaysISO, nightsBetween, formatDay, formatPrice, promoBadge } from '@/utils/format';
import { SLEEPING_OPTIONS } from '@/utils/constants';

const NO_BLOCKS = [];

/** Formulario de consulta prearmado con la cabaña (página de detalle) */
export default function CabinInquiryForm({ cabin }) {
  const { send, sending } = useWhatsAppInquiry();
  const { data: blockedData } = useFetch(`blocked-${cabin.id}`, () => publicApi.blockedDates(cabin.id));
  const blocked = blockedData || NO_BLOCKS;
  // Seleccionamos la lista y filtramos con useMemo (un selector que crea arrays nuevos re-renderiza en loop)
  const allPromos = usePromoStore((s) => s.promos);
  const promos = useMemo(() => allPromos.filter((p) => p.appliesToAll || p.cabins?.some((c) => (c._id || c) === cabin.id)), [allPromos, cabin.id]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitted },
  } = useForm({
    resolver: (values, ctx, opts) =>
      zodResolver(makeStaySchema({ maxGuests: cabin.capacity, requireCabin: true, blocked, sleepingOptions: cabin.sleepingOptions || [] }))(values, ctx, opts),
    defaultValues: { cabin: cabin.id, checkIn: '', checkOut: '', guests: Math.min(2, cabin.capacity), pets: false, promotion: '', name: '', comments: '', sleepingPreference: '' },
  });

  const [checkIn, checkOut, promotion] = watch(['checkIn', 'checkOut', 'promotion']);
  const nights = checkIn && checkOut && checkOut > checkIn ? nightsBetween(checkIn, checkOut) : 0;
  const selectedPromo = promos.find((p) => p._id === promotion);

  // Revalida al llegar los bloqueos (por si el usuario ya eligió fechas)
  useEffect(() => {
    if (isSubmitted) trigger();
  }, [blocked]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (values) =>
    send({ ...values, type: values.promotion ? 'promo' : 'cabana' }, { cabinName: cabin.name, promotionTitle: selectedPromo?.title });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-4xl bg-white p-6 shadow-calida-lg ring-1 ring-madera/5 sm:p-7" aria-label={`Consultar disponibilidad de ${cabin.name}`}>
      {cabin.price?.show && cabin.price.amount ? (
        <p className="text-carbon-light">
          desde <span className="font-serif text-3xl font-semibold text-madera">{formatPrice(cabin.price.amount)}</span> /noche
        </p>
      ) : (
        <p className="font-script text-2xl text-tejido-ink">Consultá disponibilidad</p>
      )}
      <h2 className="mb-5 text-2xl font-semibold text-cerro-profundo">{cabin.name}</h2>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Entrada" error={errors.checkIn?.message}>
          {(a) => (
            <input
              type="date"
              min={todayISO()}
              className="input"
              {...a}
              {...register('checkIn', {
                onChange: (e) => {
                  const minN = selectedPromo?.minNights || 2;
                  if (e.target.value && (!checkOut || checkOut <= e.target.value)) setValue('checkOut', addDaysISO(e.target.value, minN));
                },
              })}
            />
          )}
        </Field>
        <Field label="Salida" error={errors.checkOut?.message}>
          {(a) => <input type="date" min={checkIn ? addDaysISO(checkIn, 1) : todayISO()} className="input" {...a} {...register('checkOut')} />}
        </Field>
      </div>
      {nights > 0 && (
        <p className="mt-2 text-sm font-semibold text-cerro">
          {nights} {nights === 1 ? 'noche' : 'noches'}
          {selectedPromo?.minNights > nights && <span className="ml-2 text-tejido-ink">· la promo pide mínimo {selectedPromo.minNights}</span>}
        </p>
      )}

      <div className="mt-4 grid gap-4">
        <Field label={`Huéspedes (hasta ${cabin.capacity})`} error={errors.guests?.message}>
          {(a) => (
            <select className="input" {...a} {...register('guests')}>
              {Array.from({ length: cabin.capacity }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'huésped' : 'huéspedes'}
                </option>
              ))}
            </select>
          )}
        </Field>
        {cabin.sleepingOptions?.length > 0 && (
          <Field label="¿Cómo preferís dormir?" error={errors.sleepingPreference?.message}>
            {(a) => (
              <select className="input" {...a} {...register('sleepingPreference')}>
                <option value="">Me da igual</option>
                {cabin.sleepingOptions.map((k) => (
                  <option key={k} value={k}>
                    {SLEEPING_OPTIONS[k]}
                  </option>
                ))}
              </select>
            )}
          </Field>
        )}
        {promos.length > 0 && (
          <Field label="¿Querés usar una promo?" error={errors.promotion?.message}>
            {(a) => (
              <select className="input" {...a} {...register('promotion')}>
                <option value="">Sin promo</option>
                {promos.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title} — {promoBadge(p)}
                  </option>
                ))}
              </select>
            )}
          </Field>
        )}
        <Field label="Tu nombre" error={errors.name?.message}>
          {(a) => <input type="text" autoComplete="given-name" className="input" {...a} {...register('name')} />}
        </Field>
        <Field label="Tu WhatsApp (opcional)" hint="Para confirmarte la reserva más rápido." error={errors.phone?.message}>
          {(a) => <input type="tel" inputMode="tel" autoComplete="tel" placeholder="(0381) 15-555-5555" className="input" {...a} {...register('phone')} />}
        </Field>
        <Field label="Comentarios (opcional)" error={errors.comments?.message}>
          {(a) => <textarea rows={2} className="input resize-none" {...a} {...register('comments')} />}
        </Field>
        <Controller name="pets" control={control} render={({ field }) => <YesNoSelect value={field.value} onChange={field.onChange} label="¿Viajás con mascota? 🐾" />} />
      </div>

      <Magnetic className="mt-6 w-full">
        <button type="submit" disabled={sending} className="btn-sol w-full !py-4">
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
          Consultar por WhatsApp
        </button>
      </Magnetic>
      <p className="mt-3 text-center text-xs text-carbon-light">Te respondemos por WhatsApp. No se cobra nada online.</p>

      {blocked.length > 0 && (
        <div className="mt-5 rounded-2xl bg-crema p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-madera">
            <CalendarX2 className="h-4 w-4" aria-hidden="true" /> Fechas sin disponibilidad
          </p>
          <ul className="mt-2 space-y-1 text-sm text-carbon-light">
            {blocked.slice(0, 6).map((b) => (
              <li key={b._id}>
                {formatDay(b.startDate, { day: 'numeric', month: 'short' })} → {formatDay(b.endDate, { day: 'numeric', month: 'short' })}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
