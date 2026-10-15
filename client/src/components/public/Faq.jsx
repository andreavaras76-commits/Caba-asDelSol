import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, MessageCircle } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { waLink } from '@/utils/whatsapp';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';

export default function Faq({ faqs = [] }) {
  const { contact, businessName } = useSettingsStore((s) => s.settings);
  const [open, setOpen] = useState(0);
  const baseId = useId();
  if (!faqs.length) return null;

  return (
    <section id="faq" className="bg-crema py-20 sm:py-28">
      <div className="container-sol max-w-3xl">
        <SectionHeading eyebrow="¿Dudas?" title="Preguntas frecuentes" />
        <Reveal as="ul" className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            const panelId = `${baseId}-panel-${i}`;
            return (
              <li key={f._id} className={`overflow-hidden rounded-3xl bg-white shadow-calida transition-shadow ${isOpen ? 'ring-2 ring-sol/60' : ''}`}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-serif text-lg font-semibold text-cerro-profundo sm:text-xl"
                  >
                    {f.question}
                    <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sol-100 text-madera">
                      <Plus className="h-5 w-5" aria-hidden="true" />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="whitespace-pre-line px-6 pb-6 leading-relaxed text-carbon-light">{f.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </Reveal>
        <Reveal className="mt-10 text-center">
          <a
            href={waLink(contact.whatsapp, `¡Hola ${businessName}! 👋 Tengo una consulta:`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cerro"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" /> ¿Tenés otra pregunta? Escribinos por WhatsApp
          </a>
        </Reveal>
      </div>
    </section>
  );
}
