import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Correctly imports the Router class

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // Injecting the router correctly
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  /**
   * Safe Navigation
   * For now, it logs the path since Bilty/Quotation components don't exist yet.
   */
  navigate(path: string): void {
    console.log('CargoSetu Navigating to:', path);
    
    // Check if route exists before navigating to prevent 404
    // If you haven't created the routes yet, just alert for now:
    if (path === 'generate-bilty' || path === 'create-quotation') {
      alert(`The ${path.replace('-', ' ')} module is currently static (Under Construction).`);
    } else {
      this.router.navigate([`/${path}`]);
    }
  }

  /**
   * Logic for special documents
   */
  openOpsDocuments(): void {
    alert('CargoSetu Document Suite: \n• Packing List \n• Money Receipt \n• Transit Insurance');
  }

}