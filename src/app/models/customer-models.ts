export interface CustomerModels {
  customerId?: number;

  firstName?: string;
  lastName?: string;

  mobileNo?: string;
  alternateMobileNo?: string;

  email?: string;
  workEmail?: string;

  shiftCompleted?: boolean;

  shiftFromCity?: string;
  shiftToCity?: string;

  toAddress?: string;
  fromAddress?: string;

  shiftingType?: string;

  shiftingStartDate?: string;   // yyyy-MM-dd
  shiftReachedDate?: string;    // yyyy-MM-dd

  companyId?: number;

  uuid?: string;

  deleteFlag?: boolean;

  shiftings?: Shifting[];
}

export interface Shifting {
  shiftingId?: number;
  itemName?: string;
  quantity?: number;
  remarks?: string;
}