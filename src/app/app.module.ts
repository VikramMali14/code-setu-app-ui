import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Corrected Imports
import { MatButtonModule } from '@angular/material/button'; // Fixed 'Buttom' to 'Button'
import { MatToolbarModule } from '@angular/material/toolbar'; // Fixed 'Bar' to 'bar'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule ,FormGroup,FormsModule} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu'; // 1. Import it
import { Router, Routes } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ImageCropperModule } from 'ngx-image-cropper';


import { LoginComponent } from './component/login/login.component';
import { HomeComponent } from './component/home/home.component';
import { NavBarComponent } from './component/nav-bar/nav-bar.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { SignupComponent } from './component/signup/signup.component';
import { ServicesComponent } from './component/services/services.component';
import { AboutComponent } from './component/about/about.component';
import { ContectUsComponent } from './component/contect-us/contect-us.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';

import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FooterComponent } from './component/footer/footer.component';
import { StaffuserComponent } from './component/staffuser/staffuser.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { UpdateroleComponent } from './component/updaterole/updaterole.component';
import { RolesDetailsComponent } from './roles-details/roles-details.component';
import { DepartmentComponent } from './component/component/department/department.component';
import { LoaderComponent } from './component/loader/loader.component';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { PlanscreenComponent } from './component/planscreen/planscreen.component';
import { DownloadscreenComponent } from './component/downloadscreen/downloadscreen.component';
import { FeaturescreenComponent } from './component/featurescreen/featurescreen.component';
import { StaffDetailsComponent } from './component/staff-details/staff-details.component';
import { ImageCropperComponent } from './component/image-cropper/image-cropper.component';
// import { DownloadscreenComponent } from './component/downloadscreen/downloadscreen.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavBarComponent,
    SignupComponent,
    ServicesComponent,
    FooterComponent,
    UpdateroleComponent,
    RolesDetailsComponent,
    DepartmentComponent,
    StaffuserComponent,
    StaffDetailsComponent,
    ImageCropperComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    HttpClientModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    CommonModule,
    MatTableModule,
    MatDialogModule,
    MatStepperModule,
    MatDatepickerModule, MatMenuModule,
    MatNativeDateModule, MatPaginatorModule,
    MatAutocompleteModule, MatSnackBarModule, MatDividerModule,
    FormsModule,
    FormsModule,ImageCropperModule,
    // standaload Component
    PlanscreenComponent,
    ContectUsComponent,
    HomeComponent,
    DownloadscreenComponent,
    LoaderComponent,
    AboutComponent,
    FeaturescreenComponent

  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }

  ], bootstrap: [AppComponent]
})
export class AppModule { }
