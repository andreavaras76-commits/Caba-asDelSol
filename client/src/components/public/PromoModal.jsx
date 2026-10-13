import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MessageCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Field, Toggle } from '@/components/ui/FormField';
import { makePromoSchema } from '@/schemas/inquiry.schema';
import useWhatsAppInquiry from '@/hooks/useWhatsAppInquiry';
import useFetch from '@/hooks/useFetch';
import { publicApi } from '@/api/public';
import { promoBadge, todayISO, addDaysISO } from '@/utils/format';

/** "Quiero esta promo": pide lo mínimo y abre WhatsApp con el nombre de la promo */
export default function PromoModal({ promo, onClose }) {
  const { data: allCabins = [] } = useFetch('cabins', publicApi.cabins);
  const cabins = promo?.appliesToAll ? allCabins : allCabins.filter((c) => promo?.cabins?.some((pc) => (pc._id || pc) === c.id));
  const { send, sending } = useWhatsAppInquiry();
  const capacityOf = (id) => cabins.find((c) => c.id === id)?.capacity || Math.max(1, ...cabins.map((c) => c.capacity), 1);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: (values, ctx, opts) => zodResolver(makePromoSchema({ maxGuests: capacityOf(values.cabin) }))(values, ctx, opts),
    defaultValues: { name: '', cabin: '', checkIn: '', checkOut: '', guests: '', pets: false },
  });

  useEffect(() => {
    if (promo) reset({ name: '', cabin: cabins.length === 1 ? cabins[0].id : '', checkIn: '', checkOut: '', guests: '', pets: false });
  }, [promo?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkIn = watch('checkIn');

  const onSubmit = async (values) => {
    const cabin = cabins.find((c) => c.id === values.cabin);
    const ok = await send(
      { ...values, type: 'promo', promotion: promo._id },
      { cabinName: cabin?.name, promotionTitle: promo.title }
    );
    if (ok) onClose();
  };

  return (
    <Modal open={Boolean(promo)} onClose={onClose} title={promo ? `Quiero la promo “${promo.title}”` : ''}>
      {promo && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <p className="-mt-2 inline-block rounded-full bg-sol px-3 py-1 text-sm font-bold text-carbon">{promoBadge(promo)}</p>
          {promo.minNights > 1 && <p className="text-sm text-carbon-light">Mínimo {promo.minNights} noches.</p>}

          <Field label="Tu nombre" error={errors.name?.message}>
            {(a) => <input className="input" autoComplete="given-name" {...a} {...register('name')} />}
          </Field>
          {cabins.length > 1 && (
            <Field label="Cabaña (opcional)" error={errors.cabin?.message}>
              {(a) => (
                <select className="input" {...a} {...register('cabin')}>
                  <option value="">Cualquiera de la promo</option>
                  {cabins.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (hasta {c.capacity})
                    </option>
                  ))}
                </select>
              )}
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Entrada (opcional)" error={errors.checkIn?.message}>
              {(a) => <input type="date" min={todayISO()} className="input" {...a} {...register('checkIn')} />}
            </Field>
            <Field label="Salida (opcional)" error={errors.checkOut?.message}>
              {(a) => <input type="date" min={checkIn ? addDaysISO(checkIn, 1) : todayISO()} className="input" {...a} {...register('checkOut')} />}
            </Field>
          </div>
          <Field label="Huéspedes (opcional)" error={errors.guests?.message}>
            {(a) => <input type="number" inputMode="numeric" min={1} className="input" {...a} {...register('guests')} />}
          </Field>
          <Controller name="pets" control={control} render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Viajo con mascota 🐾" />} />
          <button type="submit" disabled={sending} className="btn-sol mt-2 w-full">
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
            Consultar por WhatsApp
          </button>
        </form>
      )}
    </Modal>
  );
}
