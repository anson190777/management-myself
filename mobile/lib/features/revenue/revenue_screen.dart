import 'package:flutter/material.dart';

class RevenueScreen extends StatelessWidget {
  const RevenueScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.payments, size: 48),
            SizedBox(height: 16),
            Text('Doanh thu', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600)),
            SizedBox(height: 8),
            Text(
              'Coming soon — sẽ triển khai sau (giống web).',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
