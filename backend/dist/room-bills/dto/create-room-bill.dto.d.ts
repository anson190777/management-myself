export declare class OtherFeeDto {
    name: string;
    amount: number;
}
export declare class CreateRoomBillDto {
    roomId: string;
    billingMonth: string;
    electricityOldReading: number;
    electricityNewReading: number;
    waterOldReading: number;
    waterNewReading: number;
    wifiFee?: number;
    trashFee?: number;
    monthlyRent?: number;
    otherFees?: OtherFeeDto[];
    note?: string;
}
