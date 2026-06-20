import { PageHeader } from '@/components/layout/PageHeader'
import { DashboardLoader } from '@/components/dashboard/DashboardLoader'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useGetCareerStatsQuery } from '@/features/dashboard/api/dashboardApi'

export function CareerStatsPage() {
  const { data, isLoading } = useGetCareerStatsQuery()

  if (isLoading) return <DashboardLoader />

  const totalEmployed = (data?.employed ?? 0) + (data?.selfEmployed ?? 0)
  const salariedPercent = totalEmployed
    ? Math.round(((data?.employed ?? 0) / totalEmployed) * 100)
    : 0

  return (
    <div>
      <PageHeader
        title="Statistiques"
        description="Vue d'ensemble de l'insertion professionnelle"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total stages" value={data?.internships ?? 0} variant="rose" />
        <StatCard label="Stages en cours" value={data?.activeInternships ?? 0} variant="primary" />
        <StatCard label="Partenaires actifs" value={data?.partners ?? 0} variant="emerald" />
        <StatCard
          label="Conventions en attente"
          value={data?.pendingConventions ?? 0}
          variant="amber"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Insertion (stages terminés)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">Emploi salarié</span>
                  <span className="font-medium text-emerald-700">{salariedPercent} %</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${salariedPercent}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">Auto-emploi</span>
                  <span className="font-medium text-amber-700">{100 - salariedPercent} %</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${100 - salariedPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicateurs clés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>{data?.activeInternships ?? 0} stage(s) actuellement en cours</p>
            <p>{data?.pendingConventions ?? 0} convention(s) non signée(s)</p>
            <p>{data?.partners ?? 0} entreprise(s) partenaire(s) active(s)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
