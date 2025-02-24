// File generated by FlutterFire CLI.
// ignore_for_file: type=lint
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        return windows;
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyB1LSneLFRRgygc45NO8KOnTsjECd8fQgY',
    appId: '1:688305204112:web:58e917c57d130e521c2115',
    messagingSenderId: '688305204112',
    projectId: 'ayantra-25fa4',
    authDomain: 'ayantra-25fa4.firebaseapp.com',
    databaseURL: 'https://ayantra-25fa4-default-rtdb.asia-southeast1.firebasedatabase.app',
    storageBucket: 'ayantra-25fa4.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyC3FeXqVCvUmVrC3ii4pCJyduUwwJbWHaI',
    appId: '1:688305204112:android:495ea69503db97e61c2115',
    messagingSenderId: '688305204112',
    projectId: 'ayantra-25fa4',
    databaseURL: 'https://ayantra-25fa4-default-rtdb.asia-southeast1.firebasedatabase.app',
    storageBucket: 'ayantra-25fa4.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyCdOn6n7Fl6C71Lv6hanH_tM6T1DGE5hVs',
    appId: '1:688305204112:ios:e49ad42f39b238691c2115',
    messagingSenderId: '688305204112',
    projectId: 'ayantra-25fa4',
    databaseURL: 'https://ayantra-25fa4-default-rtdb.asia-southeast1.firebasedatabase.app',
    storageBucket: 'ayantra-25fa4.firebasestorage.app',
    iosBundleId: 'com.example.userappfinal',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyCdOn6n7Fl6C71Lv6hanH_tM6T1DGE5hVs',
    appId: '1:688305204112:ios:e49ad42f39b238691c2115',
    messagingSenderId: '688305204112',
    projectId: 'ayantra-25fa4',
    databaseURL: 'https://ayantra-25fa4-default-rtdb.asia-southeast1.firebasedatabase.app',
    storageBucket: 'ayantra-25fa4.firebasestorage.app',
    iosBundleId: 'com.example.userappfinal',
  );

  static const FirebaseOptions windows = FirebaseOptions(
    apiKey: 'AIzaSyB1LSneLFRRgygc45NO8KOnTsjECd8fQgY',
    appId: '1:688305204112:web:d5fdcafcbf4dae621c2115',
    messagingSenderId: '688305204112',
    projectId: 'ayantra-25fa4',
    authDomain: 'ayantra-25fa4.firebaseapp.com',
    databaseURL: 'https://ayantra-25fa4-default-rtdb.asia-southeast1.firebasedatabase.app',
    storageBucket: 'ayantra-25fa4.firebasestorage.app',
  );
}
