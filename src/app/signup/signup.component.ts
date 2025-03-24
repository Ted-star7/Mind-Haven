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
  isSignIn = false;
  isLoading = false;
  passwordVisible = false; // Toggle for password visibility

  constructor(
    private router: Router,
    private serviceService: ServicesService,
    private sessionService: SessionService,
    private snackBar: MatSnackBar
  ) {}

  // Sign Up and Sign In Form Data
  signUpData = {
    fullName: '',
    email: '',
    password: '',
    rePassword: '',
    agreedToTerms: false,
  };
  signInData = {
    email: '',
    password: '',
  };

  toggleForm(): void {
    this.isSignIn = !this.isSignIn;
  }

  navigateBack(): void {
    this.router.navigate(['/']);
  }

  resetSignUpForm(): void {
    this.signUpData = {
      fullName: '',
      email: '',
      password: '',
      rePassword: '',
      agreedToTerms: false,
    };
  }

  resetSignInForm(): void {
    this.signInData = {
      email: '',
      password: '',
    };
  }

  showSnackbar(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', { duration });
  }

  onSubmitSignUp(form: NgForm): void {
    if (form.invalid) {
      this.showSnackbar('Please fill out all required fields correctly.');
      return;
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordPattern.test(this.signUpData.password)) {
      this.showSnackbar(
        'Password must have at least 8 characters, including one uppercase letter and one number.',
        8000
      );
      return;
    }

    if (this.signUpData.password !== this.signUpData.rePassword) {
      this.showSnackbar('Passwords do not match!', 5000);
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
      const { token, "user id": id, "user email": email } = response;

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



  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}
