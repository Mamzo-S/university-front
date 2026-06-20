import { baseApi } from '@/app/api/baseApi'
import type { BackendMembreResponse } from '@/features/admin/utils/personnelMappers'
import type {
  BackendCours,
  BackendEmploiDuTemps,
  BackendFormation,
  BackendPromotion,
  BackendSeance,
} from '@/features/schedule/utils/scheduleMappers'

export interface FormationInput {
  nom: string
  niveau?: string
  typeFormation?: string
  typeFinancement?: string
  dateDebut?: string
  dateFin?: string
}

export interface SeanceInput {
  emploiDuTempsId?: number
  promotionId: number
  coursId?: number
  formationId?: number
  formateurId: number
  jourSemaine: number
  heureDebut: string
  heureFin: string
  salle?: string
  typeSeance: string
}

export interface CoursInput {
  code: string
  nom: string
  semestre: string
  coefficient: number
  formationId: number
}

export interface PromotionInput {
  titre: string
  slug?: string
  description?: string
  /** Rétrocompatibilité emploi du temps */
  nom?: string
  anneeAcademique?: string
}

function normalizeMySchedule(
  response: BackendEmploiDuTemps | BackendSeance[],
): BackendSeance[] {
  if (Array.isArray(response)) {
    return response
  }
  return response.seances ?? []
}

function normalizeEmploiDuTemps(
  response: BackendEmploiDuTemps | BackendSeance[],
  _meta: unknown,
  promotionId: number,
): BackendEmploiDuTemps {
  if (!Array.isArray(response)) {
    return response
  }

  return {
    id: 0,
    promotionId,
    promotionNom: '',
    libelle: 'Emploi du temps',
    publie: false,
    effectif: 0,
    seances: response,
  }
}

export const scheduleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBackendFormations: builder.query<BackendFormation[], void>({
      query: () => '/formations',
      providesTags: ['Formation'],
    }),
    getPromotions: builder.query<BackendPromotion[], number | void>({
      query: (formationId) => ({
        url: '/promotions',
        params: formationId ? { formationId } : undefined,
      }),
      providesTags: ['Schedule'],
    }),
    getCoursByFormation: builder.query<BackendCours[], number>({
      query: (formationId) => ({
        url: '/cours',
        params: { formationId },
      }),
      providesTags: ['Schedule'],
    }),
    getFormateurs: builder.query<BackendMembreResponse[], void>({
      query: () => '/formateurs',
      providesTags: ['Schedule'],
    }),
    getEmploiDuTempsByPromotion: builder.query<BackendEmploiDuTemps, number>({
      query: (promotionId) => ({
        url: '/emplois-du-temps',
        params: { promotionId },
      }),
      transformResponse: normalizeEmploiDuTemps,
      providesTags: (_result, _error, promotionId) => [
        { type: 'Schedule', id: `edt-${promotionId}` },
      ],
    }),
    getAllSeances: builder.query<BackendSeance[], void>({
      query: () => '/emplois-du-temps/seances',
      providesTags: ['Schedule'],
    }),
    getSeancesByPromotion: builder.query<BackendSeance[], number>({
      query: (promotionId) => ({
        url: '/emplois-du-temps/seances',
        params: { promotionId },
      }),
      providesTags: (_result, _error, promotionId) => [
        { type: 'Schedule', id: `promotion-${promotionId}` },
      ],
    }),
    getMySeances: builder.query<BackendSeance[], void>({
      query: () => '/emplois-du-temps/me',
      transformResponse: normalizeMySchedule,
      providesTags: ['Schedule'],
    }),
    getEtudiantSeances: builder.query<BackendSeance[], number | 'me'>({
      query: (etudiantId) => `/etudiants/${etudiantId}/seances`,
      transformResponse: normalizeMySchedule,
      providesTags: (_result, _error, etudiantId) => [
        { type: 'Schedule', id: `etudiant-${etudiantId}` },
      ],
    }),
    createSeance: builder.mutation<BackendSeance, SeanceInput>({
      query: (body) => ({
        url: '/emplois-du-temps/seances',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Schedule'],
    }),
    updateSeance: builder.mutation<BackendSeance, { id: number; body: SeanceInput }>({
      query: ({ id, body }) => ({
        url: `/emplois-du-temps/seances/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Schedule'],
    }),
    deleteSeance: builder.mutation<void, number>({
      query: (id) => ({
        url: `/emplois-du-temps/seances/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Schedule'],
    }),
    createFormation: builder.mutation<BackendFormation, FormationInput>({
      query: (body) => ({
        url: '/formations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Formation', 'Schedule'],
    }),
    createCours: builder.mutation<BackendCours, CoursInput>({
      query: (body) => ({
        url: '/cours',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Schedule'],
    }),
    createPromotion: builder.mutation<BackendPromotion, PromotionInput>({
      query: (body) => ({
        url: '/promotions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Schedule'],
    }),
  }),
})

export const {
  useGetBackendFormationsQuery,
  useGetPromotionsQuery,
  useGetCoursByFormationQuery,
  useGetFormateursQuery,
  useGetEmploiDuTempsByPromotionQuery,
  useGetAllSeancesQuery,
  useGetSeancesByPromotionQuery,
  useGetMySeancesQuery,
  useGetEtudiantSeancesQuery,
  useCreateSeanceMutation,
  useUpdateSeanceMutation,
  useDeleteSeanceMutation,
  useCreateFormationMutation,
  useCreateCoursMutation,
  useCreatePromotionMutation,
} = scheduleApi
