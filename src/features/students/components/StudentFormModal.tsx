import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { NiveauSelect } from '@/components/ui/NiveauSelect'
import type {
  FiliereCatalog,
  PromotionCatalog,
  StudentGroupCatalog,
} from '@/features/catalog/api/catalogApi'
import type { BackendMembreResponse } from '@/features/admin/utils/personnelMappers'
import { FieldLabel, TextInput } from '@/features/formations/components/formFields'
import type { StudentCreateInput, StudentUpdateInput } from '@/features/students/api/studentsApi'
import { getApiErrorMessage } from '@/features/admin/utils/apiError'

interface StudentFormModalProps {
  open: boolean
  onClose: () => void
  initial?: BackendMembreResponse
  filieres: FiliereCatalog[]
  promotions: PromotionCatalog[]
  groups: StudentGroupCatalog[]
  defaultFiliereId?: number
  defaultPromotionId?: number
  defaultGroupeId?: number
  onSubmit: (values: StudentCreateInput | StudentUpdateInput) => Promise<void>
  isSubmitting?: boolean
}

const emptyCreate = (
  filiereId?: number,
  promotionId?: number,
  groupeEtudiantId?: number,
): StudentCreateInput => ({
  email: '',
  motDePasse: '',
  nom: '',
  prenom: '',
  ine: '',
  dateNaissance: '',
  niveau: 'LICENCE_1',
  filiereId: filiereId ?? 0,
  promotionId,
  groupeEtudiantId: groupeEtudiantId,
})

