import { useMemo } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { WeeklySchedule } from '@/features/schedule/components/WeeklySchedule'
import { useGetMySeancesQuery } from '@/features/schedule/api/scheduleApi'
import { mapSeanceToScheduleEvent } from '@/features/schedule/utils/scheduleMappers'

const useMock = import.meta.env.VITE_USE_MOCK !== 'false'

export function StudentSchedulePage() {
  const { data: seances = [], isLoading, isError } = useGetMySeancesQuery(undefined, {
    skip: useMock,
  })

  const events = useMemo(() => seances.map(mapSeanceToScheduleEvent), [seances])

  const formationLabels = useMemo(() => {
    const labels = new Set<string>()
    for (const seance of seances) {
      const label = seance.formationNom || seance.coursNom
      if (label) labels.add(label)
    }
    return [...labels].sort((a, b) => a.localeCompare(b, 'fr'))
  }, [seances])

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900">Emploi du temps</h1>
        <p className="mt-1 text-sm text-slate-500">
          Séances des formations de votre filière et niveau
        </p>
      </div>
      {!useMock && isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}
      {!useMock && isError && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          Impossible de charger votre emploi du temps. Vérifiez que votre profil étudiant est
          rattaché à une filière et un niveau d&apos;études.
        </p>
      )}
      {(useMock || !isLoading) && (
        <>
          {!useMock && formationLabels.length > 0 && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Formations planifiées ({formationLabels.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {formationLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
          <WeeklySchedule
            compact
            events={useMock ? undefined : events}
            statsLabel={
              !useMock
                ? `${seances.length} séance${seances.length !== 1 ? 's' : ''} · ${formationLabels.length} formation${formationLabels.length !== 1 ? 's' : ''}`
                : undefined
            }
            emptyMessage="Aucun créneau planifié pour vos formations."
          />
        </>
      )}
    </div>
  )
}
