import { Fragment } from 'react'
import { NavLink } from 'react-router-dom'
import { ProfileDropdown } from '@/components/layout/ProfileDropdown'
import { NavItemIcon } from '@/components/layout/NavItemIcon'
import { APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/routes/config/navConfig'

interface StudentNavbarProps {
  items: NavItem[]
}

function StudentNavItem({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          'flex shrink-0 items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors',
          'border-b-2 -mb-px',
          isActive
            ? 'border-primary-600 text-primary-700'
            : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900',
        )
      }
    >
      <NavItemIcon icon={item.icon} className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  )
}

export function StudentNavbar({ items }: StudentNavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 border-b border-slate-100 px-4 sm:px-6">
        <div className="shrink-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
            UCHK
          </p>
          <p className="truncate text-sm font-semibold text-slate-900">{APP_NAME}</p>
        </div>

        <ProfileDropdown roleLabel="Étudiant" />
      </div>

      <nav
        aria-label="Navigation étudiant"
        className="mx-auto max-w-5xl border-b border-slate-200 px-4 sm:px-6"
      >
        <div className="flex items-center overflow-x-auto">
          {items.map((item, index) => (
            <Fragment key={item.path}>
              {index > 0 && (
                <div
                  className="mx-1 h-4 w-px shrink-0 bg-slate-200"
                  aria-hidden
                />
              )}
              <StudentNavItem item={item} />
            </Fragment>
          ))}
        </div>
      </nav>
    </header>
  )
}
