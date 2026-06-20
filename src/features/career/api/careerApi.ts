import { baseApi } from '@/app/api/baseApi'

export interface Partner {
  id: number
  nom: string
  secteur?: string
  email?: string
  telephone?: string
  adresse?: string
  ville?: string
  pays?: string
  contactNom?: string
  contactFonction?: string
  description?: string
  actif?: boolean
  conventionCadre?: boolean
  stageCount?: number
}

export interface PartnerInput {
  nom: string
  secteur?: string
  email?: string
  telephone?: string
  adresse?: string
  ville?: string
  pays?: string
  contactNom?: string
  contactFonction?: string
  description?: string
  actif?: boolean
  conventionCadre?: boolean
}

export type InternshipStatus = 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'ANNULE'

export interface Internship {
  id: number
  etudiantId: number
  etudiantNom?: string
  etudiantPrenom?: string
  etudiantEmail?: string
  etudiantIne?: string
  filiereNom?: string
  partenaireId: number
  partenaireNom?: string
  sujet?: string
  description?: string
  dateDebut?: string
  dateFin?: string
  statut: InternshipStatus
  tuteurEntreprise?: string
  tuteurUniversite?: string
  conventionSignee?: boolean
  commentaire?: string
}

export interface InternshipInput {
  etudiantId: number
  partenaireId: number
  sujet?: string
  description?: string
  dateDebut?: string
  dateFin?: string
  statut?: InternshipStatus
  tuteurEntreprise?: string
  tuteurUniversite?: string
  conventionSignee?: boolean
  commentaire?: string
}

export const INTERNSHIP_STATUS_LABELS: Record<InternshipStatus, string> = {
  EN_ATTENTE: 'En attente',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  ANNULE: 'Annulé',
}

export const careerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartners: builder.query<Partner[], void>({
      query: () => '/partenaires',
      providesTags: ['Partner'],
    }),
    createPartner: builder.mutation<Partner, PartnerInput>({
      query: (body) => ({ url: '/partenaires', method: 'POST', body }),
      invalidatesTags: ['Partner', 'Dashboard'],
    }),
    updatePartner: builder.mutation<Partner, { id: number; body: PartnerInput }>({
      query: ({ id, body }) => ({ url: `/partenaires/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Partner', 'Dashboard'],
    }),
    deletePartner: builder.mutation<void, number>({
      query: (id) => ({ url: `/partenaires/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Partner', 'Dashboard', 'Internship'],
    }),
    getInternships: builder.query<Internship[], void>({
      query: () => '/stages',
      providesTags: ['Internship'],
    }),
    createInternship: builder.mutation<Internship, InternshipInput>({
      query: (body) => ({ url: '/stages', method: 'POST', body }),
      invalidatesTags: ['Internship', 'Dashboard', 'Partner'],
    }),
    updateInternship: builder.mutation<Internship, { id: number; body: InternshipInput }>({
      query: ({ id, body }) => ({ url: `/stages/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Internship', 'Dashboard', 'Partner'],
    }),
    deleteInternship: builder.mutation<void, number>({
      query: (id) => ({ url: `/stages/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Internship', 'Dashboard', 'Partner'],
    }),
  }),
})

export const {
  useGetPartnersQuery,
  useCreatePartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnerMutation,
  useGetInternshipsQuery,
  useCreateInternshipMutation,
  useUpdateInternshipMutation,
  useDeleteInternshipMutation,
} = careerApi
