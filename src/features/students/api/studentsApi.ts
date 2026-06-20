import { baseApi } from '@/app/api/baseApi'
import type { BackendMembreResponse } from '@/features/admin/utils/personnelMappers'
import type { FiliereModuleSummary } from '@/features/catalog/api/catalogApi'
import type { MockStudent } from '@/mocks/data/students'

export interface StudentCreateInput {
  email: string
  motDePasse: string
  nom: string
  prenom: string
  telephone?: string
  ine: string
  dateNaissance?: string
  niveau: string
  filiereId: number
  promotionId?: number
  groupeEtudiantId?: number
}

export interface StudentUpdateInput {
  email?: string
  motDePasse?: string
  nom?: string
  prenom?: string
  telephone?: string
  ine?: string
  dateNaissance?: string
  niveau?: string
  filiereId?: number
  promotionId?: number
  groupeEtudiantId?: number
}

export interface StudentListFilters {
  moduleId?: number
  formationId?: number
  filiereId?: number
  promotionId?: number
  groupeEtudiantId?: number
}

export interface FormateurModuleOption {
  id: number
  titre: string
  slug?: string
  filiereId?: number
  filiereNom?: string
}

export interface EtudiantFiliereView {
  id: number
  nom: string
  description?: string
  niveauEtudiant?: string
  modules: FiliereModuleSummary[]
}

function buildStudentQuery(filters?: StudentListFilters) {
  if (!filters) return '/etudiants'
  const params = new URLSearchParams()
  if (filters.moduleId != null) params.set('moduleId', String(filters.moduleId))
  if (filters.formationId != null) params.set('formationId', String(filters.formationId))
  if (filters.filiereId != null) params.set('filiereId', String(filters.filiereId))
  if (filters.promotionId != null) params.set('promotionId', String(filters.promotionId))
  if (filters.groupeEtudiantId != null) {
    params.set('groupeEtudiantId', String(filters.groupeEtudiantId))
  }
  const query = params.toString()
  return query ? `/etudiants?${query}` : '/etudiants'
}

export const studentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query<BackendMembreResponse[], StudentListFilters | void>({
      query: (filters) => buildStudentQuery(filters || undefined),
      providesTags: ['Student'],
    }),
    createStudent: builder.mutation<BackendMembreResponse, StudentCreateInput>({
      query: (body) => ({ url: '/etudiants', method: 'POST', body }),
      invalidatesTags: ['Student', 'Filiere', 'StudentGroup'],
    }),
    updateStudent: builder.mutation<
      BackendMembreResponse,
      { id: number; body: StudentUpdateInput }
    >({
      query: ({ id, body }) => ({ url: `/etudiants/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Student', 'Filiere', 'StudentGroup'],
    }),
    getMyModules: builder.query<FormateurModuleOption[], void>({
      query: () => '/formateurs/me/modules',
      providesTags: ['Formateur'],
    }),
    getMyFiliere: builder.query<EtudiantFiliereView, void>({
      query: () => '/etudiants/me/filiere',
      providesTags: ['Student', 'Filiere'],
    }),
    getStudent: builder.query<MockStudent, string>({
      query: (id) => `/students/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Student', id }],
    }),
  }),
})

export const {
  useGetStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useGetMyModulesQuery,
  useGetMyFiliereQuery,
  useGetStudentQuery,
} = studentsApi

/** @deprecated Utiliser useGetMyModulesQuery */
export const useGetMyFormationsQuery = useGetMyModulesQuery
