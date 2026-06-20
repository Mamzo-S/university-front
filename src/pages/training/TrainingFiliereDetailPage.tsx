import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Spinner } from '@/components/ui/Spinner'
import { useGetFiliereDetailQuery } from '@/features/catalog/api/catalogApi'
import { formatNiveauEtude } from '@/types/niveauEtude'

export function TrainingFiliereDetailPage() {
  const { id } = useParams<{ id: string }>()
  const filiereId = Number(id)
  const { data: filiere, isLoading, isError } = useGetFiliereDetailQuery(filiereId, {
    skip: !filiereId,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !filiere) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-8 text-center">
        <p className="text-sm text-red-600">Filière introuvable.</p>
        <Link
          to="/training/filieres"
          className="mt-4 inline-flex h-8 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Retour aux filières
        </Link>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={filiere.nom}
        description={filiere.description ?? 'Détail de la filière'}
        actions={
        <Link
          to="/training/filieres"
          className="inline-flex h-8 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Filières
        </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-500">Modules</p>
          <p className="text-lg font-semibold text-slate-900">{filiere.moduleCount ?? 0}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-500">Étudiants</p>
          <p className="text-lg font-semibold text-slate-900">{filiere.etudiantCount ?? 0}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="font-semibold text-slate-900">Modules (formations)</h2>
          </div>
          {filiere.modules.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              Aucun module rattaché. Assignez une filière lors de la création d&apos;une formation.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50 text-left text-slate-500">
                  <th className="px-4 py-2 font-medium">Titre</th>
                  <th className="px-4 py-2 font-medium">Niveau</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filiere.modules.map((module) => (
                  <tr key={module.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{module.titre}</p>
                      {module.slug && (
                        <p className="font-mono text-[11px] text-slate-400">/{module.slug}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatNiveauEtude(module.niveau)}</td>
                    <td className="px-4 py-3 text-slate-600">{module.typeFormation ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="font-semibold text-slate-900">Étudiants</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Inscrits via une promotion d&apos;un module de cette filière
            </p>
          </div>
          {filiere.etudiants.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              Aucun étudiant dans cette filière pour l&apos;instant.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50 text-left text-slate-500">
                  <th className="px-4 py-2 font-medium">Étudiant</th>
                  <th className="px-4 py-2 font-medium">Promotion</th>
                  <th className="px-4 py-2 font-medium">Module</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filiere.etudiants.map((etudiant) => (
                  <tr key={etudiant.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {etudiant.prenom} {etudiant.nom}
                      </p>
                      <p className="text-xs text-slate-500">{etudiant.email ?? etudiant.ine}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{etudiant.promotionNom ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{etudiant.formationNom ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}
