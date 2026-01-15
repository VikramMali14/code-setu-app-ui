import { Component, OnInit } from '@angular/core';
import { EmailValidator } from '@angular/forms';
import { Router } from '@angular/router';
import { error } from 'console';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  creadential = {
    userName: '',
    password: '',
    email: ''
  }
  hidePassword = true;
  constructor(private loginservice: LoginService,
    private router: Router
  ) { }
  loginWithEmail = false;
  ngOnInit(): void {
  }


onSubmit() {
  // Check if credentials exist
  const identifier = this.loginWithEmail ? this.creadential.email : this.creadential.userName;
  
  if (!identifier || !this.creadential.password) {
    alert("Please fill in all fields");
    return;
  }

  this.loginservice.generateToken(this.creadential).subscribe({
    next: (response: any) => {
      if (response && response.accessToken) {
        this.loginservice.loginUser(response.accessToken);
        this.router.navigate(['dashboard']); // Use Router!

      } else {
        console.error("Token missing in response", response);
      }
    },
    error: (err) => {
      console.error("Login failed (Check CORS or Credentials):", err);
    }
  });
}
}
