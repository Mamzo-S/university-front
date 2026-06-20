import { baseApi } from '@/app/api/baseApi'

export interface GradeNote {
  id: number
  etudiantId: number
  etudiantNomComplet?: string
  coursId: number
  coursCode?: string
  coursNom?: string
  coursCoefficient?: number
  typeEvaluation: string
  valeur: number
  anneeAcademique: string
  semestre: string
  bulletinPublie?: boolean
}

export interface GradeInput {
  etudiantId: number
  coursId: number
  typeEvaluation: string
  valeur: number
  anneeAcademique: string
  semestre: string
}

export interface CoursItem {
  id: number
  code: string
  nom: string
  semestre: string
  coefficient: number
  formationId?: number
  formationNom?: string
}

export interface BulletinCourseLine {
  coursId: number
  coursCode?: string
  coursNom?: string
  coefficient?: number
  moyenneCours?: number
}

export interface Bulletin {
  etudiantId: number
  etudiantNomComplet?: string
  etudiantIne?: string
  filiereNom?: string
  semestre: string
  anneeAcademique: string
  moyenneGenerale?: number
  mention?: string
  datePublication?: string
  lignesCours?: BulletinCourseLine[]
  notes: GradeNote[]
}

export interface BulletinSummary {
  semestre: string
  anneeAcademique: string
  moyenneGenerale?: number
  mention?: string
  datePublication?: string
  nombreNotes: number
}

export const EVALUATION_TYPES = ['DEVOIR', 'EXAMEN', 'PROJET', 'TD'] as const

export const gradesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCours: builder.query<CoursItem[], { formationId?: number } | void>({
      query: (params) => {
        const formationId =
          params && typeof params === 'object' ? params.formationId : undefined
        if (formationId != null) {
          return `/cours?formationId=${formationId}`
        }
        return '/cours'
      },
      providesTags: ['Grade'],
    }),
    getStudentGrades: builder.query<GradeNote[], number>({
      query: (etudiantId) => `/notes/etudiant/${etudiantId}`,
      providesTags: ['Grade'],
    }),
    saveGrade: builder.mutation<GradeNote, GradeInput>({
      query: (body) => ({ url: '/notes', method: 'POST', body }),
      invalidatesTags: ['Grade', 'Bulletin'],
    }),
    publishBulletin: builder.mutation<
      Bulletin,
      { etudiantId: number; semestre: string; anneeAcademique: string }
    >({
      query: ({ etudiantId, semestre, anneeAcademique }) => ({
        url: `/notes/bulletins/publier?etudiantId=${etudiantId}&semestre=${encodeURIComponent(semestre)}&anneeAcademique=${encodeURIComponent(anneeAcademique)}`,
        method: 'POST',
      }),
      invalidatesTags: ['Grade', 'Bulletin'],
    }),
    getBulletin: builder.query<
      Bulletin,
      { etudiantId: number; semestre: string; anneeAcademique: string }
    >({
      query: ({ etudiantId, semestre, anneeAcademique }) =>
        `/notes/bulletins?etudiantId=${etudiantId}&semestre=${encodeURIComponent(semestre)}&anneeAcademique=${encodeURIComponent(anneeAcademique)}`,
      providesTags: ['Bulletin'],
    }),
    getMyBulletins: builder.query<BulletinSummary[], void>({
      query: () => '/notes/bulletins/me/list',
      providesTags: ['Bulletin'],
    }),
    getMyBulletin: builder.query<
      Bulletin,
      { semestre: string; anneeAcademique: string }
    >({
      query: ({ semestre, anneeAcademique }) =>
        `/notes/bulletins/me?semestre=${encodeURIComponent(semestre)}&anneeAcademique=${encodeURIComponent(anneeAcademique)}`,
      providesTags: ['Bulletin'],
    }),
  }),
})

export const {
  useGetCoursQuery,
  useGetStudentGradesQuery,
  useSaveGradeMutation,
  usePublishBulletinMutation,
  useGetBulletinQuery,
  useGetMyBulletinsQuery,
  useGetMyBulletinQuery,
} = gradesApi
