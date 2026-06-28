import { Component, Input, OnInit } from '@angular/core';
import { TripService } from 'src/app/services/trip.service';
import { TemplateService } from 'src/app/services/template.service';

@Component({
  selector: 'app-ws-documents',
  templateUrl: './workspace-documents.component.html',
  styleUrls: ['./workspace-documents.component.css']
})
export class WsDocumentsComponent implements OnInit {
  @Input() shiftId: string = '';

  documents: any[] = [];
  tripId: number | null = null;
  isLoading = false;
  isGeneratingPdf = false;
  isUploading = false;
  errorMessage = '';
  successMessage = '';

  selectedFile: File | null = null;
  selectedDocType = 'POD';

  readonly DOC_TYPES = ['POD', 'BOL', 'INVOICE', 'PERMIT', 'INSURANCE', 'CHALLAN', 'E_WAY_BILL', 'OTHER'];

  constructor(
    private tripService: TripService,
    private templateService: TemplateService
  ) {}

  ngOnInit(): void {
    if (this.shiftId) this.loadTripThenDocs();
  }

  loadTripThenDocs(): void {
    this.isLoading = true;
    this.tripService.getTrips(0, 100).subscribe({
      next: (res) => {
        const all = res?.data?.content ?? res?.dataList ?? res?.data ?? [];
        const list = Array.isArray(all) ? all : [];
        const trip = list.find((t: any) =>
          String(t.shiftingId) === String(this.shiftId)
          || String(t.shiftId) === String(this.shiftId)
        );
        if (trip?.tripId) {
          this.tripId = trip.tripId;
          this.loadDocuments();
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.errorMessage = 'Unable to load trip.';
        this.isLoading = false;
      }
    });
  }

  loadDocuments(): void {
    if (!this.tripId) return;
    this.tripService.getDocumentsByTrip(this.tripId).subscribe({
      next: (res) => {
        const raw = res?.data?.content ?? res?.dataList ?? res?.data ?? res;
        this.documents = Array.isArray(raw) ? raw : [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load documents.';
        this.isLoading = false;
      }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
  }

  uploadDocument(): void {
    if (!this.selectedFile || !this.tripId) return;
    this.isUploading = true;
    this.tripService.uploadDocument(this.tripId, this.selectedDocType, this.selectedFile).subscribe({
      next: () => {
        this.isUploading = false;
        this.selectedFile = null;
        this.successMessage = 'Document uploaded.';
        this.loadDocuments();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.isUploading = false;
        this.errorMessage = 'Upload failed.';
      }
    });
  }

  downloadDocument(doc: any): void {
    this.tripService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName || `document-${doc.id}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.errorMessage = 'Download failed.'
    });
  }

  deleteDocument(doc: any): void {
    if (!confirm(`Delete "${doc.fileName || 'this document'}"?`)) return;
    this.tripService.deleteDocument(doc.id).subscribe({
      next: () => { this.loadDocuments(); this.successMessage = 'Document deleted.'; setTimeout(() => this.successMessage = '', 3000); },
      error: () => this.errorMessage = 'Delete failed.'
    });
  }

  generatePdf(type: 'quotation' | 'invoice' | 'lr-copy' | 'item-list'): void {
    this.isGeneratingPdf = true;
    this.errorMessage = '';
    const call = type === 'quotation' ? this.templateService.getQuotationPdf(this.shiftId)
      : type === 'invoice' ? this.templateService.getInvoicePdf(this.shiftId)
      : type === 'lr-copy' ? this.templateService.getLRCopyPdf(this.shiftId)
      : this.templateService.getItemListPdf(this.shiftId);

    call.subscribe({
      next: (blob) => {
        this.isGeneratingPdf = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-${this.shiftId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.successMessage = `${type} PDF downloaded.`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.isGeneratingPdf = false;
        this.errorMessage = `Unable to generate ${type} PDF.`;
      }
    });
  }
}
