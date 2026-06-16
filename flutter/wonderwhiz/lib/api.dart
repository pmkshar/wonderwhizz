/// API client for WonderWhiz.
///
/// Talks to the SAME backend used by the Next.js web app, so kids can log
/// in with the same email & password they use on the website.
///
/// Before building, set [baseUrl] to your deployed web app URL.
/// For local testing on an Android emulator, use http://10.0.2.2:3000
/// (which maps to the host machine's localhost:3000).
/// For iOS simulator, use http://localhost:3000.
/// For physical devices, use your machine's LAN IP, e.g. http://192.168.1.5:3000.
library wonderwhiz.api;

import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class WonderWhizConfig {
  /// TODO: replace with your production web app URL.
  /// For Android emulator: 'http://10.0.2.2:3000'
  /// For iOS simulator:    'http://localhost:3000'
  /// For physical device:  'http://<YOUR_LAN_IP>:3000'
  static const String baseUrl = 'http://10.0.2.2:3000';
}

class AppUser {
  final String? id;
  final String? name;
  final String? email;
  final String? image;
  final int? grade;
  final String? provider;

  AppUser({this.id, this.name, this.email, this.image, this.grade, this.provider});

  factory AppUser.fromJson(Map<String, dynamic> j) => AppUser(
        id: j['id'] as String?,
        name: j['name'] as String?,
        email: j['email'] as String?,
        image: j['image'] as String?,
        grade: j['grade'] is int ? j['grade'] as int : int.tryParse('${j['grade']}'),
        provider: j['provider'] as String?,
      );
}

class TutorResult {
  final String answer;
  final String subject;
  final String style;
  final String language;
  final int grade;

  TutorResult({
    required this.answer,
    required this.subject,
    required this.style,
    required this.language,
    required this.grade,
  });

  factory TutorResult.fromJson(Map<String, dynamic> j) => TutorResult(
        answer: j['answer'] as String? ?? '',
        subject: j['subject'] as String? ?? '',
        style: j['style'] as String? ?? '',
        language: j['language'] as String? ?? '',
        grade: j['grade'] is int ? j['grade'] as int : 8,
      );
}

class WonderWhizApi {
  static String get base => WonderWhizConfig.baseUrl;

  static Future<void> _saveCookie(http.Response res) async {
    final raw = res.headers['set-cookie'];
    if (raw == null) return;
    // next-auth uses 'next-auth.session-token' cookie
    final parts = raw.split(';');
    final tokenPart = parts.firstWhere(
      (p) => p.contains('next-auth.session-token=') || p.contains('__Secure-next-auth.session-token='),
      orElse: () => '',
    );
    if (tokenPart.isEmpty) return;
    final cookieValue = tokenPart.split('=').sublist(1).join('=').trim();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('ww_session_token', cookieValue);
    await prefs.setString('ww_cookie_name',
        tokenPart.contains('__Secure') ? '__Secure-next-auth.session-token' : 'next-auth.session-token');
  }

