import 'package:flutter/material.dart';

import '../api.dart';
import '../models/models.dart';
import '../widgets/subject_selector.dart';
import '../widgets/style_selector.dart';
import '../widgets/voice_picker.dart';
import '../widgets/maths_topic_selector.dart';
import '../widgets/math_keyboard.dart';
import 'result_screen.dart';
import 'question_bank_screen.dart';
import 'progress_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  AppUser? _user;
  bool _userLoading = true;
  String _subject = 'maths';
  String? _topic;
  String _style = 'detailed';
  String _language = 'en';
  int _grade = 8;
  final _questionController = TextEditingController();
  bool _asking = false;
  bool _useMathKeyboard = false;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  @override
  void dispose() {
    _questionController.dispose();
    super.dispose();
  }

  Future<void> _loadUser() async {
    final u = await WonderWhizApi.fetchUser();
    if (!mounted) return;
    setState(() {
      _user = u;
      _grade = u?.grade ?? 8;
      _userLoading = false;
    });
  }

  void _onSubjectChanged(String id) {
    setState(() {
      _subject = id;
      _topic = null; // reset topic on subject change
    });
    // suggest a matching voice language
    if (id == 'hindi' && _language == 'en') {
      setState(() => _language = 'hi');
    } else if (id == 'kannada' && _language == 'en') {
      setState(() => _language = 'kn');
    }
  }

  Future<void> _ask() async {
    final q = _questionController.text.trim();
    if (q.length < 2) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Type a question first.')),
      );
      return;
    }
    setState(() => _asking = true);
    try {
      final result = await WonderWhizApi.askTutor(
        subject: _subject,
        style: _style,
        question: q,
        language: _language,
        grade: _grade,
        topic: _subject == 'maths' ? _topic : null,
      );
      if (!mounted) return;
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => ResultScreen(
            result: result,
            question: q,
            voice: voiceById(_language)!,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('$e')),
      );
    } finally {
      if (mounted) setState(() => _asking = false);
    }
  }

  Future<void> _changeGrade(int g) async {
    setState(() => _grade = g);
    await WonderWhizApi.updateUser(grade: g);
  }

  Future<void> _signOut() async {
    await WonderWhizApi.signOut();
    if (!mounted) return;
    Navigator.of(context).pushReplacementNamed('/');
  }

  @override
  Widget build(BuildContext context) {
    if (_userLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFF97316), Color(0xFFEC4899), Color(0xFF8B5CF6)],
                ),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text('🦉', style: TextStyle(fontSize: 18)),
            ),
            const SizedBox(width: 8),
            const Text('WonderWhiz'),
          ],
        ),
        actions: [
          if (_user != null) ...[
            IconButton(
              icon: const Icon(Icons.bar_chart),
              tooltip: 'My Progress',
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const ProgressScreen()),
                );
              },
            ),
            PopupMenuButton<String>(
              onSelected: (v) async {
                if (v == 'logout') _signOut();
              },
              itemBuilder: (_) => [
                PopupMenuItem<String>(
                  enabled: false,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_user?.name ?? 'Kid', style: const TextStyle(fontWeight: FontWeight.bold)),
                      Text(_user?.email ?? '', style: const TextStyle(fontSize: 12, color: Colors.black54)),
                    ],
                  ),
                ),
                const PopupMenuDivider(),
                const PopupMenuItem<String>(value: 'logout', child: Text('Sign out')),
              ],
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                      child: Text(
                        (_user?.name ?? '?')[0].toUpperCase(),
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                    const Icon(Icons.arrow_drop_down),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Welcome strip
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFFFFEDD5), Color(0xFFFCE7F3), Color(0xFFF3E8FF)],
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                const Text('👋', style: TextStyle(fontSize: 32)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Hi ${_user?.name ?? 'friend'}!',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const Text(
                        'Pick a subject, type your question, and choose how you want it explained.',
                        style: TextStyle(fontSize: 12, color: Colors.black54),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Question bank shortcut
          Card(
            child: InkWell(
              borderRadius: BorderRadius.circular(20),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => QuestionBankScreen(
                      grade: _grade,
                      initialSubject: _subject,
                      onAskTutor: (q) {
                        _questionController.text = q;
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Question loaded — pick a style and ask!')),
                        );
                      },
                    ),
                  ),
                );
              },
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFFFBBF24), Color(0xFFF97316)]),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Center(child: Text('🎯', style: TextStyle(fontSize: 22))),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Practice with Pre-Built Questions',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          Text(
                              'Curated by grade & topic. Instant feedback, hints, achievements.',
                              style: TextStyle(fontSize: 11, color: Colors.black54)),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right, color: Colors.black45),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Grade selector
          _SectionCard(
            step: 0,
            title: 'Your Class (K-12)',
            child: DropdownButtonFormField<int>(
              value: _grade,
              decoration: const InputDecoration(border: OutlineInputBorder()),
              items: [
                for (var g = 1; g <= 12; g++)
                  DropdownMenuItem(value: g, child: Text('Class $g'))
              ],
              onChanged: (v) => _changeGrade(v ?? 8),
            ),
          ),
          const SizedBox(height: 16),

          // Step 1: Subject
          _SectionCard(
            step: 1,
            title: 'Pick a subject',
            child: SubjectSelector(value: _subject, onChanged: _onSubjectChanged),
          ),
          const SizedBox(height: 16),

          // Step 1.5: Maths topic (only for maths)
          if (_subject == 'maths') ...[
            _SectionCard(
              step: '1½',
              title: 'Pick a maths topic (optional)',
              subtitle: 'Pre-Algebra · Algebra · Geometry · Trig · Calculus · Statistics · Linear Algebra · Word Problems',
              child: MathsTopicSelector(value: _topic, onChanged: (v) => setState(() => _topic = v)),
            ),
            const SizedBox(height: 16),
          ],

          // Step 2: Question
          _SectionCard(
            step: 2,
            title: 'Ask your question',
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('✍️ Type your question',
                        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    if (_subject == 'maths')
                      FilterChip(
                        label: Text(_useMathKeyboard ? 'Math keyboard ON' : 'Math keyboard',
                            style: const TextStyle(fontSize: 11)),
                        selected: _useMathKeyboard,
                        onSelected: (v) {
                          setState(() => _useMathKeyboard = v);
                          if (v) {
                            showMathKeyboard(
                              context,
                              controller: _questionController,
                              onSubmit: _ask,
                            );
                          }
                        },
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _questionController,
                  minLines: 3,
                  maxLines: 6,
                  decoration: InputDecoration(
                    hintText: _subject == 'maths' && _useMathKeyboard
                        ? 'Tap 🧮 to open the math keyboard...'
                        : 'Type your question here...',
                    border: const OutlineInputBorder(),
                    suffixIcon: _subject == 'maths'
                        ? IconButton(
                            icon: const Icon(Icons.keyboard),
                            tooltip: 'Open math keyboard',
                            onPressed: () => showMathKeyboard(
                              context,
                              controller: _questionController,
                              onSubmit: _ask,
                            ),
                          )
                        : null,
                  ),
                ),
                const SizedBox(height: 8),
                if (subjectById(_subject) != null)
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      for (final ex in subjectById(_subject)!.examples)
                        ActionChip(
                          label: Text(ex, style: const TextStyle(fontSize: 11)),
                          onPressed: () => _questionController.text = ex,
                        ),
                    ],
                  ),
                if (_topic != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Chip(
                        label: Text(
                          'Focused on: ${_topic!.replaceAll('_', ' ')}',
                          style: const TextStyle(fontSize: 11),
                        ),
                        backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                      ),
                    ),
                  ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: FilledButton.icon(
                    onPressed: _asking ? null : _ask,
                    icon: _asking
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.auto_awesome),
                    label: Text(_asking ? 'Thinking...' : 'Ask WonderWhiz'),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Step 3: Style
          _SectionCard(
            step: 3,
            title: 'Choose how to explain',
            subtitle: 'Try multiple styles for the same question!',
            child: StyleSelector(value: _style, onChanged: (v) => setState(() => _style = v)),
          ),
          const SizedBox(height: 16),

          // Step 4: Voice
          _SectionCard(
            step: 4,
            title: 'Voice-over language',
            child: VoicePicker(value: _language, onChanged: (v) => setState(() => _language = v)),
          ),
          const SizedBox(height: 24),
          const Center(
            child: Text(
              'Made with 💛 for curious minds',
              style: TextStyle(color: Colors.black45, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final Object step; // int or String
  final String title;
  final String? subtitle;
  final Widget child;

  const _SectionCard({
    required this.step,
    required this.title,
    this.subtitle,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final stepNum = step is int ? step as int : 0;
    final showStep = stepNum > 0 || step is String;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                if (showStep)
                  Container(
                    width: 26,
                    height: 26,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.primary,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '$step',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                if (showStep) const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      if (subtitle != null)
                        Text(subtitle!, style: const TextStyle(color: Colors.black54, fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }
}
