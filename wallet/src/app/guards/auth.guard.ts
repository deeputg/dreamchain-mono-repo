import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../services/api.service';
import { DrmService } from "../services/drm.service";
import { SessionStorage, SessionStorageService } from 'ngx-webstorage'

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  @SessionStorage()
  public isLoggedIn

  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      if (this.isLoggedIn) {
        // logged in so return true
        return true;
      }
      // not logged in so redirect to login page
      this.router.navigate(['/']);
      return false;
  }

}
