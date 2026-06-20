import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  CalendarDays,
  ClipboardList,
  FileText,
  FolderUp,
  GitBranch,
  GraduationCap,
  Handshake,
  HelpCircle,
  IdCard,
  LayoutDashboard,
  MessageSquare,
  Settings,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  Video,
  Wallet,
} from 'lucide-react'
import type { UserRole } from '@/types/roles'

export interface NavItem {
  label: string
  path: string
  icon?: LucideIcon
}

export const ADMIN_NAV: NavItem[] = [
  { label: 'Tableau de bord', path: '/admin', icon: LayoutDashboard },
  { label: 'Personnel', path: '/admin/personnel', icon: Users },
  { label: 'Système', path: '/admin/system', icon: Settings },
]

export const ADMIN_STAFF_NAV: NavItem[] = [
  { label: 'Tableau de bord', path: '/staff', icon: LayoutDashboard },
  { label: 'Documents', path: '/staff/documents', icon: FileText },
  { label: 'Ressources humaines', path: '/staff/rh', icon: Users },
  { label: 'Budget', path: '/staff/budget', icon: Wallet },
]

export const TRAINER_NAV: NavItem[] = [
  { label: 'Mes modules', path: '/trainer/formations', icon: BookOpen },
  { label: 'Étudiants', path: '/trainer/students', icon: GraduationCap },
  { label: 'Bulletins', path: '/trainer/bulletins', icon: ClipboardList },
  { label: 'Emploi du temps', path: '/trainer/emploi-du-temps', icon: Calendar },
  { label: 'Quiz', path: '/trainer/quiz', icon: HelpCircle },
  { label: 'Dépôts de projet', path: '/trainer/depots', icon: FolderUp },
  { label: 'Réunions', path: '/trainer/reunions', icon: Video },
]

export const TUTOR_NAV: NavItem[] = [
  { label: 'Tableau de bord', path: '/tutor', icon: LayoutDashboard },
  { label: 'Tutorat', path: '/tutor/sessions', icon: MessageSquare },
  { label: 'Suivi étudiants', path: '/tutor/students', icon: UserCheck },
]

export const TRAINING_NAV: NavItem[] = [
  { label: 'Tableau de bord', path: '/training', icon: LayoutDashboard },
  { label: 'Filières', path: '/training/filieres', icon: GitBranch },
  { label: 'Formations', path: '/training/formations', icon: BookOpen },
  { label: 'Promotions', path: '/training/promotions', icon: Users },
  { label: 'Groupes et étudiants', path: '/training/student-groups', icon: UserPlus },
  { label: 'Emplois du temps', path: '/training/schedule', icon: CalendarDays },
  { label: 'Formateurs', path: '/training/trainers', icon: UserCog },
]

export const CAREER_NAV: NavItem[] = [
  { label: 'Tableau de bord', path: '/career', icon: LayoutDashboard },
  { label: 'Stages', path: '/career/internships', icon: Briefcase },
  { label: 'Partenaires', path: '/career/partners', icon: Handshake },
  { label: 'Statistiques', path: '/career/stats', icon: BarChart3 },
]

export const STUDENT_NAV: NavItem[] = [
  { label: 'Mon dossier', path: '/student/dossier', icon: IdCard },
  { label: 'Mes bulletins', path: '/student/bulletins', icon: ClipboardList },
  { label: 'Emploi du temps', path: '/student/emploi-du-temps', icon: Calendar },
  { label: 'Mes modules', path: '/student/formations', icon: BookOpen },
  { label: 'Documents', path: '/student/documents', icon: FileText },
  { label: 'Notifications', path: '/student/notifications', icon: Bell },
]

export const NAV_BY_ROLE: Partial<Record<UserRole, NavItem[]>> = {
  ADMIN: ADMIN_NAV,
  ADMIN_STAFF: ADMIN_STAFF_NAV,
  TEACHER: TRAINER_NAV,
  TUTOR: TUTOR_NAV,
  TRAINING_MANAGER: TRAINING_NAV,
  CAREER_SERVICE: CAREER_NAV,
  STUDENT: STUDENT_NAV,
}
