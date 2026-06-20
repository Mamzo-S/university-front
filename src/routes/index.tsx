import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { StaffLayout } from '@/layouts/StaffLayout'
import { TrainerLayout } from '@/layouts/TrainerLayout'
import { TutorLayout } from '@/layouts/TutorLayout'
import { TrainingLayout } from '@/layouts/TrainingLayout'
import { CareerLayout } from '@/layouts/CareerLayout'
import { StudentLayout } from '@/layouts/StudentLayout'
import { ProtectedRoute } from '@/routes/guards/ProtectedRoute'
import { GuestRoute } from '@/routes/guards/GuestRoute'
import { RoleGuard } from '@/routes/guards/RoleGuard'
import { RootRedirect } from '@/routes/guards/RootRedirect'
import { LoginPage } from '@/pages/auth/LoginPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminPersonnelPage } from '@/pages/admin/AdminPersonnelPage'
import { AdminSystemPage } from '@/pages/admin/AdminSystemPage'
import { StaffDashboardPage } from '@/pages/staff/StaffDashboardPage'
import { StudentDossierPage } from '@/pages/student/StudentDossierPage'
import { StudentFormationDetailPage } from '@/pages/student/StudentFormationDetailPage'
import { StudentQuizPage } from '@/pages/student/StudentQuizPage'
import { StudentFormationsPage } from '@/pages/student/StudentFormationsPage'
import { StudentSchedulePage } from '@/pages/student/StudentSchedulePage'
import { TrainerDepositsPage } from '@/pages/trainer/TrainerDepositsPage'
import { TrainerFormationDetailPage } from '@/pages/trainer/TrainerFormationDetailPage'
import { TrainerFormationsPage } from '@/pages/trainer/TrainerFormationsPage'
import { TrainerMeetingsPage } from '@/pages/trainer/TrainerMeetingsPage'
import { TrainerQuizzesPage } from '@/pages/trainer/TrainerQuizzesPage'
import { TrainerSchedulePage } from '@/pages/trainer/TrainerSchedulePage'
import { TrainerStudentsPage } from '@/pages/trainer/TrainerStudentsPage'
import { StudentBulletinsPage } from '@/pages/student/StudentBulletinsPage'
import { TrainerBulletinsPage } from '@/pages/trainer/TrainerBulletinsPage'
import { TutorDashboardPage } from '@/pages/tutor/TutorDashboardPage'
import { TrainingDashboardPage } from '@/pages/training/TrainingDashboardPage'
import { TrainingSchedulePage } from '@/pages/training/TrainingSchedulePage'
import { TrainingFormationsPage } from '@/pages/training/TrainingFormationsPage'
import { TrainingFormationDetailPage } from '@/pages/training/TrainingFormationDetailPage'
import { TrainingFilieresPage } from '@/pages/training/TrainingFilieresPage'
import { TrainingFiliereDetailPage } from '@/pages/training/TrainingFiliereDetailPage'
import { TrainingPromotionsPage } from '@/pages/training/TrainingPromotionsPage'
import { TrainingStudentGroupsPage } from '@/pages/training/TrainingStudentGroupsPage'
import { TrainingTrainersPage } from '@/pages/training/TrainingTrainersPage'
import { CareerDashboardPage } from '@/pages/career/CareerDashboardPage'
import { CareerInternshipsPage } from '@/pages/career/CareerInternshipsPage'
import { CareerPartnersPage } from '@/pages/career/CareerPartnersPage'
import { CareerStatsPage } from '@/pages/career/CareerStatsPage'
import { PlaceholderPage } from '@/components/shared/PlaceholderPage'
import { UserRole } from '@/types/roles'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<GuestRoute />}>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        {/* Administrateur */}
        <Route
          element={<RoleGuard allowedRoles={[UserRole.ADMIN]} />}
        >
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="personnel" element={<AdminPersonnelPage />} />
            <Route path="system" element={<AdminSystemPage />} />
          </Route>
        </Route>

        {/* Personnel administratif */}
        <Route
          element={<RoleGuard allowedRoles={[UserRole.ADMIN_STAFF]} />}
        >
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<StaffDashboardPage />} />
            <Route
              path="documents"
              element={
                <PlaceholderPage
                  title="Gestion documentaire"
                  description="Courriers, notes de service et circulaires"
                />
              }
            />
            <Route
              path="rh"
              element={
                <PlaceholderPage
                  title="Ressources humaines"
                  description="Personnel administratif, enseignants et tuteurs"
                />
              }
            />
            <Route
              path="budget"
              element={
                <PlaceholderPage
                  title="Gestion budgétaire"
                  description="Projets budget et notes d'orientation"
                />
              }
            />
          </Route>
        </Route>

        {/* Enseignants / Formateurs */}
        <Route
          element={<RoleGuard allowedRoles={[UserRole.TEACHER]} />}
        >
          <Route path="/trainer" element={<TrainerLayout />}>
            <Route index element={<Navigate to="formations" replace />} />
            <Route path="formations" element={<TrainerFormationsPage />} />
            <Route path="students" element={<TrainerStudentsPage />} />
            <Route path="bulletins" element={<TrainerBulletinsPage />} />
            <Route
              path="formations/:id"
              element={<TrainerFormationDetailPage />}
            />
            <Route
              path="emploi-du-temps"
              element={<TrainerSchedulePage />}
            />
            <Route path="quiz" element={<TrainerQuizzesPage />} />
            <Route path="depots" element={<TrainerDepositsPage />} />
            <Route path="reunions" element={<TrainerMeetingsPage />} />
          </Route>
        </Route>

        {/* Tuteurs */}
        <Route element={<RoleGuard allowedRoles={[UserRole.TUTOR]} />}>
          <Route path="/tutor" element={<TutorLayout />}>
            <Route index element={<TutorDashboardPage />} />
            <Route
              path="sessions"
              element={
                <PlaceholderPage
                  title="Sessions de tutorat"
                  description="Planifier et suivre les séances"
                />
              }
            />
            <Route
              path="students"
              element={
                <PlaceholderPage
                  title="Étudiants suivis"
                  description="Liste des étudiants en tutorat"
                />
              }
            />
          </Route>
        </Route>

        {/* Responsable de formation */}
        <Route
          element={<RoleGuard allowedRoles={[UserRole.TRAINING_MANAGER]} />}
        >
          <Route path="/training" element={<TrainingLayout />}>
            <Route index element={<TrainingDashboardPage />} />
            <Route path="filieres" element={<TrainingFilieresPage />} />
            <Route path="filieres/:id" element={<TrainingFiliereDetailPage />} />
            <Route path="formations" element={<TrainingFormationsPage />} />
            <Route path="formations/:id" element={<TrainingFormationDetailPage />} />
            <Route path="promotions" element={<TrainingPromotionsPage />} />
            <Route path="student-groups" element={<TrainingStudentGroupsPage />} />
            <Route path="schedule" element={<TrainingSchedulePage />} />
            <Route path="trainers" element={<TrainingTrainersPage />} />
          </Route>
        </Route>

        {/* Service insertion */}
        <Route
          element={<RoleGuard allowedRoles={[UserRole.CAREER_SERVICE]} />}
        >
          <Route path="/career" element={<CareerLayout />}>
            <Route index element={<CareerDashboardPage />} />
            <Route path="internships" element={<CareerInternshipsPage />} />
            <Route path="partners" element={<CareerPartnersPage />} />
            <Route path="stats" element={<CareerStatsPage />} />
          </Route>
        </Route>

        {/* Étudiants — navbar, pas de dashboard */}
        <Route element={<RoleGuard allowedRoles={[UserRole.STUDENT]} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dossier" replace />} />
            <Route path="dossier" element={<StudentDossierPage />} />
            <Route path="bulletins" element={<StudentBulletinsPage />} />
            <Route path="emploi-du-temps" element={<StudentSchedulePage />} />
            <Route path="formations" element={<StudentFormationsPage />} />
            <Route path="formations/:slug" element={<StudentFormationDetailPage />} />
            <Route
              path="formations/:slug/quiz/:quizId"
              element={<StudentQuizPage />}
            />
            <Route
              path="documents"
              element={
                <PlaceholderPage
                  title="Mes documents"
                  description="Documents académiques et administratifs"
                />
              }
            />
            <Route
              path="notifications"
              element={
                <PlaceholderPage
                  title="Notifications"
                  description="Annonces et mises à jour institutionnelles"
                />
              }
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
