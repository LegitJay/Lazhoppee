import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const adminUser = auth.getAdminUser();

  if (adminUser && adminUser.role === 'admin') return true;

  router.navigate(['/admin/login']);
  return false;
};