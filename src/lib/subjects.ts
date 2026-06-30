// Maths topic catalog and K-12 scope

export interface MathsTopic {
  id: string
  label: string
  emoji: string
  description: string
  gradient: string
  grades: string // e.g. "6-12" or "K-5"
  examples: string[]
  skills: string[]
}

export const MATHS_TOPICS: MathsTopic[] = [
  {
    id: 'pre_algebra',
    label: 'Pre-Algebra',
    emoji: '🔢',
    description: 'Factors, multiples, fractions, decimals, ratios',
    gradient: 'from-emerald-400 to-teal-500',
    grades: 'K-8',
    examples: [
      'Simplify the fraction 18/24',
      'Find the GCD of 36 and 48',
      'Convert 0.75 to a fraction',
    ],
    skills: [
      'Solving linear & quadratic equations',
      'Simplifying algebraic expressions',
      'Factors, multiples, primes',
      'Fractions and decimals',
    ],
  },
  {
    id: 'algebra',
    label: 'Algebra',
    emoji: '✖️',
    description: 'Equations, expressions, inequalities, functions',
    gradient: 'from-amber-400 to-orange-500',
    grades: '6-12',
    examples: [
      'Solve: 2x + 5 = 17',
      'Factorise: x² - 9',
      'Find roots of x² - 5x + 6 = 0',
    ],
    skills: [
      'Linear & quadratic equations',
      'Simplifying expressions',
      'Factoring polynomials',
      'Inequalities',
      'Functions and graphs',
    ],
  },
  {
    id: 'geometry',
    label: 'Geometry',
    emoji: '📐',
    description: 'Shapes, area, volume, perimeter, angles',
    gradient: 'from-cyan-400 to-sky-500',
    grades: 'K-12',
    examples: [
      'Find the area of a circle with radius 7 cm',
      'What is the sum of interior angles of a hexagon?',
      'Find the volume of a cone with r=3, h=10',
    ],
    skills: [
      'Area, perimeter, volume',
      'Triangles, polygons, circles',
      'Pythagoras theorem',
      'Coordinate geometry',
    ],
  },
  {
    id: 'trigonometry',
    label: 'Trigonometry',
    emoji: '📈',
    description: 'sin, cos, tan, identities, equations',
    gradient: 'from-rose-400 to-pink-500',
    grades: '9-12',
    examples: [
      'Solve: 2 sin θ = 1, 0 ≤ θ ≤ 2π',
      'Prove: sin²θ + cos²θ = 1',
      'Find tan(45°)',
    ],
    skills: [
      'Trigonometric ratios',
      'Solving trigonometric equations',
      'Identities and proofs',
      'Heights and distances',
    ],
  },
  {
    id: 'calculus',
    label: 'Calculus',
    emoji: '∫',
    description: 'Limits, derivatives, integrals',
    gradient: 'from-violet-400 to-purple-500',
    grades: '11-12',
    examples: [
      'Find lim(x→0) sin(x)/x',
      'Differentiate f(x) = x³ + 2x² - 5x',
      'Integrate ∫(3x² + 2x) dx',
    ],
    skills: [
      'Finding limits',
      'Derivatives (power, product, chain rule)',
      'Integrals (definite & indefinite)',
      'Applications of derivatives',
    ],
  },
  {
    id: 'statistics',
    label: 'Statistics',
    emoji: '📊',
    description: 'Mean, median, mode, probability, distributions',
    gradient: 'from-yellow-400 to-amber-500',
    grades: '5-12',
    examples: [
      'Find mean of 5, 8, 12, 15, 20',
      'What is the probability of rolling a 6 on a die?',
      'Find standard deviation of [2, 4, 4, 4, 5, 5, 7, 9]',
    ],
    skills: [
      'Mean, median, mode',
      'Standard deviation & variance',
      'Probability',
      'Distributions',
    ],
  },
  {
    id: 'linear_algebra',
    label: 'Linear Algebra',
    emoji: '🧮',
    description: 'Vectors, matrices, determinants, systems',
    gradient: 'from-fuchsia-500 to-pink-600',
    grades: '11-12',
    examples: [
      'Find the determinant of [[2,1],[3,4]]',
      'Solve the system: x+y=5, x-y=1',
      'Multiply matrices A=[[1,2]] and B=[[3],[4]]',
    ],
    skills: [
      'Matrix operations',
      'Determinants',
      'Solving systems of equations',
      'Vector spaces',
    ],
  },
  {
    id: 'word_problems',
    label: 'Word Problems',
    emoji: '📖',
    description: 'Real-life applications across all topics',
    gradient: 'from-lime-400 to-green-500',
    grades: 'K-12',
    examples: [
      'A train travels 60 km in 1.5 hours. Find its speed.',
      'If 3 pens cost ₹45, what do 7 pens cost?',
      'The sum of two numbers is 20 and their difference is 4. Find them.',
    ],
    skills: [
      'Translating words to equations',
      'Speed-distance-time',
      'Ratio & proportion',
      'Mixed application problems',
    ],
  },
]

