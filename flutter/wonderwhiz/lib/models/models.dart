import 'package:flutter/material.dart';

class Subject {
  final String id;
  final String label;
  final String emoji;
  final String description;
  final List<String> gradient;
  final List<String> examples;

  const Subject({
    required this.id,
    required this.label,
    required this.emoji,
    required this.description,
    required this.gradient,
    required this.examples,
  });
}

const SUBJECTS = <Subject>[
  Subject(
    id: 'maths',
    label: 'Maths',
    emoji: '➗',
    description: 'Algebra, geometry, arithmetic, trigonometry',
    gradient: ['#34D399', '#14B8A6'],
    examples: [
      'Solve: 2x + 5 = 17',
      'Find the area of a circle with radius 7 cm',
      'What is the LCM of 12 and 18?',
    ],
  ),
  Subject(
    id: 'hindi',
    label: 'Hindi',
    emoji: '📝',
    description: 'व्याकरण, साहित्य, पद्य, गद्य',
    gradient: ['#FB923C', '#F59E0B'],
    examples: [
      'संधि के भेद उदाहरण सहित समझाइए',
      '"राम पुस्तक पढ़ता है" में कारक पहचानिए',
      'रस के प्रकार बताइए',
    ],
  ),
  Subject(
    id: 'science',
    label: 'Science',
    emoji: '🔬',
    description: 'Physics, chemistry, biology',
    gradient: ['#22D3EE', '#0EA5E9'],
    examples: [
      'Why is the sky blue?',
      'Explain Newton\u2019s third law of motion',
      'What is photosynthesis?',
    ],
  ),
  Subject(
    id: 'kannada',
    label: 'Kannada',
    emoji: '🦁',
    description: 'ವ್ಯಾಕರಣ, ಸಾಹಿತ್ಯ, ಪದ್ಯ, ಗದ್ಯ',
    gradient: ['#FB7185', '#EC4899'],
    examples: [
      'ಸಂಧಿಯ ಭೇದಗಳನ್ನು ಉದಾಹರಣೆಯೊಂದಿಗೆ ವಿವರಿಸಿ',
      '"ನಾನು ಪುಸ್ತಕ ಓದುತ್ತೇನೆ" ಎಂಬ ವಾಕ್ಯದಲ್ಲಿ ಕಾರಕವನ್ನು ಗುರುತಿಸಿ',
      'ರಸದ ಪ್ರಕಾರಗಳನ್ನು ತಿಳಿಸಿ',
    ],
  ),
];

Subject? subjectById(String id) {
  for (final s in SUBJECTS) {
    if (s.id == id) return s;
  }
  return null;
}

class ExplanationStyle {
  final String id;
  final String label;
  final String emoji;
  final String description;
  final List<String> gradient;

  const ExplanationStyle({
    required this.id,
    required this.label,
    required this.emoji,
    required this.description,
    required this.gradient,
  });
}

const EXPLANATION_STYLES = <ExplanationStyle>[
  ExplanationStyle(
    id: 'detailed',
    label: 'Detailed Step-by-Step',
    emoji: '📚',
    description: 'Every step explained in full, like a patient teacher.',
    gradient: ['#34D399', '#14B8A6'],
  ),
  ExplanationStyle(
    id: 'concise',
    label: 'Concise Answer',
    emoji: '⚡',
    description: 'Just the answer in 2-3 short sentences.',
    gradient: ['#FBBF24', '#F97316'],
  ),
  ExplanationStyle(
    id: 'intuitive',
    label: 'Intuitive Explanation',
    emoji: '💡',
    description: 'Build intuition with everyday analogies.',
    gradient: ['#FB7185', '#EC4899'],
  ),
  ExplanationStyle(
    id: 'tips',
    label: 'Tips & Tricks',
    emoji: '🎯',
    description: 'Shortcuts, mnemonics and exam-ready hacks.',
    gradient: ['#A78BFA', '#9333EA'],
  ),
  ExplanationStyle(
    id: 'visual',
    label: 'Visual & Graphical',
    emoji: '📊',
    description: 'Diagrams, ASCII charts, mental pictures.',
    gradient: ['#22D3EE', '#0EA5E9'],
  ),
  ExplanationStyle(
    id: 'logic',
    label: 'Logic & Reasoning',
    emoji: '🧠',
    description: 'Why it works — first principles and proofs.',
    gradient: ['#64748B', '#374151'],
  ),
  ExplanationStyle(
    id: 'code',
    label: 'Code-Based',
    emoji: '💻',
    description: 'See the solution as runnable Python code.',
    gradient: ['#D946EF', '#DB2777'],
  ),
  ExplanationStyle(
    id: 'humorous',
    label: 'Humorous',
    emoji: '🤣',
    description: 'Same solution, but with jokes and giggles.',
    gradient: ['#FACC15', '#F59E0B'],
  ),
];

ExplanationStyle? styleById(String id) {
  for (final s in EXPLANATION_STYLES) {
    if (s.id == id) return s;
  }
  return null;
}

class VoiceOption {
  final String id;
  final String label;
  final String nativeLabel;
  final String flag;
  final String voice;

  const VoiceOption({
    required this.id,
    required this.label,
    required this.nativeLabel,
    required this.flag,
    required this.voice,
  });
}

const VOICES = <VoiceOption>[
  VoiceOption(id: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧', voice: 'tongtong'),
  VoiceOption(id: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳', voice: 'tongtong'),
  VoiceOption(id: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', flag: '🦁', voice: 'tongtong'),
];

VoiceOption? voiceById(String id) {
  for (final v in VOICES) {
    if (v.id == id) return v;
  }
  return null;
}

Color hexToColor(String hex) {
  final cleaned = hex.replaceAll('#', '');
  return Color(int.parse('FF$cleaned', radix: 16));
}

LinearGradient gradientFromHex(List<String> hexes) {
  return LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: hexes.map(hexToColor).toList(),
  );
}
