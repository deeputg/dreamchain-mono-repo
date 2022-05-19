import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Landing component
import { LandingComponent } from './views/components/landing/landing.component';

//Auth
import { RegisterComponent } from './views/auth/register/register.component';
import { LoginComponent } from './views/auth/login/login.component';

//Pages
import { DashboardComponent } from './views/components/dashboard/dashboard.component';
import { FindAccountComponent } from './views/components/find-account/find-account.component';
import { TxHistoryComponent } from './views/components/tx-history/tx-history.component';

//AuthGuard
import { AuthGuard } from './guards';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'findAccount',
    component: FindAccountComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'txHistory',
    component: TxHistoryComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
