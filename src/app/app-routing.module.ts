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
import { UpdateroleComponent } from './component/updaterole/updaterole.component';
import { RolesDetailsComponent } from './roles-details/roles-details.component';
import { DepartmentComponent } from './component/component/department/department.component';
import { PlanscreenComponent } from './component/planscreen/planscreen.component';

const routes: Routes = [
  {path: '',component: HomeComponent,pathMatch: 'full'},
  {path: 'login',component: LoginComponent,pathMatch: "full"},
  { path: 'dashboard', component: DashboardComponent, pathMatch: 'full', canActivate: [AuthGuard] },
  { path: 'signup', component: SignupComponent, pathMatch: 'full' },
  { path: 'services', component: ServicesComponent, pathMatch: 'full' },
  { path: 'about', component: AboutComponent, pathMatch: 'full' },
  { path: 'contactus', component: ContectUsComponent, pathMatch: 'full' },
  { path: 'home', component: HomeComponent, pathMatch: 'full' },
  { path: 'createrole', component: RoleComponent, pathMatch: 'full' },
  { path: 'updaterole', component: UpdateroleComponent, pathMatch: 'full' },
  { path: 'roles', component: RolesDetailsComponent, pathMatch: 'full' },
    { path: 'department', component: DepartmentComponent, pathMatch: 'full',    canActivate: [AuthGuard] },
    { path: 'plan', component: PlanscreenComponent, pathMatch: 'full',    canActivate: [AuthGuard] }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // This enables jumping to the #id in the URL
      anchorScrolling: 'enabled', 
      // This ensures the page starts at the top when changing routes
      scrollPositionRestoration: 'enabled',
      // Optional: adds a smooth scroll effect
      scrollOffset: [0, 64] 
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
