import { NIVEAU_ETUDE_OPTIONS } from '@/types/niveauEtude'

interface NiveauSelectProps {
  value?: string
  onChange: (value: string) => void
  required?: boolean
  className?: string
}

export function NiveauSelect({
  value = '',
  onChange,
  required = false,
  className = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm',
}: NiveauSelectProps) {
  return (
    <select
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    >
      <option value="" disabled={required}>
        Choisir un niveau
      </option>
      {NIVEAU_ETUDE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
