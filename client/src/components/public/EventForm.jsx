import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MessageCircle } from 'lucide-react';
import { Field, YesNoSelect } from '@/components/ui/FormField';
import Magnetic from '@/components/ui/Magnetic';
import { makeEventSchema } from '@/schemas/inquiry.schema';
import useWhatsAppInquiry from '@/hooks/useWhatsAppInquiry';
import { todayISO } from '@/utils/format';
import { EVENT_TYPES, EVENT_MIN_HOURS } from '@/utils/constants';

/** Formulario de eventos / día de campo → WhatsApp */
export default function EventForm({ capacity = 30, lodgingOptional = true, minHours = EVENT_MIN_HOURS }) {
  const { send, sending } = useWhatsAppInquiry();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(makeEventSchema({ capacity, minHours })),
    defaultValues: { name: '', eventType: EVENT_TYPES[0], eventDate: '', people: 15, hours: minHours, withLodging: false, comments: '' },
  });

  const onSubmit = async (values) => {
    const ok = await send({ ...values, type: 'evento' });
    if (ok) reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-4xl bg-crema p-6 text-carbon shadow-calida-lg sm:p-8" aria-label="Consultar por un evento">
      <p className="font-script text-2xl text-tejido-ink">Armemos tu día de campo</p>
      <h3 className="mb-6 text-3xl font-semibold text-cerro-profundo">Consultá por tu evento</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de evento" error={errors.eventType?.message}>
          {(a) => (
            <select className="input" {...a} {...register('eventType')}>
              {EVENT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Fecha" error={errors.eventDate?.message}>
          {(a) => <input type="date" min={todayISO()} className="input" {...a} {...register('eventDate')} />}
        </Field>
        <Field label={`Cantidad de personas (hasta ${capacity})`} error={errors.people?.message}>
          {(a) => <input type="number" inputMode="numeric" min={1} max={capacity} className="input" {...a} {...register('people')} />}
        </Field>
        <Field label={`Cantidad de horas (mínimo ${minHours})`} error={errors.hours?.message}>
          {(a) => <input type="number" inputMode="numeric" min={minHours} max={24} className="input" {...a} {...register('hours')} />}
        </Field>
        <Field label="Tu nombre" error={errors.name?.message} className="sm:col-span-2">
          {(a) => <input type="text" autoComplete="given-name" className="input" {...a} {...register('name')} />}
        </Field>
        <Field label="Tu WhatsApp (opcional)" hint="Para confirmarte el evento más rápido." error={errors.phone?.message} className="sm:col-span-2">
          {(a) => <input type="tel" inputMode="tel" autoComplete="tel" placeholder="(0381) 15-555-5555" className="input" {...a} {...register('phone')} />}
        </Field>
        <Field label="Comentarios (opcional)" error={errors.comments?.message} className="sm:col-span-2">
          {(a) => <textarea rows={3} className="input resize-none" placeholder="Horario que te gustaría, si traen comida, si hay chicos…" {...a} {...register('comments')} />}
        </Field>
      </div>
      <div className="mt-5 flex flex-col gap-4">
        {lodgingOptional ? (
          <Controller
            name="withLodging"
            control={control}
            render={({ field }) => <YesNoSelect value={field.value} onChange={field.onChange} label="¿Con hospedaje?" yes="Sí, nos quedamos a dormir" />}
          />
        ) : (
          <span />
        )}
        <Magnetic className="w-full">
          <button type="submit" disabled={sending} className="btn-cerro w-full whitespace-nowrap">
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
            Consultar por WhatsApp
          </button>
        </Magnetic>
      </div>
    </form>
  );
}
