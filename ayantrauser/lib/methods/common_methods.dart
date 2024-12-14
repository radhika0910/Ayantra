import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';

class CommonMethods {
  checkConnectivity(BuildContext context) async {
    var connectivityResult = await Connectivity().checkConnectivity();
    print("Result: $connectivityResult"); // debug
    displaySnakeBar("Connection Status: $connectivityResult", context);
  }

  displaySnakeBar(String messageText, BuildContext context) {
    // display a snackbar
    var snackBar = SnackBar(content: Text(messageText));
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }
}
