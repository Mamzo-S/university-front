import { baseApi } from '@/app/api/baseApi'
import type { BackendMembreResponse } from '@/features/admin/utils/personnelMappers'
import type {
  FormationProjectDeposit,
  FormationSubModule,
} from '@/types/formation'

export interface FormationCatalog {
  id: number
  titre: string
  nom: string
  slug: string
  description?: string
  imageUrl?: string
  niveau?: string
  typeFormation?: string
  typeFinancement?: string
  dateDebut?: string
  dateFin?: string
  filiereId?: number
  filiereNom?: string
}

export interface PromotionCatalog {
  id: number
  titre: string
  nom: string
  slug: string
  description?: string
  anneeAcademique?: string
  anneeAcademiqueId?: number
  anneeAcademiqueTitre?: string
  formationId?: number
  formationNom?: string
  effectif?: number
}

export interface AcademicYearCatalog {
  id: number
  titre: string
  slug: string
  description?: string
}

export interface FormationCatalogInput {
  titre: string
  slug?: string
  description?: string
  imageUrl?: string
  niveau?: string
  typeFormation?: string
  typeFinancement?: string
  dateDebut?: string
  dateFin?: string
  filiereId?: number
}

export interface FormationParcours {
  managerName?: string
  trainerName?: string
  tutorName?: string
  duration?: string
  sessionUrl?: string
  subModules: FormationSubModule[]
  projectDeposits?: FormationProjectDeposit[]
}

export interface FiliereCatalog {
  id: number
  nom: string
  description?: string
  moduleCount?: number
  etudiantCount?: number
}

export interface FiliereCatalogInput {
  nom: string
  description?: string
}

export interface FiliereModuleSummary {
  id: number
  titre: string
  slug?: string
  description?: string
  imageUrl?: string
  niveau?: string
  typeFormation?: string
  subModuleCount?: number
}

export interface FiliereEtudiantSummary {
  id: number
  prenom?: string
  nom?: string
  email?: string
  ine?: string
  promotionNom?: string
  formationNom?: string
}

export interface FiliereDetailCatalog extends FiliereCatalog {
  modules: FiliereModuleSummary[]
  etudiants: FiliereEtudiantSummary[]
}

export interface PromotionCatalogInput {
  titre: string
  slug?: string
  description?: string
}

export interface AcademicYearInput {
  titre: string
  slug?: string
  description?: string
}

export interface StudentGroupCatalog {
  id: number
  titre: string
  slug: string
  description?: string
  promotionId?: number
  promotionTitre?: string
  formationId?: number
  formationNom?: string
  filiereId?: number
  filiereNom?: string
  effectif?: number
}

