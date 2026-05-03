import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '../facades/auth.facade';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  protected authFacade = inject(AuthFacade);

  showPassword = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  devAccounts = [
    { label: 'User',    icon: 'person',          email: 'user1@yardly.ro',    password: '', color: '#3b82f6' },
    { label: 'Manager', icon: 'manage_accounts', email: 'manager1@yardly.ro', password: '', color: '#39E819' },
    { label: 'Admin',   icon: 'shield_person',   email: 'admin@yardly.ro',    password: '', color: '#f97316' },
  ];

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  quickLogin(account: { email: string; password: string }) {
    this.loginForm.setValue({ email: account.email, password: account.password });
    this.authFacade.login({ email: account.email, password: account.password });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authFacade.login(this.loginForm.value);
    }
  }
}
