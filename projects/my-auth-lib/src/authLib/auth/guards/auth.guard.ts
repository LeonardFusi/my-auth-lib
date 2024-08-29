import { CanActivateFn, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const AuthGuard: CanActivateFn = (
): boolean | UrlTree => {
  const authService = inject(AuthService);
  

  
  authService.setAuthentication()
  return authService.checkAuthentication()
};


