import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SessionStorage } from 'ngx-webstorage'
import { LoginState } from '../models/login-state.model'
import { LoginService } from '../services/'

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  @SessionStorage()
  public isLoggedIn: LoginState


  constructor(private router: Router, public loginService: LoginService) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if (this.loginService.loggedIn()){
        // logged in so return true
        return true;
      }

      // not logged in so redirect to login page
        this.router.navigate(['/']);
        return false;

  }
}
