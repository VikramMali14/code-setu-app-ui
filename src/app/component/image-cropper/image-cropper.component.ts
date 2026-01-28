import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.css']
})
export class ImageCropperComponent {
  @Input() imageChangedEvent: any = '';
  @Output() cropped = new EventEmitter<File>();
  @Output() canceled = new EventEmitter<void>();

  croppedImageBase64: any = '';
  tempBlob: Blob | null = null;

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImageBase64 = event.base64;

    // In ngx-image-cropper v6, we convert base64 to Blob manually for the File object
    if (event.base64) {
      this.tempBlob = this.base64ToBlob(event.base64);
    }
  }

  confirmCrop() {
    if (this.tempBlob) {
      const file = new File([this.tempBlob], 'profile.png', { type: 'image/png' });
      this.cropped.emit(file);
    }
  }

  cancel() {
    this.canceled.emit();
  }

  private base64ToBlob(base64: string): Blob {
    const byteString = atob(base64.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([int8Array], { type: 'image/png' });
  }
  onOverlayClick(event: MouseEvent) {
    // Close modal when clicking outside
    this.cancel();
  }
}
