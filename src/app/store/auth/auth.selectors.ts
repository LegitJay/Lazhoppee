import { createFeatureSelector, createSelector } from '@ngrx/store';
import { authReducerKey } from './auth.reducer';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>(authReducerKey);

export const selectCurrentUser = createSelector(selectAuthState, (state) => state.user);

export const selectLoading = createSelector(selectAuthState, (state) => state.loading);

export const selectError = createSelector(selectAuthState, (state) => state.error);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.isAuthenticated
);
