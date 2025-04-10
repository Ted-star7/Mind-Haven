import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServicesService } from '../services/consume.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { response } from 'express';
import { error } from 'console';


@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, MatSnackBarModule, ReactiveFormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {
  isMenuOpen = false; 

  contactForm: FormGroup;

  email: string ='';
  name: string = '';
  subject: string ='';
  phoneNumber: string ='';
  message: string ='';


  constructor(
    private serviceService: ServicesService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  )
  {
    this.contactForm= this.fb.group({
    name: ['', Validators.required],
    phoneNumber: [''],
    subject: [''],
    email: ['', [Validators.required, Validators.email]],
    message: ['']
  });
  }

 
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  showSnackbar(message:string, duration: number = 3000): void{
    this.snackBar.open(message, 'Close', {duration});
  }
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      const formData = new FormData();
      formData.append('name', this.contactForm.get('name')?.value);
      formData.append('phoneNumber', this.contactForm.get('phoneNumber')?.value);
      formData.append('subject', this.contactForm.get('subject')?.value);
      formData.append('email', this.contactForm.get('email')?.value);
      formData.append('message', this.contactForm.get('message')?.value);

      this.serviceService.postRequest('/api/open/contact-us', formData, null).subscribe(
        response => {
          if (response.success) {
            this.showSnackbar('Your Message has been sent');
            this.contactForm.reset(); // Reset the form only on success
          } else {
            this.showSnackbar('Failed to send Message: ' + response.message);
          }
        },
        error => {
          this.showSnackbar('Failed to send Message');
          console.error('Failed to send Message:', error);
        }
      );
    } else {
      this.showSnackbar('Please ensure all fields are correctly filled.');
    }
  }

}
