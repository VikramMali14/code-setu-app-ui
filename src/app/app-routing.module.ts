import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { LoginComponent } from './component/login/login.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { SignupComponent } from './component/signup/signup.component';
import { ServicesComponent } from './component/services/services.component';
import { AboutComponent } from './component/about/about.component';
import { ContectUsComponent } from './component/contect-us/contect-us.component';
import { AuthGuard } from './services/guard/auth.guard';
import { FooterComponent } from './component/footer/footer.component';
import { RoleComponent } from './component/component/role/role.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',

  },
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: "full"
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    pathMatch: 'full',
    canActivate:[AuthGuard]
  },
   {
    path: 'signup',
    component: SignupComponent,
    pathMatch: 'full'
  },
   {
    path: 'services',
    component: ServicesComponent,
    pathMatch: 'full'
  },
   {
    path: 'about',
    component: AboutComponent,
    pathMatch: 'full'
  },
   {
    path: 'contactus',
    component: FooterComponent,
    pathMatch: 'full'
  },
   {
    path: 'home',
    component: HomeComponent,
    pathMatch: 'full'
  },
   {
    path: 'role',
    component: RoleComponent,
    pathMatch: 'full'
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
