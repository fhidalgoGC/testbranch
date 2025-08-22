import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authSlice from '../features/auth/slices/authSlice';
import { authApi, identityApi } from '../features/auth/services/authApi';
import pageStateSlice from '../store/slices/pageStateSlice';
import contractDraftsSlice from '../features/contractDrafts/contractDraftsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    pageState: pageStateSlice,
    contractDrafts: contractDraftsSlice,
    [authApi.reducerPath]: authApi.reducer,
    [identityApi.reducerPath]: identityApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, identityApi.middleware),
});

// Middleware para persistir estado automáticamente
store.subscribe(() => {
  const state = store.getState();
  // Guardar solo el estado de las páginas y drafts en localStorage
  localStorage.setItem('pageState', JSON.stringify(state.pageState));
  localStorage.setItem('contractDrafts', JSON.stringify(state.contractDrafts));
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
