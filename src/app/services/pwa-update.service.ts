import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  constructor(private swUpdate: SwUpdate) {
    if (!swUpdate.isEnabled) return;

    // Prompt user when a new version is available
    swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(() => {
        if (confirm('A new version of Code Setu is available. Reload to update?')) {
          window.location.reload();
        }
      });

    // Check for updates every 6 hours
    setInterval(() => swUpdate.checkForUpdate(), 6 * 60 * 60 * 1000);
  }
}
