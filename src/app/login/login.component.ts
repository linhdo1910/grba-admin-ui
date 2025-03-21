import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { LoginResponse } from '../interface/User';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginError = 'Please fill in all required fields correctly.';
      return;
    }
    

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login(email, password, rememberMe).subscribe({
      next: (response: LoginResponse) => {
        this.loginError = null;
        if (response.role === 'admin') {
          this.router.navigate(['/admin/mainpage']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error: any) => { // Thêm type any hoặc Error cho error
        console.error('Login failed:', error);
        this.loginError = error.message || 'An unknown error occurred';
      }
    });
  }
  goToSignUp() {
    this.router.navigate(['/sign-up']);
  }
  showSignupNotAvailable() {
    this.loginError = 'Sign up feature is not available yet.';
  }
}
