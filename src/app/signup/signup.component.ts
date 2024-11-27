import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ServicesService } from '../services/consume.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, MatSnackBarModule, HttpClientModule],
  providers: [MatSnackBar],
})
export class SignupComponent {
  isSignIn = false; // Toggle between Sign Up and Sign In forms
  isLoading = false; // Loader status for API calls

  constructor(
    private router: Router,
    private serviceService: ServicesService,
    private sessionService: SessionService,
    private snackBar: MatSnackBar
  ) {}

  // Sign Up Form Fields
  signUpData = {
    fullName: '',
    email: '',
    password: '',
    rePassword: '',
    agreedToTerms: false,
  };

  // Sign In Form Fields
  signInData = {
    email: '',
    password: '',
  };

  /**
   * Toggle between Sign Up and Sign In forms
   */
  toggleForm(): void {
    this.isSignIn = !this.isSignIn;
  }

  /**
   * Navigate back to the home page
   */
  navigateBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Reset the Sign Up form to its initial state
   */
  resetSignUpForm(): void {
    this.signUpData = {
      fullName: '',
      email: '',
      password: '',
      rePassword: '',
      agreedToTerms: false,
    };
  }

  /**
   * Reset the Sign In form to its initial state
   */
  resetSignInForm(): void {
    this.signInData = {
      email: '',
      password: '',
    };
  }

  /**
   * Reusable method to show Snackbar messages
   */
  showSnackbar(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', { duration });
  }

  /**
   * Handle Sign Up form submission
   * @param form - Angular Form object
   */
  onSubmitSignUp(form: NgForm): void {
    if (form.invalid) {
      this.showSnackbar('Please fill out all required fields correctly.');
      return;
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordPattern.test(this.signUpData.password)) {
      this.showSnackbar(
        'Password must have at least 8 characters, including one uppercase letter and one number.',
        5000
      );
      return;
    }

    if (this.signUpData.password !== this.signUpData.rePassword) {
      this.showSnackbar('Passwords do not match!', 3000);
      return;
    }

    this.isLoading = true;

    const formData = {
      fullName: this.signUpData.fullName,
      email: this.signUpData.email,
      password: this.signUpData.password,
    };

    this.serviceService.postRequest('/api/open/auth/register', formData, null).subscribe(
      () => {
        this.isLoading = false;
        this.showSnackbar('Sign up successful!');
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        this.isLoading = false;
        console.error('Sign up error:', error);
        this.showSnackbar('Sign up failed. Please try again.', 5000);
        this.resetSignUpForm();
      }
    );
  }

  /**
   * Handle Sign In form submission
   * @param form - Angular Form object
   */
  onSubmitSignIn(form: NgForm): void {
    if (form.invalid) {
      this.showSnackbar('Please enter valid credentials.');
      return;
    }

    this.isLoading = true;

    const formData = {
      email: this.signInData.email,
      password: this.signInData.password,
    };

    this.serviceService.postRequest('/api/open/auth/login', formData, null).subscribe(
      (response) => {
        this.isLoading = false;
        const { token, id, email } = response;

        if (token && id) {
          this.sessionService.saveToken(token);
          this.sessionService.saveEmail(email);
          this.sessionService.saveId(id);

          this.showSnackbar('Login successful!');
          this.router.navigate(['/dashboard']);
        } else {
          this.showSnackbar('Login failed: Invalid response from server.', 5000);
        }
      },
      (error) => {
        this.isLoading = false;
        this.showSnackbar('Login failed. Please check your credentials.', 5000);
        this.resetSignInForm();
      }
    );
  }
}
