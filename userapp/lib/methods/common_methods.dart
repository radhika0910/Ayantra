import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';

class CommonMethods {
  checkConnectivity(BuildContext context) async {
    var connectivityResult = await (Connectivity().checkConnectivity());
    if (connectivityResult == ConnectivityResult.none) {
      if (!context.mounted) return;
      displaySnackBar("No internet connection", context);
      return false;
    }
  }

  displaySnackBar(String messageText, BuildContext context) {
    var snackBar = SnackBar(
      content: Text(messageText),
      duration: const Duration(seconds: 3),
    );
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }
}
