import { ROLE_LABELS, UserRole } from '@/types/roles'
import { MOCK_STUDENTS } from '@/mocks/data/students'

export type PersonnelStatus = 'active' | 'inactive' | 'pending'

export type PersonnelCategory =
  | 'administratif'
  | 'formation'
  | 'enseignant'
  | 'tuteur'
  | 'etudiant'
  | 'insertion'

export interface AdminPersonnel {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  category: PersonnelCategory
  status: PersonnelStatus
  joinedAt: string
  department?: string
  modulesManaged?: number
  specialty?: string
  tutorGroup?: string
  studentsFollowed?: number
  ine?: string
  dateOfBirth?: string
  program?: string
  promotion?: string
  niveauEtude?: string
  partnerZone?: string
}

export const PERSONNEL_STATUS_LABELS: Record<PersonnelStatus, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  pending: 'En attente',
}

const STAFF_MOCK: AdminPersonnel[] = [
  {
    id: 'p-001',
    firstName: 'Mamadou',
    lastName: 'Diallo',
    email: 'admin@uchk.sn',
    role: UserRole.ADMIN,
    category: 'administratif',
    department: 'Direction SI',
    status: 'active',
    joinedAt: '2020-09-01',
  },
  {
    id: 'p-002',
    firstName: 'Fatou',
    lastName: 'Sow',
    email: 'staff@uchk.sn',
    role: UserRole.ADMIN_STAFF,
    category: 'administratif',
    department: 'Secrétariat général',
    status: 'active',
    joinedAt: '2021-02-15',
  },
  {
    id: 'p-007',
    firstName: 'Khady',
    lastName: 'Mbaye',
    email: 'khady.mbaye@uchk.sn',
    role: UserRole.ADMIN_STAFF,
    category: 'administratif',
    department: 'Ressources humaines',
    status: 'pending',
    joinedAt: '2026-05-28',
  },
  {
    id: 'p-005',
    firstName: 'Ousmane',
    lastName: 'Fall',
    email: 'training@uchk.sn',
    role: UserRole.TRAINING_MANAGER,
    category: 'formation',
    department: 'Formation continue',
    modulesManaged: 6,
    status: 'active',
    joinedAt: '2018-03-20',
  },
  {
    id: 'p-003',
    firstName: 'Ibrahima',
    lastName: 'Ndiaye',
    email: 'teacher@uchk.sn',
    role: UserRole.TEACHER,
    category: 'enseignant',
    department: 'Informatique',
    specialty: 'Développement Web',
    status: 'active',
    joinedAt: '2019-10-01',
  },
  {
    id: 'p-008',
    firstName: 'Cheikh',
    lastName: 'Gueye',
    email: 'cheikh.gueye@uchk.sn',
    role: UserRole.TEACHER,
    category: 'enseignant',
    department: 'Réseaux',
    specialty: 'Cybersécurité',
    status: 'inactive',
    joinedAt: '2017-09-01',
  },
  {
    id: 'p-009',
    firstName: 'Mme',
    lastName: 'Ba',
    email: 'mme.ba@uchk.sn',
    role: UserRole.TEACHER,
    category: 'enseignant',
    department: 'Gestion',
    specialty: 'Comptabilité',
    status: 'active',
    joinedAt: '2016-01-12',
  },
  {
    id: 'p-010',
    firstName: 'Pr.',
    lastName: 'Fall',
    email: 'pr.fall@uchk.sn',
    role: UserRole.TEACHER,
    category: 'enseignant',
    department: 'Data Science',
    specialty: 'Machine Learning',
    status: 'active',
    joinedAt: '2015-09-01',
  },
  {
    id: 'p-004',
    firstName: 'Aissatou',
    lastName: 'Ba',
    email: 'tutor@uchk.sn',
    role: UserRole.TUTOR,
    category: 'tuteur',
    department: 'Informatique',
    tutorGroup: 'Groupe A — L3',
    studentsFollowed: 24,
    status: 'active',
    joinedAt: '2022-01-10',
  },
  {
    id: 'p-006',
    firstName: 'Mariama',
    lastName: 'Cissé',
    email: 'career@uchk.sn',
    role: UserRole.CAREER_SERVICE,
    category: 'insertion',
    department: 'Insertion professionnelle',
    partnerZone: 'Dakar & région',
    status: 'active',
    joinedAt: '2021-11-05',
  },
]

const STUDENT_PERSONNEL: AdminPersonnel[] = MOCK_STUDENTS.map((s) => ({
  id: `p-${s.id}`,
  firstName: s.firstName,
  lastName: s.lastName,
  email: s.email,
  role: UserRole.STUDENT,
  category: 'etudiant' as const,
  status: 'active' as const,
  joinedAt: '2024-09-01',
  ine: s.ine,
  program: s.formation,
  promotion: s.promotion,
  niveauEtude: s.niveauEtude,
}))

export const MOCK_ADMIN_PERSONNEL: AdminPersonnel[] = [
  ...STAFF_MOCK,
  ...STUDENT_PERSONNEL,
]

