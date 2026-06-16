# WonderWhiz — AI Tutor Bot for Kids (Flutter Mobile App)

A friendly AI tutor app for **Maths, Hindi, Science, and Kannada** for kids in **Class 1 to 10**.

It comes with **8 different explanation styles** for every question:

1. 📚 Detailed Step-by-Step
2. ⚡ Concise Answer
3. 💡 Intuitive Explanation
4. 🎯 Tips & Tricks
5. 📊 Visual & Graphical
6. 🧠 Logic & Reasoning
7. 💻 Code-Based
8. 🤣 Humorous

…plus **voice-over in English, Hindi, and Kannada**.

The Flutter app talks to the **same backend** as the Next.js web app, so kids
can use the same email & password everywhere.

---

## 📦 Project structure

```
flutter/
└── wonderwhiz/
    ├── lib/
    │   ├── main.dart               ← App entry + splash + routing
    │   ├── api.dart                ← HTTP client (/api/tutor, /api/tts, /api/user, NextAuth)
    │   ├── models/
    │   │   └── models.dart         ← Subject, ExplanationStyle, VoiceOption, color helpers
    │   ├── screens/
    │   │   ├── login_screen.dart   ← Email/password + Google sign-in
    │   │   ├── home_screen.dart    ← Subject picker, question input, style picker, voice picker
    │   │   └── result_screen.dart  ← Markdown answer + audio playback
    │   └── widgets/
    │       ├── subject_selector.dart
    │       ├── style_selector.dart
    │       └── voice_picker.dart
    ├── android/                    ← AndroidManifest.xml (INTERNET permission + cleartext)
    ├── ios/                        ← Info.plist (NSAppTransportSecurity, Google URL scheme)
    └── pubspec.yaml                ← Flutter dependencies
```

---

## 🚀 Build & install

### 0. Prerequisites

- Flutter SDK ≥ 3.0 (install: https://docs.flutter.dev/get-started/install)
- For Android: Android Studio + Android SDK
- For iOS: macOS + Xcode + CocoaPods

### 1. Configure the backend URL

Open `lib/api.dart` and set `WonderWhizConfig.baseUrl`:

```dart
/// For Android emulator: 'http://10.0.2.2:3000'
/// For iOS simulator:    'http://localhost:3000'
/// For physical device:  'http://<YOUR_LAN_IP>:3000'  e.g. http://192.168.1.5:3000
/// For production:       'https://your-app.example.com'
static const String baseUrl = 'http://10.0.2.2:3000';
```

### 2. Install dependencies

```bash
cd flutter/wonderwhiz
flutter pub get
```

### 3. Run on a device/emulator

```bash
flutter run --release
```

### 4. Build a release APK (Android)

```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
adb install build/app/outputs/flutter-apk/app-release.apk
```

### 5. Build an IPA (iOS, requires Mac + Xcode)

```bash
flutter build ipa --release
# Output: build/ios/ipa/wonderwhiz.ipa
open build/ios/archive/*.xcarchive   # then distribute via Xcode Organizer
```

---

## 🔐 Authentication

The app supports **email/password** and **Google sign-in**.

- Email/password goes through NextAuth's `/api/auth/callback/credentials` endpoint.
  The session cookie is stored on-device via `shared_preferences` and sent with
  every subsequent API call.
- Google sign-in uses the `google_sign_in` package. Because NextAuth's Google
  provider requires a server-side OAuth callback, the simplest flow is:
  1. User taps "Continue with Google" on the **web app** (which handles the full
     OAuth round-trip with NextAuth).
  2. After the web login completes, the same email & password-less session token
     is reused by the app.
  
  For a fully native Google sign-in, replace `_doGoogle()` in
  `lib/screens/login_screen.dart` with the official `google_sign_in` flow that
  sends the Google ID token to a custom `/api/auth/google-native` endpoint you
  add to the Next.js backend. See:
  https://next-auth.js.org/tutorials/nextauth-google-native

---

## 🎧 Voice-over

The app calls `/api/tts` on the backend, which uses `z-ai-web-dev-sdk` to
generate a WAV audio file. The file is played locally via `audioplayers`.

The first ~1200 characters of the answer are read aloud — long enough for most
exam answers while keeping latency reasonable.

---

## 🆘 Troubleshooting

| Problem | Fix |
|---------|-----|
| `SocketException: Connection refused` on Android emulator | Make sure the dev server is running on the host (`bun run dev` on port 3000). The emulator maps `10.0.2.2` to host's localhost. |
| `SocketException` on physical device | Set `baseUrl` to your machine's LAN IP (e.g. `http://192.168.1.5:3000`). Both devices must be on the same Wi-Fi. |
| `CLEARTEXT communication to ... not permitted` | The included `AndroidManifest.xml` already sets `android:usesCleartextTraffic="true"`. For production, switch to HTTPS. |
| iOS App Transport Security errors | `Info.plist` includes `NSAllowsArbitraryLoads = true` for development. For production, restrict to your HTTPS domain. |
| Google sign-in not working | See the Authentication section above — native Google sign-in requires an additional `/api/auth/google-native` endpoint on the backend. |
| TTS audio is silent | Wait for the audio to fully load (button shows "Generating..."). The first call may take 10-20 seconds depending on the answer length. |

---

Made with 💛 for curious minds.
