import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { NiveauSelect } from '@/components/ui/NiveauSelect'
import type { FormationCatalog, FormationCatalogInput, FiliereCatalog } from '@/features/catalog/api/catalogApi'
import { slugify } from '@/features/catalog/utils/slugify'
import { FieldLabel, TextInput } from '@/features/formations/components/formFields'
import { getApiErrorMessage } from '@/features/admin/utils/apiError'

interface FormationCatalogModalProps {
  open: boolean
  onClose: () => void
  initial?: FormationCatalog
  filieres?: FiliereCatalog[]
  onSubmit: (values: FormationCatalogInput) => Promise<void>
  isSubmitting?: boolean
}

const empty = (): FormationCatalogInput => ({
  titre: '',
  slug: '',
  description: '',
  imageUrl: '',
  niveau: 'LICENCE_1',
  typeFormation: '',
  typeFinancement: '',
})

export function FormationCatalogModal({
  open,
  onClose,
  initial,
  filieres = [],
  onSubmit,
  isSubmitting = false,
}: FormationCatalogModalProps) {
  const [values, setValues] = useState<FormationCatalogInput>(empty)
  const [slugEdited, setSlugEdited] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setValues({
        titre: initial.titre ?? initial.nom,
        slug: initial.slug ?? '',
        description: initial.description ?? '',
        imageUrl: initial.imageUrl ?? '',
        niveau: initial.niveau ?? 'LICENCE_1',
        typeFormation: initial.typeFormation ?? '',
        typeFinancement: initial.typeFinancement ?? '',
        dateDebut: initial.dateDebut,
        dateFin: initial.dateFin,
        filiereId: initial.filiereId,
      })
      setSlugEdited(true)
    } else {
      setValues(empty())
      setSlugEdited(false)
    }
    setError(null)
  }, [initial, open])

  const handleTitreChange = (titre: string) => {
    setValues((v) => ({
      ...v,
      titre,
      slug: !slugEdited && !initial ? slugify(titre) : v.slug,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await onSubmit(values)
      onClose()
    } catch (err) {
      setError(
        getApiErrorMessage(
          err as Parameters<typeof getApiErrorMessage>[0],
          'Impossible d\'enregistrer la formation.',
        ),
      )
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Modifier la formation' : 'Nouvelle formation'}
    >
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <FieldLabel>Titre</FieldLabel>
          <TextInput
            value={values.titre}
            onChange={(e) => handleTitreChange(e.target.value)}
            required
          />
        </div>
        <div>
          <FieldLabel>Slug (URL)</FieldLabel>
          <TextInput
            value={values.slug ?? ''}
            onChange={(e) => {
              setSlugEdited(true)
              setValues((v) => ({ ...v, slug: e.target.value }))
            }}
            placeholder="licence-marketing-digital"
          />
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            rows={3}
            value={values.description ?? ''}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          />
        </div>
        <div>
          <FieldLabel>Image (URL)</FieldLabel>
          <TextInput
            value={values.imageUrl ?? ''}
            onChange={(e) => setValues((v) => ({ ...v, imageUrl: e.target.value }))}
            placeholder="https://… ou /uploads/…"
          />
        </div>
        <div>
          <FieldLabel>Filière</FieldLabel>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={values.filiereId ?? ''}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                filiereId: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          >
            <option value="">Aucune filière</option>
            {filieres.map((filiere) => (
              <option key={filiere.id} value={filiere.id}>
                {filiere.nom}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Niveau</FieldLabel>
            <NiveauSelect
              value={values.niveau ?? ''}
              onChange={(value) => setValues((v) => ({ ...v, niveau: value }))}
              required
            />
          </div>
          <div>
            <FieldLabel>Type</FieldLabel>
            <TextInput
              value={values.typeFormation ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, typeFormation: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  )
}