  static Future<String?> _cookieHeader() async {
    final prefs = await SharedPreferences.getInstance();
    final value = prefs.getString('ww_session_token');
    final name = prefs.getString('ww_cookie_name') ?? 'next-auth.session-token';
    if (value == null || value.isEmpty) return null;
    return '$name=$value';
  }

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('ww_session_token');
    await prefs.remove('ww_cookie_name');
  }

  /// GET /api/user — returns the current user or null.
  static Future<AppUser?> fetchUser() async {
    try {
      final cookie = await _cookieHeader();
      final res = await http.get(
        Uri.parse('$base/api/user'),
        headers: {
          if (cookie != null) 'Cookie': cookie,
          'Accept': 'application/json',
        },
      ).timeout(const Duration(seconds: 10));
      if (res.statusCode != 200) return null;
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      final user = data['user'];
      if (user == null) return null;
      return AppUser.fromJson(user as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  /// POST /api/register — create a new account.
  static Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    int grade = 8,
  }) async {
    final res = await http.post(
      Uri.parse('$base/api/register'),
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
        'grade': grade,
      }),
    ).timeout(const Duration(seconds: 15));
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    return {'ok': res.statusCode == 200, ...data};
  }

  /// GET /api/auth/csrf — needed for credentials login.
  static Future<String?> _fetchCsrf() async {
    try {
      final res = await http.get(Uri.parse('$base/api/auth/csrf')).timeout(const Duration(seconds: 10));
      if (res.statusCode != 200) return null;
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      return data['csrfToken'] as String?;
    } catch (_) {
      return null;
    }
  }

  /// POST /api/auth/callback/credentials — performs sign-in with email & password.
  /// On success the response sets a session cookie which we persist.
  static Future<bool> loginWithEmail({
    required String email,
    required String password,
  }) async {
    final csrf = await _fetchCsrf();
    if (csrf == null) return false;
    final res = await http.post(
      Uri.parse('$base/api/auth/callback/credentials'),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: {
        'csrfToken': csrf,
        'email': email,
        'password': password,
        'redirect': 'false',
        'json': 'true',
      },
    ).timeout(const Duration(seconds: 15));
    await _saveCookie(res);
    // Verify by fetching user
    final user = await fetchUser();
    return user != null;
  }

  /// POST /api/tutor — ask the AI tutor a question.
  static Future<TutorResult> askTutor({
    required String subject,
    required String style,
    required String question,
    required String language,
    int grade = 8,
    String? topic,
  }) async {
    final cookie = await _cookieHeader();
    final res = await http.post(
      Uri.parse('$base/api/tutor'),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (cookie != null) 'Cookie': cookie,
      },
      body: jsonEncode({
        'subject': subject,
        'style': style,
        'question': question,
        'language': language,
        'grade': grade,
        if (topic != null) 'topic': topic,
      }),
    ).timeout(const Duration(seconds: 60));
    if (res.statusCode != 200) {
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      throw Exception(data['error'] ?? 'Tutor unavailable');
    }
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    return TutorResult.fromJson(data);
  }

  /// POST /api/tts — generate voice-over WAV bytes.
  static Future<Uint8List> tts({
    required String text,
    String voice = 'tongtong',
  }) async {
    final cookie = await _cookieHeader();
    final res = await http.post(
      Uri.parse('$base/api/tts'),
      headers: {
        'Content-Type': 'application/json',
        if (cookie != null) 'Cookie': cookie,
      },
      body: jsonEncode({'text': text, 'voice': voice}),
    ).timeout(const Duration(seconds: 60));
    if (res.statusCode != 200) {
      throw Exception('Voice service unavailable');
    }
    return res.bodyBytes;
  }

  /// PATCH /api/user — update grade or name.
  static Future<AppUser?> updateUser({int? grade, String? name}) async {
    final cookie = await _cookieHeader();
    final body = <String, dynamic>{};
    if (grade != null) body['grade'] = grade;
    if (name != null) body['name'] = name;
    final res = await http.patch(
      Uri.parse('$base/api/user'),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (cookie != null) 'Cookie': cookie,
      },
      body: jsonEncode(body),
    ).timeout(const Duration(seconds: 10));
    if (res.statusCode != 200) return null;
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    final u = data['user'];
    if (u == null) return null;
    return AppUser.fromJson(u as Map<String, dynamic>);
  }

  /// Sign out by clearing local session (best-effort server-side).
  static Future<void> signOut() async {
    await clearSession();
  }

  // ==================== Question Bank ====================

  /// GET /api/question-bank?grade=&subject=&topic=&difficulty=&limit=
  static Future<List<Map<String, dynamic>>> fetchQuestionBank({
    required int grade,
    required String subject,
    String? topic,
    String? difficulty,
    int limit = 30,
  }) async {
    final cookie = await _cookieHeader();
    final params = <String, String>{
      'grade': grade.toString(),
      'subject': subject,
      'limit': limit.toString(),
    };
    if (topic != null && topic.isNotEmpty) params['topic'] = topic;
    if (difficulty != null && difficulty.isNotEmpty) params['difficulty'] = difficulty;
    final uri = Uri.parse('$base/api/question-bank').replace(queryParameters: params);
    final res = await http.get(
      uri,
      headers: {
        if (cookie != null) 'Cookie': cookie,
        'Accept': 'application/json',
      },
    ).timeout(const Duration(seconds: 15));
    if (res.statusCode != 200) return [];
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    final items = data['items'] as List? ?? [];
    return items.map((e) => e as Map<String, dynamic>).toList();
  }

  // ==================== Practice ====================

  /// POST /api/practice — submit an answer for a question-bank item.
  /// Returns: { isCorrect, correctAnswer, explanation, hint, newlyAwarded }
  static Future<Map<String, dynamic>> submitPractice({
    required String questionBankId,
    required String userAnswer,
    int timeSpentSec = 0,
  }) async {
    final cookie = await _cookieHeader();
    final res = await http.post(
      Uri.parse('$base/api/practice'),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (cookie != null) 'Cookie': cookie,
      },
      body: jsonEncode({
        'questionBankId': questionBankId,
        'userAnswer': userAnswer,
        'timeSpentSec': timeSpentSec,
      }),
    ).timeout(const Duration(seconds: 15));
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode != 200) {
      throw Exception(data['error'] ?? 'Could not submit answer');
    }
    return data;
  }

  // ==================== Progress ====================

  /// GET /api/progress — student's progress summary
  static Future<Map<String, dynamic>?> fetchProgress() async {
    final cookie = await _cookieHeader();
    final res = await http.get(
      Uri.parse('$base/api/progress'),
      headers: {
        if (cookie != null) 'Cookie': cookie,
        'Accept': 'application/json',
      },
    ).timeout(const Duration(seconds: 15));
    if (res.statusCode != 200) return null;
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  // ==================== Parent Dashboard ====================

  /// GET /api/parent — overview of linked children
  static Future<List<Map<String, dynamic>>> fetchChildrenOverview() async {
    final cookie = await _cookieHeader();
    final res = await http.get(
      Uri.parse('$base/api/parent'),
      headers: {
        if (cookie != null) 'Cookie': cookie,
        'Accept': 'application/json',
      },
    ).timeout(const Duration(seconds: 15));
    if (res.statusCode != 200) return [];
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    final children = data['children'] as List? ?? [];
    return children.map((e) => e as Map<String, dynamic>).toList();
  }

  /// POST /api/parent/link — link a student by email
  static Future<Map<String, dynamic>> linkStudent(String studentEmail) async {
    final cookie = await _cookieHeader();
    final res = await http.post(
      Uri.parse('$base/api/parent/link'),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (cookie != null) 'Cookie': cookie,
      },
      body: jsonEncode({'studentEmail': studentEmail}),
    ).timeout(const Duration(seconds: 15));
    return jsonDecode(res.body) as Map<String, dynamic>;
  }
}
