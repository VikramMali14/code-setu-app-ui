import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShowpopupService } from 'src/app/services/showpopup.service';
import { TemplateService } from 'src/app/services/template.service';

@Component({
  selector: 'app-quotaion',
  templateUrl: './quotaion.component.html',
  styleUrls: ['./quotaion.component.css']
})
export class QuotaionComponent implements OnInit {
  templateForm!: FormGroup;
  pdfForm!: FormGroup;
  selectedTemplateFile: File | null = null;
  selectedTemplateFileName = '';
  isUploading = false;
  isDownloading = false;

  templateTypes = ['QUOTATION'];

  constructor(
    private fb: FormBuilder,
    private templateService: TemplateService,
    private showpopup: ShowpopupService
  ) { }

  ngOnInit(): void {
    this.buildForms();
  }

  buildForms(): void {
    this.templateForm = this.fb.group({
      name: ['', Validators.required],
      type: ['QUOTATION', Validators.required],
      isActive: [true],
      file: [null, Validators.required]
    });

    this.pdfForm = this.fb.group({
      shiftingId: ['', [Validators.required, Validators.min(1)]]
    });
  }

  onTemplateFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;

    this.selectedTemplateFile = file;
    this.selectedTemplateFileName = file?.name || '';
    this.templateForm.patchValue({ file });
    this.templateForm.get('file')?.markAsTouched();
    this.templateForm.get('file')?.updateValueAndValidity();
  }

  clearTemplateFile(): void {
    this.selectedTemplateFile = null;
    this.selectedTemplateFileName = '';
    this.templateForm.patchValue({ file: null });
    this.templateForm.get('file')?.updateValueAndValidity();
  }

  createTemplate(): void {
    if (this.templateForm.invalid || !this.selectedTemplateFile) {
      this.templateForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const templatePayload = [{
      name: this.templateForm.value.name,
      type: this.templateForm.value.type,
      isActive: this.templateForm.value.isActive
    }];

    formData.append('file', this.selectedTemplateFile, this.selectedTemplateFile.name);
    formData.append('data', JSON.stringify(templatePayload));

    this.isUploading = true;
    this.templateService.createTemplate(formData).subscribe({
      next: (response: any) => {
        this.showResponse(response, 'Template created successfully');
        this.templateForm.reset({
          type: 'QUOTATION',
          isActive: true
        });
        this.clearTemplateFile();
        this.isUploading = false;
      },
      error: (error) => {
        console.error(error);
        this.showpopup.showError('Unable to create template');
        this.isUploading = false;
      }
    });
  }

  downloadQuotationPdf(): void {
    if (this.pdfForm.invalid) {
      this.pdfForm.markAllAsTouched();
      return;
    }

    const shiftingId = this.pdfForm.value.shiftingId;
    this.isDownloading = true;

    this.templateService.getQuotationPdf(shiftingId).subscribe({
      next: (blob) => {
        this.downloadBlob(blob, `quotation-${shiftingId}.pdf`);
        this.showpopup.showSuccess('Quotation PDF downloaded');
        this.isDownloading = false;
      },
      error: (error) => {
        console.error(error);
        this.showpopup.showError('Unable to generate quotation PDF');
        this.isDownloading = false;
      }
    });
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  private showResponse(response: any, fallbackMessage: string): void {
    if (response?.responseMessege || response?.responseCode) {
      this.showpopup.showResponsePopup(response.responseMessege || fallbackMessage, response.responseCode || 200);
      return;
    }

    this.showpopup.showSuccess(fallbackMessage);
  }

}
