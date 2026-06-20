/**
 * Modèle domaine — emploi du temps académique.
 *
 * Formation (catalogue) + Promotions (classes)
 * Promotion (1) ── (1) EmploiDuTemps ── (N) Seance
 * Seance = Formation + Enseignant + créneau horaire
 */

/** Module du catalogue pédagogique (UE / cours). */
export interface ModuleCours {
  id: number
  code: string
  nom: string
  semestre: string
  coefficient: number
  formationId: number
  formationNom?: string
}

/** Promotion = classe / cohorte d'étudiants rattachée à une formation. */
export interface ClassePromotion {
  id: number
  nom: string
  anneeAcademique?: string
  formationId?: number
  formationNom?: string
  effectif?: number
}

export type TypeSeance =
  | 'COURS'
  | 'TD'
  | 'TP'
  | 'EN_LIGNE'
  | 'ATELIER'
  | 'EXAMEN'

/** Créneau planifié dans un emploi du temps. */
export interface SeancePlanifiee {
  id: number
  emploiDuTempsId: number
  coursId: number
  coursCode: string
  coursNom: string
  formateurId: number
  formateurNom: string
  promotionId: number
  promotionNom: string
  formationId?: number
  formationNom?: string
  jourSemaine: number
  heureDebut: string
  heureFin: string
  salle?: string
  typeSeance: TypeSeance | string
}

/**
 * Agrégat emploi du temps : un planning complet pour une promotion (classe).
 */
export interface EmploiDuTemps {
  id: number
  promotionId: number
  promotionNom: string
  anneeAcademique?: string
  formationId?: number
  formationNom?: string
  libelle: string
  publie: boolean
  effectif: number
  seances: SeancePlanifiee[]
}
