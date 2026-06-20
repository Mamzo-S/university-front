import type { LucideIcon } from 'lucide-react'

interface NavItemIconProps {
  icon?: LucideIcon
  className?: string
}

export function NavItemIcon({ icon: Icon, className = 'h-4 w-4 shrink-0 opacity-80' }: NavItemIconProps) {
  if (!Icon) return null
  return <Icon className={className} aria-hidden />
}
