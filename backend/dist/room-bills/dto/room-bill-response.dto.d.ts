export declare class OtherFeeResponseDto {
    name: string;
    amount: number;
}
export declare class RoomBillResponseDto {
    _id: string;
    roomId: string;
    billingMonth: string;
    electricityOldReading: number;
    electricityNewReading: number;
    electricityUsed: number;
    waterOldReading: number;
    waterNewReading: number;
    waterUsed: number;
    electricityAmount: number;
    waterAmount: number;
    wifiFee: number;
    trashFee: number;
    monthlyRent: number;
    otherFees: OtherFeeResponseDto[];
    note: string;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
}
