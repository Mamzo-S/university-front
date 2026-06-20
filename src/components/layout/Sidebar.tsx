import { NavLink } from 'react-router-dom'
import { NavItemIcon } from '@/components/layout/NavItemIcon'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/routes/config/navConfig'

interface SidebarProps {
  title: string
  subtitle?: string
  items: NavItem[]
}

export function Sidebar({ title, subtitle, items }: SidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-sidebar text-white">
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-300">
          UCHK
        </p>
        <h2 className="mt-1 text-lg font-semibold">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.split('/').length <= 2}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-active text-white'
                  : 'text-slate-300 hover:bg-sidebar-hover hover:text-white',
              )
            }
          >
            <NavItemIcon icon={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
