import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppDispatch } from '@/app/hooks'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { SubModuleFormModal } from '@/features/formations/components/SubModuleFormModal'
import { TrainerSubModulePanel } from '@/features/formations/components/TrainerSubModulePanel'
import { useCatalogFormation } from '@/features/formations/hooks/useCatalogFormation'
import { createEmptySubModuleFields } from '@/features/formations/utils/normalizeFormation'
import { addSubModule } from '@/features/formations/slice/formationsSlice'
import { createId } from '@/lib/createId'
import { countFormationContent } from '@/mocks/data/studentFormations'

export function TrainingFormationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const catalogId = id ? Number(id) : undefined
  const dispatch = useAppDispatch()
  const { formation, isLoading, isError } = useCatalogFormation(catalogId, {
    syncParcoursToApi: true,
  })
  const [addSubOpen, setAddSubOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !formation || catalogId == null || Number.isNaN(catalogId)) {
    return (
      <div className="rounded-lg border border-slate-100 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-slate-500">Formation introuvable.</p>
        <Link
          to="/training/formations"
          className="mt-3 inline-block text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          Retour aux formations
        </Link>
      </div>
    )
  }

  const stats = countFormationContent(formation)

  return (
    <div>
      <Link
        to="/training/formations"
        className="mb-3 inline-flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-800"
      >
        ← Retour aux formations
      </Link>

      <div className="relative w-full overflow-hidden rounded-md">
        <img
          src={formation.imageUrl}
          alt={formation.title}
          className="aspect-[4/1] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="info">{formation.level}</Badge>
            <Badge>{formation.type}</Badge>
          </div>
          <h1 className="mt-1 line-clamp-2 text-base font-bold text-white sm:text-lg">
            {formation.title}
          </h1>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
        <p className="text-sm leading-relaxed text-slate-600">
          {formation.description || 'Aucune description.'}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
          {[
            { label: 'Sous-modules', value: stats.subModules },
            { label: 'Documents', value: stats.documents },
            { label: 'Quiz', value: stats.quizzes },
            { label: 'Ressources', value: stats.resources },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-lg font-bold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Sous-modules</h2>
            <p className="text-xs text-slate-500">
              Contenu pédagogique de la formation
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setAddSubOpen(true)}>
            + Sous-module
          </Button>
        </div>
        <div className="space-y-3">
          {formation.subModules.map((sub, index) => (
            <TrainerSubModulePanel
              key={sub.id}
              subModule={sub}
              formationId={formation.id}
              enrolledStudentIds={formation.enrolledStudentIds ?? []}
              defaultOpen={index === 0}
            />
          ))}
          {formation.subModules.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
              Ajoutez un sous-module pour structurer le contenu pédagogique.
            </p>
          )}
        </div>
      </div>

      <SubModuleFormModal
        open={addSubOpen}
        onClose={() => setAddSubOpen(false)}
        onSubmit={(values) =>
          dispatch(
            addSubModule({
              formationId: formation.id,
              subModule: {
                id: createId('sub'),
                ...values,
                order: formation.subModules.length + 1,
                documents: [],
                quizzes: [],
                resources: [],
                ...createEmptySubModuleFields(),
              },
            }),
          )
        }
      />
    </div>
  )
}
