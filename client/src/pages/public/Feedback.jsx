import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Star, Loader2, Send, Heart } from 'lucide-react';
import Seo from '@/components/ui/Seo';
import BrandLogo from '@/components/ui/BrandLogo';
import { Field } from '@/components/ui/FormField';
import { LoadingBlock } from '@/components/admin/ui';
import useFetch from '@/hooks/useFetch';
import { publicApi } from '@/api/public';

const schema = z.object({
  rating: z.number({ invalid_type_error: 'Elegí una puntuación' }).int().min(1, 'Elegí una puntuación').max(5),
  text: z.string().trim().max(1500, 'El comentario admite hasta 1500 caracteres').optional().or(z.literal('')),
  origin: z.string().trim().max(80, 'Hasta 80 caracteres').optional().or(z.literal('')),
});

const LABELS = ['', 'Mala', 'Regular', 'Buena', 'Muy buena', '¡Excelente!'];

export default function Feedback() {
  const { token } = useParams();
  const { data, loading, error } = useFetch(`feedback-${token}`, () => publicApi.feedback(token));
  const [done, setDone] = useState(false);
  const [hover, setHover] = useState(0);
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { rating: 0, text: '', origin: '' } });

  const onSubmit = async (values) => {
    try {
      await publicApi.submitFeedback(token, values);
      setDone(true);
    } catch (err) {
      if (err.status === 409) setDone(true);
      else setError('root', { message: err.message });
    }
  };

  const shell = (children) => (
    <section className="flex min-h-[80vh] items-center justify-center bg-gradient-to-b from-cielo-100 via-crema to-crema px-4 pb-16 pt-28">
      <Seo title="Tu opinión" noindex />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg rounded-4xl bg-white p-6 text-center shadow-calida-lg sm:p-8">
        <span className="mx-auto mb-4 inline-flex rounded-3xl bg-white p-1.5 shadow-calida ring-1 ring-madera/5">
          <BrandLogo variant="full" size={88} className="h-20 w-20 rounded-2xl" />
        </span>
        {children}
      </motion.div>
    </section>
  );

  if (loading) return shell(<LoadingBlock />);
  if (error) return shell(<p className="text-carbon-light">{error.message || 'Este link de opinión no existe.'}</p>);

  if (done || data?.answered) {
    return shell(
      <>
        <Heart className="mx-auto h-10 w-10 fill-tejido text-tejido" aria-hidden="true" />
        <h1 className="mt-3 text-3xl font-semibold text-cerro-profundo">¡Gracias{data?.name ? `, ${data.name}` : ''}!</h1>
        <p className="mt-2 text-carbon-light">Tu opinión nos ayuda a seguir mejorando. ¡Te esperamos de nuevo en los Valles!</p>
        <Link to="/" className="btn-sol mt-6">Volver al sitio</Link>
      </>
    );
  }

  return shell(
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="text-left">
      <p className="text-center font-script text-2xl text-tejido-ink">¡Hola, {data.name}!</p>
      <h1 className="text-center text-3xl font-semibold text-cerro-profundo">¿Cómo fue tu estadía{data.cabinName ? ` en la ${data.cabinName}` : ''}?</h1>

      <Controller
        name="rating"
        control={control}
        render={({ field }) => (
          <div className="mt-6 text-center">
            <div role="radiogroup" aria-label="Puntuación" className="inline-flex gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => {
                const on = n <= (hover || field.value);
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={field.value === n}
                    aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
                    onClick={() => field.onChange(n)}
                    onMouseEnter={() => setHover(n)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star className={`h-10 w-10 ${on ? 'fill-sol text-sol' : 'text-piedra'}`} />
                  </button>
                );
              })}
            </div>
            <p className="h-6 font-semibold text-madera">{LABELS[hover || field.value]}</p>
            {errors.rating && <p className="error-text">{errors.rating.message}</p>}
          </div>
        )}
      />

      <Field label="Contanos un poco más (opcional)" error={errors.text?.message} className="mt-4">
        {(a) => <textarea rows={4} className="input" placeholder="¿Qué fue lo que más te gustó? ¿Qué podemos mejorar?" {...a} {...register('text')} />}
      </Field>
      <Field label="¿De dónde nos visitás? (opcional)" error={errors.origin?.message} className="mt-4">
        {(a) => <input className="input" placeholder="Ej: San Miguel de Tucumán" {...a} {...register('origin')} />}
      </Field>
      {errors.root && <p className="error-text mt-3">{errors.root.message}</p>}
      <button type="submit" disabled={isSubmitting} className="btn-sol mt-6 w-full">
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Enviar opinión
      </button>
    </form>
  );
}
