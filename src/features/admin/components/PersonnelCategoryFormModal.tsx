import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { NiveauSelect } from '@/components/ui/NiveauSelect'
import { getCategoryConfig } from '@/features/admin/config/personnelCategories'
import {
  FieldLabel,
  SelectInput,
  TextInput,
} from '@/features/formations/components/formFields'
import type {
  AdminPersonnel,
  PersonnelCategory,
  PersonnelStatus,
} from '@/mocks/data/adminPersonnel'
import { ROLE_LABELS } from '@/types/roles'

type FormState = Partial<AdminPersonnel> & {
  firstName: string
  lastName: string
  email: string
  status: PersonnelStatus
  joinedAt: string
}

interface PersonnelCategoryFormModalProps {
  open: boolean
  onClose: () => void
  category: PersonnelCategory
  onSubmit: (values: AdminPersonnel, password?: string) => void | Promise<void>
  personnel?: AdminPersonnel
  isSubmitting?: boolean
  submitError?: string | null
  allowEdit?: boolean
}

function emptyForm(category: PersonnelCategory): FormState {
  const config = getCategoryConfig(category)
  return {
    firstName: '',
    lastName: '',
    email: '',
    role: config.defaultRole,
    category,
    status: category === 'etudiant' ? 'active' : 'pending',
    joinedAt: new Date().toISOString().slice(0, 10),
    department: '',
    modulesManaged: 0,
    specialty: '',
    tutorGroup: '',
    studentsFollowed: 0,
    ine: '',
    dateOfBirth: '',
    program: '',
    promotion: '',
    niveauEtude: 'LICENCE_1',
    partnerZone: '',
  }
}

