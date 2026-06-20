import { useCallback, useMemo, useState } from 'react'
import { ScheduleEventCard } from '@/features/schedule/components/ScheduleEventCard'
import {
  COMPACT_SCHEDULE_CONFIG,
  FORMATION_DRAG_TYPE,
  SEANCE_DRAG_TYPE,
  SCHEDULE_CONFIG,
  type ScheduleGridConfig,
  generateTimeSlots,
  getEventPosition,
  getNowLinePosition,
  getWeekDays,
  isSameDay,
  slotIndexToTimeRange,
  yOffsetToSlotIndex,
} from '@/features/schedule/utils/scheduleUtils'
import { MOCK_STUDENT_SCHEDULE } from '@/mocks/data/schedule'
import { cn } from '@/lib/utils'
import type { ScheduleEvent, ScheduleEventMove, ScheduleSlotSelection } from '@/types/schedule'

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

interface WeeklyScheduleProps {
  events?: ScheduleEvent[]
  emptyMessage?: string
  editable?: boolean
  canPlan?: boolean
  isLoading?: boolean
  statsLabel?: string
  planHint?: string
  /** Grille plus basse (vue étudiant). */
  compact?: boolean
  onSlotSelect?: (slot: ScheduleSlotSelection) => void
  onEventClick?: (eventId: string) => void
  onEventMove?: (move: ScheduleEventMove) => void
}

