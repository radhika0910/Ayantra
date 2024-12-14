import 'package:flutter/material.dart';

class Loading extends StatelessWidget {
  final String messageText;

  const Loading({super.key, required this.messageText});

  @override
  Widget build(BuildContext context) {
    return Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        backgroundColor: Colors.black87,
        child: Container(
          margin: const EdgeInsets.all(15),
          width: double.infinity,
          decoration: BoxDecoration(
            color: Colors.black87,
            borderRadius: BorderRadius.circular(5),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(children: [
              const SizedBox(
                width: 5,
              ),
              CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.purple),
              ),
              const SizedBox(
                width: 10,
              ),
              Text(
                messageText,
                style: const TextStyle(color: Colors.white, fontSize: 14),
              )
            ]),
          ),
        ));
  }
}
