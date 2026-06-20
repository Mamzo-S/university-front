import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  FieldLabel,
  SelectInput,
  TextArea,
  TextInput,
} from '@/features/formations/components/formFields'
import type { StudentFormation } from '@/types/formation'
import { NIVEAU_ETUDE_OPTIONS } from '@/types/niveauEtude'

export interface FormationFormValues {
  title: string
  description: string
  imageUrl: string
  level: string
  type: string
  duration: string
  sessionUrl: string
}

const emptyValues: FormationFormValues = {
  title: '',
  description: '',
  imageUrl:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop',
  level: 'LICENCE_3',
  type: 'Présentiel',
  duration: '4 mois',
  sessionUrl: 'https://meet.uchk.sn/session',
}

interface FormationFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: FormationFormValues) => void
  formation?: StudentFormation
}

export function FormationFormModal({
  open,
  onClose,
  onSubmit,
  formation,
}: FormationFormModalProps) {
  const [values, setValues] = useState<FormationFormValues>(emptyValues)

  useEffect(() => {
    if (formation) {
      setValues({
        title: formation.title,
        description: formation.description,
        imageUrl: formation.imageUrl,
        level: formation.level,
        type: formation.type,
        duration: formation.duration,
        sessionUrl: formation.sessionUrl,
      })
    } else {
      setValues(emptyValues)
    }
  }, [formation, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(values)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={formation ? 'Modifier le module' : 'Nouveau module'}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <FieldLabel>Intitulé</FieldLabel>
          <TextInput
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            required
          />
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <TextArea
            value={values.description}
            onChange={(e) =>
              setValues((v) => ({ ...v, description: e.target.value }))
            }
            rows={3}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Niveau</FieldLabel>
            <SelectInput
              value={values.level}
              onChange={(e) => setValues((v) => ({ ...v, level: e.target.value }))}
            >
              {NIVEAU_ETUDE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </div>
          <div>
            <FieldLabel>Type</FieldLabel>
            <SelectInput
              value={values.type}
              onChange={(e) => setValues((v) => ({ ...v, type: e.target.value }))}
            >
              <option>Présentiel</option>
              <option>Hybride</option>
              <option>En ligne</option>
            </SelectInput>
          </div>
        </div>
        <div>
          <FieldLabel>Durée</FieldLabel>
          <TextInput
            value={values.duration}
            onChange={(e) => setValues((v) => ({ ...v, duration: e.target.value }))}
            required
          />
        </div>
        <div>
          <FieldLabel>URL de session</FieldLabel>
          <TextInput
            value={values.sessionUrl}
            onChange={(e) =>
              setValues((v) => ({ ...v, sessionUrl: e.target.value }))
            }
          />
        </div>
        <div>
          <FieldLabel>Image (URL)</FieldLabel>
          <TextInput
            value={values.imageUrl}
            onChange={(e) => setValues((v) => ({ ...v, imageUrl: e.target.value }))}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" size="sm">
            {formation ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
