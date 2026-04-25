import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-contect-us',
    standalone: true, 

  templateUrl: './contect-us.component.html',
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    FormsModule
  ],
  styleUrls: ['./contect-us.component.css']
})
export class ContectUsComponent implements OnInit {
  contact = {
    fullName: '',
    email: '',
    message: ''
  };

  supportEmail = 'support@cargosetu.com';

  constructor() { }

  ngOnInit(): void {
  }

  sendMessage(): void {
    const subject = encodeURIComponent(`CargoSetu contact request from ${this.contact.fullName}`);
    const body = encodeURIComponent(
      `Name: ${this.contact.fullName}\n` +
      `Email: ${this.contact.email}\n\n` +
      `Message:\n${this.contact.message}`
    );

    window.location.href = `mailto:${this.supportEmail}?subject=${subject}&body=${body}`;
  }

}
