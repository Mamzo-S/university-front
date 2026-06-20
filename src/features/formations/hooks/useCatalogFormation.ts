import { useEffect, useMemo, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  useGetFormationCatalogQuery,
  useGetFormationParcoursQuery,
  useUpdateFormationParcoursMutation,
} from '@/features/catalog/api/catalogApi'
import {
  buildStudentFormation,
  catalogToStudentFormation,
  extractParcoursFromFormation,
  formationIdFromCatalog,
  mergeCatalogWithFormation,
} from '@/features/formations/utils/catalogFormationBridge'
import {
  ensureFormation,
  replaceFormationParcours,
  selectFormationById,
} from '@/features/formations/slice/formationsSlice'

interface UseCatalogFormationOptions {
  syncParcoursToApi?: boolean
}

export function useCatalogFormation(
  catalogId: number | undefined,
  options?: UseCatalogFormationOptions,
) {
  const dispatch = useAppDispatch()
  const skip = catalogId == null || Number.isNaN(catalogId)
  const formationId =
    catalogId != null ? formationIdFromCatalog(catalogId) : undefined
  const hydratedRef = useRef<number | null>(null)

  const {
    data: catalog,
    isLoading: catalogLoading,
    isError: catalogError,
  } = useGetFormationCatalogQuery(catalogId!, { skip })

  const {
    data: parcours,
    isLoading: parcoursLoading,
    isError: parcoursError,
  } = useGetFormationParcoursQuery(catalogId!, { skip })

  const [updateParcours] = useUpdateFormationParcoursMutation()

  const storedFormation = useAppSelector((state) =>
    formationId ? selectFormationById(state, formationId) : undefined,
  )

  useEffect(() => {
    if (!catalog || !formationId) return
    dispatch(ensureFormation(catalogToStudentFormation(catalog)))
  }, [catalog, formationId, dispatch])

  useEffect(() => {
    if (!catalog || !formationId || !parcours) return
    if (hydratedRef.current === catalog.id) return
    if ((parcours.subModules?.length ?? 0) === 0) return

    dispatch(
      replaceFormationParcours({
        formationId,
        formation: buildStudentFormation(catalog, parcours),
      }),
    )
    hydratedRef.current = catalog.id
  }, [catalog, formationId, parcours, dispatch])

  const formation = useMemo(() => {
    if (!catalog) return storedFormation

    const fromApi = buildStudentFormation(catalog, parcours)
    if (!storedFormation) return fromApi

    const merged = mergeCatalogWithFormation(catalog, storedFormation)
    const hasLocalContent =
      storedFormation.subModules.length > 0 ||
      (storedFormation.projectDeposits?.length ?? 0) > 0

    if (hasLocalContent) return merged

    return fromApi
  }, [catalog, parcours, storedFormation])

  useEffect(() => {
    if (!options?.syncParcoursToApi || !formation || catalogId == null) return

    const timer = window.setTimeout(() => {
      void updateParcours({
        id: catalogId,
        body: extractParcoursFromFormation(formation),
      })
    }, 800)

    return () => window.clearTimeout(timer)
  }, [formation, options?.syncParcoursToApi, catalogId, updateParcours])

  return {
    catalog,
    formation,
    formationId,
    isLoading: catalogLoading || parcoursLoading,
    isError: catalogError || parcoursError,
  }
}
