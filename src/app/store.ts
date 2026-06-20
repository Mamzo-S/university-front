import { combineReducers, configureStore } from '@reduxjs/toolkit'
import '@/features/catalog/api/catalogApi'
import '@/features/students/api/studentsApi'
import '@/features/career/api/careerApi'
import '@/features/grades/api/gradesApi'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist'
import { persistStorage } from '@/lib/persistStorage'
import { baseApi } from '@/app/api/baseApi'
import authReducer from '@/features/auth/slice/authSlice'
import adminReducer from '@/features/admin/slice/adminSlice'
import formationsReducer from '@/features/formations/slice/formationsSlice'

const authPersistConfig = {
  key: 'auth',
  storage: persistStorage,
  whitelist: ['token', 'refreshToken', 'user', 'isAuthenticated'],
}

const formationsPersistConfig = {
  key: 'formations',
  storage: persistStorage,
}

const adminPersistConfig = {
  key: 'admin',
  storage: persistStorage,
}

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  formations: persistReducer(formationsPersistConfig, formationsReducer),
  admin: persistReducer(adminPersistConfig, adminReducer),
  [baseApi.reducerPath]: baseApi.reducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
