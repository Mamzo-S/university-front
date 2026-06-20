import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useGetStudentQuery } from '@/features/students/api/studentsApi'
import { formatNiveauEtude } from '@/types/niveauEtude'

export function StudentDossierPage() {
  const { user } = useAuth()
  const { data: student, isLoading } = useGetStudentQuery('stu-001')

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!student) {
    return <p className="text-slate-500">Dossier introuvable.</p>
  }

  const fields = [
    { label: 'INE', value: student.ine },
    { label: 'Nom', value: student.lastName },
    { label: 'Prénom', value: student.firstName },
    { label: 'Date de naissance', value: student.birthDate },
    { label: 'Formation', value: student.formation },
    { label: 'Promotion', value: student.promotion },
    { label: 'Niveau', value: formatNiveauEtude(student.niveauEtude) },
    { label: 'E-mail', value: user?.email ?? student.email },
  ]

  return (
    <div>
      <PageHeader
        title="Mon dossier"
        description="Informations académiques et parcours universitaire"
      />
      <Card>
        <CardHeader>
          <CardTitle>
            {student.firstName} {student.lastName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label}>
                <dt className="text-sm font-medium text-slate-500">{field.label}</dt>
                <dd className="mt-1 text-sm text-slate-900">{field.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
