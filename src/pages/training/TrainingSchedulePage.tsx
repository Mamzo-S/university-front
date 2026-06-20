import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ConfirmDialog } from '@/features/formations/components/ConfirmDialog'
import { CrudActions } from '@/features/formations/components/CrudActions'
import {
  useCreateSeanceMutation,
  useDeleteSeanceMutation,
  useGetAllSeancesQuery,
  useGetEmploiDuTempsByPromotionQuery,
  useGetFormateursQuery,
  useUpdateSeanceMutation,
  type SeanceInput,
} from '@/features/schedule/api/scheduleApi'
import {
  useCreateFormationCatalogMutation,
  useCreatePromotionCatalogMutation,
  useGetFilieresQuery,
  useGetFormationsCatalogQuery,
  useGetPromotionsCatalogQuery,
} from '@/features/catalog/api/catalogApi'
import { FormationFormModal } from '@/features/schedule/components/FormationFormModal'
import { PromotionFormModal } from '@/features/schedule/components/PromotionFormModal'
import { SeanceFormModal, type SeanceFormSubmit } from '@/features/schedule/components/SeanceFormModal'
import { WeeklySchedule } from '@/features/schedule/components/WeeklySchedule'
import {
  DAY_OPTIONS,
  mapFormateurOption,
  mapSeanceToScheduleEvent,
} from '@/features/schedule/utils/scheduleMappers'
import { FORMATION_DRAG_TYPE, moveTimeRange } from '@/features/schedule/utils/scheduleUtils'
import type { BackendSeance } from '@/features/schedule/utils/scheduleMappers'
import type { ScheduleEventMove, ScheduleSlotSelection } from '@/types/schedule'
import { formatNiveauEtude, NIVEAU_ETUDE_OPTIONS } from '@/types/niveauEtude'
import { cn } from '@/lib/utils'

function formationLabel(
  formation: { titre?: string; nom: string; filiereNom?: string; niveau?: string },
) {
  const title = formation.titre ?? formation.nom
  const parts = [title]
  if (formation.filiereNom) parts.push(formation.filiereNom)
  if (formation.niveau) parts.push(formatNiveauEtude(formation.niveau))
  return parts.join(' · ')
}

