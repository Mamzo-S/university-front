import { Spinner } from '@/components/ui/Spinner'
import { ModuleCatalogCard } from '@/features/students/components/ModuleCatalogCard'
import { useGetMyFiliereQuery } from '@/features/students/api/studentsApi'
import { formatNiveauEtude } from '@/types/niveauEtude'

export function StudentFormationsPage() {
  const { data: filiereView, isLoading, isError } = useGetMyFiliereQuery()

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !filiereView) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
        <p className="text-sm text-slate-600">
          Aucune filière associée à votre profil. Contactez l&apos;administration.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Mes modules</h1>
        <p className="mt-1 text-sm text-slate-500">
          Filière : <span className="font-medium text-slate-700">{filiereView.nom}</span>
          {filiereView.niveauEtudiant && (
            <>
              {' '}
              — Niveau :{' '}
              <span className="font-medium text-slate-700">
                {formatNiveauEtude(filiereView.niveauEtudiant)}
              </span>
            </>
          )}
          {filiereView.description ? ` — ${filiereView.description}` : ''}
        </p>
      </div>

      {filiereView.modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <p className="text-sm text-slate-600">
            Aucun module disponible pour votre filière et votre niveau d&apos;études.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filiereView.modules.map((module) => (
            <ModuleCatalogCard key={module.id} module={module} />
          ))}
        </div>
      )}
    </div>
  )
}