export function PersonnelCategoryFormModal({
  open,
  onClose,
  category,
  onSubmit,
  personnel,
  isSubmitting = false,
  submitError = null,
  allowEdit = true,
}: PersonnelCategoryFormModalProps) {
  const config = getCategoryConfig(category)
  const [values, setValues] = useState<FormState>(() => emptyForm(category))
  const [password, setPassword] = useState('')
  const isCreate = !personnel
  const isReadOnly = !allowEdit

  useEffect(() => {
    if (personnel) {
      setValues({ ...emptyForm(category), ...personnel })
    } else {
      setValues(emptyForm(category))
    }
    setPassword('')
  }, [personnel, open, category])

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setValues((v) => ({ ...v, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isReadOnly) {
      onClose()
      return
    }

    const payload: AdminPersonnel = {
      id: personnel?.id ?? '',
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      role: values.role ?? config.defaultRole,
      category,
      status: values.status,
      joinedAt: values.joinedAt,
      department: values.department || undefined,
      modulesManaged: values.modulesManaged,
      specialty: values.specialty || undefined,
      tutorGroup: values.tutorGroup || undefined,
      studentsFollowed: values.studentsFollowed,
      ine: values.ine || undefined,
      dateOfBirth: values.dateOfBirth || undefined,
      program: values.program || undefined,
      promotion: values.promotion || undefined,
      niveauEtude: values.niveauEtude,
      partnerZone: values.partnerZone || undefined,
    }

    try {
      await onSubmit(payload, password)
      onClose()
    } catch {
      // L'erreur est affichée via submitError dans le parent
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        personnel
          ? `Modifier — ${config.label}`
          : `Ajouter — ${config.label}`
      }
    >
      <p className="mb-3 text-xs text-slate-500">{config.description}</p>
      {submitError && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {submitError}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Prénom</FieldLabel>
            <TextInput
              value={values.firstName}
              onChange={(e) => set('firstName', e.target.value)}
              placeholder="Ex. Mamadou"
              required
            />
          </div>
          <div>
            <FieldLabel>Nom</FieldLabel>
            <TextInput
              value={values.lastName}
              onChange={(e) => set('lastName', e.target.value)}
              placeholder="Ex. Diallo"
              required
            />
          </div>
        </div>
        <div>
          <FieldLabel>Email</FieldLabel>
          <TextInput
            type="email"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="prenom.nom@uchk.sn"
            required
          />
        </div>

        <div>
          <FieldLabel>
            {isCreate ? 'Mot de passe initial' : 'Nouveau mot de passe (optionnel)'}
          </FieldLabel>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isCreate ? 'Minimum 6 caractères' : 'Laisser vide pour ne pas changer'}
            minLength={isCreate ? 6 : undefined}
            required={isCreate}
            autoComplete="new-password"
          />
        </div>

        {category === 'administratif' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Fonction</FieldLabel>
                <SelectInput
                  value={values.role}
                  onChange={(e) =>
                    set('role', e.target.value as AdminPersonnel['role'])
                  }
                  disabled={!isCreate}
                >
                  {config.roles.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </SelectInput>
              </div>
              <div>
                <FieldLabel>Service</FieldLabel>
                <TextInput
                  value={values.department ?? ''}
                  onChange={(e) => set('department', e.target.value)}
                  placeholder="Ex. Direction SI"
                  required
                />
              </div>
            </div>
          </>
        )}

        {category === 'formation' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Pôle</FieldLabel>
              <TextInput
                value={values.department ?? ''}
                onChange={(e) => set('department', e.target.value)}
                placeholder="Ex. Pédagogie et programmes"
                required
              />
            </div>
            <div>
              <FieldLabel>Modules gérés</FieldLabel>
              <TextInput
                type="number"
                min={0}
                value={values.modulesManaged || ''}
                onChange={(e) =>
                  set(
                    'modulesManaged',
                    e.target.value === '' ? 0 : Number(e.target.value),
                  )
                }
                placeholder="Ex. 4"
              />
            </div>
          </div>
        )}

        {category === 'enseignant' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Spécialité</FieldLabel>
              <TextInput
                value={values.specialty ?? ''}
                onChange={(e) => set('specialty', e.target.value)}
                placeholder="Ex. Marketing digital"
                required
              />
            </div>
            <div>
              <FieldLabel>Département</FieldLabel>
              <TextInput
                value={values.department ?? ''}
                onChange={(e) => set('department', e.target.value)}
                placeholder="Ex. Communication"
                required
              />
            </div>
          </div>
        )}

        {category === 'tuteur' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Groupe</FieldLabel>
              <TextInput
                value={values.tutorGroup ?? ''}
                onChange={(e) => set('tutorGroup', e.target.value)}
                placeholder="Groupe A — L3"
                required
              />
            </div>
            <div>
              <FieldLabel>Étudiants suivis</FieldLabel>
              <TextInput
                type="number"
                min={0}
                value={values.studentsFollowed || ''}
                onChange={(e) =>
                  set(
                    'studentsFollowed',
                    e.target.value === '' ? 0 : Number(e.target.value),
                  )
                }
                placeholder="Ex. 12"
              />
            </div>
          </div>
        )}

        {category === 'etudiant' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>INE</FieldLabel>
                <TextInput
                  value={values.ine ?? ''}
                  onChange={(e) => set('ine', e.target.value)}
                  placeholder="Ex. 2024001234"
                  required
                />
              </div>
              <div>
                <FieldLabel>Date de naissance</FieldLabel>
                <TextInput
                  type="date"
                  value={values.dateOfBirth ?? ''}
                  onChange={(e) => set('dateOfBirth', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Niveau</FieldLabel>
                <NiveauSelect
                  value={values.niveauEtude ?? ''}
                  onChange={(value) => set('niveauEtude', value)}
                  required
                />
              </div>
              <div>
                <FieldLabel>Formation</FieldLabel>
                <TextInput
                  value={values.program ?? ''}
                  onChange={(e) => set('program', e.target.value)}
                  placeholder="Ex. Licence Marketing"
                />
              </div>
              <div>
                <FieldLabel>Promotion</FieldLabel>
                <TextInput
                  value={values.promotion ?? ''}
                  onChange={(e) => set('promotion', e.target.value)}
                  placeholder="2024-2025"
                />
              </div>
            </div>
          </>
        )}

        {category === 'insertion' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Zone partenaires</FieldLabel>
              <TextInput
                value={values.partnerZone ?? ''}
                onChange={(e) => set('partnerZone', e.target.value)}
                placeholder="Ex. Dakar — Thiès"
                required
              />
            </div>
            <div>
              <FieldLabel>Service</FieldLabel>
              <TextInput
                value={values.department ?? ''}
                onChange={(e) => set('department', e.target.value)}
                placeholder="Ex. Relations entreprises"
              />
            </div>
          </div>
        )}

        {category !== 'etudiant' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Statut</FieldLabel>
              <SelectInput
                value={values.status}
                onChange={(e) =>
                  set('status', e.target.value as PersonnelStatus)
                }
              >
                <option value="active">Actif</option>
                <option value="pending">En attente</option>
                <option value="inactive">Inactif</option>
              </SelectInput>
            </div>
            <div>
              <FieldLabel>Date d&apos;arrivée</FieldLabel>
              <TextInput
                type="date"
                value={values.joinedAt}
                onChange={(e) => set('joinedAt', e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {category === 'etudiant' && (
          <div>
            <FieldLabel>Statut</FieldLabel>
            <SelectInput
              value={values.status}
              onChange={(e) =>
                set('status', e.target.value as PersonnelStatus)
              }
            >
              <option value="active">Inscrit</option>
              <option value="inactive">Radié</option>
              <option value="pending">En attente</option>
            </SelectInput>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {isReadOnly ? 'Fermer' : 'Annuler'}
          </Button>
          {!isReadOnly && (
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {personnel ? 'Enregistrer' : 'Créer le compte'}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  )
}
