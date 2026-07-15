import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
final firebaseAuthProvider = Provider<FirebaseAuth>((ref) {
  return FirebaseAuth.instance;
});

final authStateProvider = StreamProvider<User?>((ref) {
  return ref.watch(firebaseAuthProvider).authStateChanges();
});

Future<void> signInAnonymously(WidgetRef ref) async {
  try {
    await ref.read(firebaseAuthProvider).signInAnonymously();
  } catch (e) {
    debugPrint('Error signing in anonymously: \$e');
  }
}

Future<void> signInWithGoogle(WidgetRef ref) async {
  try {
    final GoogleSignIn googleSignIn = GoogleSignIn();
    final GoogleSignInAccount? googleUser = await googleSignIn.signIn();

    if (googleUser == null) {
      // The user canceled the sign-in
      return;
    }

    final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

    final OAuthCredential credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    await ref.read(firebaseAuthProvider).signInWithCredential(credential);
  } catch (e) {
    debugPrint('Error signing in with Google: \$e');
    rethrow;
  }
}

Future<void> signOut(WidgetRef ref) async {
  await GoogleSignIn().signOut();
  await ref.read(firebaseAuthProvider).signOut();
}
