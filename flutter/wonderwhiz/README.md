# WonderWhiz — AI Tutor Bot for Kids (Flutter Mobile App)

A friendly AI tutor app for **Maths, Hindi, Science, and Kannada** for kids in **Class K-12**.

## 🆕 New in v2

- 🎯 **Question Bank** — 46+ pre-built questions across all subjects, grades, and maths topics with instant feedback, hints, and explanations
- 📊 **Progress Dashboard** — track questions asked, practice accuracy, current & best streak, achievements, subject/topic breakdowns, 7-day activity chart
- 👨‍👩‍👧 **Parent Dashboard** — parents can link their child's account by email and monitor progress, accuracy, achievements, recent activity
- 🧮 **Math Keyboard** — 6 categories of math symbols (Basic, Powers, Constants, Functions, Calculus, Geometry) with ∫, √, π, θ, sin, cos, ∂, ∞, ∠, ⊥, °, ∑, and more
- 🧭 **8 Maths Topics** — Pre-Algebra, Algebra, Geometry, Trigonometry, Calculus, Statistics, Linear Algebra, Word Problems
- 🏆 **Achievements** — 10 badges (First Question, Curious Mind, Question Conqueror, Practice Rookie, Practice Pro, On a Roll, Unstoppable, Math Explorer, Polyglot, Style Master)
- 🎓 **K-12 Grade Support** — full K-12 scale (Class 1-12)

## ✨ Existing features

- 8 explanation styles per question: Detailed Step-by-Step 📚, Concise ⚡, Intuitive 💡, Tips & Tricks 🎯, Visual & Graphical 📊, Logic & Reasoning 🧠, Code-Based 💻, Humorous 🤣
- Voice-over in English, Hindi, Kannada
- Same backend as the web app — kids log in with the same email & password

---

## 📦 Project structure

```
flutter/
└── wonderwhiz/
    ├── lib/
    │   ├── main.dart
    │   ├── api.dart                       # HTTP client (/api/tutor, /api/tts, /api/practice, etc.)
    │   ├── models/
    │   │   └── models.dart                # Subject, MathsTopic, ExplanationStyle, VoiceOption, MathKeyPad, QuestionBankItem
    │   ├── screens/
    │   │   ├── login_screen.dart          # Email/password + Google sign-in
    │   │   ├── home_screen.dart           # Subject picker, topic picker, math keyboard toggle, question input
    │   │   ├── result_screen.dart         # Markdown answer + audio playback
    │   │   ├── question_bank_screen.dart  # Browse & practice pre-built questions
    │   │   ├── progress_screen.dart       # Student's progress dashboard
    │   │   └── parent_dashboard_screen.dart # Parent view of linked children
    │   └── widgets/
    │       ├── subject_selector.dart
    │       ├── maths_topic_selector.dart
    │       ├── style_selector.dart
    │       ├── voice_picker.dart
    │       └── math_keyboard.dart         # Modal bottom-sheet math keyboard
    ├── android/                           # AndroidManifest.xml (INTERNET + cleartext)
    ├── ios/                               # Info.plist (ATS + Google URL scheme)
    └── pubspec.yaml
```

---

## 🚀 Build & install

### 0. Prerequisites
- Flutter SDK ≥ 3.0 (https://docs.flutter.dev/get-started/install)
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
adb install build/app/outputs/flutter-apk/app-release.apk
```

### 5. Build an IPA (iOS, requires Mac + Xcode)
```bash
flutter build ipa --release
open build/ios/archive/*.xcarchive
```

---

## 🔐 Authentication & Roles

- **Student role** — can ask questions, use the math keyboard, practice in the question bank, and view their progress
- **Parent role** — sees a "My Children" button instead of the tutor; can link child accounts by email and monitor their progress
- Same email & password works on both web and mobile

---

## 🆘 Troubleshooting

| Problem | Fix |
|---------|-----|
| `SocketException` on Android emulator | Make sure the dev server is running on the host (port 3000). Emulator maps `10.0.2.2` to host's localhost. |
| `SocketException` on physical device | Set `baseUrl` to your machine's LAN IP. Both devices must be on the same Wi-Fi. |
| `CLEARTEXT communication` errors | `AndroidManifest.xml` already sets `usesCleartextTraffic="true"`. For production, switch to HTTPS. |
| iOS App Transport Security errors | `Info.plist` includes `NSAllowsArbitraryLoads = true` for development. For production, restrict to HTTPS. |
| Google sign-in not working | See Authentication section in the previous README — requires an extra backend endpoint. |

---

Made with 💛 for curious minds.
