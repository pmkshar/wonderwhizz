# WonderWhiz — AI Tutor Bot for Kids

This package contains the **Flutter mobile app source code** for WonderWhiz, an
AI tutor for **Maths, Hindi, Science, and Kannada** (Class 1 to 10) with
**8 explanation styles** and **multi-language voice-over**.

## What's inside

- `flutter/wonderwhiz/` — full Flutter source (Dart + pubspec.yaml + Android + iOS configs)

## Quick start

1. Install Flutter SDK (https://docs.flutter.dev/get-started/install)
2. `cd flutter/wonderwhiz`
3. Edit `lib/api.dart` and set `WonderWhizConfig.baseUrl` to point to your
   running Next.js backend (see the README inside `flutter/wonderwhiz/`).
4. `flutter pub get`
5. `flutter run --release`  (or `flutter build apk --release` / `flutter build ipa --release`)

## Features

- 🦉 Friendly kid-themed UI
- 📚 Maths, 📝 Hindi, 🔬 Science, 🦁 Kannada
- 8 explanation styles: Detailed step-by-step, Concise, Intuitive, Tips & Tricks, Visual, Logic, Code, Humorous
- 🎧 Voice-over in English, Hindi, Kannada
- 🔐 Email/password + Google login (shared with web app)
- 📱 Single codebase for both Android and iOS

## Backend

The Flutter app talks to the Next.js backend (in the parent project). See
`flutter/wonderwhiz/README.md` for the full API contract.

Made with 💛 for curious minds.
