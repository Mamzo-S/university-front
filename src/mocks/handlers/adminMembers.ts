import type { BackendMembreResponse } from '@/features/admin/utils/personnelMappers'
import { CATEGORY_API_PATH } from '@/features/admin/config/personnelCategories'
import type { PersonnelCategory } from '@/mocks/data/adminPersonnel'
import {
  MOCK_ADMIN_PERSONNEL,
  normalizePersonnel,
} from '@/mocks/data/adminPersonnel'
import { fakeDelay } from '@/mocks/utils'

const FRONT_TO_BACKEND_ROLE: Record<string, string> = {
  ADMIN: 'ADMIN',
  ADMIN_STAFF: 'PERSONNEL_ADMIN',
  TEACHER: 'FORMATEUR',
  TUTOR: 'TUTEUR',
  TRAINING_MANAGER: 'RESPONSABLE_FORMATION',
  CAREER_SERVICE: 'SERVICE_INSERTION',
  STUDENT: 'ETUDIANT',
}

function toBackendMembre(
  item: ReturnType<typeof normalizePersonnel>[number],
): BackendMembreResponse {
  return {
    id: Number(item.id.replace(/\D/g, '')) || 0,
    utilisateurId: Number(item.id.replace(/\D/g, '')) || 0,
    prenom: item.firstName,
    nom: item.lastName,
    email: item.email,
    actif: item.status === 'active',
    role: FRONT_TO_BACKEND_ROLE[item.role] ?? 'PERSONNEL_ADMIN',
    fonction: item.tutorGroup,
    service: item.department ?? item.partnerZone,
    grade: item.department,
    specialite: item.specialty,
    ine: item.ine,
    niveau: item.niveauEtude,
    promotionNom: item.promotion,
    formationNom: item.program,
  }
}

const PATH_TO_CATEGORY = Object.fromEntries(
  Object.entries(CATEGORY_API_PATH).map(([category, path]) => [
    path.replace(/^\//, ''),
    category as PersonnelCategory,
  ]),
) as Record<string, PersonnelCategory>

export async function handleAdminMembersList(path: string) {
  await fakeDelay(200)

  const category = PATH_TO_CATEGORY[path]
  if (!category) {
    return { error: { status: 404, data: 'Catégorie introuvable' } }
  }

  const data = normalizePersonnel(MOCK_ADMIN_PERSONNEL)
    .filter((item) => item.category === category)
    .map(toBackendMembre)

  return { data }
}
