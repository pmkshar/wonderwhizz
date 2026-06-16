import 'package:flutter/material.dart';

import '../api.dart';

class ParentDashboardScreen extends StatefulWidget {
  const ParentDashboardScreen({super.key});

  @override
  State<ParentDashboardScreen> createState() => _ParentDashboardScreenState();
}

class _ParentDashboardScreenState extends State<ParentDashboardScreen> {
  List<Map<String, dynamic>> _children = [];
  bool _loading = true;
  final _emailCtrl = TextEditingController();
  bool _linking = false;
  String? _expandedId;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _children = await WonderWhizApi.fetchChildrenOverview();
    } catch (_) {
      _children = [];
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _link() async {
    if (_emailCtrl.text.trim().isEmpty) return;
    setState(() => _linking = true);
    try {
      final r = await WonderWhizApi.linkStudent(_emailCtrl.text.trim());
      if (r['ok'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Linked ${r['student']?['name'] ?? r['student']?['email'] ?? 'student'}! 🎉')),
        );
        _emailCtrl.clear();
        _load();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(r['error'] ?? 'Could not link')),
        );
      }
    } finally {
      if (mounted) setState(() => _linking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('👨‍👩‍👧 Parent Dashboard')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Link child
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Link a child by their account email',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _emailCtrl,
                          decoration: const InputDecoration(
                            hintText: 'child@example.com',
                            border: OutlineInputBorder(),
                            isDense: true,
                          ),
                          keyboardType: TextInputType.emailAddress,
                        ),
                      ),
                      const SizedBox(width: 8),
                      FilledButton(
                        onPressed: _linking ? null : _link,
                        child: _linking
                            ? const SizedBox(
                                width: 16, height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Text('Link'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          if (_loading)
            const Center(child: CircularProgressIndicator())
          else if (_children.isEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: const [
                    Text('👶', style: TextStyle(fontSize: 48)),
                    SizedBox(height: 8),
                    Text('No children linked yet'),
                    SizedBox(height: 4),
                    Text(
                      'Ask your child to register on WonderWhiz first (with student role), then enter their email above.',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.black54, fontSize: 12),
                    ),
                  ],
                ),
              ),
            )
          else
            ..._children.map((c) {
              final id = c['id'] as String;
              final summary = c['summary'] as Map<String, dynamic>;
              final expanded = _expandedId == id;
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: Column(
                  children: [
                    ListTile(
                      leading: CircleAvatar(
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        child: Text(
                          (c['name'] ?? c['email'])[0].toString().toUpperCase(),
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                      title: Text(c['name'] ?? 'Kid',
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('${c['email']} · Class ${c['grade']}',
                          style: const TextStyle(fontSize: 11)),
                      trailing: Wrap(
                        spacing: 6,
                        children: [
                          _mini('💬', '${summary['totalQuestions']}'),
                          _mini('🎯', '${summary['totalPractice']}'),
                          _mini('📈', '${summary['accuracy']}%'),
                          _mini('🏆', '${summary['achievementsEarned']}'),
                        ],
                      ),
                      onTap: () => setState(() => _expandedId = expanded ? null : id),
                    ),
                    if (expanded)
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Divider(),
                            const Text('By Subject',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            const SizedBox(height: 4),
                            ...(((c['breakdowns'] ?? const {})['bySubject'] as List?) ?? [])
                                .map((b) => Padding(
                                      padding: const EdgeInsets.only(bottom: 4),
                                      child: Row(
                                        children: [
                                          Text(_emoji(b['subject'])),
                                          const SizedBox(width: 6),
                                          Text('${b['subject']}',
                                              style: const TextStyle(fontSize: 11)),
                                          const Spacer(),
                                          Text('${b['count']}',
                                              style: const TextStyle(fontSize: 11)),
                                        ],
                                      ),
                                    )),
                            const SizedBox(height: 8),
                            const Text('Topics Explored',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            const SizedBox(height: 4),
                            Wrap(
                              spacing: 4,
                              runSpacing: 4,
                              children: ((((c['breakdowns'] ?? const {})['byTopic'] as List?) ?? []))
                                  .map<Widget>((t) => Chip(
                                        label: Text(
                                          '${t['topic'].toString().replaceAll('_', ' ')} · ${t['count']}',
                                          style: const TextStyle(fontSize: 10),
                                        ),
                                        padding: EdgeInsets.zero,
                                        visualDensity: VisualDensity.compact,
                                      ))
                                  .toList(),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _mini(String emoji, String value) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(emoji, style: const TextStyle(fontSize: 14)),
        Text(value, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
      ],
    );
  }

  String _emoji(String? s) {
    return {'maths': '➗', 'hindi': '📝', 'science': '🔬', 'kannada': '🦁'}[s] ?? '📚';
  }
}
