export interface MobileCountry {
  code: string;
  name: string;
  digits: number;
}

// Generic config of allowed mobile digits per country code.
// Used across create/update forms so that when the code changes the
// validation + maxlength adapt automatically.
export const MOBILE_COUNTRIES: MobileCountry[] = [
  { code: '+91', name: 'India (+91)', digits: 10 },
  { code: '+1', name: 'USA (+1)', digits: 10 },
  { code: '+44', name: 'UK (+44)', digits: 10 },
  { code: '+971', name: 'UAE (+971)', digits: 9 },
  { code: '+61', name: 'Australia (+61)', digits: 9 },
  { code: '+65', name: 'Singapore (+65)', digits: 8 },
  { code: '+60', name: 'Malaysia (+60)', digits: 9 },
  { code: '+82', name: 'Korea (+82)', digits: 10 },
  { code: '+81', name: 'Japan (+81)', digits: 10 },
  { code: '+49', name: 'Germany (+49)', digits: 11 },
  { code: '+33', name: 'France (+33)', digits: 9 },
  { code: '+39', name: 'Italy (+39)', digits: 9 },
  { code: '+34', name: 'Spain (+34)', digits: 9 },
  { code: '+55', name: 'Brazil (+55)', digits: 11 },
  { code: '+7', name: 'Russia (+7)', digits: 10 },
  { code: '+86', name: 'China (+86)', digits: 11 }
];

export function getMobileDigits(code: string | null | undefined): number {
  if (!code) return 10;
  const country = MOBILE_COUNTRIES.find(c => {
    if (!code.trim().startsWith('+')) {
      return c.code === `+${code.trim()}`;
    }
    return c.code === code.trim();
  });
  return country?.digits ?? 10;
}