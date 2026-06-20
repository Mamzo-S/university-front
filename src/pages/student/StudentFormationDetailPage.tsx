import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ProjectDepositPanel } from '@/features/formations/components/ProjectDepositPanel'
import { SubModulePanel } from '@/features/formations/components/SubModulePanel'
import { useStudentFormation } from '@/features/formations/hooks/useStudentFormation'
import { getInitials } from '@/lib/utils'

function TeamMember({ role, name }: { role: string; name: string }) {
  const parts = name.split(' ')
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">
        {getInitials(parts[0] ?? name, parts.slice(1).join(' ') || name)}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-slate-400">{role}</p>
        <p className="truncate text-sm font-medium text-slate-800">{name}</p>
      </div>
    </div>
  )
}

export function StudentFormationDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { formation, isLoading, isError } = useStudentFormation(slug)

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !formation || !slug?.trim()) {
    return (
      <div className="rounded-lg border border-slate-100 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-slate-500">Formation introuvable.</p>
        <Link
          to="/student/formations"
          className="mt-3 inline-block text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          Retour aux formations
        </Link>
      </div>
    )
  }

  const handleJoinSession = () => {
    if (formation.sessionUrl && formation.sessionUrl !== '#') {
      window.open(formation.sessionUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div>
      <Link
        to="/student/formations"
        className="mb-3 inline-flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-800"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M11.78 4.72a.75.75 0 00-1.06 0l-4.25 4.25a.75.75 0 000 1.06l4.25 4.25a.75.75 0 101.06-1.06L8.56 10l3.72-3.72a.75.75 0 000-1.06z"
            clipRule="evenodd"
          />
        </svg>
        Retour
      </Link>

      <div className="relative w-full overflow-hidden rounded-md">
        <img
          src={formation.imageUrl}
          alt={formation.title}
          className="aspect-[4/1] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 px-4 py-3">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="info">{formation.level}</Badge>
                <Badge>{formation.type}</Badge>
              </div>
              <h1 className="mt-1 line-clamp-2 text-base font-bold text-white sm:text-lg">
                {formation.title}
              </h1>
            </div>

            {formation.sessionUrl && formation.sessionUrl !== '#' && (
              <Button
                size="sm"
                onClick={handleJoinSession}
                className="animate-join-pulse shrink-0 bg-white text-slate-900 transition-transform hover:scale-105 hover:bg-slate-100 hover:animate-none"
              >
                Rejoindre
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
          {formation.description || 'Aucune description.'}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
          <TeamMember role="Responsable" name={formation.managerName} />
          <TeamMember role="Formateur" name={formation.trainerName} />
          <TeamMember role="Tuteur" name={formation.tutorName} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
          <span>{formation.duration}</span>
          <span className="text-slate-300">·</span>
          <span>{formation.subModules.length} sous-modules</span>
        </div>
      </div>

      {formation.projectDeposits && formation.projectDeposits.length > 0 && (
        <div className="mt-5">
          <ProjectDepositPanel deposits={formation.projectDeposits} />
        </div>
      )}

      <div className="mt-5">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Sous-modules</h2>
        {formation.subModules.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
            Aucun sous-module disponible pour le moment.
          </p>
        ) : (
          <div className="space-y-3">
            {formation.subModules.map((sub, index) => (
              <SubModulePanel
                key={sub.id}
                subModule={sub}
                formationId={formation.id}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
