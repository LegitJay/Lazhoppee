import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, exhaustMap, switchMap, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ payload }) =>
        this.authService.login(payload).pipe(
          map((res) => AuthActions.loginSuccess({ user: res.user, token: res.token })),
          tap(() => this.cartService.refreshCartCount()),
          catchError((err) =>
            of(
              AuthActions.loginFailure({
                error: err?.error?.message || 'Login failed. Please try again.',
              })
            )
          )
        )
      )
    )
  );

  loadCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadCurrentUser),
      switchMap(() => {
        if (!this.authService.isLoggedIn()) {
          return of(AuthActions.loadCurrentUserFailure({ error: 'Not authenticated' }));
        }

        return this.authService.getMe().pipe(
          map((user) =>
            AuthActions.loadCurrentUserSuccess({
              user,
              token: this.authService.getToken() ?? undefined,
            })
          ),
          catchError((err) =>
            of(
              AuthActions.loadCurrentUserFailure({
                error: err?.error?.message || 'Failed to load current user.',
              })
            )
          )
        );
      })
    )
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.authService.logout();
          this.router.navigate(['/auth']);
        })
      ),
    { dispatch: false }
  );
}