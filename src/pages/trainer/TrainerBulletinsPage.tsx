import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import {
  EVALUATION_TYPES,
  useGetCoursQuery,
  useGetStudentGradesQuery,
  usePublishBulletinMutation,
  useSaveGradeMutation,
} from '@/features/grades/api/gradesApi'
import { FieldLabel, TextInput } from '@/features/formations/components/formFields'
import { useGetStudentsQuery } from '@/features/students/api/studentsApi'
import { getApiErrorMessage } from '@/features/admin/utils/apiError'

export function TrainerBulletinsPage() {
  const { data: students = [] } = useGetStudentsQuery()
  const { data: cours = [] } = useGetCoursQuery()
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [semestre, setSemestre] = useState('S1')
  const [anneeAcademique, setAnneeAcademique] = useState('2024-2025')

  const { data: grades = [], isLoading } = useGetStudentGradesQuery(selectedStudentId ?? 0, {
    skip: !selectedStudentId,
  })

  const [saveGrade, { isLoading: saving }] = useSaveGradeMutation()
  const [publishBulletin, { isLoading: publishing }] = usePublishBulletinMutation()
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    coursId: 0,
    typeEvaluation: 'EXAMEN' as (typeof EVALUATION_TYPES)[number],
    valeur: '',
  })

  const periodGrades = useMemo(
    () =>
      grades.filter(
        (grade) => grade.semestre === semestre && grade.anneeAcademique === anneeAcademique,
      ),
    [grades, semestre, anneeAcademique],
  )

  const hasUnpublished = periodGrades.some((grade) => !grade.bulletinPublie)
  const isPublished = periodGrades.length > 0 && periodGrades.every((grade) => grade.bulletinPublie)

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!selectedStudentId || !form.coursId) return

    const valeur = Number(form.valeur)
    if (Number.isNaN(valeur) || valeur < 0 || valeur > 20) {
      setError('La note doit être comprise entre 0 et 20.')
      return
    }

    try {
      await saveGrade({
        etudiantId: selectedStudentId,
        coursId: form.coursId,
        typeEvaluation: form.typeEvaluation,
        valeur,
        semestre,
        anneeAcademique,
      }).unwrap()
      setForm((current) => ({ ...current, valeur: '' }))
    } catch (err) {
      setError(
        getApiErrorMessage(
          err as Parameters<typeof getApiErrorMessage>[0],
          'Impossible d\'enregistrer la note.',
        ),
      )
    }
  }

  const handlePublish = async () => {
    if (!selectedStudentId) return
    setError(null)
    try {
      await publishBulletin({
        etudiantId: selectedStudentId,
        semestre,
        anneeAcademique,
      }).unwrap()
    } catch (err) {
      setError(
        getApiErrorMessage(
          err as Parameters<typeof getApiErrorMessage>[0],
          'Impossible de publier le bulletin.',
        ),
      )
    }
  }

  return (
    <div>
      <PageHeader
        title="Bulletins"
        description="Saisie des notes et publication des bulletins étudiants"
      />

      <div className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <div>
          <FieldLabel>Étudiant</FieldLabel>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={selectedStudentId ?? ''}
            onChange={(e) => setSelectedStudentId(Number(e.target.value) || null)}
          >
            <option value="">Choisir un étudiant</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.prenom} {student.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Semestre</FieldLabel>
          <TextInput value={semestre} onChange={(e) => setSemestre(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Année académique</FieldLabel>
          <TextInput
            value={anneeAcademique}
            onChange={(e) => setAnneeAcademique(e.target.value)}
          />
        </div>
      </div>

      {!selectedStudentId ? (
        <p className="text-sm text-slate-500">Sélectionnez un étudiant pour gérer son bulletin.</p>
      ) : cours.length === 0 ? (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Aucun cours enregistré. Créez des cours (matières) côté backend avant de saisir des notes.
        </p>
      ) : (
        <>
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Ajouter une note</h2>
            <form onSubmit={handleAddGrade} className="grid gap-3 sm:grid-cols-4">
              <div>
                <FieldLabel>Cours</FieldLabel>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.coursId || cours[0]?.id || ''}
                  onChange={(e) => setForm((v) => ({ ...v, coursId: Number(e.target.value) }))}
                  required
                >
                  {cours.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nom} ({item.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Type</FieldLabel>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.typeEvaluation}
                  onChange={(e) =>
                    setForm((v) => ({
                      ...v,
                      typeEvaluation: e.target.value as (typeof EVALUATION_TYPES)[number],
                    }))
                  }
                >
                  {EVALUATION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Note /20</FieldLabel>
                <TextInput
                  type="number"
                  min={0}
                  max={20}
                  step={0.25}
                  value={form.valeur}
                  onChange={(e) => setForm((v) => ({ ...v, valeur: e.target.value }))}
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" size="sm" isLoading={saving} className="w-full">
                  Enregistrer
                </Button>
              </div>
            </form>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-800">Notes du bulletin</h2>
              {isPublished && <Badge variant="success">Publié</Badge>}
              {hasUnpublished && <Badge variant="warning">Brouillon</Badge>}
            </div>
            <Button
              size="sm"
              disabled={periodGrades.length === 0 || isPublished}
              isLoading={publishing}
              onClick={handlePublish}
            >
              Publier le bulletin
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : periodGrades.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <p className="text-sm text-slate-600">Aucune note pour cette période.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                    <th className="px-4 py-3 font-medium">Cours</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Note</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {periodGrades.map((grade) => (
                    <tr key={grade.id}>
                      <td className="px-4 py-3 text-slate-800">{grade.coursNom}</td>
                      <td className="px-4 py-3 text-slate-600">{grade.typeEvaluation}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{grade.valeur}/20</td>
                      <td className="px-4 py-3">
                        <Badge variant={grade.bulletinPublie ? 'success' : 'warning'}>
                          {grade.bulletinPublie ? 'Publié' : 'Brouillon'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
