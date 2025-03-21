// sign-up.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { LoginResponse, SignUpResponse } from '../interface/User';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  standalone: false
})
export class SignUpComponent {
  signUpForm: FormGroup;
  signUpError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signUpForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
  console.log('Form value:', this.signUpForm.value);
  console.log('Form errors:', this.signUpForm.errors);
  console.log('Form invalid:', this.signUpForm.invalid);
    if (this.signUpForm.invalid) {
      this.signUpError = 'Vui lòng điền đầy đủ và đúng tất cả các trường bắt buộc.';
      if (this.signUpForm.errors?.['mismatch']) {
        this.signUpError = 'Mật khẩu và xác nhận mật khẩu không khớp.';
      }
      return;
    }

    const { name, email, password } = this.signUpForm.value;

    this.authService.signUp(name, email, password).subscribe({
      next: (response: SignUpResponse) => {
        this.signUpError = null;
        alert('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        console.error('Sign-up failed:', error);
        this.signUpError = error.message || 'Đã xảy ra lỗi trong quá trình đăng ký';
        alert(this.signUpError);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  // Getter để dễ truy cập trạng thái form trong template nếu cần
  get f() { return this.signUpForm.controls; }
}