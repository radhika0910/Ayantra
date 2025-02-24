import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';

class AuthProvider extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final DatabaseReference _dbRef = FirebaseDatabase.instance.ref(); // 🔥 Reference to Firebase Database

  bool get isLoggedIn => _auth.currentUser != null;

  // ✅ Sign Up (Now Saves User Data)
  Future<bool> signUp(String email, String password, String name,int role) async {
    try {
      UserCredential userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      // 🔥 Save user data to Realtime Database
      // Role : 0 = User
      // Role : 1 = Driver
      // Role : 2 = Admin
      await _dbRef.child("users").child(userCredential.user!.uid).set({
        "uid": userCredential.user!.uid,
        "name": name,
        "email": email,
         "role": role, // Now saving role
      });

      notifyListeners();
      return true;
    } catch (e) {
      print("Sign Up Error: $e");
      return false;
    }
  }

  // ✅ Login Function
  Future<bool> login(String email, String password) async {
    try {
      await _auth.signInWithEmailAndPassword(email: email, password: password);
      notifyListeners();
      return true;
    } catch (e) {
      print("Login Error: $e");
      return false;
    }
  }

  Future<void> logout() async {
    await _auth.signOut();
    notifyListeners();
  }
}
