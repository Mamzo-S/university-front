import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { NiveauSelect } from '@/components/ui/NiveauSelect'
import type { FiliereCatalog, PromotionCatalog } from '@/features/catalog/api/catalogApi'
import { FieldLabel, TextInput } from '@/features/formations/components/formFields'
import type { StudentCreateInput } from '@/features/students/api/studentsApi'
import { getApiErrorMessage } from '@/features/admin/utils/apiError'

interface StudentCreateModalProps {
  open: boolean
  onClose: () => void
  filieres: FiliereCatalog[]
  promotions: PromotionCatalog[]
  onSubmit: (values: StudentCreateInput) => Promise<void>
  isSubmitting?: boolean
}

const empty = (): StudentCreateInput => ({
  email: '',
  motDePasse: '',
  nom: '',
  prenom: '',
  ine: '',
  dateNaissance: '',
  niveau: 'LICENCE_1',
  filiereId: 0,
})

export function StudentCreateModal({
  open,
  onClose,
  filieres,
  promotions,
  onSubmit,
  isSubmitting = false,
}: StudentCreateModalProps) {
  const [values, setValues] = useState<StudentCreateInput>(empty())
  const [error, setError] = useState<string | null>(null)

  const filiereOptions = useMemo(
    () => [...filieres].sort((a, b) => a.nom.localeCompare(b.nom, 'fr')),
    [filieres],
  )

  const promotionOptions = useMemo(
    () =>
      [...promotions].sort((a, b) =>
        (a.titre ?? a.nom).localeCompare(b.titre ?? b.nom, 'fr'),
      ),
    [promotions],
  )

  useEffect(() => {
    setValues({
      ...empty(),
      filiereId: filiereOptions[0]?.id ?? 0,
    })
    setError(null)
  }, [open, filiereOptions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!values.filiereId) {
      setError('Sélectionnez une filière.')
      return
    }
    if (!values.niveau) {
      setError('Sélectionnez un niveau.')
      return
    }
    try {
      const payload: StudentCreateInput = {
        ...values,
        promotionId: values.promotionId || undefined,
      }
      await onSubmit(payload)
      onClose()
    } catch (err) {
      setError(
        getApiErrorMessage(
          err as Parameters<typeof getApiErrorMessage>[0],
          'Impossible de créer l\'étudiant.',
        ),
      )
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouvel étudiant">
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {filiereOptions.length === 0 ? (
        <p className="text-sm text-slate-600">
          Aucune filière disponible pour vos modules assignés.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Prénom</FieldLabel>
              <TextInput
                value={values.prenom}
                onChange={(e) => setValues((v) => ({ ...v, prenom: e.target.value }))}
                required
              />
            </div>
            <div>
              <FieldLabel>Nom</FieldLabel>
              <TextInput
                value={values.nom}
                onChange={(e) => setValues((v) => ({ ...v, nom: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <TextInput
              type="email"
              value={values.email}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <FieldLabel>Mot de passe</FieldLabel>
            <TextInput
              type="password"
              value={values.motDePasse}
              onChange={(e) => setValues((v) => ({ ...v, motDePasse: e.target.value }))}
              minLength={6}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>INE</FieldLabel>
              <TextInput
                value={values.ine}
                onChange={(e) => setValues((v) => ({ ...v, ine: e.target.value }))}
                required
              />
            </div>
            <div>
              <FieldLabel>Date de naissance</FieldLabel>
              <TextInput
                type="date"
                value={values.dateNaissance ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, dateNaissance: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Niveau</FieldLabel>
              <NiveauSelect
                value={values.niveau}
                onChange={(value) => setValues((v) => ({ ...v, niveau: value }))}
                required
              />
            </div>
            <div>
              <FieldLabel>Filière</FieldLabel>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={values.filiereId || ''}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    filiereId: Number(e.target.value),
                    promotionId: undefined,
                  }))
                }
                required
              >
                <option value="" disabled>
                  Choisir une filière
                </option>
                {filiereOptions.map((filiere) => (
                  <option key={filiere.id} value={filiere.id}>
                    {filiere.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <FieldLabel>Promotion (optionnel)</FieldLabel>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={values.promotionId ?? ''}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  promotionId: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            >
              <option value="">Aucune promotion</option>
              {promotionOptions.map((promotion) => (
                <option key={promotion.id} value={promotion.id}>
                  {promotion.titre ?? promotion.nom}
                  {promotion.formationNom ? ` — ${promotion.formationNom}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Créer
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
