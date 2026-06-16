import 'dart:typed_data';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';

import '../api.dart';
import '../models/models.dart';

class ResultScreen extends StatefulWidget {
  final TutorResult result;
  final String question;
  final VoiceOption voice;

  const ResultScreen({
    super.key,
    required this.result,
    required this.question,
    required this.voice,
  });

  @override
  State<ResultScreen> createState() => _ResultScreenState();
}

class _ResultScreenState extends State<ResultScreen> {
  final _player = AudioPlayer();
  bool _loadingAudio = false;
  bool _playing = false;
  Uint8List? _audioBytes;

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  Future<void> _playPause() async {
    if (_audioBytes != null) {
      if (_playing) {
        await _player.pause();
        setState(() => _playing = false);
      } else {
        await _player.resume();
        setState(() => _playing = true);
      }
      return;
    }
    setState(() => _loadingAudio = true);
    try {
      final bytes = await WonderWhizApi.tts(
        text: widget.result.answer,
        voice: widget.voice.voice,
      );
      _audioBytes = bytes;
      await _player.play(BytesSource(bytes));
      setState(() {
        _loadingAudio = false;
        _playing = true;
      });
    } catch (e) {
      setState(() => _loadingAudio = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Voice error: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final style = styleById(widget.result.style);
    final subject = subjectById(widget.result.subject);
    return Scaffold(
      appBar: AppBar(
        title: Text(style?.label ?? 'Explanation'),
        actions: [
          IconButton(
            icon: const Icon(Icons.copy),
            tooltip: 'Copy answer',
            onPressed: () async {
              // ignore: unawaited_futures
              // copy not part of base, use Clipboard from services
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Header chip
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            color: Colors.black.withOpacity(0.03),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                if (style != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      gradient: gradientFromHex(style.gradient),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(style.emoji, style: const TextStyle(fontSize: 16)),
                        const SizedBox(width: 6),
                        Text(
                          style.label,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                if (subject != null)
                  Chip(
                    label: Text('${subject.emoji} ${subject.label}'),
                    backgroundColor: Colors.white,
                  ),
                Chip(
                  label: Text('${widget.voice.flag} ${widget.voice.nativeLabel}'),
                  backgroundColor: Colors.white,
                ),
              ],
            ),
          ),
          // Question
          if (widget.question.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('🙋', style: TextStyle(fontSize: 18)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.04),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Text(widget.question),
                    ),
                  ),
                ],
              ),
            ),
          // Answer
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              children: [
                MarkdownBody(
                  data: widget.result.answer,
                  styleSheet: MarkdownStyleSheet(
                    p: const TextStyle(fontSize: 15, height: 1.5),
                    code: TextStyle(
                      fontFamily: 'monospace',
                      backgroundColor: Colors.purple.withOpacity(0.1),
                    ),
                    codeblockDecoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    codeblockPadding: const EdgeInsets.all(12),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
          // Voice controls
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.black.withOpacity(0.06))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: _loadingAudio ? null : _playPause,
                    icon: _loadingAudio
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : Icon(_playing ? Icons.pause : Icons.play_arrow),
                    label: Text(
                      _loadingAudio
                          ? 'Generating...'
                          : _playing
                              ? 'Pause'
                              : 'Listen (${widget.voice.flag} ${widget.voice.nativeLabel})',
                    ),
                  ),
                ),
                if (_audioBytes != null) ...[
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.stop),
                    onPressed: () async {
                      await _player.stop();
                      setState(() => _playing = false);
                    },
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
