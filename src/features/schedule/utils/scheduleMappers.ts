import type {
  ClassePromotion,
  EmploiDuTemps,
  ModuleCours,
  SeancePlanifiee,
} from '@/types/emploiDuTemps'
import type { ScheduleEvent, ScheduleEventType } from '@/types/schedule'

export type BackendFormation = {
  id: number
  titre?: string
  nom: string
  slug?: string
  description?: string
  imageUrl?: string
  niveau?: string
  typeFormation?: string
  typeFinancement?: string
  dateDebut?: string
  dateFin?: string
}

export type BackendPromotion = ClassePromotion & {
  titre?: string
  slug?: string
  description?: string
  anneeAcademiqueId?: number
  anneeAcademiqueTitre?: string
}

export type BackendCours = ModuleCours

export type FormationScheduleOption = {
  id: number
  label: string
}

export type BackendSeance = SeancePlanifiee

export type BackendEmploiDuTemps = EmploiDuTemps

const TYPE_MAP: Record<string, ScheduleEventType> = {
  COURS: 'course',
  TD: 'td',
  TP: 'tp',
  EN_LIGNE: 'online',
  ATELIER: 'workshop',
  EXAMEN: 'exam',
}

const PROMOTION_COLORS = [
  'bg-primary-50 border-primary-200 text-primary-900',
  'bg-sky-50 border-sky-200 text-sky-900',
  'bg-violet-50 border-violet-200 text-violet-900',
  'bg-amber-50 border-amber-200 text-amber-900',
  'bg-emerald-50 border-emerald-200 text-emerald-900',
  'bg-rose-50 border-rose-200 text-rose-900',
]

function promotionColorClass(promotionId: number) {
  return PROMOTION_COLORS[promotionId % PROMOTION_COLORS.length]!
}

export function mapSeanceToScheduleEvent(seance: SeancePlanifiee): ScheduleEvent {
  const type = TYPE_MAP[seance.typeSeance] ?? 'course'
  const isOnline = type === 'online'

  return {
    id: String(seance.id),
    title: seance.formationNom || seance.coursNom,
    type,
    dayOfWeek: seance.jourSemaine,
    startTime: seance.heureDebut.slice(0, 5),
    endTime: seance.heureFin.slice(0, 5),
    room: seance.salle,
    teacher: seance.formateurNom,
    hasJoin: isOnline,
    description: seance.formationNom
      ? `${seance.formationNom} · ${seance.promotionNom}`
      : seance.promotionNom,
    isRecurring: true,
    tag: {
      label: seance.formationNom || seance.promotionNom,
      variant: 'blue',
    },
    colorClass: promotionColorClass(seance.promotionId),
  }
}

export function mapFormateurOption(formateur: {
  id: number
  prenom: string
  nom: string
}) {
  return {
    id: formateur.id,
    label: `${formateur.prenom} ${formateur.nom}`.trim(),
  }
}

export const DAY_OPTIONS = [
  { value: 0, label: 'Lundi' },
  { value: 1, label: 'Mardi' },
  { value: 2, label: 'Mercredi' },
  { value: 3, label: 'Jeudi' },
  { value: 4, label: 'Vendredi' },
  { value: 5, label: 'Samedi' },
  { value: 6, label: 'Dimanche' },
]

export const SEANCE_TYPE_OPTIONS = [
  { value: 'COURS', label: 'Cours' },
  { value: 'TD', label: 'TD' },
  { value: 'TP', label: 'TP' },
  { value: 'EN_LIGNE', label: 'En ligne' },
  { value: 'ATELIER', label: 'Atelier' },
  { value: 'EXAMEN', label: 'Examen' },
]
