import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/app/store'
import { mockBaseQuery } from '@/mocks/mockBaseQuery'

const useMock = import.meta.env.VITE_USE_MOCK !== 'false'

const realBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL ?? '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQuery = useMock ? mockBaseQuery : realBaseQuery

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'Auth',
    'User',
    'AdminPersonnel',
    'Student',
    'Formation',
    'Document',
    'Communication',
    'Internship',
    'Dashboard',
    'Schedule',
    'Promotion',
    'AcademicYear',
    'StudentGroup',
    'Formateur',
    'Filiere',
    'Partner',
    'Internship',
    'Grade',
    'Bulletin',
  ],
  endpoints: () => ({}),
})
