import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useGetFilieresQuery, useGetPromotionsCatalogQuery } from '@/features/catalog/api/catalogApi'
import {
  useCreateStudentMutation,
  useGetMyModulesQuery,
  useGetStudentsQuery,
} from '@/features/students/api/studentsApi'
import { StudentCreateModal } from '@/features/students/components/StudentCreateModal'
import { formatNiveauEtude } from '@/types/niveauEtude'

export function TrainerStudentsPage() {
  const { data: myModules = [] } = useGetMyModulesQuery()
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null)

  useEffect(() => {
    if (myModules.length > 0 && selectedModuleId == null) {
      setSelectedModuleId(myModules[0]?.id ?? null)
    }
  }, [myModules, selectedModuleId])

  const { data: students = [], isLoading } = useGetStudentsQuery(
    selectedModuleId != null ? { moduleId: selectedModuleId } : undefined,
    { skip: selectedModuleId == null },
  )

  const { data: allPromotions = [] } = useGetPromotionsCatalogQuery()
  const { data: allFilieres = [] } = useGetFilieresQuery()
  const [createStudent, { isLoading: creating }] = useCreateStudentMutation()

  const [modalOpen, setModalOpen] = useState(false)

  const myFiliereIds = useMemo(
    () =>
      new Set(
        myModules
          .map((module) => module.filiereId)
          .filter((id): id is number => id != null),
      ),
    [myModules],
  )

  const availableFilieres = useMemo(
    () => allFilieres.filter((filiere) => myFiliereIds.has(filiere.id)),
    [allFilieres, myFiliereIds],
  )

  const availablePromotions = useMemo(
    () =>
      allPromotions.filter(
        (promotion) =>
          promotion.formationId != null &&
          myModules.some((module) => module.id === promotion.formationId),
      ),
    [allPromotions, myModules],
  )

  const selectedModule = myModules.find((module) => module.id === selectedModuleId)

  return (
    <div>
      <PageHeader
        title="Étudiants"
        description="Liste des étudiants par module (filière)"
        actions={
          <Button
            size="sm"
            disabled={availableFilieres.length === 0}
            onClick={() => setModalOpen(true)}
          >
            + Nouvel étudiant
          </Button>
        }
      />

      {myModules.length === 0 ? (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Aucun module ne vous est assigné. Contactez le responsable de formation.
        </p>
      ) : (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Module</label>
            <select
              className="min-w-[220px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={selectedModuleId ?? ''}
              onChange={(e) => setSelectedModuleId(Number(e.target.value))}
            >
              {myModules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.titre}
                  {module.filiereNom ? ` (${module.filiereNom})` : ''}
                </option>
              ))}
            </select>
          </div>
          {selectedModule?.filiereNom && (
            <p className="pb-2 text-sm text-slate-500">
              Filière : <span className="font-medium text-slate-700">{selectedModule.filiereNom}</span>
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <p className="text-sm text-slate-600">
            {selectedModuleId
              ? 'Aucun étudiant inscrit dans la filière de ce module.'
              : 'Sélectionnez un module pour afficher les étudiants.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">Étudiant</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">INE</th>
                <th className="px-4 py-3 font-medium">Filière</th>
                <th className="px-4 py-3 font-medium">Promotion</th>
                <th className="px-4 py-3 font-medium">Niveau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {student.prenom} {student.nom}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{student.email}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {student.ine ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{student.filiereNom ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{student.promotionNom ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatNiveauEtude(student.niveau)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <StudentCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        filieres={availableFilieres}
        promotions={availablePromotions}
        isSubmitting={creating}
        onSubmit={async (values) => {
          await createStudent(values).unwrap()
        }}
      />
    </div>
  )
}