export function TrainingSchedulePage() {
  const {
    data: formations = [],
    isLoading: formationsLoading,
    isError: formationsError,
  } = useGetFormationsCatalogQuery()
  const { data: filieres = [] } = useGetFilieresQuery()
  const { data: formateurs = [] } = useGetFormateursQuery()
  const {
    data: allSeances = [],
    isLoading: allSeancesLoading,
    isError: allSeancesError,
  } = useGetAllSeancesQuery()

  const [filiereFilterId, setFiliereFilterId] = useState<number | null>(null)
  const [niveauFilter, setNiveauFilter] = useState<string | null>(null)
  const [formationFilterId, setFormationFilterId] = useState<number | null>(null)
  const [promotionId, setPromotionId] = useState<number | null>(null)

  const formationOptions = useMemo(
    () =>
      [...formations].sort((a, b) =>
        (a.titre ?? a.nom).localeCompare(b.titre ?? b.nom, 'fr'),
      ),
    [formations],
  )

  const filteredFormations = useMemo(() => {
    return formationOptions.filter((f) => {
      if (filiereFilterId != null && f.filiereId !== filiereFilterId) return false
      if (niveauFilter && f.niveau !== niveauFilter) return false
      return true
    })
  }, [formationOptions, filiereFilterId, niveauFilter])

  const scopedFormations = useMemo(() => {
    if (formationFilterId) {
      return filteredFormations.filter((f) => f.id === formationFilterId)
    }
    return filteredFormations
  }, [filteredFormations, formationFilterId])

  const filteredFormationIds = useMemo(
    () => new Set(scopedFormations.map((f) => f.id)),
    [scopedFormations],
  )

  const hasScopeFilters =
    filiereFilterId != null || niveauFilter != null || formationFilterId != null

  const filteredSeances = useMemo(() => {
    if (!hasScopeFilters) return allSeances
    return allSeances.filter((s) =>
      s.formationId != null ? filteredFormationIds.has(s.formationId) : false,
    )
  }, [allSeances, hasScopeFilters, filteredFormationIds])

  const handleFiliereFilterChange = (id: number | null) => {
    setFiliereFilterId(id)
    setFormationFilterId((current) => {
      if (current == null) return null
      const stillValid = formationOptions.some(
        (f) =>
          f.id === current &&
          (id == null || f.filiereId === id) &&
          (!niveauFilter || f.niveau === niveauFilter),
      )
      return stillValid ? current : null
    })
  }

  const handleNiveauFilterChange = (niveau: string | null) => {
    setNiveauFilter(niveau)
    setFormationFilterId((current) => {
      if (current == null) return null
      const stillValid = formationOptions.some(
        (f) =>
          f.id === current &&
          (filiereFilterId == null || f.filiereId === filiereFilterId) &&
          (!niveau || f.niveau === niveau),
      )
      return stillValid ? current : null
    })
  }

  const draggableFormations = scopedFormations

  const formationScheduleOptions = useMemo(
    () =>
      filteredFormations.map((f) => ({
        id: f.id,
        label: formationLabel(f),
      })),
    [filteredFormations],
  )

  const selectedFormationFilter = formationOptions.find((f) => f.id === formationFilterId)
  const selectedFiliereFilter = filieres.find((f) => f.id === filiereFilterId)

  const { data: promotions = [] } = useGetPromotionsCatalogQuery()
  const promotionOptions = useMemo(
    () =>
      [...promotions].sort((a, b) =>
        (a.titre ?? a.nom).localeCompare(b.titre ?? b.nom, 'fr'),
      ),
    [promotions],
  )
  const selectedPromotion = promotionOptions.find((p) => p.id === promotionId)

  const { data: emploiDuTemps } = useGetEmploiDuTempsByPromotionQuery(promotionId!, {
    skip: !promotionId,
  })

  const [createFormation, { isLoading: creatingFormation }] =
    useCreateFormationCatalogMutation()
  const [createSeance, { isLoading: creatingSeance }] = useCreateSeanceMutation()
  const [updateSeance, { isLoading: updatingSeance }] = useUpdateSeanceMutation()
  const [deleteSeance] = useDeleteSeanceMutation()
  const [createPromotion, { isLoading: creatingPromotion }] =
    useCreatePromotionCatalogMutation()

  const [formationModalOpen, setFormationModalOpen] = useState(false)
  const [seanceModalOpen, setSeanceModalOpen] = useState(false)
  const [promotionModalOpen, setPromotionModalOpen] = useState(false)
  const [editingSeance, setEditingSeance] = useState<BackendSeance | undefined>()
  const [deletingSeance, setDeletingSeance] = useState<BackendSeance | undefined>()
  const [seanceDraft, setSeanceDraft] = useState<Partial<SeanceInput> | undefined>()

  const formateurOptions = useMemo(
    () => formateurs.map(mapFormateurOption),
    [formateurs],
  )

  const canInteractWithSchedule =
    filteredFormations.length > 0 &&
    formateurOptions.length > 0 &&
    promotionOptions.length > 0

  const canPlanSeances = canInteractWithSchedule

  const scheduleEvents = useMemo(
    () => filteredSeances.map(mapSeanceToScheduleEvent),
    [filteredSeances],
  )

  const promotionCount = useMemo(
    () => new Set(filteredSeances.map((s) => s.promotionId)).size,
    [filteredSeances],
  )

  const sortedSeances = useMemo(
    () =>
      [...filteredSeances].sort((a, b) => {
        if (a.jourSemaine !== b.jourSemaine) return a.jourSemaine - b.jourSemaine
        return a.heureDebut.localeCompare(b.heureDebut)
      }),
    [filteredSeances],
  )

  const seanceToInput = (seance: BackendSeance): SeanceInput & { id: number } => ({
    id: seance.id,
    emploiDuTempsId: seance.emploiDuTempsId,
    formationId: seance.formationId,
    formateurId: seance.formateurId,
    promotionId: seance.promotionId,
    jourSemaine: seance.jourSemaine,
    heureDebut: seance.heureDebut.slice(0, 5),
    heureFin: seance.heureFin.slice(0, 5),
    salle: seance.salle,
    typeSeance: seance.typeSeance,
  })

  const syncContextFromSeance = (seance: BackendSeance) => {
    if (seance.formationId) setFormationFilterId(seance.formationId)
    setPromotionId(seance.promotionId)
  }

  const modalPromotion = useMemo(() => {
    if (selectedPromotion) return selectedPromotion
    if (!editingSeance) return undefined
    return {
      id: editingSeance.promotionId,
      nom: editingSeance.promotionNom,
      formationId: editingSeance.formationId,
      formationNom: editingSeance.formationNom,
    }
  }, [selectedPromotion, editingSeance])

  const openSeanceModal = (draft?: Partial<SeanceInput>) => {
    setEditingSeance(undefined)
    setSeanceDraft(draft)
    setSeanceModalOpen(true)
  }

  const defaultFormationId =
    draggableFormations[0]?.id ?? filteredFormations[0]?.id

  const handleSlotSelect = (slot: ScheduleSlotSelection) => {
    if (!canInteractWithSchedule) return

    const targetPromotionId =
      promotionId ?? seanceDraft?.promotionId ?? promotionOptions[0]?.id

    if (targetPromotionId == null) return

    if (!promotionId) {
      setPromotionId(targetPromotionId)
    }

    openSeanceModal({
      jourSemaine: slot.dayOfWeek,
      heureDebut: slot.startTime,
      heureFin: slot.endTime,
      formationId: slot.formationId ?? defaultFormationId,
      formateurId: formateurOptions[0]?.id,
      promotionId: targetPromotionId,
    })
  }

  const handleEventClick = (eventId: string) => {
    const seance = allSeances.find((s) => String(s.id) === eventId)
    if (seance) {
      syncContextFromSeance(seance)
      setSeanceDraft(undefined)
      setEditingSeance(seance)
      setSeanceModalOpen(true)
    }
  }

  const handleEventMove = async (move: ScheduleEventMove) => {
    const seance = allSeances.find((s) => String(s.id) === move.eventId)
    if (!seance) return

    const { startTime, endTime } = moveTimeRange(
      seance.heureDebut.slice(0, 5),
      seance.heureFin.slice(0, 5),
      move.startTime,
    )

    try {
      await updateSeance({
        id: seance.id,
        body: {
          ...seanceToInput(seance),
          jourSemaine: move.dayOfWeek,
          heureDebut: startTime,
          heureFin: endTime,
        },
      }).unwrap()
    } catch {
      // conflit horaire — invalidation RTK restaure l'état
    }
  }

  const handleSaveSeance = async (values: SeanceFormSubmit) => {
    const targetPromotionId =
      values.promotionId ??
      selectedPromotion?.id ??
      editingSeance?.promotionId

    if (!targetPromotionId) return

    if (targetPromotionId !== promotionId) {
      setPromotionId(targetPromotionId)
    }

    const basePayload: SeanceInput = {
      formationId: values.formationId,
      formateurId: values.formateurId,
      promotionId: targetPromotionId,
      emploiDuTempsId:
        targetPromotionId === promotionId
          ? emploiDuTemps?.id ||
            editingSeance?.emploiDuTempsId ||
            values.emploiDuTempsId
          : undefined,
      heureDebut: values.heureDebut,
      heureFin: values.heureFin,
      salle: values.salle,
      typeSeance: values.typeSeance,
      jourSemaine: values.jourSemaine,
    }

    if (editingSeance) {
      await updateSeance({ id: editingSeance.id, body: basePayload }).unwrap()
    } else {
      const jours = [
        ...new Set([values.jourSemaine, ...values.joursRepetition]),
      ].sort((a, b) => a - b)

      for (const jour of jours) {
        await createSeance({ ...basePayload, jourSemaine: jour }).unwrap()
      }
    }
    setEditingSeance(undefined)
    setSeanceDraft(undefined)
  }

  if (formationsLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Emplois du temps"
        description="Planification des séances par filière, niveau et promotion"
      />

      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Filtres
        </p>
        {formationsError && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            Impossible de charger les formations.
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Filière</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              value={filiereFilterId ?? ''}
              onChange={(e) =>
                handleFiliereFilterChange(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">Toutes les filières</option>
              {[...filieres]
                .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nom}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Niveau</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              value={niveauFilter ?? ''}
              onChange={(e) => handleNiveauFilterChange(e.target.value || null)}
            >
              <option value="">Tous les niveaux</option>
              {NIVEAU_ETUDE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Module (formation)</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              value={formationFilterId ?? ''}
              onChange={(e) =>
                setFormationFilterId(e.target.value ? Number(e.target.value) : null)
              }
              disabled={filteredFormations.length === 0}
            >
              <option value="">
                {filteredFormations.length === 0
                  ? 'Aucun module pour ce périmètre'
                  : 'Tous les modules'}
              </option>
              {filteredFormations.map((f) => (
                <option key={f.id} value={f.id}>
                  {formationLabel(f)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Promotion (classe)</label>
            <div className="mt-1 flex gap-2">
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                value={promotionId ?? ''}
                onChange={(e) =>
                  setPromotionId(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">Choisir une promotion</option>
                {promotionOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titre ?? p.nom}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPromotionModalOpen(true)}
              >
                +
              </Button>
            </div>
          </div>
        </div>
        {hasScopeFilters && (
          <p className="mt-3 text-xs text-slate-500">
            {filteredSeances.length} séance{filteredSeances.length !== 1 ? 's' : ''} ·{' '}
            {scopedFormations.length} module{scopedFormations.length !== 1 ? 's' : ''}
            {selectedFiliereFilter ? ` · ${selectedFiliereFilter.nom}` : ''}
            {niveauFilter ? ` · ${formatNiveauEtude(niveauFilter)}` : ''}
          </p>
        )}
        {promotionId && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => openSeanceModal({ promotionId })}
              disabled={!canPlanSeances}
            >
              + Séance
            </Button>
            <Button size="sm" variant="outline" onClick={() => setFormationModalOpen(true)}>
              + Module
            </Button>
          </div>
        )}
      </div>

      <div className="mb-4">
        <WeeklySchedule
          events={scheduleEvents}
          editable
          canPlan={canPlanSeances}
          isLoading={allSeancesLoading}
          statsLabel={`${filteredSeances.length} séance${filteredSeances.length !== 1 ? 's' : ''} · ${promotionCount} promotion${promotionCount !== 1 ? 's' : ''}`}
          emptyMessage={
            hasScopeFilters
              ? 'Aucune séance pour cette filière / ce niveau. Ajustez les filtres ou planifiez une séance.'
              : 'Aucune séance planifiée. Sélectionnez une promotion pour en ajouter.'
          }
          onSlotSelect={handleSlotSelect}
          onEventClick={handleEventClick}
          onEventMove={handleEventMove}
        />
        {allSeancesError && (
          <p className="mt-2 text-sm text-red-600">
            Impossible de charger les séances. Vérifiez que le backend est à jour.
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Séances ({filteredSeances.length}
            {hasScopeFilters ? '' : ` / ${allSeances.length}`})
          </h2>
          <p className="mb-3 text-xs text-slate-500">
            {hasScopeFilters
              ? 'Liste filtrée par filière, niveau ou module'
              : 'Liste complète — triée par jour et horaire'}
          </p>
          {allSeancesLoading ? (
            <Spinner />
          ) : sortedSeances.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune séance enregistrée.</p>
          ) : (
            <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {sortedSeances.map((seance) => (
                <li
                  key={seance.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5 transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {seance.formationNom || seance.coursNom}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {DAY_OPTIONS[seance.jourSemaine]?.label}{' '}
                      {seance.heureDebut.slice(0, 5)}–{seance.heureFin.slice(0, 5)}
                      {seance.salle ? ` · ${seance.salle}` : ''}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {seance.formateurNom}
                    </p>
                    <span className="mt-1.5 inline-block rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700">
                      {seance.promotionNom}
                    </span>
                  </div>
                  <CrudActions
                    onEdit={() => {
                      syncContextFromSeance(seance)
                      setEditingSeance(seance)
                      setSeanceModalOpen(true)
                    }}
                    onDelete={() => setDeletingSeance(seance)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Formations à glisser</h2>
          <p className="mb-3 text-xs text-slate-500">
            {formationFilterId
              ? `Filtre : ${selectedFormationFilter ? formationLabel(selectedFormationFilter) : '—'}`
              : `${draggableFormations.length} module${draggableFormations.length !== 1 ? 's' : ''} dans le périmètre`}
          </p>
          {filteredFormations.length === 0 && hasScopeFilters && (
            <p className="mb-3 text-sm text-amber-700">
              Aucun module pour cette filière et ce niveau. Créez-en un ou élargissez les filtres.
            </p>
          )}
          {formationOptions.length === 0 ? (
            <p className="text-sm text-amber-700">Aucune formation dans le catalogue.</p>
          ) : (
            <ul className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
              {draggableFormations.map((formation) => (
                <li key={formation.id}>
                  <div
                    draggable={canPlanSeances}
                    onDragStart={(e) => {
                      e.dataTransfer.setData(FORMATION_DRAG_TYPE, String(formation.id))
                      e.dataTransfer.setData('text/plain', String(formation.id))
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                    className={cn(
                      'rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs',
                      canPlanSeances
                        ? 'cursor-grab active:cursor-grabbing hover:border-primary-200 hover:bg-primary-50/60'
                        : 'opacity-50',
                    )}
                  >
                    <span className="font-medium text-slate-800">
                      {formation.titre ?? formation.nom}
                    </span>
                    {(formation.filiereNom || formation.niveau) && (
                      <span className="mt-0.5 block text-[10px] text-slate-500">
                        {[formation.filiereNom, formation.niveau && formatNiveauEtude(formation.niveau)]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {formateurOptions.length === 0 && (
            <p className="mt-3 text-xs text-amber-700">
              Aucun enseignant — créez des comptes formateurs via l&apos;admin.
            </p>
          )}
        </div>
      </div>

      {formationOptions.length === 0 && !formationsLoading && (
        <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-center">
          <Button size="sm" onClick={() => setFormationModalOpen(true)}>
            + Créer une formation
          </Button>
        </div>
      )}

      <FormationFormModal
        open={formationModalOpen}
        onClose={() => setFormationModalOpen(false)}
        isSubmitting={creatingFormation}
        onSubmit={async (values) => {
          const created = await createFormation({
            titre: values.nom,
            niveau: values.niveau ?? niveauFilter ?? undefined,
            typeFormation: values.typeFormation,
            typeFinancement: values.typeFinancement,
            dateDebut: values.dateDebut,
            dateFin: values.dateFin,
            filiereId: filiereFilterId ?? undefined,
          }).unwrap()
          setFormationFilterId(created.id)
        }}
      />

      <PromotionFormModal
        open={promotionModalOpen}
        onClose={() => setPromotionModalOpen(false)}
        onSubmit={async (values) => {
          const created = await createPromotion(values).unwrap()
          setPromotionId(created.id)
        }}
        isSubmitting={creatingPromotion}
      />

      {seanceModalOpen && canInteractWithSchedule && (
        <SeanceFormModal
          open={seanceModalOpen}
          onClose={() => {
            setSeanceModalOpen(false)
            setEditingSeance(undefined)
            setSeanceDraft(undefined)
          }}
          promotion={editingSeance ? modalPromotion : selectedPromotion}
          promotions={promotionOptions}
          formations={formationScheduleOptions}
          formateurs={formateurOptions}
          initial={
            editingSeance
              ? seanceToInput(editingSeance)
              : seanceDraft
                ? {
                    ...seanceDraft,
                    promotionId: promotionId ?? seanceDraft.promotionId ?? 0,
                    jourSemaine: seanceDraft.jourSemaine ?? 0,
                    heureDebut: seanceDraft.heureDebut ?? '08:00',
                    heureFin: seanceDraft.heureFin ?? '10:00',
                    typeSeance: seanceDraft.typeSeance ?? 'COURS',
                    formationId:
                      seanceDraft.formationId ?? defaultFormationId ?? 0,
                    formateurId: seanceDraft.formateurId ?? formateurOptions[0]?.id ?? 0,
                  }
                : undefined
          }
          onSubmit={handleSaveSeance}
          isSubmitting={creatingSeance || updatingSeance}
        />
      )}

      <ConfirmDialog
        open={!!deletingSeance}
        title="Supprimer la séance"
        message={`Retirer « ${deletingSeance?.formationNom || deletingSeance?.coursNom} » de l'emploi du temps ?`}
        onConfirm={async () => {
          if (deletingSeance) {
            await deleteSeance(deletingSeance.id).unwrap()
            setDeletingSeance(undefined)
          }
        }}
        onCancel={() => setDeletingSeance(undefined)}
      />
    </div>
  )
}
