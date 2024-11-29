import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServicesService } from '../services/consume.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule, MatSnackBarModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  providers: [MatSnackBar],
})
export class ResetPasswordComponent implements OnInit {
  email: string = '';
  otp: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isLoading = false;
  step: number = 1; // 1 for email input, 2 for OTP and new password input
  otpTimer: number = 60; // Countdown in seconds
  otpResendDisabled: boolean = true;

  constructor(
    private router: Router,
    private serviceService: ServicesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.startOtpTimer();
  }

  // Show a snackbar message
  showSnackbar(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', { duration });
  }

  // Start the OTP resend timer
  startOtpTimer(): void {
    this.otpTimer = 60;
    this.otpResendDisabled = true;
    const timerInterval = setInterval(() => {
      if (this.otpTimer > 0) {
        this.otpTimer--;
      } else {
        clearInterval(timerInterval);
        this.otpResendDisabled = false;
      }
    }, 1000);
  }

  // Handle email submission
  onEmailSubmit(): void {
    if (this.email) {
      this.serviceService
        .postRequest('/api/open/auth/reset-password/request', { email: this.email }, null)
        .subscribe(
          () => {
            this.showSnackbar('OTP has been sent to your email.');
            this.step = 2; // Slide to the next form
            this.startOtpTimer(); // Restart the OTP timer
          },
          (error) => {
            this.showSnackbar('Failed to send OTP. Please try again.');
            console.error('OTP request error:', error);
          }
        );
    }
  }

  // Handle OTP resend
  onResendOtp(): void {
    if (!this.otpResendDisabled) {
      this.serviceService
        .postRequest('/api/open/auth/resend-otp', { email: this.email }, null)
        .subscribe(
          () => {
            this.showSnackbar('OTP resent successfully.');
            this.startOtpTimer();
          },
          (error) => {
            this.showSnackbar('Failed to resend OTP. Please try again.');
            console.error('OTP resend error:', error);
          }
        );
    }
  }

  // Handle password reset submission
  onResetSubmit(): void {
    if (this.otp && this.newPassword && this.newPassword === this.confirmPassword) {
      this.isLoading = true;
      const resetData = {
        email: this.email,
        otp: this.otp,
        newPassword: this.newPassword,
      };

      this.serviceService
        .postRequest('/api/open/auth/reset-password/confirm', resetData, null)
        .subscribe(
          () => {
            this.isLoading = false;
            this.showSnackbar('Password reset successful! Redirecting to login...');
            setTimeout(() => this.router.navigate(['/login']), 3000);
          },
          (error) => {
            this.isLoading = false;
            this.showSnackbar('Failed to reset password. Please try again.');
            console.error('Password reset error:', error);
          }
        );
    } else {
      this.showSnackbar('Please ensure all fields are correctly filled.');
    }
  }

  // Navigate to the home page
  navigateHome(): void {
    this.router.navigate(['/']);
  }
}
