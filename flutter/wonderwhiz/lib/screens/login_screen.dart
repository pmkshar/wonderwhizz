import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../api.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController = TabController(length: 2, vsync: this);
  bool _loading = false;

  // login fields
  final _loginEmail = TextEditingController();
  final _loginPassword = TextEditingController();

  // register fields
  final _regName = TextEditingController();
  final _regEmail = TextEditingController();
  final _regPassword = TextEditingController();
  int _regGrade = 8;

  @override
  void dispose() {
    _tabController.dispose();
    _loginEmail.dispose();
    _loginPassword.dispose();
    _regName.dispose();
    _regEmail.dispose();
    _regPassword.dispose();
    super.dispose();
  }

  Future<void> _doLogin() async {
    final email = _loginEmail.text.trim();
    final password = _loginPassword.text;
    if (email.isEmpty || password.isEmpty) {
      _toast('Please enter email and password');
      return;
    }
    setState(() => _loading = true);
    final ok = await WonderWhizApi.loginWithEmail(email: email, password: password);
    if (!mounted) return;
    setState(() => _loading = false);
    if (ok) {
      _goHome();
    } else {
      _toast('Wrong email or password');
    }
  }

  Future<void> _doRegister() async {
    final name = _regName.text.trim();
    final email = _regEmail.text.trim();
    final password = _regPassword.text;
    if (name.isEmpty || email.isEmpty || password.length < 6) {
      _toast('Fill all fields. Password must be 6+ characters.');
      return;
    }
    setState(() => _loading = true);
    final res = await WonderWhizApi.register(
      name: name,
      email: email,
      password: password,
      grade: _regGrade,
    );
    if (!mounted) return;
    if (res['ok'] == true) {
      // Auto-login
      final ok = await WonderWhizApi.loginWithEmail(email: email, password: password);
      setState(() => _loading = false);
      if (ok) {
        _goHome();
      } else {
        _toast('Account created! Please log in.');
        _tabController.index = 0;
        _loginEmail.text = email;
      }
    } else {
      setState(() => _loading = false);
      _toast(res['error'] ?? 'Registration failed');
    }
  }

  Future<void> _doGoogle() async {
    setState(() => _loading = true);
    try {
      final google = GoogleSignIn(scopes: ['email', 'profile']);
      final account = await google.signIn();
      if (account == null) {
        setState(() => _loading = false);
        return;
      }
      // For Google sign-in, we need to exchange the id token with the backend.
      // For simplicity, this client prompts the user to log in via web first,
      // OR you can wire up the NextAuth Google callback URL via a WebView.
      // Here we just inform the user.
      _toast('Google sign-in: please use the same Google account on the web app, then come back and sign in with email/password.');
      await google.signOut();
    } catch (e) {
      _toast('Google sign-in failed: $e');
    }
    if (!mounted) return;
    setState(() => _loading = false);
  }

  void _goHome() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const HomeScreen()),
    );
  }

  void _toast(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFFFEDD5), Color(0xFFFFE4E6), Color(0xFFF3E8FF)],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 460),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('🦉', style: TextStyle(fontSize: 64)),
                    const SizedBox(height: 8),
                    const Text(
                      'WonderWhiz',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'AI Tutor for Maths, Hindi, Science & Kannada',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.black54),
                    ),
                    const SizedBox(height: 24),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          children: [
                            TabBar(
                              controller: _tabController,
                              tabs: const [
                                Tab(text: 'Log In'),
                                Tab(text: 'Register'),
                              ],
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              height: 320,
                              child: TabBarView(
                                controller: _tabController,
                                children: [
                                  // LOGIN
                                  Column(
                                    children: [
                                      TextField(
                                        controller: _loginEmail,
                                        keyboardType: TextInputType.emailAddress,
                                        decoration: const InputDecoration(
                                          labelText: 'Email',
                                          prefixIcon: Icon(Icons.email_outlined),
                                          border: OutlineInputBorder(),
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      TextField(
                                        controller: _loginPassword,
                                        obscureText: true,
                                        decoration: const InputDecoration(
                                          labelText: 'Password',
                                          prefixIcon: Icon(Icons.lock_outline),
                                          border: OutlineInputBorder(),
                                        ),
                                      ),
                                      const SizedBox(height: 16),
                                      SizedBox(
                                        width: double.infinity,
                                        height: 50,
                                        child: FilledButton(
                                          onPressed: _loading ? null : _doLogin,
                                          child: _loading
                                              ? const CircularProgressIndicator(strokeWidth: 2, color: Colors.white)
                                              : const Text('Log In & Start Learning'),
                                        ),
                                      ),
                                    ],
                                  ),
                                  // REGISTER
                                  SingleChildScrollView(
                                    child: Column(
                                      children: [
                                      TextField(
                                        controller: _regName,
                                        decoration: const InputDecoration(
                                          labelText: "Kid's Name",
                                          prefixIcon: Icon(Icons.person_outline),
                                          border: OutlineInputBorder(),
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      TextField(
                                        controller: _regEmail,
                                        keyboardType: TextInputType.emailAddress,
                                        decoration: const InputDecoration(
                                          labelText: 'Parent Email',
                                          prefixIcon: Icon(Icons.email_outlined),
                                          border: OutlineInputBorder(),
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      TextField(
                                        controller: _regPassword,
                                        obscureText: true,
                                        decoration: const InputDecoration(
                                          labelText: 'Password (min 6)',
                                          prefixIcon: Icon(Icons.lock_outline),
                                          border: OutlineInputBorder(),
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      DropdownButtonFormField<int>(
                                        value: _regGrade,
                                        decoration: const InputDecoration(
                                          labelText: 'Class / Grade',
                                          prefixIcon: Icon(Icons.school_outlined),
                                          border: OutlineInputBorder(),
                                        ),
                                        items: [
                                          for (var g = 1; g <= 10; g++)
                                            DropdownMenuItem(value: g, child: Text('Class $g'))
                                        ],
                                        onChanged: (v) => setState(() => _regGrade = v ?? 8),
                                      ),
                                      const SizedBox(height: 16),
                                      SizedBox(
                                        width: double.infinity,
                                        height: 50,
                                        child: FilledButton(
                                          onPressed: _loading ? null : _doRegister,
                                          child: _loading
                                              ? const CircularProgressIndicator(strokeWidth: 2, color: Colors.white)
                                              : const Text('Create Account & Start'),
                                        ),
                                      ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 12),
                            const Row(
                              children: [
                                Expanded(child: Divider()),
                                Padding(
                                  padding: EdgeInsets.symmetric(horizontal: 8),
                                  child: Text('OR', style: TextStyle(color: Colors.black45, fontSize: 12)),
                                ),
                                Expanded(child: Divider()),
                              ],
                            ),
                            const SizedBox(height: 12),
                            SizedBox(
                              width: double.infinity,
                              height: 48,
                              child: OutlinedButton.icon(
                                onPressed: _loading ? null : _doGoogle,
                                icon: const _GoogleIcon(),
                                label: const Text('Continue with Google'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Parents, please supervise kids under 13.',
                      style: TextStyle(color: Colors.black45, fontSize: 11),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _GoogleIcon extends StatelessWidget {
  const _GoogleIcon();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 18,
      height: 18,
      child: CustomPaint(painter: _GoogleLogoPainter()),
    );
  }
}

class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // Simple multi-color "G"
    final paint = Paint()..style = PaintingStyle.stroke..strokeWidth = 3;
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 1.5;
    paint.color = const Color(0xFF4285F4);
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), 0.4, 1.6, false, paint);
    paint.color = const Color(0xFFEA4335);
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), 2.0, 1.0, false, paint);
    paint.color = const Color(0xFFFBBC05);
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), 3.0, 1.0, false, paint);
    paint.color = const Color(0xFF34A853);
    canvas.drawArc(Rect.fromCircle(center: center, radius: radius), 4.0, 1.4, false, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// (TickerProvider is provided by SingleTickerProviderStateMixin above)
