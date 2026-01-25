import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'cargo-set-ui';
  showScrollButton = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    // Show button when user scrolls down 300px from top
    this.showScrollButton = window.pageYOffset > 300;
  }
   scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
