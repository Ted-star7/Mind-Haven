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
  contactForm: FormGroup;

  email: string ='';
  name: string = '';
  phoneNumber: string ='';
  message: string ='';


  constructor(
    private serviceService: ServicesService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ){
    this.contactForm= this.fb.group({
    name: ['', Validators.required],
    phone: [''],
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

  onSubmit(): void{
    if(this.contactForm.valid){
      this.serviceService.postRequest('/api/contact', this.contactForm.valid, null).subscribe(
        response =>{
          this.showSnackbar('Your Message has been sent')
        },
        error => {
          this.showSnackbar('Failed to send OTP. Please try again.');
          console.error('OTP request error:', error);
        }
      )
    }
    else{
      this.showSnackbar('Please ensure all fields are correctly filled.')
    }
    this.contactForm.reset();
  }

}
