import 'dart:math';

import 'package:flutter/material.dart';
import 'package:userapp/pages/home_page.dart';

class WaitingScreen extends StatefulWidget {
  final String driverName;

  const WaitingScreen({Key? key, required this.driverName}) : super(key: key);

  @override
  _WaitingScreenState createState() => _WaitingScreenState();
}

class _WaitingScreenState extends State<WaitingScreen> {
  late int otp;

  @override
  void initState() {
    super.initState();
    otp = Random().nextInt(9000) + 1000; // Generate random 4-digit OTP
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Waiting for Driver")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text("Driver: ${widget.driverName}",
                style:
                    const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            const CircularProgressIndicator(),
            const SizedBox(height: 20),
            Text("OTP: $otp",
                style:
                    const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (context) => const HomePage()),
                  (route) => false, // Remove all previous screens
                );
              },
              child: const Text("Cancel Ride"),
            ),
          ],
        ),
      ),
    );
  }
}
