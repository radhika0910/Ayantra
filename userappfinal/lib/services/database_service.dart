import 'package:firebase_database/firebase_database.dart';
import '../models/user_model.dart';

class DatabaseService {
  final String uid;
  DatabaseService({required this.uid});

  final DatabaseReference _db = FirebaseDatabase.instance.ref();

  // Save user data
  Future<void> saveUserData(String name, String email) async {
    await _db.child("users/$uid").set({
      "name": name,
      "email": email,
    });
  }

  // Fetch user data
  Future<UserModel?> getUserData() async {
    DataSnapshot snapshot = await _db.child("users/$uid").get();

    if (snapshot.exists) {
      Map<dynamic, dynamic> data = snapshot.value as Map<dynamic, dynamic>;
      return UserModel(uid: uid, email: data["email"], name: data["name"]);
    }
    return null;
  }
}
