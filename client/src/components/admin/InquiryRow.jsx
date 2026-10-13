import { Home, PartyPopper, Gift, MessageCircle, PawPrint } from 'lucide-react';
import { Badge, INQUIRY_TONES } from './ui';
import { INQUIRY_STATUS } from '@/utils/constants';
import { formatDay, timeAgo } from '@/utils/format';

const TYPE_ICON = { cabana: Home, evento: PartyPopper, promo: Gift, general: MessageCircle };

/** Resumen de una consulta (para listados y dashboard) */
export function InquirySummary({ inquiry }) {
  const Icon = TYPE_ICON[inquiry.type] || MessageCircle;
  const stay =
    inquiry.type === 'evento'
      ? [inquiry.eventType, inquiry.eventDate && formatDay(inquiry.eventDate), inquiry.people && `${inquiry.people} personas`, inquiry.withLodging && 'con hospedaje']
      : [inquiry.checkIn && `${formatDay(inquiry.checkIn, { day: '2-digit', month: '2-digit' })} → ${formatDay(inquiry.checkOut, { day: '2-digit', month: '2-digit' })}`, inquiry.nights && `${inquiry.nights} noches`, inquiry.guests && `${inquiry.guests} huéspedes`];

  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-crema-dark text-madera">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 font-semibold">
          {inquiry.name}
          <Badge tone={INQUIRY_TONES[inquiry.status]}>{INQUIRY_STATUS[inquiry.status]}</Badge>
          {inquiry.pets && <PawPrint className="h-4 w-4 text-tejido-ink" aria-label="Con mascota" />}
        </p>
        <p className="truncate text-sm text-carbon-light">
          {[inquiry.cabinName || (inquiry.type === 'evento' ? 'Evento / día de campo' : 'Sin cabaña elegida'), inquiry.promotionTitle && `🎁 ${inquiry.promotionTitle}`].filter(Boolean).join(' · ')}
        </p>
        <p className="text-xs text-carbon-light">
          {stay.filter(Boolean).join(' · ')} · {timeAgo(inquiry.createdAt)}
        </p>
      </div>
    </div>
  );
}
