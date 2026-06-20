import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  DEFAULT_TEACHER_INFO,
  normalizeFormations,
} from '@/features/formations/utils/normalizeFormation'
import { MOCK_STUDENT_FORMATIONS } from '@/mocks/data/studentFormations'
import type {
  FormationDocument,
  FormationProjectDeposit,
  FormationQuiz,
  FormationResource,
  FormationSubModule,
  StudentFormation,
  SubModuleStudentNote,
  SubModuleTeacherInfo,
} from '@/types/formation'
import type { RootState } from '@/app/store'

interface FormationsState {
  items: StudentFormation[]
}

const initialState: FormationsState = {
  items: normalizeFormations(MOCK_STUDENT_FORMATIONS),
}

function findFormationIndex(state: FormationsState, formationId: string) {
  return state.items.findIndex((f) => f.id === formationId)
}

function findSubModuleIndex(formation: StudentFormation, subModuleId: string) {
  return formation.subModules.findIndex((s) => s.id === subModuleId)
}

const formationsSlice = createSlice({
  name: 'formations',
  initialState,
  reducers: {
    addFormation: (state, action: PayloadAction<StudentFormation>) => {
      state.items.push(action.payload)
    },
    ensureFormation: (state, action: PayloadAction<StudentFormation>) => {
      const index = findFormationIndex(state, action.payload.id)
      if (index === -1) {
        state.items.push({
          ...action.payload,
          subModules: action.payload.subModules ?? [],
          enrolledStudentIds: action.payload.enrolledStudentIds ?? [],
        })
      }
    },
    replaceFormationParcours: (
      state,
      action: PayloadAction<{ formationId: string; formation: StudentFormation }>,
    ) => {
      const index = findFormationIndex(state, action.payload.formationId)
      const source = action.payload.formation
      if (index === -1) {
        state.items.push({
          ...source,
          subModules: source.subModules ?? [],
          enrolledStudentIds: source.enrolledStudentIds ?? [],
        })
        return
      }
      state.items[index] = {
        ...state.items[index],
        managerName: source.managerName,
        trainerName: source.trainerName,
        tutorName: source.tutorName,
        duration: source.duration,
        sessionUrl: source.sessionUrl,
        subModules: source.subModules ?? [],
        projectDeposits: source.projectDeposits ?? [],
      }
    },
    updateFormation: (
      state,
      action: PayloadAction<{ id: string; data: Partial<StudentFormation> }>,
    ) => {
      const index = findFormationIndex(state, action.payload.id)
      if (index === -1) return
      state.items[index] = { ...state.items[index], ...action.payload.data }
    },
    deleteFormation: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((f) => f.id !== action.payload)
    },

    addSubModule: (
      state,
      action: PayloadAction<{ formationId: string; subModule: FormationSubModule }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation) return
      formation.subModules.push(action.payload.subModule)
    },
    updateSubModule: (
      state,
      action: PayloadAction<{
        formationId: string
        subModuleId: string
        data: Partial<FormationSubModule>
      }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation) return
      const index = findSubModuleIndex(formation, action.payload.subModuleId)
      if (index === -1) return
      formation.subModules[index] = {
        ...formation.subModules[index],
        ...action.payload.data,
      }
    },
    deleteSubModule: (
      state,
      action: PayloadAction<{ formationId: string; subModuleId: string }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation) return
      formation.subModules = formation.subModules.filter(
        (s) => s.id !== action.payload.subModuleId,
      )
    },

    addQuiz: (
      state,
      action: PayloadAction<{
        formationId: string
        subModuleId: string
        quiz: FormationQuiz
      }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation) return
      const sub = formation.subModules.find((s) => s.id === action.payload.subModuleId)
      if (!sub) return
      sub.quizzes.push(action.payload.quiz)
    },
    updateQuiz: (
      state,
      action: PayloadAction<{
        formationId: string
        subModuleId: string
        quizId: string
        data: Partial<FormationQuiz>
      }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation) return
      const sub = formation.subModules.find((s) => s.id === action.payload.subModuleId)
      if (!sub) return
      const index = sub.quizzes.findIndex((q) => q.id === action.payload.quizId)
      if (index === -1) return
      sub.quizzes[index] = { ...sub.quizzes[index], ...action.payload.data }
    },
    deleteQuiz: (
      state,
      action: PayloadAction<{
        formationId: string
        subModuleId: string
        quizId: string
      }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation) return
      const sub = formation.subModules.find((s) => s.id === action.payload.subModuleId)
      if (!sub) return
      sub.quizzes = sub.quizzes.filter((q) => q.id !== action.payload.quizId)
    },

    addDocument: (
      state,
      action: PayloadAction<{
        formationId: string
        subModuleId: string
        document: FormationDocument
      }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation) return
      const sub = formation.subModules.find((s) => s.id === action.payload.subModuleId)
      if (!sub) return
      sub.documents.push(action.payload.document)
    },
    updateDocument: (
      state,
      action: PayloadAction<{
        formationId: string
        subModuleId: string
        documentId: string
        data: Partial<FormationDocument>
      }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation) return
      const sub = formation.subModules.find((s) => s.id === action.payload.subModuleId)
      if (!sub) return
      const index = sub.documents.findIndex((d) => d.id === action.payload.documentId)
      if (index === -1) return
      sub.documents[index] = { ...sub.documents[index], ...action.payload.data }
    },
    deleteDocument: (
      state,
      action: PayloadAction<{
        formationId: string
        subModuleId: string
        documentId: string
      }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation) return
      const sub = formation.subModules.find((s) => s.id === action.payload.subModuleId)
      if (!sub) return
      sub.documents = sub.documents.filter((d) => d.id !== action.payload.documentId)
    },

    addResource: (
      state,
      action: PayloadAction<{
        formationId: string
        subModuleId: string
        resource: FormationResource
      }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation) return
      const sub = formation.subModules.find((s) => s.id === action.payload.subModuleId)
      if (!sub) return
      sub.resources.push(action.payload.resource)
    },
    updateResource: (
      state,
      action: PayloadAction<{
        formationId: string
        subModuleId: string
        resourceId: string
        data: Partial<FormationResource>
      }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation) return
      const sub = formation.subModules.find((s) => s.id === action.payload.subModuleId)
      if (!sub) return
      const index = sub.resources.findIndex((r) => r.id === action.payload.resourceId)
      if (index === -1) return
      sub.resources[index] = { ...sub.resources[index], ...action.payload.data }
    },
    deleteResource: (
      state,
      action: PayloadAction<{
        formationId: string
        subModuleId: string
        resourceId: string
      }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation) return
      const sub = formation.subModules.find((s) => s.id === action.payload.subModuleId)
      if (!sub) return
      sub.resources = sub.resources.filter((r) => r.id !== action.payload.resourceId)
    },

    addDeposit: (
      state,
      action: PayloadAction<{
        formationId: string
        deposit: FormationProjectDeposit
      }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation) return
      if (!formation.projectDeposits) formation.projectDeposits = []
      formation.projectDeposits.push(action.payload.deposit)
    },
    updateDeposit: (
      state,
      action: PayloadAction<{
        formationId: string
        depositId: string
        data: Partial<FormationProjectDeposit>
      }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation?.projectDeposits) return
      const index = formation.projectDeposits.findIndex(
        (d) => d.id === action.payload.depositId,
      )
      if (index === -1) return
      formation.projectDeposits[index] = {
        ...formation.projectDeposits[index],
        ...action.payload.data,
      }
    },
    deleteDeposit: (
      state,
      action: PayloadAction<{ formationId: string; depositId: string }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation?.projectDeposits) return
      formation.projectDeposits = formation.projectDeposits.filter(
        (d) => d.id !== action.payload.depositId,
      )
    },

    enrollStudent: (
      state,
      action: PayloadAction<{ formationId: string; studentId: string }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation) return
      if (!formation.enrolledStudentIds) formation.enrolledStudentIds = []
      if (!formation.enrolledStudentIds.includes(action.payload.studentId)) {
        formation.enrolledStudentIds.push(action.payload.studentId)
      }
    },
    unenrollStudent: (
      state,
      action: PayloadAction<{ formationId: string; studentId: string }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation?.enrolledStudentIds) return
      formation.enrolledStudentIds = formation.enrolledStudentIds.filter(
        (id) => id !== action.payload.studentId,
      )
      for (const sub of formation.subModules) {
        if (sub.studentNotes) {
          sub.studentNotes = sub.studentNotes.filter(
            (n) => n.studentId !== action.payload.studentId,
          )
        }
      }
    },

    upsertSubModuleStudentNote: (
      state,
      action: PayloadAction<{
        formationId: string
        subModuleId: string
        note: SubModuleStudentNote
      }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation) return
      const sub = formation.subModules.find((s) => s.id === action.payload.subModuleId)
      if (!sub) return
      if (!sub.studentNotes) sub.studentNotes = []
      const index = sub.studentNotes.findIndex(
        (n) => n.studentId === action.payload.note.studentId,
      )
      if (index === -1) {
        sub.studentNotes.push(action.payload.note)
      } else {
        sub.studentNotes[index] = action.payload.note
      }
    },
    deleteSubModuleStudentNote: (
      state,
      action: PayloadAction<{
        formationId: string
        subModuleId: string
        studentId: string
      }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation) return
      const sub = formation.subModules.find((s) => s.id === action.payload.subModuleId)
      if (!sub?.studentNotes) return
      sub.studentNotes = sub.studentNotes.filter(
        (n) => n.studentId !== action.payload.studentId,
      )
    },

    updateSubModuleTeacherInfo: (
      state,
      action: PayloadAction<{
        formationId: string
        subModuleId: string
        data: Partial<SubModuleTeacherInfo>
      }>,
    ) => {
      const formation = state.items.find((f) => f.id === action.payload.formationId)
      if (!formation) return
      const sub = formation.subModules.find((s) => s.id === action.payload.subModuleId)
      if (!sub) return
      sub.teacherInfo = {
        ...DEFAULT_TEACHER_INFO,
        ...sub.teacherInfo,
        ...action.payload.data,
      }
    },
  },
})

export const {
  addFormation,
  ensureFormation,
  replaceFormationParcours,
  updateFormation,
  deleteFormation,
  addSubModule,
  updateSubModule,
  deleteSubModule,
  addQuiz,
  updateQuiz,
  deleteQuiz,
  addDocument,
  updateDocument,
  deleteDocument,
  addResource,
  updateResource,
  deleteResource,
  addDeposit,
  updateDeposit,
  deleteDeposit,
  enrollStudent,
  unenrollStudent,
  upsertSubModuleStudentNote,
  deleteSubModuleStudentNote,
  updateSubModuleTeacherInfo,
} = formationsSlice.actions

export const selectAllFormations = (state: RootState) => state.formations.items

export const selectFormationById = (state: RootState, id: string) =>
  state.formations.items.find((f) => f.id === id)

export const selectFormationsByTrainer = (state: RootState, trainerName: string) =>
  state.formations.items.filter((f) => f.trainerName === trainerName)

export default formationsSlice.reducer
