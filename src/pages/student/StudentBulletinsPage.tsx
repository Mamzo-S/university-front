import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import {
  useGetMyBulletinQuery,
  useGetMyBulletinsQuery,
  type BulletinSummary,
} from '@/features/grades/api/gradesApi'

function mentionVariant(mention?: string) {
  if (mention === 'Très Bien' || mention === 'Bien') return 'success' as const
  if (mention === 'Assez Bien' || mention === 'Passable') return 'info' as const
  return 'warning' as const
}

export function StudentBulletinsPage() {
  const { data: bulletins = [], isLoading } = useGetMyBulletinsQuery()
  const [selected, setSelected] = useState<BulletinSummary | null>(null)

  const { data: detail, isLoading: loadingDetail } = useGetMyBulletinQuery(
    selected
      ? { semestre: selected.semestre, anneeAcademique: selected.anneeAcademique }
      : { semestre: '', anneeAcademique: '' },
    { skip: !selected },
  )

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Mes bulletins"
        description="Consultez vos bulletins de notes publiés par l'établissement"
      />

      {bulletins.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <p className="text-sm text-slate-600">Aucun bulletin publié pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            {bulletins.map((bulletin) => {
              const active =
                selected?.semestre === bulletin.semestre &&
                selected?.anneeAcademique === bulletin.anneeAcademique

              return (
                <button
                  key={`${bulletin.anneeAcademique}-${bulletin.semestre}`}
                  type="button"
                  onClick={() => setSelected(bulletin)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                    active
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-slate-200 bg-white hover:border-primary-200'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {bulletin.semestre} — {bulletin.anneeAcademique}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Moyenne : {bulletin.moyenneGenerale ?? '—'}/20
                  </p>
                  {bulletin.mention && (
                    <Badge variant={mentionVariant(bulletin.mention)} className="mt-2">
                      {bulletin.mention}
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>

          <div>
            {!selected ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-slate-500">
                  Sélectionnez un bulletin pour afficher le détail.
                </CardContent>
              </Card>
            ) : loadingDetail || !detail ? (
              <div className="flex justify-center py-16">
                <Spinner size="lg" />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Bulletin {detail.semestre} — {detail.anneeAcademique}
                  </CardTitle>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
                    <span>{detail.etudiantNomComplet}</span>
                    {detail.etudiantIne && <span>· INE {detail.etudiantIne}</span>}
                    {detail.filiereNom && <span>· {detail.filiereNom}</span>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap items-center gap-4 rounded-lg bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-xs text-slate-500">Moyenne générale</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {detail.moyenneGenerale ?? '—'}
                        <span className="text-base font-normal text-slate-500">/20</span>
                      </p>
                    </div>
                    {detail.mention && (
                      <Badge variant={mentionVariant(detail.mention)}>{detail.mention}</Badge>
                    )}
                    {detail.datePublication && (
                      <p className="text-xs text-slate-500">
                        Publié le {detail.datePublication}
                      </p>
                    )}
                  </div>

                  {detail.lignesCours && detail.lignesCours.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold text-slate-800">
                        Moyennes par cours
                      </h3>
                      <div className="overflow-hidden rounded-lg border border-slate-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 text-left text-slate-500">
                              <th className="px-3 py-2 font-medium">Cours</th>
                              <th className="px-3 py-2 font-medium">Coef.</th>
                              <th className="px-3 py-2 font-medium">Moyenne</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {detail.lignesCours.map((line) => (
                              <tr key={line.coursId}>
                                <td className="px-3 py-2">
                                  <p className="font-medium text-slate-900">{line.coursNom}</p>
                                  {line.coursCode && (
                                    <p className="text-xs text-slate-400">{line.coursCode}</p>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-slate-600">
                                  {line.coefficient ?? '—'}
                                </td>
                                <td className="px-3 py-2 font-medium text-slate-900">
                                  {line.moyenneCours ?? '—'}/20
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-800">
                      Détail des évaluations
                    </h3>
                    <div className="overflow-hidden rounded-lg border border-slate-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-left text-slate-500">
                            <th className="px-3 py-2 font-medium">Cours</th>
                            <th className="px-3 py-2 font-medium">Type</th>
                            <th className="px-3 py-2 font-medium">Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {detail.notes.map((note) => (
                            <tr key={note.id}>
                              <td className="px-3 py-2 text-slate-800">{note.coursNom}</td>
                              <td className="px-3 py-2 text-slate-600">{note.typeEvaluation}</td>
                              <td className="px-3 py-2 font-medium text-slate-900">
                                {note.valeur}/20
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
