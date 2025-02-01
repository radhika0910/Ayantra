import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';
import 'package:userapp/authentication/signin_screen.dart';
import 'package:userapp/pages/home_page.dart';
import 'package:userapp/widgets/loading.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  TextEditingController _emailController = TextEditingController();
  TextEditingController _passwordController = TextEditingController();
  TextEditingController _nameController = TextEditingController();
  TextEditingController _phoneController = TextEditingController();

  validateForm() {
    if (_emailController.text.isEmpty) {
      print("Email is empty");
      return;
    }
    if (_passwordController.text.isEmpty) {
      print("Password is empty");
      return;
    }
    if (_nameController.text.isEmpty) {
      print("Name is empty");
      return;
    }
    if (_phoneController.text.isEmpty) {
      print("Phone is empty");
      return;
    }
    registerUser();
  }

  registerUser() async {
    showDialog(
      barrierDismissible: false,
      context: context,
      builder: (BuildContext context) =>
          Loading(messageText: "Creating account..."),
    );

    final User? userFirebase = (await FirebaseAuth.instance
            .createUserWithEmailAndPassword(
      email: _emailController.text,
      password: _passwordController.text,
    )
            // ignore: body_might_complete_normally_catch_error
            .catchError((error) {
      Navigator.pop(context);
      print("Error: $error");
    }))
        .user;

    Navigator.pop(context);

    if (userFirebase != null) {
      print("User created successfully");
      Navigator.push(
          context, MaterialPageRoute(builder: (context) => HomePage()));
    } else {
      print("User creation failed");
    }
    DatabaseReference userRef =
        FirebaseDatabase.instance.ref().child("users").child(userFirebase!.uid);
    Map userMap = {
      "name": _nameController.text.trim(),
      "email": _emailController.text.trim(),
      "phone": _phoneController.text.trim(),
      "id": userFirebase.uid,
      "blockStatus": false,
    };
    userRef.set(userMap);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: SingleChildScrollView(
            child: Padding(
      padding: const EdgeInsets.all(8.0),
      child: Column(
        children: [
          Image.asset("assets/images/logo.png"),
          Text(
            "Create a new account",
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          Padding(
            padding: const EdgeInsets.all(22),
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
                TextField(
                  controller: _passwordController,
                  keyboardType: TextInputType.visiblePassword,
                  decoration: InputDecoration(
                      hintText: "Password",
                      labelStyle: TextStyle(color: Colors.grey),
                      labelText: "Password",
                      border: OutlineInputBorder()),
                ),
                TextField(
                  controller: _nameController,
                  keyboardType: TextInputType.text,
                  decoration: InputDecoration(
                      hintText: "Name",
                      labelStyle: TextStyle(color: Colors.grey),
                      labelText: "Name",
                      border: OutlineInputBorder()),
                ),
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(
                      hintText: "Phone",
                      labelStyle: TextStyle(color: Colors.grey),
                      labelText: "Phone",
                      border: OutlineInputBorder()),
                ),
                SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    validateForm();
                  },
                  child: Text("Sign Up"),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      padding:
                          EdgeInsets.symmetric(horizontal: 100, vertical: 20),
                      textStyle: TextStyle(fontSize: 20)),
                ),
                SizedBox(height: 20),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => SigninScreen()));
                  },
                  child: Text("Already have an account? Sign In"),
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.blue,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    )));
  }
}
