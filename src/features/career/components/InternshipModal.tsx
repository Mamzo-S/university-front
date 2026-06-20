import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { BackendMembreResponse } from '@/features/admin/utils/personnelMappers'
import type {
  Internship,
  InternshipInput,
  InternshipStatus,
  Partner,
} from '@/features/career/api/careerApi'
import { INTERNSHIP_STATUS_LABELS } from '@/features/career/api/careerApi'
import { FieldLabel, TextInput } from '@/features/formations/components/formFields'
import { getApiErrorMessage } from '@/features/admin/utils/apiError'

interface InternshipModalProps {
  open: boolean
  onClose: () => void
  initial?: Internship
  students: BackendMembreResponse[]
  partners: Partner[]
  onSubmit: (values: InternshipInput) => Promise<void>
  isSubmitting?: boolean
}

const empty = (students: BackendMembreResponse[], partners: Partner[]): InternshipInput => ({
  etudiantId: students[0]?.id ?? 0,
  partenaireId: partners[0]?.id ?? 0,
  sujet: '',
  description: '',
  dateDebut: '',
  dateFin: '',
  statut: 'EN_ATTENTE',
  tuteurEntreprise: '',
  tuteurUniversite: '',
  conventionSignee: false,
  commentaire: '',
})

export function InternshipModal({
  open,
  onClose,
  initial,
  students,
  partners,
  onSubmit,
  isSubmitting = false,
}: InternshipModalProps) {
  const [values, setValues] = useState<InternshipInput>(empty(students, partners))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setValues({
        etudiantId: initial.etudiantId,
        partenaireId: initial.partenaireId,
        sujet: initial.sujet ?? '',
        description: initial.description ?? '',
        dateDebut: initial.dateDebut ?? '',
        dateFin: initial.dateFin ?? '',
        statut: initial.statut,
        tuteurEntreprise: initial.tuteurEntreprise ?? '',
        tuteurUniversite: initial.tuteurUniversite ?? '',
        conventionSignee: initial.conventionSignee ?? false,
        commentaire: initial.commentaire ?? '',
      })
    } else {
      setValues(empty(students, partners))
    }
    setError(null)
  }, [initial, open, students, partners])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!values.etudiantId || !values.partenaireId) {
      setError('Sélectionnez un étudiant et un partenaire.')
      return
    }
    try {
      await onSubmit(values)
      onClose()
    } catch (err) {
      setError(
        getApiErrorMessage(
          err as Parameters<typeof getApiErrorMessage>[0],
          'Impossible d\'enregistrer le stage.',
        ),
      )
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Modifier le stage' : 'Nouveau stage'}>
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {students.length === 0 || partners.length === 0 ? (
        <p className="text-sm text-slate-600">
          {students.length === 0
            ? 'Aucun étudiant disponible.'
            : 'Créez d\'abord au moins un partenaire entreprise.'}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <FieldLabel>Étudiant</FieldLabel>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={values.etudiantId || ''}
              onChange={(e) => setValues((v) => ({ ...v, etudiantId: Number(e.target.value) }))}
              required
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.prenom} {student.nom}
                  {student.filiereNom ? ` — ${student.filiereNom}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>Partenaire</FieldLabel>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={values.partenaireId || ''}
              onChange={(e) => setValues((v) => ({ ...v, partenaireId: Number(e.target.value) }))}
              required
            >
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>Sujet du stage</FieldLabel>
            <TextInput
              value={values.sujet ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, sujet: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Date de début</FieldLabel>
              <TextInput
                type="date"
                value={values.dateDebut ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, dateDebut: e.target.value }))}
              />
            </div>
            <div>
              <FieldLabel>Date de fin</FieldLabel>
              <TextInput
                type="date"
                value={values.dateFin ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, dateFin: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <FieldLabel>Statut</FieldLabel>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={values.statut ?? 'EN_ATTENTE'}
              onChange={(e) =>
                setValues((v) => ({ ...v, statut: e.target.value as InternshipStatus }))
              }
            >
              {(Object.keys(INTERNSHIP_STATUS_LABELS) as InternshipStatus[]).map((status) => (
                <option key={status} value={status}>
                  {INTERNSHIP_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Tuteur entreprise</FieldLabel>
              <TextInput
                value={values.tuteurEntreprise ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, tuteurEntreprise: e.target.value }))}
              />
            </div>
            <div>
              <FieldLabel>Tuteur université</FieldLabel>
              <TextInput
                value={values.tuteurUniversite ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, tuteurUniversite: e.target.value }))}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.conventionSignee ?? false}
              onChange={(e) => setValues((v) => ({ ...v, conventionSignee: e.target.checked }))}
            />
            Convention signée
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Enregistrer
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
