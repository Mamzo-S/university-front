import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { BackendMembreResponse } from '@/features/admin/utils/personnelMappers'
import {
  useCreateStudentGroupMutation,
  useDeleteStudentGroupMutation,
  useGetFilieresQuery,
  useGetFormationsCatalogQuery,
  useGetPromotionsCatalogQuery,
  useGetStudentGroupsQuery,
  useUpdateStudentGroupMutation,
  type StudentGroupCatalog,
} from '@/features/catalog/api/catalogApi'
import { StudentGroupFormModal } from '@/features/catalog/components/StudentGroupFormModal'
import {
  useCreateStudentMutation,
  useGetStudentsQuery,
  useUpdateStudentMutation,
  type StudentCreateInput,
} from '@/features/students/api/studentsApi'
import { StudentFormModal } from '@/features/students/components/StudentFormModal'
import { ConfirmDialog } from '@/features/formations/components/ConfirmDialog'
import { CrudActions } from '@/features/formations/components/CrudActions'
import { formatNiveauEtude } from '@/types/niveauEtude'

export function TrainingStudentGroupsPage() {
  const { data: formations = [] } = useGetFormationsCatalogQuery()
  const { data: promotions = [] } = useGetPromotionsCatalogQuery()
  const { data: filieres = [] } = useGetFilieresQuery()

  const [filiereId, setFiliereId] = useState<number | ''>('')
  const [formationId, setFormationId] = useState<number | ''>('')
  const [promotionId, setPromotionId] = useState<number | ''>('')

  const groupFilters = useMemo(() => {
    if (promotionId) return { promotionId }
    if (formationId) return { formationId }
    if (filiereId) return { filiereId }
    return undefined
  }, [promotionId, formationId, filiereId])

  const studentQueryFilters = useMemo(() => {
    if (promotionId) return { promotionId }
    if (formationId) return { formationId }
    if (filiereId) return { filiereId }
    return undefined
  }, [promotionId, formationId, filiereId])

  const { data: groups = [], isLoading: loadingGroups } = useGetStudentGroupsQuery(groupFilters)
  const {
    data: studentsRaw = [],
    isLoading: loadingStudents,
    isError: studentsError,
  } = useGetStudentsQuery(studentQueryFilters)

  const [createGroup, { isLoading: creatingGroup }] = useCreateStudentGroupMutation()
  const [updateGroup, { isLoading: updatingGroup }] = useUpdateStudentGroupMutation()
  const [deleteGroup] = useDeleteStudentGroupMutation()
  const [createStudent, { isLoading: creatingStudent }] = useCreateStudentMutation()
  const [updateStudent, { isLoading: updatingStudent }] = useUpdateStudentMutation()

  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [studentModalOpen, setStudentModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<StudentGroupCatalog | undefined>()
  const [editingStudent, setEditingStudent] = useState<BackendMembreResponse | undefined>()
  const [deletingGroup, setDeletingGroup] = useState<StudentGroupCatalog | undefined>()

  const filiereOptions = useMemo(
    () => [...filieres].sort((a, b) => a.nom.localeCompare(b.nom, 'fr')),
    [filieres],
  )

  const formationOptions = useMemo(
    () =>
      formations
        .filter((f) => !filiereId || f.filiereId === filiereId)
        .sort((a, b) => (a.titre ?? a.nom).localeCompare(b.titre ?? b.nom, 'fr')),
    [formations, filiereId],
  )

  const promotionOptions = useMemo(
    () =>
      [...promotions].sort((a, b) =>
        (a.titre ?? a.nom).localeCompare(b.titre ?? b.nom, 'fr'),
      ),
    [promotions],
  )

  const students = studentsRaw

  const resetDependentFilters = (level: 'filiere' | 'formation') => {
    if (level === 'filiere') {
      setFormationId('')
      setPromotionId('')
    } else {
      setPromotionId('')
    }
  }

  return (
    <div>
      <PageHeader
        title="Groupes et étudiants"
        description="Gestion des groupes, inscriptions et affectations par filière"
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingStudent(undefined)
                setStudentModalOpen(true)
              }}
            >
              + Nouvel étudiant
            </Button>
            <Button
              size="sm"
              disabled={promotions.length === 0}
              onClick={() => {
                setEditingGroup(undefined)
                setGroupModalOpen(true)
              }}
            >
              + Nouveau groupe
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <FilterSelect
          label="Filière"
          value={filiereId}
          onChange={(value) => {
            setFiliereId(value)
            resetDependentFilters('filiere')
          }}
          options={[
            { value: '', label: 'Toutes les filières' },
            ...filiereOptions.map((f) => ({ value: f.id, label: f.nom })),
          ]}
        />
        <FilterSelect
          label="Formation"
          value={formationId}
          onChange={(value) => {
            setFormationId(value)
            resetDependentFilters('formation')
          }}
          options={[
            { value: '', label: 'Toutes les formations' },
            ...formationOptions.map((f) => ({
              value: f.id,
              label: f.titre ?? f.nom,
            })),
          ]}
        />
        <FilterSelect
          label="Promotion"
          value={promotionId}
          onChange={setPromotionId}
          options={[
            { value: '', label: 'Toutes les promotions' },
            ...promotionOptions.map((p) => ({
              value: p.id,
              label: p.titre ?? p.nom,
            })),
          ]}
        />
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Groupes d&apos;étudiants</h2>
        {loadingGroups ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <p className="text-sm text-slate-600">Aucun groupe d&apos;étudiants.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Titre</th>
                  <th className="px-4 py-3 font-medium">Promotion</th>
                  <th className="px-4 py-3 font-medium">Formation</th>
                  <th className="px-4 py-3 font-medium">Filière</th>
                  <th className="px-4 py-3 font-medium">Effectif</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {groups.map((group) => (
                  <tr key={group.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900">{group.titre}</td>
                    <td className="px-4 py-3 text-slate-600">{group.promotionTitre ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{group.formationNom ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{group.filiereNom ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{group.effectif ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      <CrudActions
                        onEdit={() => {
                          setEditingGroup(group)
                          setGroupModalOpen(true)
                        }}
                        onDelete={() => setDeletingGroup(group)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          Étudiants ({students.length})
        </h2>
        {studentsError && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            Impossible de charger la liste des étudiants.
          </p>
        )}
        {loadingStudents ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : students.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <p className="text-sm text-slate-600">
              {promotionId || formationId || filiereId
                ? 'Aucun étudiant pour ces filtres.'
                : 'Aucun étudiant enregistré.'}
            </p>
            {(promotionId || formationId || filiereId) && (
              <p className="mt-2 text-xs text-slate-500">
                Réinitialisez les filtres pour afficher tous les étudiants.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Étudiant</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">INE</th>
                  <th className="px-4 py-3 font-medium">Niveau</th>
                  <th className="px-4 py-3 font-medium">Filière</th>
                  <th className="px-4 py-3 font-medium">Promotion</th>
                  <th className="px-4 py-3 font-medium">Groupe</th>
                  <th className="px-4 py-3 font-medium" />
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
                    <td className="px-4 py-3 text-slate-600">
                      {formatNiveauEtude(student.niveau)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{student.filiereNom ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{student.promotionNom ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {student.groupeEtudiantNom ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingStudent(student)
                          setStudentModalOpen(true)
                        }}
                      >
                        Modifier
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <StudentGroupFormModal
        open={groupModalOpen}
        onClose={() => {
          setGroupModalOpen(false)
          setEditingGroup(undefined)
        }}
        promotions={promotions}
        initial={editingGroup}
        defaultPromotionId={promotionId || undefined}
        isSubmitting={creatingGroup || updatingGroup}
        onSubmit={async (values) => {
          if (editingGroup) {
            await updateGroup({ id: editingGroup.id, body: values }).unwrap()
          } else {
            await createGroup(values).unwrap()
          }
          setEditingGroup(undefined)
        }}
      />

      <StudentFormModal
        open={studentModalOpen}
        onClose={() => {
          setStudentModalOpen(false)
          setEditingStudent(undefined)
        }}
        initial={editingStudent}
        filieres={filieres}
        promotions={promotions}
        groups={groups}
        defaultFiliereId={filiereId || undefined}
        defaultPromotionId={promotionId || undefined}
        isSubmitting={creatingStudent || updatingStudent}
        onSubmit={async (values) => {
          if (editingStudent) {
            await updateStudent({ id: editingStudent.id, body: values }).unwrap()
          } else {
            await createStudent(values as StudentCreateInput).unwrap()
          }
          setEditingStudent(undefined)
        }}
      />

      <ConfirmDialog
        open={!!deletingGroup}
        title="Supprimer le groupe"
        message={`Supprimer « ${deletingGroup?.titre} » ?`}
        onConfirm={async () => {
          if (deletingGroup) {
            await deleteGroup(deletingGroup.id).unwrap()
            setDeletingGroup(undefined)
          }
        }}
        onCancel={() => setDeletingGroup(undefined)}
      />
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: number | ''
  onChange: (value: number | '') => void
  options: { value: number | ''; label: string }[]
}) {
  return (
    <div className="min-w-[160px] flex-1">
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      <select
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
      >
        {options.map((option) => (
          <option key={String(option.value)} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
