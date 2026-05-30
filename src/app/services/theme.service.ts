import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppThemeSettings {
  mode: ThemeMode;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
}

export const DEFAULT_THEME_SETTINGS: AppThemeSettings = {
  mode: 'light',
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  accentColor: '#e94e77',
  fontFamily: 'Roboto, "Helvetica Neue", sans-serif'
};

const THEME_STORAGE_KEY = 'cargo_setu_theme_settings';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly settingsSubject = new BehaviorSubject<AppThemeSettings>(this.getStoredSettings());
  readonly settings$ = this.settingsSubject.asObservable();

  initialize(): void {
    this.applyTheme(this.settingsSubject.value);
  }

  get settings(): AppThemeSettings {
    return this.settingsSubject.value;
  }

  updateTheme(partial: Partial<AppThemeSettings>): void {
    const nextSettings = {
      ...this.settingsSubject.value,
      ...partial
    };

    this.settingsSubject.next(nextSettings);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(nextSettings));
    this.applyTheme(nextSettings);
  }

  resetTheme(): void {
    localStorage.removeItem(THEME_STORAGE_KEY);
    this.settingsSubject.next(DEFAULT_THEME_SETTINGS);
    this.applyTheme(DEFAULT_THEME_SETTINGS);
  }

  private getStoredSettings(): AppThemeSettings {
    try {
      const storedValue = localStorage.getItem(THEME_STORAGE_KEY);
      if (!storedValue) {
        return DEFAULT_THEME_SETTINGS;
      }

      return {
        ...DEFAULT_THEME_SETTINGS,
        ...JSON.parse(storedValue)
      };
    } catch (error) {
      console.error('Unable to load saved theme settings:', error);
      return DEFAULT_THEME_SETTINGS;
    }
  }

  private applyTheme(settings: AppThemeSettings): void {
    const root = document.documentElement;
    const resolvedMode = this.resolveMode(settings.mode);
    const isDark = resolvedMode === 'dark';

    root.style.setProperty('--app-primary', settings.primaryColor);
    root.style.setProperty('--app-secondary', settings.secondaryColor);
    root.style.setProperty('--app-accent', settings.accentColor);
    root.style.setProperty('--app-font-family', settings.fontFamily);
    root.style.setProperty('--app-header-gradient', `linear-gradient(90deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 50%, ${settings.accentColor} 100%)`);
    root.style.setProperty('--app-sidebar-gradient', `linear-gradient(180deg, ${settings.primaryColor}, ${settings.secondaryColor}, ${settings.accentColor})`);
    root.style.setProperty('--app-action-gradient', `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 100%)`);
    root.style.setProperty('--app-primary-soft', this.hexToRgba(settings.primaryColor, 0.1));
    root.style.setProperty('--app-primary-shadow', this.hexToRgba(settings.primaryColor, 0.35));

    root.style.setProperty('--app-bg', isDark ? '#111827' : '#f4f6f9');
    root.style.setProperty('--app-surface', isDark ? '#1f2937' : '#ffffff');
    root.style.setProperty('--app-surface-muted', isDark ? '#273449' : '#f8fafc');
    root.style.setProperty('--app-text', isDark ? '#f9fafb' : '#2d3748');
    root.style.setProperty('--app-muted-text', isDark ? '#cbd5e1' : '#718096');
    root.style.setProperty('--app-border', isDark ? '#374151' : '#e2e8f0');

    document.body.classList.toggle('app-dark-theme', isDark);
    document.body.classList.toggle('app-light-theme', !isDark);
  }

  private resolveMode(mode: ThemeMode): 'light' | 'dark' {
    if (mode !== 'system') {
      return mode;
    }

    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private hexToRgba(hex: string, opacity: number): string {
    const normalized = hex.replace('#', '');
    const fullHex = normalized.length === 3
      ? normalized.split('').map((char) => char + char).join('')
      : normalized;

    const red = parseInt(fullHex.substring(0, 2), 16);
    const green = parseInt(fullHex.substring(2, 4), 16);
    const blue = parseInt(fullHex.substring(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  }
}
