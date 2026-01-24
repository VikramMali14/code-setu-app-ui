// ... other imports

import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isLoading" class="loader-container">
      <div class="loader"></div>
    </div>
  `,
  styles: [`
    .loader-container {
      /* Cover the entire viewport */
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh; /* Changed from 100px to 100vh */
      
      /* Center the loader within the container */
      display: flex;
      justify-content: center;
      align-items: center;

      /* Add the blur effect and a slight tint */
      backdrop-filter: blur(4px); 
      background-color: rgba(0, 0, 0, 0.1); 
      z-index: 9999; /* Ensure it's on top of everything else */
    }
    .loader {
      /* Your existing loader animation styles */
      width: 40px;
      height: 40px;
      --c: no-repeat linear-gradient(orange 0 0);
      background: var(--c), var(--c), var(--c), var(--c);
      background-size: 21px 21px;
      animation: l5 1.5s infinite cubic-bezier(0.3, 1, 0, 1);
    }
    @keyframes l5 {
      0%   { background-position: 0 0, 100% 0, 100% 100%, 0 100% }
      33%  { background-position: 0 0, 100% 0, 100% 100%, 0 100%; width: 60px; height: 60px }
      66%  { background-position: 100% 0, 100% 100%, 0 100%, 0 0; width: 60px; height: 60px }
      100% { background-position: 100% 0, 100% 100%, 0 100%, 0 0 }
    }
  `]
})
export class LoaderComponent {
  @Input() isLoading: boolean = true;
  @Input() set loading(value: boolean) {
    this.isLoading = value;
  }
}


