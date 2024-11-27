import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  email: string = '';
  otp: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  step: number = 1; // 1 for email input, 2 for OTP and new password input

  // On submitting the email form
  onEmailSubmit(): void {
    if (this.email) {
      // Simulate sending OTP
      this.step = 2; // Slide to the next form
    }
  }

  // On submitting the reset form
  onResetSubmit(): void {
    if (
      this.otp &&
      this.newPassword &&
      this.newPassword === this.confirmPassword
    ) {
      // Simulate password reset logic here
      alert('Password reset successful!');
    }
  }
}