export interface StudentGroupInput {
  titre: string
  slug?: string
  description?: string
  promotionId: number
}

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFormationsCatalog: builder.query<FormationCatalog[], void>({
      query: () => '/formations',
      providesTags: ['Formation'],
    }),
    getFormationCatalog: builder.query<FormationCatalog, number>({
      query: (id) => `/formations/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Formation', id }],
    }),
    getFormationBySlug: builder.query<FormationCatalog, string>({
      query: (slug) => `/formations/by-slug/${encodeURIComponent(slug)}`,
      providesTags: (_result, _error, slug) => [{ type: 'Formation', id: `slug-${slug}` }],
    }),
    getFormationParcours: builder.query<FormationParcours, number>({
      query: (id) => `/formations/${id}/parcours`,
      providesTags: (_result, _error, id) => [{ type: 'Formation', id: `parcours-${id}` }],
    }),
    getFormationParcoursBySlug: builder.query<FormationParcours, string>({
      query: (slug) => `/formations/by-slug/${encodeURIComponent(slug)}/parcours`,
      providesTags: (_result, _error, slug) => [
        { type: 'Formation', id: `parcours-slug-${slug}` },
      ],
    }),
    updateFormationParcours: builder.mutation<
      FormationParcours,
      { id: number; body: FormationParcours }
    >({
      query: ({ id, body }) => ({
        url: `/formations/${id}/parcours`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Formation', id: `parcours-${id}` },
        'Formation',
        'Filiere',
      ],
    }),
    createFormationCatalog: builder.mutation<FormationCatalog, FormationCatalogInput>({
      query: (body) => ({ url: '/formations', method: 'POST', body }),
      invalidatesTags: ['Formation', 'Schedule'],
    }),
    updateFormationCatalog: builder.mutation<
      FormationCatalog,
      { id: number; body: FormationCatalogInput }
    >({
      query: ({ id, body }) => ({ url: `/formations/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Formation', 'Schedule'],
    }),
    deleteFormationCatalog: builder.mutation<void, number>({
      query: (id) => ({ url: `/formations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Formation', 'Schedule'],
    }),

    getPromotionsCatalog: builder.query<PromotionCatalog[], number | void>({
      query: (formationId) => ({
        url: '/promotions',
        params: formationId ? { formationId } : undefined,
      }),
      providesTags: ['Promotion'],
    }),
    createPromotionCatalog: builder.mutation<PromotionCatalog, PromotionCatalogInput>({
      query: (body) => ({ url: '/promotions', method: 'POST', body }),
      invalidatesTags: ['Promotion', 'Schedule'],
    }),
    updatePromotionCatalog: builder.mutation<
      PromotionCatalog,
      { id: number; body: PromotionCatalogInput }
    >({
      query: ({ id, body }) => ({ url: `/promotions/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Promotion', 'Schedule'],
    }),
    deletePromotionCatalog: builder.mutation<void, number>({
      query: (id) => ({ url: `/promotions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Promotion', 'Schedule'],
    }),

    getAcademicYears: builder.query<AcademicYearCatalog[], void>({
      query: () => '/annees-academiques',
      providesTags: ['AcademicYear'],
    }),
    createAcademicYear: builder.mutation<AcademicYearCatalog, AcademicYearInput>({
      query: (body) => ({ url: '/annees-academiques', method: 'POST', body }),
      invalidatesTags: ['AcademicYear'],
    }),
    updateAcademicYear: builder.mutation<
      AcademicYearCatalog,
      { id: number; body: AcademicYearInput }
    >({
      query: ({ id, body }) => ({
        url: `/annees-academiques/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AcademicYear', 'Promotion'],
    }),
    deleteAcademicYear: builder.mutation<void, number>({
      query: (id) => ({ url: `/annees-academiques/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AcademicYear', 'Promotion'],
    }),

    getStudentGroups: builder.query<
      StudentGroupCatalog[],
      { promotionId?: number; formationId?: number; filiereId?: number } | void
    >({
      query: (filters) => ({
        url: '/groupes-etudiants',
        params: filters ?? undefined,
      }),
      providesTags: ['StudentGroup'],
    }),
    createStudentGroup: builder.mutation<StudentGroupCatalog, StudentGroupInput>({
      query: (body) => ({ url: '/groupes-etudiants', method: 'POST', body }),
      invalidatesTags: ['StudentGroup'],
    }),
    updateStudentGroup: builder.mutation<
      StudentGroupCatalog,
      { id: number; body: StudentGroupInput }
    >({
      query: ({ id, body }) => ({
        url: `/groupes-etudiants/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['StudentGroup'],
    }),
    deleteStudentGroup: builder.mutation<void, number>({
      query: (id) => ({ url: `/groupes-etudiants/${id}`, method: 'DELETE' }),
      invalidatesTags: ['StudentGroup'],
    }),

    getFormateurs: builder.query<BackendMembreResponse[], void>({
      query: () => '/formateurs',
      providesTags: ['Formateur'],
    }),
    assignFormateurFormations: builder.mutation<
      BackendMembreResponse,
      { formateurId: number; formationIds: number[] }
    >({
      query: ({ formateurId, formationIds }) => ({
        url: `/formateurs/${formateurId}/formations`,
        method: 'PUT',
        body: { formationIds },
      }),
      invalidatesTags: ['Formateur', 'Schedule'],
    }),

    getFilieres: builder.query<FiliereCatalog[], void>({
      query: () => '/filieres',
      providesTags: ['Filiere'],
    }),
    getFiliereDetail: builder.query<FiliereDetailCatalog, number>({
      query: (id) => `/filieres/${id}/detail`,
      providesTags: (_result, _error, id) => [{ type: 'Filiere', id }],
    }),
    createFiliere: builder.mutation<FiliereCatalog, FiliereCatalogInput>({
      query: (body) => ({ url: '/filieres', method: 'POST', body }),
      invalidatesTags: ['Filiere'],
    }),
    updateFiliere: builder.mutation<
      FiliereCatalog,
      { id: number; body: FiliereCatalogInput }
    >({
      query: ({ id, body }) => ({ url: `/filieres/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Filiere', 'Formation'],
    }),
    deleteFiliere: builder.mutation<void, number>({
      query: (id) => ({ url: `/filieres/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Filiere', 'Formation'],
    }),
  }),
})

export const {
  useGetFormationsCatalogQuery,
  useGetFormationCatalogQuery,
  useGetFormationBySlugQuery,
  useGetFormationParcoursQuery,
  useGetFormationParcoursBySlugQuery,
  useUpdateFormationParcoursMutation,
  useCreateFormationCatalogMutation,
  useUpdateFormationCatalogMutation,
  useDeleteFormationCatalogMutation,
  useGetPromotionsCatalogQuery,
  useCreatePromotionCatalogMutation,
  useUpdatePromotionCatalogMutation,
  useDeletePromotionCatalogMutation,
  useGetAcademicYearsQuery,
  useCreateAcademicYearMutation,
  useUpdateAcademicYearMutation,
  useDeleteAcademicYearMutation,
  useGetStudentGroupsQuery,
  useCreateStudentGroupMutation,
  useUpdateStudentGroupMutation,
  useDeleteStudentGroupMutation,
  useGetFormateursQuery,
  useAssignFormateurFormationsMutation,
  useGetFilieresQuery,
  useGetFiliereDetailQuery,
  useCreateFiliereMutation,
  useUpdateFiliereMutation,
  useDeleteFiliereMutation,
} = catalogApi
