import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import type { FiliereModuleSummary } from '@/features/catalog/api/catalogApi'
import {
  DEFAULT_FORMATION_IMAGE,
  moduleSlugFromSummary,
} from '@/features/formations/utils/catalogFormationBridge'
import { formatNiveauEtude } from '@/types/niveauEtude'

interface ModuleCatalogCardProps {
  module: FiliereModuleSummary
  basePath?: string
}

export function ModuleCatalogCard({
  module,
  basePath = '/student/formations',
}: ModuleCatalogCardProps) {
  const imageUrl = module.imageUrl ?? DEFAULT_FORMATION_IMAGE
  const subModuleCount = module.subModuleCount ?? 0

  return (
    <Link
      to={`${basePath}/${moduleSlugFromSummary(module)}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={module.titre}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1.5">
          {module.niveau && (
            <Badge variant="info">{formatNiveauEtude(module.niveau)}</Badge>
          )}
          {module.typeFormation && <Badge>{module.typeFormation}</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-primary-700">
          {module.titre}
        </h3>

        {module.description ? (
          <p className="mt-1.5 line-clamp-2 flex-1 text-xs text-slate-500">
            {module.description}
          </p>
        ) : (
          module.slug && (
            <p className="mt-1.5 font-mono text-xs text-slate-400">{module.slug}</p>
          )
        )}

        <p className="mt-3 border-t border-slate-50 pt-3 text-xs text-slate-400">
          {subModuleCount} sous-module{subModuleCount !== 1 ? 's' : ''}
        </p>
      </div>
    </Link>
  )
}
