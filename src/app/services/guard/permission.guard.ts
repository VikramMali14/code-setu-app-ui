import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AccessMenuService, PermissionAction } from '../access-menu.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(private accessMenuService: AccessMenuService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const module = route.data['module'] as string;
    const action = (route.data['action'] as PermissionAction) || 'READ';

    if (!module) {
      return true; // No module restriction on this route
    }

    const hasAccess = this.accessMenuService.hasPermission(module, action);

    if (hasAccess) {
      return true;
    }

    // Silently redirect to dashboard — no alert or error message shown to user
    return this.router.createUrlTree(['/dashboard']);
  }
}
