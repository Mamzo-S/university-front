import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { NiveauSelect } from '@/components/ui/NiveauSelect'
import type { FormationInput } from '@/features/schedule/api/scheduleApi'
import { FieldLabel, TextInput } from '@/features/formations/components/formFields'
import { getApiErrorMessage } from '@/features/admin/utils/apiError'

interface FormationFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: FormationInput) => Promise<void>
  isSubmitting?: boolean
}

export function FormationFormModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: FormationFormModalProps) {
  const [nom, setNom] = useState('')
  const [niveau, setNiveau] = useState('LICENCE_1')
  const [typeFormation, setTypeFormation] = useState('Présentiel')
  const [typeFinancement, setTypeFinancement] = useState('État')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setNom('')
    setNiveau('LICENCE_1')
    setTypeFormation('Présentiel')
    setTypeFinancement('État')
    setDateDebut('')
    setDateFin('')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await onSubmit({
        nom: nom.trim(),
        niveau: niveau.trim() || undefined,
        typeFormation: typeFormation.trim() || undefined,
        typeFinancement: typeFinancement.trim() || undefined,
        dateDebut: dateDebut || undefined,
        dateFin: dateFin || undefined,
      })
      reset()
      onClose()
    } catch (err) {
      setError(
        getApiErrorMessage(
          err as Parameters<typeof getApiErrorMessage>[0],
          'Impossible de créer la formation.',
        ),
      )
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Créer une formation">
      <p className="mb-3 text-xs text-slate-500">
        Étape 1 du parcours : programme pédagogique (Licence, Master, etc.)
      </p>
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <FieldLabel>Intitulé</FieldLabel>
          <TextInput
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex. Licence Marketing Digital"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Niveau</FieldLabel>
            <NiveauSelect value={niveau} onChange={setNiveau} required />
          </div>
          <div>
            <FieldLabel>Type</FieldLabel>
            <TextInput
              value={typeFormation}
              onChange={(e) => setTypeFormation(e.target.value)}
              placeholder="Présentiel, Hybride…"
            />
          </div>
        </div>
        <div>
          <FieldLabel>Financement</FieldLabel>
          <TextInput
            value={typeFinancement}
            onChange={(e) => setTypeFinancement(e.target.value)}
            placeholder="État, Partenaire…"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Date de début</FieldLabel>
            <TextInput
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Date de fin</FieldLabel>
            <TextInput
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Créer la formation
          </Button>
        </div>
      </form>
    </Modal>
  )
}
