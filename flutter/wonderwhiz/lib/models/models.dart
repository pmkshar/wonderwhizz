import 'package:flutter/material.dart';

class Subject {
  final String id;
  final String label;
  final String emoji;
  final String description;
  final List<String> gradient;
  final List<String> examples;
  final bool hasTopics;

  const Subject({
    required this.id,
    required this.label,
    required this.emoji,
    required this.description,
    required this.gradient,
    required this.examples,
    this.hasTopics = false,
  });
}

const SUBJECTS = <Subject>[
  Subject(
    id: 'maths',
    label: 'Maths',
    emoji: '➗',
    description: 'Algebra, Calculus, Geometry, Trig & more',
    gradient: ['#34D399', '#14B8A6'],
    examples: [
      'Solve: 2x + 5 = 17',
      'Find the area of a circle with radius 7 cm',
      'What is the LCM of 12 and 18?',
    ],
    hasTopics: true,
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

class MathsTopic {
  final String id;
  final String label;
  final String emoji;
  final String description;
  final List<String> gradient;
  final String grades;
  final List<String> examples;

  const MathsTopic({
    required this.id,
    required this.label,
    required this.emoji,
    required this.description,
    required this.gradient,
    required this.grades,
    required this.examples,
  });
}

const MATHS_TOPICS = <MathsTopic>[
  MathsTopic(
    id: 'pre_algebra',
    label: 'Pre-Algebra',
    emoji: '🔢',
    description: 'Factors, multiples, fractions, decimals, ratios',
    gradient: ['#34D399', '#14B8A6'],
    grades: 'K-8',
    examples: ['Simplify 18/24', 'Find GCD of 36 and 48'],
  ),
  MathsTopic(
    id: 'algebra',
    label: 'Algebra',
    emoji: '✖️',
    description: 'Equations, expressions, inequalities, functions',
    gradient: ['#FBBF24', '#F97316'],
    grades: '6-12',
    examples: ['Solve: 2x + 5 = 17', 'Factorise: x² - 9'],
  ),
  MathsTopic(
    id: 'geometry',
    label: 'Geometry',
    emoji: '📐',
    description: 'Shapes, area, volume, perimeter, angles',
    gradient: ['#22D3EE', '#0EA5E9'],
    grades: 'K-12',
    examples: ['Area of circle r=7', 'Volume of cone r=3 h=10'],
  ),
  MathsTopic(
    id: 'trigonometry',
    label: 'Trigonometry',
    emoji: '📈',
    description: 'sin, cos, tan, identities, equations',
    gradient: ['#FB7185', '#EC4899'],
    grades: '9-12',
    examples: ['Solve 2 sin θ = 1', 'Prove sin²θ + cos²θ = 1'],
  ),
  MathsTopic(
    id: 'calculus',
    label: 'Calculus',
    emoji: '∫',
    description: 'Limits, derivatives, integrals',
    gradient: ['#A78BFA', '#9333EA'],
    grades: '11-12',
    examples: ['lim(x→0) sin(x)/x', 'Differentiate x³ + 2x²'],
  ),
  MathsTopic(
    id: 'statistics',
    label: 'Statistics',
    emoji: '📊',
    description: 'Mean, median, mode, probability, distributions',
    gradient: ['#FACC15', '#F59E0B'],
    grades: '5-12',
    examples: ['Mean of 5,8,12,15,20', 'P(rolling a 6)'],
  ),
  MathsTopic(
    id: 'linear_algebra',
    label: 'Linear Algebra',
    emoji: '🧮',
    description: 'Vectors, matrices, determinants, systems',
    gradient: ['#D946EF', '#DB2777'],
    grades: '11-12',
    examples: ['det([[2,1],[3,4]])', 'Solve x+y=5, x-y=1'],
  ),
  MathsTopic(
    id: 'word_problems',
    label: 'Word Problems',
    emoji: '📖',
    description: 'Real-life applications across all topics',
    gradient: ['#A3E635', '#22C55E'],
    grades: 'K-12',
    examples: ['Train 60km in 1.5h, speed?', '3 pens ₹45, 7 pens?'],
  ),
];

MathsTopic? mathsTopicById(String id) {
  for (final t in MATHS_TOPICS) {
    if (t.id == id) return t;
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

// ===== Question Bank =====

class QuestionBankItem {
  final String id;
  final int grade;
  final String subject;
  final String topic;
  final String difficulty;
  final String question;
  final List<String>? options;
  final String? hint;

  QuestionBankItem({
    required this.id,
    required this.grade,
    required this.subject,
    required this.topic,
    required this.difficulty,
    required this.question,
    this.options,
    this.hint,
  });

  factory QuestionBankItem.fromJson(Map<String, dynamic> j) => QuestionBankItem(
        id: j['id'] as String,
        grade: j['grade'] as int,
        subject: j['subject'] as String,
        topic: j['topic'] as String,
        difficulty: j['difficulty'] as String,
        question: j['question'] as String,
        options: j['options'] != null
            ? (j['options'] as List).map((e) => e.toString()).toList()
            : null,
        hint: j['hint'] as String?,
      );
}

// ===== Math Keyboard =====

class MathKey {
  final String id;
  final String label;
  final String symbol;
  const MathKey({required this.id, required this.label, required this.symbol});
}

class MathKeyPad {
  final String id;
  final String title;
  final List<String> gradient;
  final List<MathKey> keys;
  const MathKeyPad({
    required this.id,
    required this.title,
    required this.gradient,
    required this.keys,
  });
}

const MATH_KEY_PADS = <MathKeyPad>[
  MathKeyPad(
    id: 'basic',
    title: 'Basic',
    gradient: ['#34D399', '#14B8A6'],
    keys: [
      MathKey(id: 'plus', label: '+', symbol: '+'),
      MathKey(id: 'minus', label: '−', symbol: '-'),
      MathKey(id: 'multiply', label: '×', symbol: '×'),
      MathKey(id: 'divide', label: '÷', symbol: '÷'),
      MathKey(id: 'equals', label: '=', symbol: '='),
      MathKey(id: 'neq', label: '≠', symbol: '≠'),
      MathKey(id: 'lt', label: '<', symbol: '<'),
      MathKey(id: 'gt', label: '>', symbol: '>'),
      MathKey(id: 'leq', label: '≤', symbol: '≤'),
      MathKey(id: 'geq', label: '≥', symbol: '≥'),
      MathKey(id: 'approx', label: '≈', symbol: '≈'),
      MathKey(id: 'paren', label: '( )', symbol: '()'),
    ],
  ),
  MathKeyPad(
    id: 'power',
    title: 'Powers',
    gradient: ['#FBBF24', '#F97316'],
    keys: [
      MathKey(id: 'sq', label: 'x²', symbol: '²'),
      MathKey(id: 'cube', label: 'x³', symbol: '³'),
      MathKey(id: 'pow', label: 'x^n', symbol: '^'),
      MathKey(id: 'sqrt', label: '√', symbol: '√'),
      MathKey(id: 'cbrt', label: '∛', symbol: '∛'),
      MathKey(id: 'sub', label: 'x_n', symbol: '_'),
      MathKey(id: 'reciprocal', label: '1/x', symbol: '1/'),
      MathKey(id: 'frac', label: 'a/b', symbol: '/'),
      MathKey(id: 'infinity', label: '∞', symbol: '∞'),
      MathKey(id: 'abs', label: '|x|', symbol: '||'),
      MathKey(id: 'dot', label: '·', symbol: '·'),
      MathKey(id: 'pi', label: 'π', symbol: 'π'),
    ],
  ),
  MathKeyPad(
    id: 'constants',
    title: 'Constants',
    gradient: ['#22D3EE', '#0EA5E9'],
    keys: [
      MathKey(id: 'pi', label: 'π', symbol: 'π'),
      MathKey(id: 'e', label: 'e', symbol: 'e'),
      MathKey(id: 'i', label: 'i', symbol: 'i'),
      MathKey(id: 'phi', label: 'φ', symbol: 'φ'),
      MathKey(id: 'theta', label: 'θ', symbol: 'θ'),
      MathKey(id: 'alpha', label: 'α', symbol: 'α'),
      MathKey(id: 'beta', label: 'β', symbol: 'β'),
      MathKey(id: 'gamma', label: 'γ', symbol: 'γ'),
      MathKey(id: 'lambda', label: 'λ', symbol: 'λ'),
      MathKey(id: 'mu', label: 'μ', symbol: 'μ'),
      MathKey(id: 'sigma', label: 'σ', symbol: 'σ'),
      MathKey(id: 'delta', label: 'Δ', symbol: 'Δ'),
    ],
  ),
  MathKeyPad(
    id: 'functions',
    title: 'Functions',
    gradient: ['#FB7185', '#EC4899'],
    keys: [
      MathKey(id: 'sin', label: 'sin', symbol: 'sin('),
      MathKey(id: 'cos', label: 'cos', symbol: 'cos('),
      MathKey(id: 'tan', label: 'tan', symbol: 'tan('),
      MathKey(id: 'csc', label: 'csc', symbol: 'csc('),
      MathKey(id: 'sec', label: 'sec', symbol: 'sec('),
      MathKey(id: 'cot', label: 'cot', symbol: 'cot('),
      MathKey(id: 'log', label: 'log', symbol: 'log('),
      MathKey(id: 'ln', label: 'ln', symbol: 'ln('),
      MathKey(id: 'exp', label: 'e^', symbol: 'e^'),
      MathKey(id: 'abs_fn', label: 'abs', symbol: 'abs('),
      MathKey(id: 'lim', label: 'lim', symbol: 'lim_'),
      MathKey(id: 'sum', label: 'Σ', symbol: 'Σ'),
    ],
  ),
  MathKeyPad(
    id: 'calculus',
    title: 'Calculus',
    gradient: ['#A78BFA', '#9333EA'],
    keys: [
      MathKey(id: 'int', label: '∫', symbol: '∫'),
      MathKey(id: 'int_def', label: '∫_a^b', symbol: '∫_a^b '),
      MathKey(id: 'd_dx', label: 'd/dx', symbol: 'd/dx '),
      MathKey(id: 'partial', label: '∂', symbol: '∂'),
      MathKey(id: 'lim2', label: 'lim→0', symbol: 'lim_(x→0) '),
      MathKey(id: 'rightarrow', label: '→', symbol: '→'),
      MathKey(id: 'Rightarrow', label: '⇒', symbol: '⇒'),
      MathKey(id: 'therefore', label: '∴', symbol: '∴'),
      MathKey(id: 'because', label: '∵', symbol: '∵'),
      MathKey(id: 'forall', label: '∀', symbol: '∀'),
      MathKey(id: 'exists', label: '∃', symbol: '∃'),
      MathKey(id: 'in', label: '∈', symbol: '∈'),
    ],
  ),
  MathKeyPad(
    id: 'geometry',
    title: 'Geometry',
    gradient: ['#A3E635', '#22C55E'],
    keys: [
      MathKey(id: 'triangle', label: '△', symbol: '△'),
      MathKey(id: 'angle', label: '∠', symbol: '∠'),
      MathKey(id: 'perp', label: '⊥', symbol: '⊥'),
      MathKey(id: 'parallel', label: '∥', symbol: '∥'),
      MathKey(id: 'degree', label: '°', symbol: '°'),
      MathKey(id: 'circle', label: '○', symbol: '○'),
      MathKey(id: 'square_sym', label: '□', symbol: '□'),
      MathKey(id: 'cong', label: '≅', symbol: '≅'),
      MathKey(id: 'sim', label: '∼', symbol: '∼'),
      MathKey(id: 'arc', label: '⌒', symbol: '⌒'),
      MathKey(id: 'vector', label: '⃗', symbol: '⃗'),
      MathKey(id: 'in', label: '∈', symbol: '∈'),
    ],
  ),
];
