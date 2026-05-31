import 'package:flutter_test/flutter_test.dart';
import 'package:management_myself/main.dart';

void main() {
  testWidgets('App khởi tạo được', (WidgetTester tester) async {
    await tester.pumpWidget(const ManagementMyselfApp());
    expect(find.text('ManagementMyself'), findsOneWidget);
  });
}
