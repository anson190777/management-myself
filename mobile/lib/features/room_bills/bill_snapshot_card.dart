import 'package:flutter/material.dart';

import '../../models/api_models.dart';
import '../../theme/app_theme.dart';
import '../../utils/format.dart';
import '../../widgets/app_card.dart';

/// Nội dung chụp ảnh / chia sẻ — parity web preview modal.
class BillSnapshotCard extends StatelessWidget {
  const BillSnapshotCard({
    super.key,
    required this.bill,
    required this.tenantName,
    required this.room,
    this.qrImage,
  });

  final RoomBill bill;
  final String tenantName;
  final Room? room;
  final Widget? qrImage;

  String _electricityAmountLine() {
    if (room == null) return formatCurrencyVnd(bill.electricityAmount);
    return formatUsageAmountFormula(
      used: bill.electricityUsed,
      unitPrice: room!.electricityUnitPrice,
      amount: bill.electricityAmount,
    );
  }

  String _waterAmountLine() {
    if (room == null) return formatCurrencyVnd(bill.waterAmount);
    return formatUsageAmountFormula(
      used: bill.waterUsed,
      unitPrice: room!.waterUnitPrice,
      amount: bill.waterAmount,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Hoá đơn tiền phòng',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          DetailRow(label: 'Người thuê', value: tenantName, bold: true),
          DetailRow(label: 'Phòng', value: bill.roomName ?? room?.name ?? '—'),
          DetailRow(label: 'Tháng', value: bill.billingMonth, bold: true),
          const Divider(height: 24),
          DetailRow(
            label: 'Điện',
            value: formatMeterReadingLine(
              oldReading: bill.electricityOldReading,
              newReading: bill.electricityNewReading,
              used: bill.electricityUsed,
            ),
          ),
          DetailRow(
            label: 'Nước',
            value: formatMeterReadingLine(
              oldReading: bill.waterOldReading,
              newReading: bill.waterNewReading,
              used: bill.waterUsed,
            ),
          ),
          const SizedBox(height: 8),
          DetailRow(label: 'Tiền thuê', value: formatCurrencyVnd(bill.monthlyRent)),
          DetailRow(label: 'Tiền điện', value: _electricityAmountLine()),
          DetailRow(label: 'Tiền nước', value: _waterAmountLine()),
          DetailRow(label: 'Phí wifi', value: formatCurrencyVnd(bill.wifiFee)),
          DetailRow(label: 'Phí rác', value: formatCurrencyVnd(bill.trashFee)),
          if (bill.otherFees.isNotEmpty)
            DetailRow(
              label: 'Phí phát sinh',
              value: bill.otherFees
                  .map((f) => '${f.name}: ${formatCurrencyVnd(f.amount)}')
                  .join(' | '),
            ),
          if (bill.note != null && bill.note!.isNotEmpty)
            DetailRow(label: 'Ghi chú', value: bill.note!),
          const Divider(height: 20),
          Text(
            'Tổng tiền: ${formatCurrencyVnd(bill.totalAmount)}',
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
            ),
          ),
          if (qrImage != null) ...[
            const SizedBox(height: 20),
            const Text(
              'Mã QR thanh toán',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            Center(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(8),
                  child: qrImage,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
