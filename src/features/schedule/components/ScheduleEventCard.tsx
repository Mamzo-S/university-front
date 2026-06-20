import { cn } from '@/lib/utils'
import { SEANCE_DRAG_TYPE } from '@/features/schedule/utils/scheduleUtils'
import type { ScheduleEvent } from '@/types/schedule'

const typeStyles: Record<
  ScheduleEvent['type'],
  { accent: string; label: string }
> = {
  course: { accent: 'border-l-primary-500', label: 'Cours' },
  td: { accent: 'border-l-slate-500', label: 'TD' },
  tp: { accent: 'border-l-slate-600', label: 'TP' },
  online: { accent: 'border-l-sky-500', label: 'En ligne' },
  meeting: { accent: 'border-l-amber-500', label: 'Groupe' },
  workshop: { accent: 'border-l-blue-500', label: 'Atelier' },
  exam: { accent: 'border-l-rose-500', label: 'Examen' },
}

interface ScheduleEventCardProps {
  event: ScheduleEvent
  style: { top: number; height: number }
  compact?: boolean
  interactive?: boolean
  draggable?: boolean
  isDragging?: boolean
  onClick?: () => void
  onDragStart?: (eventId: string) => void
  onDragEnd?: () => void
}

export function ScheduleEventCard({
  event,
  style,
  compact = false,
  interactive = false,
  draggable = false,
  isDragging = false,
  onClick,
  onDragStart,
  onDragEnd,
}: ScheduleEventCardProps) {
  const { accent, label } = typeStyles[event.type]
  const isCompact = compact || style.height < 56
  const showMeta = !compact && style.height >= 72
  const showTag = !compact && style.height >= 96

  return (
    <div
      className={cn(
        'absolute inset-x-0.5 overflow-hidden rounded-md border border-l-[3px] shadow-sm transition-shadow',
        accent,
        event.colorClass ?? 'border-slate-200 bg-white text-slate-900',
        interactive && 'pointer-events-auto',
        draggable
          ? 'cursor-grab active:cursor-grabbing hover:shadow-md hover:ring-2 hover:ring-primary-300/60'
          : interactive
            ? 'cursor-pointer hover:shadow-md hover:ring-2 hover:ring-primary-200'
            : 'pointer-events-none',
        isDragging && 'opacity-40',
      )}
      style={{ top: style.top, height: style.height, zIndex: isDragging ? 20 : 1 }}
      aria-label={`${event.title}, ${event.startTime} à ${event.endTime}`}
      draggable={draggable}
      onDragStart={
        draggable
          ? (e) => {
              e.stopPropagation()
              e.dataTransfer.setData(SEANCE_DRAG_TYPE, event.id)
              e.dataTransfer.effectAllowed = 'move'
              onDragStart?.(event.id)
            }
          : undefined
      }
      onDragEnd={draggable ? onDragEnd : undefined}
      onClick={
        interactive
          ? (e) => {
              e.stopPropagation()
              onClick?.()
            }
          : undefined
      }
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <div className={cn('flex h-full flex-col gap-0.5', compact ? 'px-1 py-0.5' : 'px-1.5 py-1')}>
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-[8px] font-semibold uppercase tracking-wide opacity-70">
            {label}
          </span>
          {event.isRecurring && !isCompact && (
            <span
              className="shrink-0 rounded bg-white/60 px-1 py-px text-[8px] font-bold opacity-80"
              title="Récurrent chaque semaine"
            >
              ↻
            </span>
          )}
        </div>

        <p
          className={cn(
            'font-semibold leading-tight',
            isCompact ? 'line-clamp-1 text-[9px]' : 'line-clamp-2 text-[10px]',
          )}
        >
          {event.title}
        </p>

        {showMeta && event.teacher && (
          <p className="line-clamp-1 text-[9px] opacity-75">{event.teacher}</p>
        )}

        {showMeta && event.room && (
          <p className="line-clamp-1 text-[9px] opacity-70">📍 {event.room}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-1">
          <span className="text-[9px] font-medium opacity-70">
            {event.startTime}–{event.endTime}
          </span>
          {showTag && event.tag && (
            <span className="max-w-[55%] truncate rounded bg-white/50 px-1 py-px text-[8px] font-medium">
              {event.tag.label}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
