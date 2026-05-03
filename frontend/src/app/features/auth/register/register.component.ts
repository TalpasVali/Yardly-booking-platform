import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFacade } from '../facades/auth.facade';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  protected authFacade = inject(AuthFacade);

  showPassword = false;

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['user'],
    terms: [false, [Validators.requiredTrue]],
  });

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  setRole(role: 'user' | 'manager') {
    this.registerForm.patchValue({ role });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { fullName, email, password, role } = this.registerForm.value;
      this.authFacade.register({ fullName, email, password, role });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
