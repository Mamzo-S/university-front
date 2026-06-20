export interface MockStudent {
  id: string
  ine: string
  firstName: string
  lastName: string
  birthDate: string
  formation: string
  promotion: string
  niveauEtude: string
  email: string
}

export const MOCK_STUDENTS: MockStudent[] = [
  {
    id: 'stu-001',
    ine: '2021UCHK0042',
    firstName: 'Amadou',
    lastName: 'Sy',
    birthDate: '2002-05-14',
    formation: 'Licence Informatique',
    promotion: '2024-2025',
    niveauEtude: 'LICENCE_3',
    email: 'student@uchk.sn',
  },
  {
    id: 'stu-002',
    ine: '2022UCHK0118',
    firstName: 'Khady',
    lastName: 'Mbaye',
    birthDate: '2003-11-02',
    formation: 'Licence Gestion',
    promotion: '2024-2025',
    niveauEtude: 'LICENCE_2',
    email: 'khady.mbaye@uchk.sn',
  },
  {
    id: 'stu-003',
    ine: '2020UCHK0027',
    firstName: 'Cheikh',
    lastName: 'Gueye',
    birthDate: '2001-08-21',
    formation: 'Master Data Science',
    promotion: '2023-2024',
    niveauEtude: 'LICENCE_1',
    email: 'cheikh.gueye@uchk.sn',
  },
  {
    id: 'stu-004',
    ine: '2023UCHK0205',
    firstName: 'Awa',
    lastName: 'Diop',
    birthDate: '2004-01-30',
    formation: 'Licence Droit',
    promotion: '2024-2025',
    niveauEtude: 'MASTER_1',
    email: 'awa.diop@uchk.sn',
  },
  {
    id: 'stu-005',
    ine: '2022UCHK0089',
    firstName: 'Moussa',
    lastName: 'Ndiaye',
    birthDate: '2002-03-12',
    formation: 'Licence Informatique',
    promotion: '2024-2025',
    niveauEtude: 'LICENCE_2',
    email: 'moussa.ndiaye@uchk.sn',
  },
  {
    id: 'stu-006',
    ine: '2021UCHK0156',
    firstName: 'Fatou',
    lastName: 'Sarr',
    birthDate: '2001-07-08',
    formation: 'Licence Informatique',
    promotion: '2024-2025',
    niveauEtude: 'LICENCE_3',
    email: 'fatou.sarr@uchk.sn',
  },
  {
    id: 'stu-007',
    ine: '2023UCHK0312',
    firstName: 'Ibrahima',
    lastName: 'Lo',
    birthDate: '2003-12-19',
    formation: 'Licence Informatique',
    promotion: '2024-2025',
    niveauEtude: 'MASTER_1',
    email: 'ibrahima.lo@uchk.sn',
  },
  {
    id: 'stu-008',
    ine: '2022UCHK0198',
    firstName: 'Mariama',
    lastName: 'Cissé',
    birthDate: '2002-09-25',
    formation: 'Licence Informatique',
    promotion: '2024-2025',
    niveauEtude: 'LICENCE_2',
    email: 'mariama.cisse@uchk.sn',
  },
]

export function findStudentById(id: string) {
  return MOCK_STUDENTS.find((s) => s.id === id)
}

export function getStudentsByIds(ids: string[]) {
  return ids
    .map((id) => findStudentById(id))
    .filter((s): s is MockStudent => !!s)
}
