import { createReducer, on } from '@ngrx/store';
import { initialAuthState, AuthState } from './auth.state';
import * as AuthActions from './auth.actions';

export const authReducerKey = 'auth';

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.login, (state): AuthState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { user, token }): AuthState => ({
    ...state,
    loading: false,
    error: null,
    user,
    token: token ?? null,
    isAuthenticated: true,
  })),

  on(AuthActions.loginFailure, (state, { error }): AuthState => ({
    ...state,
    loading: false,
    error,
    user: null,
    token: null,
    isAuthenticated: false,
  })),

  on(AuthActions.logout, (state): AuthState => ({
    ...state,
    user: null,
    token: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  })),

  on(AuthActions.loadCurrentUser, (state): AuthState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.loadCurrentUserSuccess, (state, { user, token }): AuthState => ({
    ...state,
    loading: false,
    error: null,
    user,
    token: token ?? state.token ?? null,
    isAuthenticated: true,
  })),

  on(AuthActions.loadCurrentUserFailure, (state, { error }): AuthState => ({
    ...state,
    loading: false,
    error,
    user: null,
    token: null,
    isAuthenticated: false,
  }))
);
