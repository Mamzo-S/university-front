import { roleToCategory } from '@/features/admin/config/personnelCategories'
import {
  mapBackendUser,
  type BackendAuthResponse,
} from '@/features/auth/utils/authMappers'
import type { AdminPersonnel } from '@/mocks/data/adminPersonnel'
import { ROLE_LABELS, UserRole } from '@/types/roles'

export interface BackendMembreResponse {
  id: number
  utilisateurId: number
  prenom: string
  nom: string
  email: string
  telephone?: string
  actif: boolean
  role: string
  fonction?: string
  service?: string
  grade?: string
  specialite?: string
  ine?: string
  dateNaissance?: string
  niveau?: string
  promotionNom?: string
  formationNom?: string
  filiereId?: number
  filiereNom?: string
  promotionId?: number
  groupeEtudiantId?: number
  groupeEtudiantNom?: string
  formationIds?: number[]
  formationNoms?: string[]
}

const BACKEND_TO_FRONT_ROLE: Record<string, UserRole> = {
  ADMIN: UserRole.ADMIN,
  FORMATEUR: UserRole.TEACHER,
  PROFESSEUR: UserRole.TEACHER,
  ETUDIANT: UserRole.STUDENT,
  PERSONNEL_ADMIN: UserRole.ADMIN_STAFF,
  TUTEUR: UserRole.TUTOR,
  RESPONSABLE_FORMATION: UserRole.TRAINING_MANAGER,
  SERVICE_INSERTION: UserRole.CAREER_SERVICE,
}

const FRONT_TO_BACKEND_ROLE: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'ADMIN',
  [UserRole.ADMIN_STAFF]: 'PERSONNEL_ADMIN',
  [UserRole.TEACHER]: 'FORMATEUR',
  [UserRole.TUTOR]: 'TUTEUR',
  [UserRole.TRAINING_MANAGER]: 'RESPONSABLE_FORMATION',
  [UserRole.CAREER_SERVICE]: 'SERVICE_INSERTION',
  [UserRole.STUDENT]: 'ETUDIANT',
}

export interface BackendUpdateUserRequest {
  email: string
  nom: string
  prenom: string
  telephone?: string
  actif: boolean
  motDePasse?: string
  ine?: string
  dateNaissance?: string
  promotionNom?: string
  formationNom?: string
  niveau?: string
  grade?: string
  specialite?: string
  fonction?: string
  service?: string
}

export interface BackendCreateUserRequest {
  email: string
  motDePasse: string
  nom: string
  prenom: string
  telephone?: string
  roles: string[]
  ine?: string
  dateNaissance?: string
  promotionNom?: string
  formationNom?: string
  niveau?: string
  grade?: string
  specialite?: string
  fonction?: string
  service?: string
  typePersonnel?: string
}

export function toCreateUserRequest(
  values: AdminPersonnel,
  password: string,
): BackendCreateUserRequest {
  const backendRole = FRONT_TO_BACKEND_ROLE[values.role]
  const body: BackendCreateUserRequest = {
    email: values.email,
    motDePasse: password,
    nom: values.lastName,
    prenom: values.firstName,
    roles: [backendRole],
  }

  switch (values.role) {
    case UserRole.TEACHER:
      body.grade = values.department
      body.specialite = values.specialty
      break
    case UserRole.STUDENT:
      body.ine = values.ine?.trim()
      body.niveau = values.niveauEtude ?? 'LICENCE_1'
      body.promotionNom = values.promotion?.trim()
      body.formationNom = values.program?.trim()
      if (values.dateOfBirth) {
        body.dateNaissance = values.dateOfBirth
      }
      break
    case UserRole.ADMIN_STAFF:
      body.fonction = ROLE_LABELS[UserRole.ADMIN_STAFF]
      body.service = values.department
      body.typePersonnel = 'PERSONNEL_ADMIN'
      break
    case UserRole.TUTOR:
      body.fonction = values.tutorGroup || ROLE_LABELS[UserRole.TUTOR]
      body.service = values.department
      body.typePersonnel = 'TUTEUR'
      break
    case UserRole.TRAINING_MANAGER:
      body.fonction = ROLE_LABELS[UserRole.TRAINING_MANAGER]
      body.service = values.department
      body.typePersonnel = 'RESPONSABLE_FORMATION'
      break
    case UserRole.CAREER_SERVICE:
      body.fonction = ROLE_LABELS[UserRole.CAREER_SERVICE]
      body.service = values.department || values.partnerZone
      body.typePersonnel = 'SERVICE_INSERTION'
      break
    default:
      break
  }

  return body
}

export function toUpdateUserRequest(
  values: AdminPersonnel,
  password?: string,
): BackendUpdateUserRequest {
  const createBody = toCreateUserRequest(values, password ?? '')
  const body: BackendUpdateUserRequest = {
    email: createBody.email,
    nom: createBody.nom,
    prenom: createBody.prenom,
    actif: values.status === 'active',
    ine: createBody.ine,
    dateNaissance: createBody.dateNaissance,
    promotionNom: createBody.promotionNom,
    formationNom: createBody.formationNom,
    niveau: createBody.niveau,
    grade: createBody.grade,
    specialite: createBody.specialite,
    fonction: createBody.fonction,
    service: createBody.service,
  }

  if (password?.trim()) {
    body.motDePasse = password.trim()
  }

  return body
}

export function mapMembreToAdminPersonnel(
  membre: BackendMembreResponse,
): AdminPersonnel {
  const role = BACKEND_TO_FRONT_ROLE[membre.role] ?? UserRole.ADMIN_STAFF
  const category = roleToCategory(role)

  return {
    id: String(membre.utilisateurId ?? membre.id),
    firstName: membre.prenom,
    lastName: membre.nom,
    email: membre.email,
    role,
    category,
    status: membre.actif ? 'active' : 'inactive',
    joinedAt: new Date().toISOString().slice(0, 10),
    department: membre.service ?? membre.grade,
    specialty: membre.specialite,
    tutorGroup: category === 'tuteur' ? membre.fonction : undefined,
    partnerZone: category === 'insertion' ? membre.service : undefined,
    ine: membre.ine,
    dateOfBirth: membre.dateNaissance,
    program: membre.formationNom,
    promotion: membre.promotionNom,
    niveauEtude: membre.niveau,
  }
}

export function toAdminPersonnelFromAuthResponse(
  response: BackendAuthResponse,
  formValues: AdminPersonnel,
): AdminPersonnel {
  const user = response.user ? mapBackendUser(response.user) : null
  const primaryRole = user?.roles[0] ?? formValues.role

  return {
    ...formValues,
    id: user?.id ?? formValues.id,
    firstName: user?.firstName ?? formValues.firstName,
    lastName: user?.lastName ?? formValues.lastName,
    email: user?.email ?? formValues.email,
    role: primaryRole,
    category: roleToCategory(primaryRole),
    status: 'active',
  }
}
