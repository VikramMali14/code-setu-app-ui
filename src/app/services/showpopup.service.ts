import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ShowpopupService {

  constructor(private snackBar: MatSnackBar) { }

  private display(message: string, type: 'success' | 'error' | 'info') {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`pop-${type}`] // This applies the CSS class
    });
  }

  private getThemeByCode(code: number): 'success' | 'error' | 'info' {
    const codeStr = code?.toString() || '';
    
    if (codeStr === '200' || codeStr === '201') {
      return 'success'; // Green
    } else if (['400', '401', '403', '404', '409', '500', '502', '503'].includes(codeStr)) {
      return 'error';   // Red
    } else {
      return 'info';    // Blue
    }
  }

  showResponsePopup(message: any, code: number) {
    const theme = this.getThemeByCode(code);
    const displayMessage = message?.toString() || "No message provided";
    this.display(displayMessage, theme);
  }

  // Helper methods for direct use
  showSuccess(message: string) {
    this.display(message, 'success');
  }

  showError(message: string) {
    this.display(message, 'error');
  }

  showInfo(message: string) {
    this.display(message, 'info');
  }
}