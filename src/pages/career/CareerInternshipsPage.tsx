import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import {
  INTERNSHIP_STATUS_LABELS,
  useCreateInternshipMutation,
  useDeleteInternshipMutation,
  useGetInternshipsQuery,
  useGetPartnersQuery,
  useUpdateInternshipMutation,
  type Internship,
} from '@/features/career/api/careerApi'
import { InternshipModal } from '@/features/career/components/InternshipModal'
import { useGetStudentsQuery } from '@/features/students/api/studentsApi'
import { ConfirmDialog } from '@/features/formations/components/ConfirmDialog'
import { CrudActions } from '@/features/formations/components/CrudActions'

const statusVariant = (statut: Internship['statut']) => {
  switch (statut) {
    case 'EN_COURS':
      return 'info' as const
    case 'TERMINE':
      return 'success' as const
    case 'ANNULE':
      return 'default' as const
    default:
      return 'warning' as const
  }
}

export function CareerInternshipsPage() {
  const { data: internships = [], isLoading } = useGetInternshipsQuery()
  const { data: partners = [] } = useGetPartnersQuery()
  const { data: students = [] } = useGetStudentsQuery()
  const [createInternship, { isLoading: creating }] = useCreateInternshipMutation()
  const [updateInternship, { isLoading: updating }] = useUpdateInternshipMutation()
  const [deleteInternship] = useDeleteInternshipMutation()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Internship | undefined>()
  const [deleting, setDeleting] = useState<Internship | undefined>()

  const activePartners = partners.filter((partner) => partner.actif !== false)

  return (
    <div>
      <PageHeader
        title="Stages"
        description="Suivi des stages étudiants en entreprise"
        actions={
          <Button
            size="sm"
            disabled={activePartners.length === 0 || students.length === 0}
            onClick={() => { setEditing(undefined); setModalOpen(true) }}
          >
            + Nouveau stage
          </Button>
        }
      />

      {(activePartners.length === 0 || students.length === 0) && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {students.length === 0
            ? 'Aucun étudiant inscrit.'
            : 'Créez au moins un partenaire actif avant d\'enregistrer un stage.'}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : internships.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <p className="text-sm text-slate-600">Aucun stage enregistré.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">Étudiant</th>
                <th className="px-4 py-3 font-medium">Partenaire</th>
                <th className="px-4 py-3 font-medium">Sujet</th>
                <th className="px-4 py-3 font-medium">Période</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Convention</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {internships.map((internship) => (
                <tr key={internship.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {internship.etudiantPrenom} {internship.etudiantNom}
                    </p>
                    <p className="text-xs text-slate-400">{internship.filiereNom ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{internship.partenaireNom ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{internship.sujet ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {internship.dateDebut ?? '—'}
                    {internship.dateFin ? ` → ${internship.dateFin}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(internship.statut)}>
                      {INTERNSHIP_STATUS_LABELS[internship.statut]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={internship.conventionSignee ? 'success' : 'warning'}>
                      {internship.conventionSignee ? 'Signée' : 'En attente'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <CrudActions
                      onEdit={() => { setEditing(internship); setModalOpen(true) }}
                      onDelete={() => setDeleting(internship)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <InternshipModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        students={students}
        partners={activePartners}
        isSubmitting={creating || updating}
        onSubmit={async (values) => {
          if (editing) {
            await updateInternship({ id: editing.id, body: values }).unwrap()
          } else {
            await createInternship(values).unwrap()
          }
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Supprimer le stage"
        message={`Supprimer le stage de ${deleting?.etudiantPrenom} ${deleting?.etudiantNom} ?`}
        confirmLabel="Supprimer"
        onConfirm={async () => {
          if (deleting) await deleteInternship(deleting.id).unwrap()
          setDeleting(undefined)
        }}
        onCancel={() => setDeleting(undefined)}
      />
    </div>
  )
}
