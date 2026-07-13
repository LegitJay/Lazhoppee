import { createAction, props } from '@ngrx/store';
import { AuthResponse, AuthUser } from '../../services/auth.service';

export const login = createAction(
  '[Auth] Login',
  props<{ payload: { email: string; password: string } }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: AuthUser; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string | null }>()
);

export const logout = createAction('[Auth] Logout');

export const loadCurrentUser = createAction('[Auth] Load Current User');

export const loadCurrentUserSuccess = createAction(
  '[Auth] Load Current User Success',
  props<{ user: AuthUser; token?: string }>()
);

export const loadCurrentUserFailure = createAction(
  '[Auth] Load Current User Failure',
  props<{ error: string }>()
);