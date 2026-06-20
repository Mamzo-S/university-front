import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import {
  useCreatePartnerMutation,
  useDeletePartnerMutation,
  useGetPartnersQuery,
  useUpdatePartnerMutation,
  type Partner,
} from '@/features/career/api/careerApi'
import { PartnerModal } from '@/features/career/components/PartnerModal'
import { ConfirmDialog } from '@/features/formations/components/ConfirmDialog'
import { CrudActions } from '@/features/formations/components/CrudActions'

export function CareerPartnersPage() {
  const { data: partners = [], isLoading } = useGetPartnersQuery()
  const [createPartner, { isLoading: creating }] = useCreatePartnerMutation()
  const [updatePartner, { isLoading: updating }] = useUpdatePartnerMutation()
  const [deletePartner] = useDeletePartnerMutation()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partner | undefined>()
  const [deleting, setDeleting] = useState<Partner | undefined>()

  return (
    <div>
      <PageHeader
        title="Partenaires"
        description="Entreprises partenaires et conventions cadre"
        actions={
          <Button size="sm" onClick={() => { setEditing(undefined); setModalOpen(true) }}>
            + Nouveau partenaire
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : partners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <p className="text-sm text-slate-600">Aucun partenaire enregistré.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">Entreprise</th>
                <th className="px-4 py-3 font-medium">Secteur</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Ville</th>
                <th className="px-4 py-3 font-medium">Stages</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{partner.nom}</p>
                    {partner.conventionCadre && (
                      <Badge variant="info" className="mt-1">
                        Convention cadre
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{partner.secteur ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {partner.contactNom ?? '—'}
                    {partner.email ? (
                      <p className="text-xs text-slate-400">{partner.email}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{partner.ville ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{partner.stageCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <Badge variant={partner.actif ? 'success' : 'default'}>
                      {partner.actif ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <CrudActions
                      onEdit={() => { setEditing(partner); setModalOpen(true) }}
                      onDelete={() => setDeleting(partner)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PartnerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        isSubmitting={creating || updating}
        onSubmit={async (values) => {
          if (editing) {
            await updatePartner({ id: editing.id, body: values }).unwrap()
          } else {
            await createPartner(values).unwrap()
          }
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Supprimer le partenaire"
        message={`Supprimer « ${deleting?.nom} » ?`}
        confirmLabel="Supprimer"
        onConfirm={async () => {
          if (deleting) await deletePartner(deleting.id).unwrap()
          setDeleting(undefined)
        }}
        onCancel={() => setDeleting(undefined)}
      />
    </div>
  )
}
