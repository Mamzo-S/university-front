export type ScheduleEventType =
  | 'course'
  | 'td'
  | 'tp'
  | 'online'
  | 'meeting'
  | 'workshop'
  | 'exam'

export interface ScheduleParticipant {
  initials: string
  color: string
}

export interface ScheduleEvent {
  id: string
  title: string
  type: ScheduleEventType
  dayOfWeek: number
  startTime: string
  endTime: string
  room?: string
  teacher?: string
  participants?: ScheduleParticipant[]
  extraCount?: number
  tag?: { label: string; variant: 'pink' | 'blue' }
  description?: string
  hasJoin?: boolean
  fileLink?: string
  isInProgress?: boolean
  /** Séance récurrente chaque semaine (emploi du temps). */
  isRecurring?: boolean
  /** Classe Tailwind pour distinguer les promotions sur la grille. */
  colorClass?: string
}

export interface ScheduleWeek {
  startDate: string
  endDate: string
  events: ScheduleEvent[]
}

export interface ScheduleSlotSelection {
  dayOfWeek: number
  startTime: string
  endTime: string
  formationId?: number
}

export interface ScheduleEventMove {
  eventId: string
  dayOfWeek: number
  startTime: string
  endTime: string
}
