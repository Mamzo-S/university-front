import { useMemo } from 'react'
import {
  useGetFormationBySlugQuery,
  useGetFormationParcoursBySlugQuery,
} from '@/features/catalog/api/catalogApi'
import { buildStudentFormation } from '@/features/formations/utils/catalogFormationBridge'

export function useStudentFormation(slug: string | undefined) {
  const normalizedSlug = slug?.trim()
  const skip = !normalizedSlug

  const {
    data: catalog,
    isLoading: catalogLoading,
    isError: catalogError,
  } = useGetFormationBySlugQuery(normalizedSlug!, { skip })

  const { data: parcours, isLoading: parcoursLoading } = useGetFormationParcoursBySlugQuery(
    normalizedSlug!,
    { skip },
  )

  const formation = useMemo(
    () => (catalog ? buildStudentFormation(catalog, parcours) : undefined),
    [catalog, parcours],
  )

  return {
    catalog,
    formation,
    isLoading: catalogLoading || parcoursLoading,
    isError: catalogError,
  }
}
