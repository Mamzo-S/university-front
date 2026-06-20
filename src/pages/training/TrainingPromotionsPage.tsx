import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import {
  useCreatePromotionCatalogMutation,
  useDeletePromotionCatalogMutation,
  useGetPromotionsCatalogQuery,
  useUpdatePromotionCatalogMutation,
  type PromotionCatalog,
} from '@/features/catalog/api/catalogApi'
import { PromotionCatalogModal } from '@/features/catalog/components/PromotionCatalogModal'
import { ConfirmDialog } from '@/features/formations/components/ConfirmDialog'
import { CrudActions } from '@/features/formations/components/CrudActions'

export function TrainingPromotionsPage() {
  const { data: promotions = [], isLoading } = useGetPromotionsCatalogQuery()
  const [createPromotion, { isLoading: creating }] = useCreatePromotionCatalogMutation()
  const [updatePromotion, { isLoading: updating }] = useUpdatePromotionCatalogMutation()
  const [deletePromotion] = useDeletePromotionCatalogMutation()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PromotionCatalog | undefined>()
  const [deleting, setDeleting] = useState<PromotionCatalog | undefined>()

  return (
    <div>
      <PageHeader
        title="Promotions"
        description="Cohortes et promotions (titre, slug, description)"
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(undefined)
              setModalOpen(true)
            }}
          >
            + Nouvelle promotion
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : promotions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <p className="text-sm text-slate-600">Aucune promotion enregistrée.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">Titre</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {promotions.map((promotion) => (
                <tr key={promotion.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {promotion.titre ?? promotion.nom}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {promotion.slug}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {promotion.description ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CrudActions
                      onEdit={() => {
                        setEditing(promotion)
                        setModalOpen(true)
                      }}
                      onDelete={() => setDeleting(promotion)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PromotionCatalogModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(undefined)
        }}
        initial={editing}
        isSubmitting={creating || updating}
        onSubmit={async (values) => {
          if (editing) {
            await updatePromotion({ id: editing.id, body: values }).unwrap()
          } else {
            await createPromotion(values).unwrap()
          }
          setEditing(undefined)
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Supprimer la promotion"
        message={`Supprimer « ${deleting?.titre ?? deleting?.nom} » ?`}
        onConfirm={async () => {
          if (deleting) {
            await deletePromotion(deleting.id).unwrap()
            setDeleting(undefined)
          }
        }}
        onCancel={() => setDeleting(undefined)}
      />
    </div>
  )
}
