import type {
  FiliereModuleSummary,
  FormationCatalog,
  FormationParcours,
} from '@/features/catalog/api/catalogApi'
import { formatNiveauEtude } from '@/types/niveauEtude'
import type { StudentFormation } from '@/types/formation'

export const DEFAULT_FORMATION_IMAGE =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop'

export function formationIdFromCatalog(catalogId: number): string {
  return String(catalogId)
}

export function formationSlugFromCatalog(
  catalog: Pick<FormationCatalog, 'slug' | 'id'>,
): string {
  return catalog.slug?.trim() || String(catalog.id)
}

export function moduleSlugFromSummary(
  module: Pick<FiliereModuleSummary, 'slug' | 'id'>,
): string {
  return module.slug?.trim() || String(module.id)
}

export function studentFormationDetailPath(
  module: Pick<FiliereModuleSummary, 'slug' | 'id'>,
): string {
  return `/student/formations/${moduleSlugFromSummary(module)}`
}

export function catalogToStudentFormation(catalog: FormationCatalog): StudentFormation {
  return buildStudentFormation(catalog)
}

export function buildStudentFormation(
  catalog: FormationCatalog,
  parcours?: FormationParcours | null,
): StudentFormation {
  return {
    id: formationSlugFromCatalog(catalog),
    title: catalog.titre ?? catalog.nom,
    description: catalog.description ?? '',
    imageUrl: catalog.imageUrl ?? DEFAULT_FORMATION_IMAGE,
    level: formatNiveauEtude(catalog.niveau),
    type: catalog.typeFormation ?? '—',
    managerName: parcours?.managerName ?? '—',
    trainerName: parcours?.trainerName ?? '—',
    tutorName: parcours?.tutorName ?? '—',
    duration: parcours?.duration ?? '—',
    sessionUrl: parcours?.sessionUrl ?? '#',
    subModules: parcours?.subModules ?? [],
    projectDeposits: parcours?.projectDeposits ?? [],
  }
}

export function mergeCatalogWithFormation(
  catalog: FormationCatalog,
  formation: StudentFormation,
): StudentFormation {
  return {
    ...formation,
    id: formationSlugFromCatalog(catalog),
    title: catalog.titre ?? catalog.nom,
    description: catalog.description ?? formation.description,
    imageUrl: catalog.imageUrl ?? formation.imageUrl ?? DEFAULT_FORMATION_IMAGE,
    level: formatNiveauEtude(catalog.niveau),
    type: catalog.typeFormation ?? formation.type,
  }
}

export function extractParcoursFromFormation(formation: StudentFormation): FormationParcours {
  return {
    managerName: formation.managerName !== '—' ? formation.managerName : undefined,
    trainerName: formation.trainerName !== '—' ? formation.trainerName : undefined,
    tutorName: formation.tutorName !== '—' ? formation.tutorName : undefined,
    duration: formation.duration !== '—' ? formation.duration : undefined,
    sessionUrl:
      formation.sessionUrl && formation.sessionUrl !== '#'
        ? formation.sessionUrl
        : undefined,
    subModules: formation.subModules,
    projectDeposits: formation.projectDeposits,
  }
}
