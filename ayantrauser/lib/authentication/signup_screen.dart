import 'package:ayantrauser/authentication/signin_screen.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  TextEditingController userPhoneTextEditingController =
      TextEditingController();
  TextEditingController userNameTextEditingController = TextEditingController();
  TextEditingController emailTextEditingController = TextEditingController();
  TextEditingController passwordTextEditingController = TextEditingController();

  Future<void> registerUser() async {
    final email = emailTextEditingController.text.trim();
    final password = passwordTextEditingController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please fill in all fields.")),
      );
      return;
    }

    try {
      await FirebaseAuth.instance
          .createUserWithEmailAndPassword(email: email, password: password);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Account created successfully!")),
      );
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const SignInScreen()),
      );
    } on FirebaseAuthException catch (e) {
      // Handle Firebase-specific errors
      if (e.code == 'weak-password') {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("The password is too weak.")),
        );
      } else if (e.code == 'email-already-in-use') {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("The email is already in use.")),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error: ${e.message}")),
        );
      }
    } catch (e) {
      // Handle other errors
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Column(
            children: [
              Image.asset('assets/images/logo.png'),
              const Text(
                "Create an account",
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
              ),
              Padding(
                padding: const EdgeInsets.all(22),
                child: Column(
                  children: [
                    TextField(
                      controller: userNameTextEditingController,
                      decoration: const InputDecoration(labelText: "User Name"),
                      style: const TextStyle(color: Colors.grey, fontSize: 15),
                    ),
                    const SizedBox(height: 22),
                    TextField(
                      controller: emailTextEditingController,
                      decoration:
                          const InputDecoration(labelText: "User Email"),
                      style: const TextStyle(color: Colors.grey, fontSize: 15),
                    ),
                    const SizedBox(height: 22),
                    TextField(
                      controller: passwordTextEditingController,
                      obscureText: true,
                      decoration: const InputDecoration(labelText: "Password"),
                      style: const TextStyle(color: Colors.grey, fontSize: 15),
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: registerUser,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.purple,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 80, vertical: 10),
                      ),
                      child: const Text("Sign Up"),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Already have an account?"),
                  TextButton(
                    onPressed: () {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                            builder: (context) => const SignInScreen()),
                      );
                    },
                    child: const Text("Login"),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
