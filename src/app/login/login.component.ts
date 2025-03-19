import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserAPIService } from '../user-api.service';
import { AuthService } from '../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userAPIService: UserAPIService,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigate(['/admin']);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password, rememberMe } = this.loginForm.value;

      this.userAPIService.loginUser({ email, password, rememberMe }).subscribe({
        next: (response) => {
          const { userId, role, token } = response;
          this.authService.login(email, password, rememberMe, userId, role, token);
          this.router.navigate(['/']);
        },
        error: () => {
          this.loginError = 'Invalid email or password';
        }
      });
    }
  }
}
