export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

export interface AccountBank {
  _id: string;
  customerCode: string;
  customerName: string;
  bank: string;
  accountNumber: string;
  isDefault: boolean;
}

export interface Room {
  _id: string;
  name: string;
  nameUser: string;
  monthlyRent: number;
  electricityUnitPrice: number;
  waterUnitPrice: number;
  wifiFee: number;
  trashFee: number;
  isActive: boolean;
}

export interface OtherFee {
  name: string;
  amount: number;
}

export interface RoomBill {
  _id: string;
  roomId: string | Room;
  billingMonth: string;
  electricityOldReading: number;
  electricityNewReading: number;
  waterOldReading: number;
  waterNewReading: number;
  electricityAmount: number;
  waterAmount: number;
  wifiFee: number;
  trashFee: number;
  monthlyRent: number;
  totalAmount: number;
  note?: string;
  otherFees?: OtherFee[];
}
