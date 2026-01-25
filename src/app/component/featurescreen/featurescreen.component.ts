import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

interface Feature {
  icon: string;
  title: string;
  description: string;
}
@Component({
  selector: 'app-featurescreen',
  standalone:true,
  imports:[CommonModule,
    MatButtonModule,
    MatFormFieldModule,
  ],
  templateUrl: './featurescreen.component.html',
  styleUrls: ['./featurescreen.component.css']
})
export class FeaturescreenComponent implements OnInit {

  features: Feature[] = [
    { icon: 'headset_mic', title: '24x7 Tech Support', description: 'Get the help you need anytime, any day.' },
    { icon: 'devices', title: 'Multi-Device Use', description: 'Seamlessly use on mobile, tablet, and desktop.' },
    { icon: 'security', title: 'Secure & Safe Data', description: 'Your data is protected with top-tier security.' },
    { icon: 'touch_app', title: 'Easy to Use Interface', description: 'A simple and intuitive interface for everyone.' },
    { icon: 'people', title: 'Multi-User Login', description: 'Allow multiple staff members to access the system.' },
    { icon: 'request_quote', title: 'Dynamic Quotation', description: 'Generate quotes quickly and dynamically.' },
    { icon: 'receipt_long', title: 'Dynamic Invoice', description: 'Create detailed invoices on the fly.' },
    { icon: 'location_on', title: 'Live Tracking', description: 'Track shipments and deliveries in real-time.' },
    { icon: 'share', title: 'Share Pdf', description: 'Easily share all documents in PDF format.' },
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