export function normalizePersonnelItem(item: AdminPersonnel): AdminPersonnel {
  if (item.category) return item
  const category =
    item.role === UserRole.ADMIN || item.role === UserRole.ADMIN_STAFF
      ? 'administratif'
      : item.role === UserRole.TRAINING_MANAGER
        ? 'formation'
        : item.role === UserRole.TEACHER
          ? 'enseignant'
          : item.role === UserRole.TUTOR
            ? 'tuteur'
            : item.role === UserRole.STUDENT
              ? 'etudiant'
              : 'insertion'
  return { ...item, category }
}

export function normalizePersonnel(items: AdminPersonnel[]) {
  return items.map(normalizePersonnelItem)
}

export function getPersonnelRoleLabel(role: UserRole) {
  return ROLE_LABELS[role]
}

export function filterPersonnelInCategory(
  row: AdminPersonnel,
  filters: Record<string, string>,
  category: PersonnelCategory,
): boolean {
  if (row.category !== category) return false

  const q = filters.search?.toLowerCase().trim() ?? ''
  if (q) {
    const parts = [
      row.firstName,
      row.lastName,
      row.email,
      row.department,
      row.specialty,
      row.program,
      row.ine,
      row.tutorGroup,
      row.partnerZone,
      getPersonnelRoleLabel(row.role),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    if (!parts.includes(q)) return false
  }

  if (filters.status && row.status !== filters.status) return false

  if (category === 'administratif' && filters.role && row.role !== filters.role) {
    return false
  }
  if (category === 'administratif' && filters.department && row.department !== filters.department) {
    return false
  }
  if (category === 'enseignant' && filters.department && row.department !== filters.department) {
    return false
  }
  if (category === 'etudiant' && filters.program && row.program !== filters.program) {
    return false
  }
  if (category === 'etudiant' && filters.promotion && row.promotion !== filters.promotion) {
    return false
  }
  if (category === 'insertion' && filters.zone && row.partnerZone !== filters.zone) {
    return false
  }

  return true
}

export function buildCategoryFilterConfig(
  category: PersonnelCategory,
  personnel: AdminPersonnel[],
) {
  const items = personnel.filter((p) => p.category === category)
  const base = [
    {
      id: 'search',
      label: 'Recherche',
      type: 'search' as const,
      placeholder: 'Nom, email...',
    },
    {
      id: 'status',
      label: 'Statut',
      type: 'select' as const,
      defaultValue: '',
      options: [
        { value: '', label: 'Tous' },
        { value: 'active', label: 'Actif' },
        { value: 'inactive', label: 'Inactif' },
        { value: 'pending', label: 'En attente' },
      ],
    },
  ]

  switch (category) {
    case 'administratif':
      return [
        ...base,
        {
          id: 'role',
          label: 'Rôle',
          type: 'select' as const,
          defaultValue: '',
          options: [
            { value: '', label: 'Tous' },
            { value: UserRole.ADMIN, label: ROLE_LABELS[UserRole.ADMIN] },
            {
              value: UserRole.ADMIN_STAFF,
              label: ROLE_LABELS[UserRole.ADMIN_STAFF],
            },
          ],
        },
        {
          id: 'department',
          label: 'Service',
          type: 'select' as const,
          defaultValue: '',
          options: [
            { value: '', label: 'Tous' },
            ...Array.from(
              new Set(items.map((p) => p.department).filter(Boolean) as string[]),
            )
              .sort()
              .map((d) => ({ value: d, label: d })),
          ],
        },
      ]
    case 'enseignant':
      return [
        ...base,
        {
          id: 'department',
          label: 'Département',
          type: 'select' as const,
          defaultValue: '',
          options: [
            { value: '', label: 'Tous' },
            ...Array.from(
              new Set(items.map((p) => p.department).filter(Boolean) as string[]),
            )
              .sort()
              .map((d) => ({ value: d, label: d })),
          ],
        },
      ]
    case 'etudiant':
      return [
        ...base,
        {
          id: 'program',
          label: 'Formation',
          type: 'select' as const,
          defaultValue: '',
          options: [
            { value: '', label: 'Toutes' },
            ...Array.from(
              new Set(items.map((p) => p.program).filter(Boolean) as string[]),
            )
              .sort()
              .map((p) => ({ value: p, label: p })),
          ],
        },
        {
          id: 'promotion',
          label: 'Promotion',
          type: 'select' as const,
          defaultValue: '',
          options: [
            { value: '', label: 'Toutes' },
            ...Array.from(
              new Set(items.map((p) => p.promotion).filter(Boolean) as string[]),
            )
              .sort()
              .map((p) => ({ value: p, label: p })),
          ],
        },
      ]
    case 'insertion':
      return [
        ...base,
        {
          id: 'zone',
          label: 'Zone',
          type: 'select' as const,
          defaultValue: '',
          options: [
            { value: '', label: 'Toutes' },
            ...Array.from(
              new Set(items.map((p) => p.partnerZone).filter(Boolean) as string[]),
            )
              .sort()
              .map((z) => ({ value: z, label: z })),
          ],
        },
      ]
    default:
      return base
  }
}
