export const NIVEAU_ETUDE_OPTIONS = [
  { value: 'LICENCE_1', label: 'Licence 1' },
  { value: 'LICENCE_2', label: 'Licence 2' },
  { value: 'LICENCE_3', label: 'Licence 3' },
  { value: 'MASTER_1', label: 'Master 1' },
  { value: 'MASTER_2', label: 'Master 2' },
  { value: 'DOCTORAT', label: 'Doctorat' },
] as const

export type NiveauEtude = (typeof NIVEAU_ETUDE_OPTIONS)[number]['value']

const LABELS: Record<NiveauEtude, string> = Object.fromEntries(
  NIVEAU_ETUDE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<NiveauEtude, string>

export function formatNiveauEtude(value?: string | null): string {
  if (!value) return '—'
  return LABELS[value as NiveauEtude] ?? value
}