export function StudentFormModal({
  open,
  onClose,
  initial,
  filieres,
  promotions,
  groups,
  defaultFiliereId,
  defaultPromotionId,
  defaultGroupeId,
  onSubmit,
  isSubmitting = false,
}: StudentFormModalProps) {
  const isEdit = !!initial
  const [createValues, setCreateValues] = useState<StudentCreateInput>(
    emptyCreate(defaultFiliereId, defaultPromotionId, defaultGroupeId),
  )
  const [updateValues, setUpdateValues] = useState<StudentUpdateInput>({})
  const [error, setError] = useState<string | null>(null)

  const filiereOptions = useMemo(
    () => [...filieres].sort((a, b) => a.nom.localeCompare(b.nom, 'fr')),
    [filieres],
  )

  const currentFiliereId = isEdit
    ? (updateValues.filiereId ?? initial?.filiereId ?? 0)
    : createValues.filiereId

  const currentPromotionId = isEdit
    ? (updateValues.promotionId ?? initial?.promotionId)
    : createValues.promotionId

  const promotionOptions = useMemo(
    () =>
      [...promotions].sort((a, b) =>
        (a.titre ?? a.nom).localeCompare(b.titre ?? b.nom, 'fr'),
      ),
    [promotions],
  )

  const groupOptions = useMemo(
    () =>
      groups
        .filter(
          (group) =>
            !currentPromotionId || group.promotionId === currentPromotionId,
        )
        .sort((a, b) => a.titre.localeCompare(b.titre, 'fr')),
    [groups, currentPromotionId],
  )

  useEffect(() => {
    setError(null)
    if (initial) {
      setUpdateValues({
        email: initial.email,
        nom: initial.nom,
        prenom: initial.prenom,
        telephone: initial.telephone,
        ine: initial.ine,
        dateNaissance: initial.dateNaissance,
        niveau: initial.niveau ?? 'LICENCE_1',
        filiereId: initial.filiereId,
        promotionId: initial.promotionId,
        groupeEtudiantId: initial.groupeEtudiantId,
      })
    } else {
      setCreateValues(emptyCreate(defaultFiliereId, defaultPromotionId, defaultGroupeId))
    }
  }, [initial, open, defaultFiliereId, defaultPromotionId, defaultGroupeId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (isEdit) {
        if (!updateValues.niveau) {
          setError('Sélectionnez un niveau.')
          return
        }
        await onSubmit({
          ...updateValues,
          motDePasse: updateValues.motDePasse || undefined,
        })
      } else {
        if (!createValues.filiereId) {
          setError('Sélectionnez une filière.')
          return
        }
        if (!createValues.niveau) {
          setError('Sélectionnez un niveau.')
          return
        }
        await onSubmit({
          ...createValues,
          promotionId: createValues.promotionId || undefined,
          groupeEtudiantId: createValues.groupeEtudiantId || undefined,
        })
      }
      onClose()
    } catch (err) {
      setError(
        getApiErrorMessage(
          err as Parameters<typeof getApiErrorMessage>[0],
          isEdit ? 'Impossible de modifier l\'étudiant.' : 'Impossible de créer l\'étudiant.',
        ),
      )
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier l\'étudiant' : 'Nouvel étudiant'}
    >
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {filiereOptions.length === 0 ? (
        <p className="text-sm text-slate-600">Aucune filière disponible.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Prénom</FieldLabel>
              <TextInput
                value={isEdit ? updateValues.prenom ?? '' : createValues.prenom}
                onChange={(e) =>
                  isEdit
                    ? setUpdateValues((v) => ({ ...v, prenom: e.target.value }))
                    : setCreateValues((v) => ({ ...v, prenom: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <FieldLabel>Nom</FieldLabel>
              <TextInput
                value={isEdit ? updateValues.nom ?? '' : createValues.nom}
                onChange={(e) =>
                  isEdit
                    ? setUpdateValues((v) => ({ ...v, nom: e.target.value }))
                    : setCreateValues((v) => ({ ...v, nom: e.target.value }))
                }
                required
              />
            </div>
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <TextInput
              type="email"
              value={isEdit ? updateValues.email ?? '' : createValues.email}
              onChange={(e) =>
                isEdit
                  ? setUpdateValues((v) => ({ ...v, email: e.target.value }))
                  : setCreateValues((v) => ({ ...v, email: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <FieldLabel>{isEdit ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}</FieldLabel>
            <TextInput
              type="password"
              value={isEdit ? updateValues.motDePasse ?? '' : createValues.motDePasse}
              onChange={(e) =>
                isEdit
                  ? setUpdateValues((v) => ({ ...v, motDePasse: e.target.value }))
                  : setCreateValues((v) => ({ ...v, motDePasse: e.target.value }))
              }
              minLength={isEdit ? undefined : 6}
              required={!isEdit}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>INE</FieldLabel>
              <TextInput
                value={isEdit ? updateValues.ine ?? '' : createValues.ine}
                onChange={(e) =>
                  isEdit
                    ? setUpdateValues((v) => ({ ...v, ine: e.target.value }))
                    : setCreateValues((v) => ({ ...v, ine: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <FieldLabel>Date de naissance</FieldLabel>
              <TextInput
                type="date"
                value={
                  isEdit ? updateValues.dateNaissance ?? '' : createValues.dateNaissance ?? ''
                }
                onChange={(e) =>
                  isEdit
                    ? setUpdateValues((v) => ({ ...v, dateNaissance: e.target.value }))
                    : setCreateValues((v) => ({ ...v, dateNaissance: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Niveau</FieldLabel>
              <NiveauSelect
                value={isEdit ? updateValues.niveau ?? '' : createValues.niveau}
                onChange={(value) =>
                  isEdit
                    ? setUpdateValues((v) => ({ ...v, niveau: value }))
                    : setCreateValues((v) => ({ ...v, niveau: value }))
                }
                required={!isEdit}
              />
            </div>
            <div>
              <FieldLabel>Filière</FieldLabel>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={currentFiliereId || ''}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  isEdit
                    ? setUpdateValues((v) => ({
                        ...v,
                        filiereId: value,
                        promotionId: undefined,
                        groupeEtudiantId: undefined,
                      }))
                    : setCreateValues((v) => ({
                        ...v,
                        filiereId: value,
                        promotionId: undefined,
                        groupeEtudiantId: undefined,
                      }))
                }}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Promotion</FieldLabel>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={currentPromotionId ?? ''}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : undefined
                  isEdit
                    ? setUpdateValues((v) => ({
                        ...v,
                        promotionId: value,
                        groupeEtudiantId: undefined,
                      }))
                    : setCreateValues((v) => ({
                        ...v,
                        promotionId: value,
                        groupeEtudiantId: undefined,
                      }))
                }}
              >
                <option value="">Aucune promotion</option>
                {promotionOptions.map((promotion) => (
                  <option key={promotion.id} value={promotion.id}>
                    {promotion.titre ?? promotion.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Groupe</FieldLabel>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={
                  (isEdit
                    ? updateValues.groupeEtudiantId
                    : createValues.groupeEtudiantId) ?? ''
                }
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : undefined
                  isEdit
                    ? setUpdateValues((v) => ({ ...v, groupeEtudiantId: value }))
                    : setCreateValues((v) => ({ ...v, groupeEtudiantId: value }))
                }}
              >
                <option value="">Aucun groupe</option>
                {groupOptions.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.titre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {isEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
