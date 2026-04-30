export interface company {
  companyId?: number;
  companyName: string;
  companyEmail: string;
  whatsappNumber: number;
  contactNo1: number;
  contactNo2?: number;
  landlineNo?: string;
  tollFreeNumber?: string;
  panNumber: string;
  gstNumber: string;
  address: string;
  country: string;
  state: string;
  city: string;
  branch?: string;
  mainBranch?: string;
  companyUUID?: string;
  isActive?: boolean;
}
