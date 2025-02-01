import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:userapp/pages/home_page.dart';
import 'package:userapp/widgets/loading.dart';

import 'signup_screen.dart';

class SigninScreen extends StatefulWidget {
  const SigninScreen({super.key});

  @override
  State<SigninScreen> createState() => _SigninScreenState();
}

class _SigninScreenState extends State<SigninScreen> {
  TextEditingController _emailController = TextEditingController();
  TextEditingController _passwordController = TextEditingController();

  signinformvalidation() {
    if (_emailController.text.isEmpty) {
      print("Email is empty");
      return;
    }
    if (_passwordController.text.isEmpty) {
      print("Password is empty");
      return;
    } else {
      signInUser();
    }
  }

  signInUser() async {
    showDialog(
      barrierDismissible: false,
      context: context,
      builder: (BuildContext context) =>
          const Loading(messageText: "Signing in..."),
    );
    final User? userFirebase = (await FirebaseAuth.instance
            .signInWithEmailAndPassword(
      email: _emailController.text,
      password: _passwordController.text,
    )
            // ignore: body_might_complete_normally_catch_error
            .catchError((error) {
      Navigator.pop(context);
      print("Error: $error");
    }))
        .user;
    if (!context.mounted) return;
    Navigator.pop(context);
    if (userFirebase != null) {
      Navigator.push(
          context, MaterialPageRoute(builder: (context) => const HomePage()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          children: [
            Image.asset(
              "assets/images/logo.png",
            ),
            const Text(
              "Sign in to your account",
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            Padding(
                padding: const EdgeInsets.all(22.0),
                child: Column(
                  children: [
                    TextField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: InputDecoration(
                          hintText: "Email",
                          labelStyle: TextStyle(color: Colors.grey),
                          labelText: "Email",
                          border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: 20),
                    TextField(
                      controller: _passwordController,
                      keyboardType: TextInputType.visiblePassword,
                      decoration: InputDecoration(
                          hintText: "Password",
                          labelStyle: TextStyle(color: Colors.grey),
                          labelText: "Password",
                          border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () {
                        // Sign in the user
                        // checkIfNetworkIsAvailable();
                        signinformvalidation();
                      },
                      child: const Text("Sign in"),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text("Don't have an account?"),
                        TextButton(
                          onPressed: () {
                            // Navigate to the sign up screen
                            Navigator.push(
                                context,
                                MaterialPageRoute(
                                    builder: (context) => SignupScreen()));
                          },
                          child: const Text("Sign up"),
                        )
                      ],
                    )
                  ],
                ))
          ],
        ),
      ),
    ));
  }
}
