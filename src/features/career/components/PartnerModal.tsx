import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { Partner, PartnerInput } from '@/features/career/api/careerApi'
import { FieldLabel, TextInput } from '@/features/formations/components/formFields'
import { getApiErrorMessage } from '@/features/admin/utils/apiError'

interface PartnerModalProps {
  open: boolean
  onClose: () => void
  initial?: Partner
  onSubmit: (values: PartnerInput) => Promise<void>
  isSubmitting?: boolean
}

const empty = (): PartnerInput => ({
  nom: '',
  secteur: '',
  email: '',
  telephone: '',
  adresse: '',
  ville: '',
  pays: 'Sénégal',
  contactNom: '',
  contactFonction: '',
  description: '',
  actif: true,
  conventionCadre: false,
})

export function PartnerModal({
  open,
  onClose,
  initial,
  onSubmit,
  isSubmitting = false,
}: PartnerModalProps) {
  const [values, setValues] = useState<PartnerInput>(empty())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setValues({
        nom: initial.nom,
        secteur: initial.secteur ?? '',
        email: initial.email ?? '',
        telephone: initial.telephone ?? '',
        adresse: initial.adresse ?? '',
        ville: initial.ville ?? '',
        pays: initial.pays ?? 'Sénégal',
        contactNom: initial.contactNom ?? '',
        contactFonction: initial.contactFonction ?? '',
        description: initial.description ?? '',
        actif: initial.actif ?? true,
        conventionCadre: initial.conventionCadre ?? false,
      })
    } else {
      setValues(empty())
    }
    setError(null)
  }, [initial, open])

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
          'Impossible d\'enregistrer le partenaire.',
        ),
      )
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Modifier le partenaire' : 'Nouveau partenaire'}>
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <FieldLabel>Entreprise</FieldLabel>
          <TextInput
            value={values.nom}
            onChange={(e) => setValues((v) => ({ ...v, nom: e.target.value }))}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Secteur</FieldLabel>
            <TextInput
              value={values.secteur ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, secteur: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel>Ville</FieldLabel>
            <TextInput
              value={values.ville ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, ville: e.target.value }))}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Email</FieldLabel>
            <TextInput
              type="email"
              value={values.email ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel>Téléphone</FieldLabel>
            <TextInput
              value={values.telephone ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, telephone: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <FieldLabel>Adresse</FieldLabel>
          <TextInput
            value={values.adresse ?? ''}
            onChange={(e) => setValues((v) => ({ ...v, adresse: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Contact</FieldLabel>
            <TextInput
              value={values.contactNom ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, contactNom: e.target.value }))}
            />
          </div>
          <div>
            <FieldLabel>Fonction du contact</FieldLabel>
            <TextInput
              value={values.contactFonction ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, contactFonction: e.target.value }))}
            />
          </div>
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
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={values.actif ?? true}
              onChange={(e) => setValues((v) => ({ ...v, actif: e.target.checked }))}
            />
            Partenaire actif
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={values.conventionCadre ?? false}
              onChange={(e) => setValues((v) => ({ ...v, conventionCadre: e.target.checked }))}
            />
            Convention cadre signée
          </label>
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
