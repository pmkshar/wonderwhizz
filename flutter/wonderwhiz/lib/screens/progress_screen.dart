import 'package:flutter/material.dart';

import '../api.dart';

class ProgressScreen extends StatefulWidget {
  const ProgressScreen({super.key});

  @override
  State<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends State<ProgressScreen> {
  Map<String, dynamic>? _data;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final d = await WonderWhizApi.fetchProgress();
    if (mounted) {
      setState(() {
        _data = d;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: const Text('📊 My Progress')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    if (_data == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('📊 My Progress')),
        body: const Center(child: Text('Could not load progress.')),
      );
    }
    final summary = _data!['summary'] as Map<String, dynamic>;
    final achievements = (_data!['achievements'] as List?) ?? [];
    final bySubject = ((_data!['breakdowns'] ?? const {})['bySubject'] as List?) ?? [];
    final byTopic = ((_data!['breakdowns'] ?? const {})['byTopic'] as List?) ?? [];
    final recentQ = (_data!['recentQuestions'] as List?) ?? [];

    return Scaffold(
      appBar: AppBar(title: const Text('📊 My Progress')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Stat cards
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 1.4,
            children: [
              _statCard('Questions Asked', summary['totalQuestions'].toString(), '💬', Colors.cyan),
              _statCard('Practice Done', summary['totalPractice'].toString(), '🎯', Colors.teal),
              _statCard('Accuracy', '${summary['accuracy']}%', '📈', Colors.orange),
              _statCard('Streak', '${summary['streak']} (Best: ${summary['bestStreak']})', '🔥', Colors.pink),
            ],
          ),
          const SizedBox(height: 16),
          // Achievements
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('🏆 Achievements (${achievements.length})',
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  if (achievements.isEmpty)
                    const Text('No achievements yet. Ask questions and practice to earn them!',
                        style: TextStyle(color: Colors.black54, fontSize: 12))
                  else
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: achievements.map<Widget>((a) {
                        return Chip(
                          avatar: Text(a['emoji'] ?? '⭐'),
                          label: Text(a['name'] ?? '',
                              style: const TextStyle(fontSize: 11)),
                          backgroundColor: Colors.amber.shade50,
                        );
                      }).toList(),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          // By Subject
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('📚 By Subject',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  if (bySubject.isEmpty)
                    const Text('No data yet.', style: TextStyle(color: Colors.black54, fontSize: 12))
                  else
                    ...bySubject.map((b) => Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Row(
                            children: [
                              Expanded(
                                flex: 3,
                              child: Text('${_subjectEmoji(b['subject'])} ${b['subject']}',
                                  style: const TextStyle(fontSize: 12)),
                              ),
                              Expanded(
                                flex: 5,
                                child: LinearProgressIndicator(
                                  value: (b['count'] as num).toDouble() /
                                      (bySubject.isNotEmpty
                                          ? (bySubject.map((x) => (x['count'] as num).toDouble())
                                              .reduce((a, b) => a > b ? a : b))
                                          : 1.0),
                                ),
                              ),
                              SizedBox(
                                width: 30,
                                child: Text('${b['count']}',
                                    style: const TextStyle(fontSize: 11),
                                    textAlign: TextAlign.right),
                              ),
                            ],
                          ),
                        )),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          // By Topic
          if (byTopic.isNotEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('🧭 Topics Explored',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: byTopic.map<Widget>((t) {
                        return Chip(
                          label: Text(
                            '${t['topic'].toString().replaceAll('_', ' ')} · ${t['count']}',
                            style: const TextStyle(fontSize: 11),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 12),
          // Recent questions
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('🕐 Recent Questions',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  if (recentQ.isEmpty)
                    const Text('No questions yet.', style: TextStyle(color: Colors.black54, fontSize: 12))
                  else
                    ...recentQ.take(5).map((q) => ListTile(
                          dense: true,
                          contentPadding: EdgeInsets.zero,
                          leading: Text(_subjectEmoji(q['subject']),
                              style: const TextStyle(fontSize: 18)),
                          title: Text(q['question'],
                              maxLines: 1, overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 13)),
                          subtitle: Text(
                            '${q['topic']?.toString().replaceAll('_', ' ') ?? ''} · ${q['style']}',
                            style: const TextStyle(fontSize: 10),
                          ),
                        )),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _statCard(String label, String value, String emoji, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: color.withOpacity(0.15),
                  radius: 14,
                  child: Text(emoji, style: const TextStyle(fontSize: 14)),
                ),
              ],
            ),
            Text(value,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            Text(label,
                style: const TextStyle(fontSize: 10, color: Colors.black54)),
          ],
        ),
      ),
    );
  }

  String _subjectEmoji(String? s) {
    return {
          'maths': '➗',
          'hindi': '📝',
          'science': '🔬',
          'kannada': '🦁',
        }[s] ??
        '📚';
  }
}
