import { baseApi } from '@/app/api/baseApi'
import type {
  MOCK_ADMIN_STATS,
  MOCK_STAFF_STATS,
  MOCK_TRAINER_STATS,
  MOCK_TRAINING_STATS,
  MOCK_TUTOR_STATS,
} from '@/mocks/data/stats'

type AdminStats = typeof MOCK_ADMIN_STATS
type TrainerStats = typeof MOCK_TRAINER_STATS
type StaffStats = typeof MOCK_STAFF_STATS
type TrainingStats = typeof MOCK_TRAINING_STATS
type CareerStats = {
  internships: number
  partners: number
  employed: number
  selfEmployed: number
  pendingConventions?: number
  activeInternships?: number
}
type TutorStats = typeof MOCK_TUTOR_STATS

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStats, void>({
      query: () => '/dashboard/admin',
      providesTags: ['Dashboard'],
    }),
    getTrainerStats: builder.query<TrainerStats, void>({
      query: () => '/dashboard/trainer',
      providesTags: ['Dashboard'],
    }),
    getStaffStats: builder.query<StaffStats, void>({
      query: () => '/dashboard/staff',
      providesTags: ['Dashboard'],
    }),
    getTrainingStats: builder.query<TrainingStats, void>({
      query: () => '/dashboard/training',
      providesTags: ['Dashboard'],
    }),
    getCareerStats: builder.query<CareerStats, void>({
      query: () => '/dashboard/career',
      providesTags: ['Dashboard'],
    }),
    getTutorStats: builder.query<TutorStats, void>({
      query: () => '/dashboard/tutor',
      providesTags: ['Dashboard'],
    }),
  }),
})

export const {
  useGetAdminStatsQuery,
  useGetTrainerStatsQuery,
  useGetStaffStatsQuery,
  useGetTrainingStatsQuery,
  useGetCareerStatsQuery,
  useGetTutorStatsQuery,
} = dashboardApi
