import 'package:flutter/material.dart';

import '../api.dart';
import '../models/models.dart';

class QuestionBankScreen extends StatefulWidget {
  final int grade;
  final String initialSubject;
  final void Function(String question)? onAskTutor;

  const QuestionBankScreen({
    super.key,
    required this.grade,
    this.initialSubject = 'maths',
    this.onAskTutor,
  });

  @override
  State<QuestionBankScreen> createState() => _QuestionBankScreenState();
}

class _QuestionBankScreenState extends State<QuestionBankScreen> {
  late String _subject = widget.initialSubject;
  String? _topic;
  String? _difficulty;
  late int _grade = widget.grade;
  List<Map<String, dynamic>> _items = [];
  bool _loading = true;
  Map<String, dynamic>? _active;
  String _userAnswer = '';
  Map<String, dynamic>? _result;
  bool _submitting = false;
  bool _showHint = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      _items = await WonderWhizApi.fetchQuestionBank(
        grade: _grade,
        subject: _subject,
        topic: _topic,
        difficulty: _difficulty,
      );
    } catch (_) {
      _items = [];
    }
    if (mounted) setState(() => _loading = false);
  }

  void _startPractice(Map<String, dynamic> item) {
    setState(() {
      _active = item;
      _userAnswer = '';
      _result = null;
      _showHint = false;
    });
  }

  Future<void> _submit() async {
    if (_userAnswer.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pick or type an answer first.')),
      );
      return;
    }
    setState(() => _submitting = true);
    try {
      final r = await WonderWhizApi.submitPractice(
        questionBankId: _active!['id'],
        userAnswer: _userAnswer.trim(),
      );
      setState(() => _result = r);
      if (r['isCorrect'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Correct! 🎉')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Not quite — see the explanation.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _next() {
    if (_active == null) return;
    final idx = _items.indexWhere((i) => i['id'] == _active!['id']);
    if (idx + 1 < _items.length) {
      _startPractice(_items[idx + 1]);
    } else {
      setState(() => _active = null);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('You finished this batch! 🎉')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('🎯 Question Bank')),
      body: _active == null ? _buildList() : _buildActive(),
    );
  }

  Widget _buildList() {
    return Column(
      children: [
        // Filters
        Padding(
          padding: const EdgeInsets.all(12),
          child: Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _dropdown<int>(
                value: _grade,
                items: [for (var g = 1; g <= 12; g++) g],
                label: (g) => 'Class $g',
                onChanged: (v) {
                  setState(() => _grade = v ?? _grade);
                  _load();
                },
              ),
              _dropdown<String>(
                value: _subject,
                items: SUBJECTS.map((s) => s.id).toList(),
                label: (s) => SUBJECTS.firstWhere((x) => x.id == s).label,
                onChanged: (v) {
                  setState(() {
                    _subject = v ?? _subject;
                    _topic = null;
                  });
                  _load();
                },
              ),
              if (_subject == 'maths')
                _dropdown<String?>(
                  value: _topic ?? 'all',
                  items: ['all', ...MATHS_TOPICS.map((t) => t.id)],
                  label: (t) {
                    if (t == 'all' || t == null) return 'All topics';
                    return mathsTopicById(t)?.label ?? t;
                  },
                  onChanged: (v) {
                    setState(() => _topic = v == 'all' ? null : v);
                    _load();
                  },
                ),
              _dropdown<String?>(
                value: _difficulty ?? 'all',
                items: ['all', 'easy', 'medium', 'hard'],
                label: (d) {
                  if (d == 'all' || d == null) return 'Any difficulty';
                  return d[0].toUpperCase() + d.substring(1);
                },
                onChanged: (v) {
                  setState(() => _difficulty = v == 'all' ? null : v);
                  _load();
                },
              ),
            ],
          ),
        ),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _items.isEmpty
                  ? const Center(child: Text('No questions found. Try different filters.'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(12),
                      itemCount: _items.length,
                      itemBuilder: (context, i) {
                        final q = _items[i];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: q['difficulty'] == 'easy'
                                  ? Colors.green
                                  : q['difficulty'] == 'medium'
                                      ? Colors.amber
                                      : Colors.red,
                              child: Text('${i + 1}',
                                  style: const TextStyle(color: Colors.white)),
                            ),
                            title: Text(q['question'],
                                maxLines: 2, overflow: TextOverflow.ellipsis),
                            subtitle: Text(
                              '${q['topic'].toString().replaceAll('_', ' ')} · ${q['options'] != null ? 'MCQ' : 'Free response'}',
                              style: const TextStyle(fontSize: 11),
                            ),
                            onTap: () => _startPractice(q),
                          ),
                        );
                      },
                    ),
        ),
      ],
    );
  }

  Widget _buildActive() {
    final q = _active!;
    final options = q['options'] as List?;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: [
            Chip(label: Text('Class ${q['grade']}')),
            Chip(label: Text('${q['subject']}')),
            Chip(label: Text('${q['topic'].toString().replaceAll('_', ' ')}')),
            Chip(label: Text('${q['difficulty']}')),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.04),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Question',
                  style: TextStyle(fontSize: 11, color: Colors.black54)),
              const SizedBox(height: 4),
              Text(q['question'],
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
        const SizedBox(height: 16),
        if (_result == null) ...[
          if (options != null)
            ...options.map<Widget>((opt) {
              final o = opt.toString();
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  title: Text(o),
                  leading: Radio<String>(
                    value: o,
                    groupValue: _userAnswer,
                    onChanged: (v) => setState(() => _userAnswer = v ?? ''),
                  ),
                  selected: _userAnswer == o,
                  onTap: () => setState(() => _userAnswer = o),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: BorderSide(
                      color: _userAnswer == o
                          ? Theme.of(context).colorScheme.primary
                          : Colors.black12,
                    ),
                  ),
                ),
              );
            }).toList()
          else
            TextField(
              decoration: const InputDecoration(
                labelText: 'Type your answer',
                border: OutlineInputBorder(),
              ),
              onChanged: (v) => _userAnswer = v,
            ),
          if (q['hint'] != null && _showHint)
            Container(
              margin: const EdgeInsets.only(top: 8),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.amber.shade200),
              ),
              child: Text('💡 Hint: ${q['hint']}'),
            ),
          if (q['hint'] != null && !_showHint)
            TextButton.icon(
              onPressed: () => setState(() => _showHint = true),
              icon: const Icon(Icons.lightbulb_outline),
              label: const Text('Show hint'),
            ),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: _submitting ? null : _submit,
            icon: _submitting
                ? const SizedBox(
                    width: 16, height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Icon(Icons.check_circle_outline),
            label: const Text('Submit answer'),
          ),
        ] else ...[
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _result!['isCorrect'] == true
                  ? Colors.green.shade50
                  : Colors.red.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _result!['isCorrect'] == true
                    ? Colors.green.shade300
                    : Colors.red.shade300,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _result!['isCorrect'] == true ? 'Correct! 🎉' : 'Not quite right',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: _result!['isCorrect'] == true
                        ? Colors.green.shade700
                        : Colors.red.shade700,
                  ),
                ),
                if (_result!['isCorrect'] != true) ...[
                  const SizedBox(height: 4),
                  Text('Your answer: $_userAnswer'),
                  Text('Correct answer: ${_result!['correctAnswer']}'),
                ],
              ],
            ),
          ),
          if (_result!['explanation'] != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.04),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text('✨ Explanation\n${_result!['explanation']}'),
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              if (widget.onAskTutor != null)
                OutlinedButton.icon(
                  onPressed: () {
                    widget.onAskTutor!(q['question']);
                    Navigator.of(context).pop();
                  },
                  icon: const Icon(Icons.auto_awesome),
                  label: const Text('Ask AI Tutor'),
                ),
              const Spacer(),
              FilledButton.icon(
                onPressed: _next,
                icon: const Icon(Icons.arrow_forward),
                label: const Text('Next'),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _dropdown<T>({
    required T value,
    required List<T> items,
    required String Function(T) label,
    required ValueChanged<T?> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.black26),
        borderRadius: BorderRadius.circular(8),
      ),
      child: DropdownButton<T>(
        value: value,
        underline: const SizedBox(),
        items: items
            .map((t) => DropdownMenuItem<T>(
                  value: t,
                  child: Text(label(t), style: const TextStyle(fontSize: 13)),
                ))
            .toList(),
        onChanged: onChanged,
      ),
    );
  }
}
