import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, MessageCircle, Loader2, User } from 'lucide-react';
import { Field, YesNoSelect } from '@/components/ui/FormField';
import Magnetic from '@/components/ui/Magnetic';
import { makeStaySchema } from '@/schemas/inquiry.schema';
import useWhatsAppInquiry from '@/hooks/useWhatsAppInquiry';
import useFetch from '@/hooks/useFetch';
import { publicApi } from '@/api/public';
import { todayISO, addDaysISO } from '@/utils/format';
import { LIMITS, SLEEPING_OPTIONS } from '@/utils/constants';

export default function HeroSearch() {
  const { data: cabins = [] } = useFetch('cabins', publicApi.cabins);
  const { send, sending } = useWhatsAppInquiry();
  const maxCapacity = useMemo(() => Math.max(1, ...cabins.map((c) => c.capacity)), [cabins]);
  const capacityOf = (id) => cabins.find((c) => c.id === id)?.capacity || (cabins.length ? maxCapacity : LIMITS.GUESTS_MAX);
  const sleepingFor = (id) => (id ? cabins.find((c) => c.id === id)?.sleepingOptions || [] : Object.keys(SLEEPING_OPTIONS));

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: (values, ctx, opts) =>
      zodResolver(makeStaySchema({ maxGuests: capacityOf(values.cabin), sleepingOptions: sleepingFor(values.cabin) }))(values, ctx, opts),
    defaultValues: { checkIn: '', checkOut: '', guests: 2, cabin: '', pets: false, name: '', sleepingPreference: '' },
  });

  const checkIn = watch('checkIn');
  const cabinId = watch('cabin');
  const sleepingChoices = sleepingFor(cabinId);
  useEffect(() => {
    const pref = watch('sleepingPreference');
    if (pref && !sleepingChoices.includes(pref)) setValue('sleepingPreference', '');
  }, [cabinId]);
  const guestsMax = capacityOf(cabinId);

  const onSubmit = async (values) => {
    const cabin = cabins.find((c) => c.id === values.cabin);
    await send({ ...values, type: cabin ? 'cabana' : 'general' }, { cabinName: cabin?.name });
  };

  const inputCls = 'input !border-transparent !bg-white/95 !py-3 pl-10';
  const dateCls = 'input !border-transparent !bg-white/95 !py-3 !px-3 sm:!pl-10';
  const selCls = 'input !border-transparent !bg-white/95 !py-3 !pl-3 !pr-8';
  const dateIcon = 'pointer-events-none absolute left-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-madera sm:block';

  return (
    <form
      id="consultar"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="glass w-full scroll-mt-28 rounded-4xl p-4 shadow-calida-lg sm:p-5"
      aria-label="Consultar disponibilidad"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1fr_1fr_1.1fr_1.05fr_1.15fr_1fr]">
        <Field label="Entrada" error={errors.checkIn?.message} light>
          {(a) => (
            <div className="relative">
              <CalendarDays className={dateIcon} aria-hidden="true" />
              <input
                type="date"
                min={todayISO()}
                className={dateCls}
                {...a}
                {...register('checkIn', {
                  onChange: (e) => {
                    const out = watch('checkOut');
                    if (e.target.value && (!out || out <= e.target.value)) setValue('checkOut', addDaysISO(e.target.value, 2));
                  },
                })}
              />
            </div>
          )}
        </Field>
        <Field label="Salida" error={errors.checkOut?.message} light>
          {(a) => (
            <div className="relative">
              <CalendarDays className={dateIcon} aria-hidden="true" />
              <input type="date" min={checkIn ? addDaysISO(checkIn, 1) : todayISO()} className={dateCls} {...a} {...register('checkOut')} />
            </div>
          )}
        </Field>
        <Field label="Huéspedes" error={errors.guests?.message} light>
          {(a) => (
            <div className="relative">
              <select className={selCls} {...a} {...register('guests')}>
                {Array.from({ length: guestsMax }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'huésped' : 'huéspedes'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </Field>
        <Field label="Cabaña" error={errors.cabin?.message} light>
          {(a) => (
            <div className="relative">
              <select className={selCls} {...a} {...register('cabin')}>
                <option value="">Cualquiera</option>
                {cabins.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (hasta {c.capacity})
                  </option>
                ))}
              </select>
            </div>
          )}
        </Field>
        <Field label="¿Cómo preferís dormir?" error={errors.sleepingPreference?.message} light className="col-span-2 lg:col-span-1">
          {(a) => (
            <div className="relative">
              <select className={selCls} disabled={!sleepingChoices.length} {...a} {...register('sleepingPreference')}>
                <option value="">{sleepingChoices.length ? 'Me da igual' : 'Sin opciones'}</option>
                {sleepingChoices.map((k) => (
                  <option key={k} value={k}>
                    {SLEEPING_OPTIONS[k]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </Field>
        <Field label="Tu nombre" error={errors.name?.message} light className="col-span-2 lg:col-span-1">
          {(a) => (
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-madera" aria-hidden="true" />
              <input type="text" autoComplete="given-name" placeholder="Tu nombre" className={inputCls} {...a} {...register('name')} />
            </div>
          )}
        </Field>
      </div>

      <div className="mt-4 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <Controller
          name="pets"
          control={control}
          render={({ field }) => <YesNoSelect value={field.value} onChange={field.onChange} label="¿Viajás con mascota? 🐾" light />}
        />
        <Magnetic className="w-full sm:w-auto">
          <button type="submit" disabled={sending} className="btn-sol w-full !py-3.5 sm:w-auto">
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
            Consultar por WhatsApp
          </button>
        </Magnetic>
      </div>
    </form>
  );
}
