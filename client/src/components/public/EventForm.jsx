import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MessageCircle } from 'lucide-react';
import { Field, Toggle } from '@/components/ui/FormField';
import Magnetic from '@/components/ui/Magnetic';
import { makeEventSchema } from '@/schemas/inquiry.schema';
import useWhatsAppInquiry from '@/hooks/useWhatsAppInquiry';
import { todayISO } from '@/utils/format';

const EVENT_TYPES = ['Cumpleaños', 'Juntada con amigos/as', 'Reunión familiar', 'Evento de empresa', 'Otro'];

/** Formulario de eventos / día de campo → WhatsApp */
export default function EventForm({ capacity = 30, lodgingOptional = true }) {
  const { send, sending } = useWhatsAppInquiry();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(makeEventSchema({ capacity })),
    defaultValues: { name: '', eventType: EVENT_TYPES[0], eventDate: '', people: 15, withLodging: false, comments: '' },
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
        <Field label="Tu nombre" error={errors.name?.message}>
          {(a) => <input type="text" autoComplete="given-name" className="input" {...a} {...register('name')} />}
        </Field>
        <Field label="Comentarios (opcional)" error={errors.comments?.message} className="sm:col-span-2">
          {(a) => <textarea rows={3} className="input resize-none" placeholder="Horario, si traen comida, si hay chicos…" {...a} {...register('comments')} />}
        </Field>
      </div>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {lodgingOptional ? (
          <Controller
            name="withLodging"
            control={control}
            render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Queremos quedarnos a dormir" />}
          />
        ) : (
          <span />
        )}
        <Magnetic>
          <button type="submit" disabled={sending} className="btn-cerro w-full sm:w-auto">
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
            Consultar por WhatsApp
          </button>
        </Magnetic>
      </div>
    </form>
  );
}