export function WeeklySchedule({
  events,
  emptyMessage = 'Aucun créneau planifié pour cette semaine.',
  editable = false,
  canPlan = true,
  isLoading = false,
  statsLabel,
  planHint,
  compact = false,
  onSlotSelect,
  onEventClick,
  onEventMove,
}: WeeklyScheduleProps) {
  const [today] = useState(() => new Date())
  const [dragOverDay, setDragOverDay] = useState<number | null>(null)
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null)
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null)

  const gridConfig: ScheduleGridConfig = compact ? COMPACT_SCHEDULE_CONFIG : SCHEDULE_CONFIG
  const { slotHeight } = gridConfig

  const weekDays = useMemo(() => getWeekDays(today), [today])
  const timeSlots = useMemo(() => generateTimeSlots(gridConfig), [gridConfig])
  const nowLine = useMemo(() => getNowLinePosition(gridConfig), [gridConfig])

  const sourceEvents = events ?? (editable ? [] : MOCK_STUDENT_SCHEDULE.events)

  const promotionLabels = useMemo(() => {
    const labels = new Set<string>()
    for (const event of sourceEvents) {
      if (event.tag?.label) labels.add(event.tag.label)
    }
    return labels.size
  }, [sourceEvents])

  const eventsByDay = useMemo(() => {
    const map = new Map<number, ScheduleEvent[]>()
    for (let i = 0; i < 7; i++) map.set(i, [])
    for (const event of sourceEvents) {
      map.get(event.dayOfWeek)?.push(event)
    }
    return map
  }, [sourceEvents])

  const gridHeight = timeSlots.length * slotHeight

  const resolveSlotFromPointer = useCallback((clientY: number, currentTarget: EventTarget) => {
    const column = currentTarget as HTMLElement
    const rect = column.getBoundingClientRect()
    const y = clientY - rect.top
    const slotIndex = yOffsetToSlotIndex(y, gridConfig)
    return slotIndexToTimeRange(slotIndex, 120, gridConfig)
  }, [gridConfig])

  const handleColumnClick = useCallback(
    (dayIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
      if (!editable || !canPlan || !onSlotSelect) return
      if ((e.target as HTMLElement).closest('[data-schedule-event]')) return

      const { startTime, endTime } = resolveSlotFromPointer(e.clientY, e.currentTarget)
      onSlotSelect({ dayOfWeek: dayIndex, startTime, endTime })
    },
    [editable, canPlan, onSlotSelect, resolveSlotFromPointer],
  )

  const handleDrop = useCallback(
    (dayIndex: number, e: React.DragEvent<HTMLDivElement>) => {
      if (!editable || !canPlan) return
      e.preventDefault()
      setDragOverDay(null)
      setDragOverSlot(null)
      setDraggingEventId(null)

      const { startTime, endTime } = resolveSlotFromPointer(e.clientY, e.currentTarget)

      const seanceId = e.dataTransfer.getData(SEANCE_DRAG_TYPE)
      if (seanceId && onEventMove) {
        onEventMove({
          eventId: seanceId,
          dayOfWeek: dayIndex,
          startTime,
          endTime,
        })
        return
      }

      if (!onSlotSelect) return

      const formationIdRaw =
        e.dataTransfer.getData(FORMATION_DRAG_TYPE) ||
        e.dataTransfer.getData('text/plain')
      const formationId = formationIdRaw ? Number(formationIdRaw) : undefined

      onSlotSelect({
        dayOfWeek: dayIndex,
        startTime,
        endTime,
        formationId:
          formationId && !Number.isNaN(formationId) ? formationId : undefined,
      })
    },
    [editable, canPlan, onSlotSelect, onEventMove, resolveSlotFromPointer],
  )

  const handleDragOver = useCallback(
    (dayIndex: number, e: React.DragEvent<HTMLDivElement>) => {
      if (!editable || !canPlan) return
      e.preventDefault()

      const isSeanceDrag = e.dataTransfer.types.includes(SEANCE_DRAG_TYPE)
      e.dataTransfer.dropEffect = isSeanceDrag ? 'move' : 'copy'

      const rect = e.currentTarget.getBoundingClientRect()
      const slotIndex = yOffsetToSlotIndex(e.clientY - rect.top, gridConfig)
      setDragOverDay(dayIndex)
      setDragOverSlot(slotIndex)
    },
    [editable, canPlan, gridConfig],
  )

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {statsLabel ? (
          <p className="text-sm font-medium text-slate-700">{statsLabel}</p>
        ) : (
          <p className="text-sm font-medium text-slate-700">
            {sourceEvents.length} séance{sourceEvents.length !== 1 ? 's' : ''}
            {promotionLabels > 0 &&
              ` · ${promotionLabels} promotion${promotionLabels !== 1 ? 's' : ''}`}
          </p>
        )}
        {isLoading && (
          <span className="text-xs text-slate-400">Chargement…</span>
        )}
      </div>

      {editable && (
        <p className="mb-3 rounded-lg border border-dashed border-primary-200 bg-primary-50/50 px-3 py-2 text-xs text-primary-800">
          {planHint ??
            (canPlan
              ? 'Cliquez sur un créneau vide pour ajouter une séance, glissez une formation ou déplacez une séance existante.'
              : 'Ajoutez au moins un module, un enseignant et une promotion pour planifier.')}
        </p>
      )}

      {sourceEvents.length === 0 && (
        <p className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-center text-sm text-slate-500">
          {emptyMessage}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
        <div className="overflow-x-auto">
          <div className="w-full min-w-[760px]">
            <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-slate-100">
              <div className="bg-white" />
              {weekDays.map((date, index) => {
                const isToday = isSameDay(date, today)
                const isSunday = index === 6

                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      'px-2 text-center',
                      compact ? 'py-2' : 'py-3',
                      isToday
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-slate-600',
                      isSunday && !isToday && 'text-slate-300',
                    )}
                  >
                    <span
                      className={cn(
                        'block text-[10px] font-semibold uppercase tracking-wider',
                        isToday ? 'text-primary-100' : 'text-slate-400',
                      )}
                    >
                      {DAY_LABELS[index]}
                    </span>
                    <span className="mt-0.5 block text-sm font-bold">
                      {date.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-[48px_repeat(7,1fr)]">
              <div className="border-r border-slate-50 bg-white">
                {timeSlots.map((slot) => (
                  <div
                    key={slot}
                    className="flex items-start justify-end border-b border-slate-50 pr-2 pt-0.5 text-[10px] text-slate-400"
                    style={{ height: slotHeight }}
                  >
                    {slot.endsWith(':00') ? slot : ''}
                  </div>
                ))}
              </div>

              {weekDays.map((date, dayIndex) => {
                const isToday = isSameDay(date, today)
                const isSunday = dayIndex === 6
                const dayEvents = eventsByDay.get(dayIndex) ?? []
                const isDropTarget = dragOverDay === dayIndex

                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      'relative border-r border-slate-50 bg-white',
                      isToday && 'bg-primary-50/20',
                      isSunday && !isToday && 'bg-slate-50/50',
                      editable && canPlan && 'cursor-cell',
                      isDropTarget && 'bg-primary-50/60 ring-2 ring-inset ring-primary-300',
                    )}
                    style={{ height: gridHeight }}
                    onClick={(e) => handleColumnClick(dayIndex, e)}
                    onDragOver={(e) => handleDragOver(dayIndex, e)}
                    onDragLeave={() => {
                      setDragOverDay(null)
                      setDragOverSlot(null)
                    }}
                    onDrop={(e) => handleDrop(dayIndex, e)}
                  >
                    {timeSlots.map((slot, slotIndex) => (
                      <div
                        key={slot}
                        className={cn(
                          'border-b border-slate-50',
                          editable && canPlan && 'pointer-events-none',
                          editable &&
                            canPlan &&
                            isDropTarget &&
                            dragOverSlot === slotIndex &&
                            'bg-primary-100/70',
                        )}
                        style={{ height: slotHeight }}
                      />
                    ))}

                    {isToday && nowLine && (
                      <div
                        className="pointer-events-none absolute inset-x-0 z-10"
                        style={{ top: nowLine.top }}
                      >
                        <span className="absolute -left-12 -top-2.5 rounded-md bg-rose-500 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm">
                          {nowLine.label}
                        </span>
                        <div className="border-t-2 border-dashed border-rose-400/70" />
                      </div>
                    )}

                    {dayEvents.map((event) => (
                      <div key={event.id} data-schedule-event>
                        <ScheduleEventCard
                          event={event}
                          style={getEventPosition(event.startTime, event.endTime, gridConfig)}
                          compact={compact}
                          interactive={editable}
                          draggable={editable && canPlan && !!onEventMove}
                          isDragging={draggingEventId === event.id}
                          onDragStart={setDraggingEventId}
                          onDragEnd={() => setDraggingEventId(null)}
                          onClick={() => onEventClick?.(event.id)}
                        />
                        {draggingEventId === event.id && (
                          <div
                            className="pointer-events-none absolute inset-x-1 rounded-lg border-2 border-dashed border-primary-300 bg-primary-50/40"
                            style={getEventPosition(event.startTime, event.endTime, gridConfig)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {!compact && (
      <div className="mt-4 flex flex-wrap gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
        {[
          { color: 'bg-primary-500', label: 'Cours' },
          { color: 'bg-sky-500', label: 'En ligne' },
          { color: 'bg-amber-400', label: 'Groupe' },
          { color: 'bg-blue-500', label: 'Atelier' },
          { color: 'bg-rose-500', label: 'Examen' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-full', item.color)} />
            <span className="text-xs text-slate-500">{item.label}</span>
          </div>
        ))}
        {editable && (
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-emerald-50 px-1.5 py-px text-[9px] font-medium text-emerald-700">
              ↻
            </span>
            <span className="text-xs text-slate-500">Récurrent chaque semaine</span>
          </div>
        )}
      </div>
      )}
    </div>
  )
}
