/// WonderWhiz — AI Tutor Bot for Kids
/// Maths / Hindi / Science / Kannada tutor with 8 explanation styles
/// and multi-language voice-over.
library wonderwhiz;

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'api.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const WonderWhizApp());
}

class WonderWhizApp extends StatelessWidget {
  const WonderWhizApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WonderWhiz',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFF97316),
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFFAF7F2),
        fontFamily: 'Nunito',
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            color: Color(0xFF1F2937),
            fontSize: 20,
            fontWeight: FontWeight.w800,
          ),
        ),
        cardTheme: CardTheme(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: BorderSide(color: Colors.black.withOpacity(0.06)),
          ),
          color: Colors.white,
        ),
      ),
      home: const SplashGate(),
    );
  }
}

/// Decides between Login and Home based on saved session token.
class SplashGate extends StatefulWidget {
  const SplashGate({super.key});

  @override
  State<SplashGate> createState() => _SplashGateState();
}

class _SplashGateState extends State<SplashGate> {
  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('ww_session_token');
    // Wait a moment for splash branding, then route
    await Future.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    if (token == null || token.isEmpty) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
      return;
    }
    // Validate token by fetching /api/user
    final user = await WonderWhizApi.fetchUser();
    if (!mounted) return;
    if (user == null) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    } else {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFF97316), Color(0xFFEC4899), Color(0xFF8B5CF6)],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Text('🦉', style: TextStyle(fontSize: 80)),
              SizedBox(height: 12),
              Text(
                'WonderWhiz',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 36,
                  fontWeight: FontWeight.w800,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'AI Tutor for Kids',
                style: TextStyle(color: Colors.white70, fontSize: 16),
              ),
              SizedBox(height: 32),
              CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
