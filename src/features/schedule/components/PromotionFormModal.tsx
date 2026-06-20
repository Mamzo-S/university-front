import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { PromotionInput } from '@/features/schedule/api/scheduleApi'
import { slugify } from '@/features/catalog/utils/slugify'
import { FieldLabel, TextInput } from '@/features/formations/components/formFields'
import { getApiErrorMessage } from '@/features/admin/utils/apiError'

interface PromotionFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: PromotionInput) => Promise<void>
  isSubmitting?: boolean
}

export function PromotionFormModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: PromotionFormModalProps) {
  const [titre, setTitre] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setTitre('')
      setSlug('')
      setSlugEdited(false)
      setDescription('')
      setError(null)
    }
  }, [open])

  const handleTitreChange = (value: string) => {
    setTitre(value)
    if (!slugEdited) {
      setSlug(slugify(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await onSubmit({
        titre: titre.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
      })
      onClose()
    } catch (err) {
      setError(
        getApiErrorMessage(
          err as Parameters<typeof getApiErrorMessage>[0],
          'Impossible de créer la promotion.',
        ),
      )
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Ajouter une promotion">
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <FieldLabel>Titre</FieldLabel>
          <TextInput
            value={titre}
            onChange={(e) => handleTitreChange(e.target.value)}
            placeholder="Promo 2025-2026"
            required
          />
        </div>
        <div>
          <FieldLabel>Slug</FieldLabel>
          <TextInput
            value={slug}
            onChange={(e) => {
              setSlugEdited(true)
              setSlug(e.target.value)
            }}
          />
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Créer la promotion
          </Button>
        </div>
      </form>
    </Modal>
  )
}