export function getMathsTopic(id: string): MathsTopic | undefined {
  return MATHS_TOPICS.find((t) => t.id === id)
}

// Subjects metadata (updated: maths now has topics)
export interface SubjectMeta {
  id: string
  label: string
  emoji: string
  description: string
  gradient: string
  examples: string[]
  hasTopics: boolean
}

export const SUBJECTS: SubjectMeta[] = [
  {
    id: 'maths',
    label: 'Maths',
    emoji: '➗',
    description: 'Algebra, Calculus, Geometry, Trig & more',
    gradient: 'from-emerald-400 to-teal-500',
    examples: [
      'Solve: 2x + 5 = 17',
      'Find the area of a circle with radius 7 cm',
      'What is the LCM of 12 and 18?',
    ],
    hasTopics: true,
  },
  {
    id: 'hindi',
    label: 'Hindi',
    emoji: '📝',
    description: 'व्याकरण, साहित्य, पद्य, गद्य',
    gradient: 'from-orange-400 to-amber-500',
    examples: [
      'संधि के भेद उदाहरण सहित समझाइए',
      '"राम पुस्तक पढ़ता है" में कारक पहचानिए',
      'रस के प्रकार बताइए',
    ],
    hasTopics: false,
  },
  {
    id: 'science',
    label: 'Science',
    emoji: '🔬',
    description: 'Physics, chemistry, biology',
    gradient: 'from-cyan-400 to-sky-500',
    examples: [
      'Why is the sky blue?',
      'Explain Newton\u2019s third law of motion',
      'What is photosynthesis?',
    ],
    hasTopics: false,
  },
  {
    id: 'english',
    label: 'English',
    emoji: '📖',
    description: 'Reading, writing, comprehension, literature',
    gradient: 'from-indigo-400 to-blue-500',
    examples: [
      'What is the theme of the poem "Daffodils"?',
      'Write a letter to the editor about pollution',
      'Explain the difference between a simile and a metaphor',
    ],
    hasTopics: false,
  },
  {
    id: 'english_grammar',
    label: 'English Grammar',
    emoji: '✏️',
    description: 'Tenses, parts of speech, sentence structure, punctuation',
    gradient: 'from-teal-400 to-cyan-500',
    examples: [
      'What is the difference between present perfect and past simple?',
      'Identify the subject and predicate in "The cat sat on the mat"',
      'Explain active and passive voice with examples',
    ],
    hasTopics: false,
  },
  {
    id: 'kannada',
    label: 'Kannada',
    emoji: '🦁',
    description: 'ವ್ಯಾಕರಣ, ಸಾಹಿತ್ಯ, ಪದ್ಯ, ಗದ್ಯ',
    gradient: 'from-rose-400 to-pink-500',
    examples: [
      'ಸಂಧಿಯ ಭೇದಗಳನ್ನು ಉದಾಹರಣೆಯೊಂದಿಗೆ ವಿವರಿಸಿ',
      '"ನಾನು ಪುಸ್ತಕ ಓದುತ್ತೇನೆ" ಎಂಬ ವಾಕ್ಯದಲ್ಲಿ ಕಾರಕವನ್ನು ಗುರುತಿಸಿ',
      'ರಸದ ಪ್ರಕಾರಗಳನ್ನು ತಿಳಿಸಿ',
    ],
    hasTopics: false,
  },
]

export function getSubject(id: string): SubjectMeta | undefined {
  return SUBJECTS.find((s) => s.id === id)
}
