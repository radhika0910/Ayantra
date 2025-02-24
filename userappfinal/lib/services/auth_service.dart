import 'package:firebase_auth/firebase_auth.dart';
import '../models/user_model.dart';
import 'database_service.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // Sign Up
  Future<UserModel?> signUp(String email, String password, String name) async {
    try {
      UserCredential result = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      User? user = result.user;

      if (user != null) {
        // Save user info to database
        await DatabaseService(uid: user.uid).saveUserData(name, email);
        return UserModel(uid: user.uid, email: email, name: name);
      }
    } catch (e) {
      print("Sign Up Error: $e");
    }
    return null;
  }

  // Login
  Future<UserModel?> login(String email, String password) async {
    try {
      UserCredential result = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      User? user = result.user;

      if (user != null) {
        return await DatabaseService(uid: user.uid).getUserData();
      }
    } catch (e) {
      print("Login Error: $e");
    }
    return null;
  }

  // Logout
  Future<void> logout() async {
    await _auth.signOut();
  }
}
