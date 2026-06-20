import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import {
  useCreateFormationCatalogMutation,
  useDeleteFormationCatalogMutation,
  useGetFilieresQuery,
  useGetFormationsCatalogQuery,
  useUpdateFormationCatalogMutation,
  type FormationCatalog,
} from '@/features/catalog/api/catalogApi'
import { FormationCatalogModal } from '@/features/catalog/components/FormationCatalogModal'
import { ConfirmDialog } from '@/features/formations/components/ConfirmDialog'
import { CrudActions } from '@/features/formations/components/CrudActions'
import { formatNiveauEtude } from '@/types/niveauEtude'

export function TrainingFormationsPage() {
  const { data: formations = [], isLoading } = useGetFormationsCatalogQuery()
  const { data: filieres = [] } = useGetFilieresQuery()
  const [createFormation, { isLoading: creating }] = useCreateFormationCatalogMutation()
  const [updateFormation, { isLoading: updating }] = useUpdateFormationCatalogMutation()
  const [deleteFormation] = useDeleteFormationCatalogMutation()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FormationCatalog | undefined>()
  const [deleting, setDeleting] = useState<FormationCatalog | undefined>()

  return (
    <div>
      <PageHeader
        title="Formations"
        description="Programmes pédagogiques — titre, slug, description et image"
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(undefined)
              setModalOpen(true)
            }}
          >
            + Nouvelle formation
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : formations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <p className="text-sm text-slate-600">Aucune formation enregistrée.</p>
          <Button size="sm" className="mt-4" onClick={() => setModalOpen(true)}>
            Créer la première formation
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Titre</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Filière</th>
                <th className="px-4 py-3 font-medium">Niveau</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {formations.map((formation) => (
                <tr key={formation.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    {formation.imageUrl ? (
                      <img
                        src={formation.imageUrl}
                        alt=""
                        className="h-10 w-16 rounded object-cover"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/training/formations/${formation.id}`}
                      className="font-medium text-slate-900 hover:text-primary-700"
                    >
                      {formation.titre ?? formation.nom}
                    </Link>
                    {formation.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {formation.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {formation.slug}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formation.filiereNom ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{formatNiveauEtude(formation.niveau)}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formation.typeFormation ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/training/formations/${formation.id}`}
                        className="text-xs font-medium text-primary-600 hover:underline"
                      >
                        Contenu
                      </Link>
                      <Link
                        to="/training/schedule"
                        className="text-xs font-medium text-primary-600 hover:underline"
                      >
                        EDT
                      </Link>
                      <CrudActions
                        onEdit={() => {
                          setEditing(formation)
                          setModalOpen(true)
                        }}
                        onDelete={() => setDeleting(formation)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormationCatalogModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(undefined)
        }}
        initial={editing}
        filieres={filieres}
        isSubmitting={creating || updating}
        onSubmit={async (values) => {
          if (editing) {
            await updateFormation({ id: editing.id, body: values }).unwrap()
          } else {
            await createFormation(values).unwrap()
          }
          setEditing(undefined)
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Supprimer la formation"
        message={`Supprimer « ${deleting?.titre ?? deleting?.nom} » ?`}
        onConfirm={async () => {
          if (deleting) {
            await deleteFormation(deleting.id).unwrap()
            setDeleting(undefined)
          }
        }}
        onCancel={() => setDeleting(undefined)}
      />
    </div>
  )
}
