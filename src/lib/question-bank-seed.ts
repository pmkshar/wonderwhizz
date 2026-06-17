// Pre-built question bank seed data — K-12, all subjects, all maths topics
// Each entry: { grade, subject, topic, difficulty, question, options?, correctAnswer, hint?, explanation? }

export interface SeedQuestion {
  grade: number
  subject: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  options?: string[]
  correctAnswer: string
  hint?: string
  explanation?: string
}

export const SEED_QUESTIONS: SeedQuestion[] = [
  // ============== MATHS: PRE-ALGEBRA ==============
  {
    grade: 3, subject: 'maths', topic: 'pre_algebra', difficulty: 'easy',
    question: 'What is 6 × 7?',
    options: ['36', '42', '48', '49'],
    correctAnswer: '42',
    hint: 'Think of 7 groups of 6.',
    explanation: '6 × 7 = 42.',
  },
  {
    grade: 4, subject: 'maths', topic: 'pre_algebra', difficulty: 'easy',
    question: 'Simplify the fraction 18/24.',
    options: ['2/3', '3/4', '4/5', '5/6'],
    correctAnswer: '3/4',
    hint: 'Divide top and bottom by their GCD.',
    explanation: 'GCD(18,24)=6. 18÷6=3, 24÷6=4, so 18/24 = 3/4.',
  },
  {
    grade: 5, subject: 'maths', topic: 'pre_algebra', difficulty: 'medium',
    question: 'Find the LCM of 12 and 18.',
    options: ['24', '36', '48', '72'],
    correctAnswer: '36',
    hint: 'List multiples of each.',
    explanation: 'Multiples of 12: 12,24,36,... Multiples of 18: 18,36,... LCM = 36.',
  },
  {
    grade: 6, subject: 'maths', topic: 'pre_algebra', difficulty: 'medium',
    question: 'Convert 0.75 to a fraction in simplest form.',
    options: ['3/4', '7/10', '75/100', '1/2'],
    correctAnswer: '3/4',
    explanation: '0.75 = 75/100 = 3/4 after dividing by 25.',
  },
  {
    grade: 7, subject: 'maths', topic: 'pre_algebra', difficulty: 'medium',
    question: 'What is 15% of 240?',
    options: ['24', '36', '48', '60'],
    correctAnswer: '36',
    explanation: '15% = 0.15. 0.15 × 240 = 36.',
  },

  // ============== MATHS: ALGEBRA ==============
  {
    grade: 7, subject: 'maths', topic: 'algebra', difficulty: 'easy',
    question: 'Solve for x: 2x + 5 = 17',
    options: ['x = 4', 'x = 6', 'x = 7', 'x = 11'],
    correctAnswer: 'x = 6',
    hint: 'Subtract 5 from both sides first.',
    explanation: '2x + 5 = 17 → 2x = 12 → x = 6.',
  },
  {
    grade: 8, subject: 'maths', topic: 'algebra', difficulty: 'medium',
    question: 'Factorise: x² - 9',
    options: ['(x-3)(x-3)', '(x+3)(x+3)', '(x-3)(x+3)', '(x-9)(x+1)'],
    correctAnswer: '(x-3)(x+3)',
    hint: 'This is a difference of squares: a²-b² = (a-b)(a+b).',
    explanation: 'x² - 9 = x² - 3² = (x-3)(x+3).',
  },
  {
    grade: 9, subject: 'maths', topic: 'algebra', difficulty: 'medium',
    question: 'Find the roots of x² - 5x + 6 = 0.',
    options: ['x=2, x=3', 'x=-2, x=-3', 'x=1, x=6', 'x=-1, x=-6'],
    correctAnswer: 'x=2, x=3',
    hint: 'Find two numbers that multiply to 6 and add to -5.',
    explanation: 'x² - 5x + 6 = (x-2)(x-3) = 0, so x=2 or x=3.',
  },
  {
    grade: 10, subject: 'maths', topic: 'algebra', difficulty: 'hard',
    question: 'Simplify: (2x²)³',
    options: ['6x⁶', '8x⁶', '8x⁵', '2x⁶'],
    correctAnswer: '8x⁶',
    explanation: '(2x²)³ = 2³·(x²)³ = 8x⁶.',
  },
  {
    grade: 10, subject: 'maths', topic: 'algebra', difficulty: 'hard',
    question: 'Solve: 3x - 7 ≥ 2x + 5',
    options: ['x ≥ 12', 'x ≤ 12', 'x ≥ 2', 'x ≤ -2'],
    correctAnswer: 'x ≥ 12',
    explanation: '3x - 7 ≥ 2x + 5 → x ≥ 12.',
  },

  // ============== MATHS: GEOMETRY ==============
  {
    grade: 4, subject: 'maths', topic: 'geometry', difficulty: 'easy',
    question: 'What is the perimeter of a rectangle with length 8 cm and width 5 cm?',
    options: ['13 cm', '26 cm', '40 cm', '30 cm'],
    correctAnswer: '26 cm',
    explanation: 'Perimeter = 2(L+W) = 2(8+5) = 26 cm.',
  },
  {
    grade: 6, subject: 'maths', topic: 'geometry', difficulty: 'medium',
    question: 'Find the area of a circle with radius 7 cm. (Use π = 22/7)',
    options: ['154 cm²', '44 cm²', '22 cm²', '308 cm²'],
    correctAnswer: '154 cm²',
    hint: 'Area = π r²',
    explanation: 'A = π r² = (22/7) × 49 = 154 cm².',
  },
  {
    grade: 7, subject: 'maths', topic: 'geometry', difficulty: 'medium',
    question: 'What is the sum of interior angles of a hexagon?',
    options: ['360°', '540°', '720°', '900°'],
    correctAnswer: '720°',
    hint: 'Sum = (n-2) × 180°.',
    explanation: 'A hexagon has 6 sides. Sum = (6-2) × 180° = 720°.',
  },
  {
    grade: 8, subject: 'maths', topic: 'geometry', difficulty: 'medium',
    question: 'A right triangle has legs 6 cm and 8 cm. Find the hypotenuse.',
    options: ['10 cm', '12 cm', '14 cm', '9 cm'],
    correctAnswer: '10 cm',
    hint: 'Use Pythagoras: a² + b² = c².',
    explanation: 'c = √(36+64) = √100 = 10 cm.',
  },
  {
    grade: 9, subject: 'maths', topic: 'geometry', difficulty: 'hard',
    question: 'Find the volume of a cone with radius 3 cm and height 10 cm. (π = 3.14)',
    options: ['94.2 cm³', '31.4 cm³', '314 cm³', '942 cm³'],
    correctAnswer: '94.2 cm³',
    explanation: 'V = (1/3)π r² h = (1/3)(3.14)(9)(10) ≈ 94.2 cm³.',
  },

  // ============== MATHS: TRIGONOMETRY ==============
  {
    grade: 9, subject: 'maths', topic: 'trigonometry', difficulty: 'easy',
    question: 'What is tan(45°)?',
    options: ['0', '1', '√3', '1/2'],
    correctAnswer: '1',
    explanation: 'tan(45°) = sin(45°)/cos(45°) = (√2/2)/(√2/2) = 1.',
  },
  {
    grade: 10, subject: 'maths', topic: 'trigonometry', difficulty: 'medium',
    question: 'Solve: 2 sin θ = 1, for 0 ≤ θ ≤ 90°.',
    options: ['30°', '45°', '60°', '90°'],
    correctAnswer: '30°',
    hint: 'sin θ = 1/2.',
    explanation: '2 sin θ = 1 → sin θ = 1/2 → θ = 30°.',
  },
  {
    grade: 11, subject: 'maths', topic: 'trigonometry', difficulty: 'medium',
    question: 'Prove: sin²θ + cos²θ = ?',
    options: ['0', '1', '2', 'tan²θ'],
    correctAnswer: '1',
    explanation: 'The fundamental Pythagorean identity: sin²θ + cos²θ = 1.',
  },
  {
    grade: 11, subject: 'maths', topic: 'trigonometry', difficulty: 'hard',
    question: 'Find the value of sin(30°) + cos(60°).',
    options: ['1/2', '1', '√3/2', '0'],
    correctAnswer: '1',
    explanation: 'sin(30°) = 1/2 and cos(60°) = 1/2, so 1/2 + 1/2 = 1.',
  },

  // ============== MATHS: CALCULUS ==============
  {
    grade: 11, subject: 'maths', topic: 'calculus', difficulty: 'medium',
    question: 'Find lim(x→0) sin(x)/x.',
    options: ['0', '1', '∞', 'undefined'],
    correctAnswer: '1',
    hint: 'This is a famous limit.',
    explanation: 'The squeeze theorem shows lim(x→0) sin(x)/x = 1.',
  },
  {
    grade: 11, subject: 'maths', topic: 'calculus', difficulty: 'medium',
    question: 'Differentiate f(x) = x³ + 2x² - 5x.',
    options: ['3x² + 4x - 5', 'x² + 2x - 5', '3x² + 2x - 5', '3x² + 4x + 5'],
    correctAnswer: '3x² + 4x - 5',
    hint: 'Use the power rule: d/dx[x^n] = n·x^(n-1).',
    explanation: "f'(x) = 3x² + 4x - 5.",
  },
  {
    grade: 12, subject: 'maths', topic: 'calculus', difficulty: 'hard',
    question: 'Integrate: ∫(3x² + 2x) dx',
    options: ['x³ + x² + C', '6x + 2', 'x³ + x²', '3x³ + x² + C'],
    correctAnswer: 'x³ + x² + C',
    hint: 'Use the power rule in reverse: ∫x^n dx = x^(n+1)/(n+1).',
    explanation: '∫3x² dx = x³, ∫2x dx = x², so ∫(3x² + 2x) dx = x³ + x² + C.',
  },
  {
    grade: 12, subject: 'maths', topic: 'calculus', difficulty: 'hard',
    question: 'Find d/dx [sin(x) · e^x].',
    options: ['cos(x)·e^x + sin(x)·e^x', 'cos(x)·e^x', '-sin(x)·e^x', 'sin(x)·e^x'],
    correctAnswer: 'cos(x)·e^x + sin(x)·e^x',
    hint: 'Use the product rule: (uv)\' = u\'v + uv\'.',
    explanation: "(sin x · e^x)' = cos(x)·e^x + sin(x)·e^x = e^x(sin x + cos x).",
  },

  // ============== MATHS: STATISTICS ==============
  {
    grade: 5, subject: 'maths', topic: 'statistics', difficulty: 'easy',
    question: 'Find the mean of 5, 8, 12, 15, 20.',
    options: ['10', '12', '14', '15'],
    correctAnswer: '12',
    hint: 'Mean = sum ÷ count.',
    explanation: 'Sum = 60. Count = 5. Mean = 60 ÷ 5 = 12.',
  },
  {
    grade: 6, subject: 'maths', topic: 'statistics', difficulty: 'medium',
    question: 'Find the median of 4, 9, 12, 15, 18.',
    options: ['9', '12', '15', '11.6'],
    correctAnswer: '12',
    explanation: 'Already ordered. Middle value (3rd of 5) = 12.',
  },
  {
    grade: 8, subject: 'maths', topic: 'statistics', difficulty: 'medium',
    question: 'What is the probability of rolling a 6 on a fair 6-sided die?',
    options: ['1/2', '1/3', '1/6', '5/6'],
    correctAnswer: '1/6',
    explanation: '1 favourable outcome out of 6 possible = 1/6.',
  },
  {
    grade: 10, subject: 'maths', topic: 'statistics', difficulty: 'hard',
    question: 'Find the variance of [2, 4, 4, 4, 5, 5, 7, 9].',
    options: ['2', '4', '6', '8'],
    correctAnswer: '4',
    hint: 'Variance = average of squared deviations from mean.',
    explanation: 'Mean = 5. Squared deviations: 9,1,1,1,0,0,4,16. Sum=32. Variance = 32/8 = 4.',
  },

  // ============== MATHS: LINEAR ALGEBRA ==============
  {
    grade: 11, subject: 'maths', topic: 'linear_algebra', difficulty: 'medium',
    question: 'Find the determinant of [[2,1],[3,4]].',
    options: ['5', '8', '11', '-2'],
    correctAnswer: '5',
    hint: 'det = ad - bc for a 2x2 matrix.',
    explanation: 'det = (2)(4) - (1)(3) = 8 - 3 = 5.',
  },
  {
    grade: 11, subject: 'maths', topic: 'linear_algebra', difficulty: 'medium',
    question: 'Solve the system: x + y = 5, x - y = 1.',
    options: ['x=3, y=2', 'x=2, y=3', 'x=4, y=1', 'x=1, y=4'],
    correctAnswer: 'x=3, y=2',
    hint: 'Add the two equations.',
    explanation: 'Adding: 2x = 6 → x = 3. Then y = 5 - 3 = 2.',
  },
  {
    grade: 12, subject: 'maths', topic: 'linear_algebra', difficulty: 'hard',
    question: 'Multiply: [[1,2]] × [[3],[4]].',
    options: ['[[11]]', '[[3,4]]', '[[1,2,3,4]]', '[[3,8]]'],
    correctAnswer: '[[11]]',
    explanation: '(1×3) + (2×4) = 3 + 8 = 11. Result is a 1×1 matrix [[11]].',
  },

  // ============== MATHS: WORD PROBLEMS ==============
  {
    grade: 4, subject: 'maths', topic: 'word_problems', difficulty: 'easy',
    question: 'A train travels 60 km in 1.5 hours. Find its speed.',
    options: ['30 km/h', '40 km/h', '45 km/h', '90 km/h'],
    correctAnswer: '40 km/h',
    hint: 'Speed = Distance ÷ Time.',
    explanation: '60 km ÷ 1.5 h = 40 km/h.',
  },
  {
    grade: 5, subject: 'maths', topic: 'word_problems', difficulty: 'medium',
    question: 'If 3 pens cost ₹45, what do 7 pens cost?',
    options: ['₹90', '₹105', '₹120', '₹135'],
    correctAnswer: '₹105',
    hint: 'First find the cost of 1 pen.',
    explanation: '1 pen = ₹15. 7 pens = 7 × 15 = ₹105.',
  },
  {
    grade: 7, subject: 'maths', topic: 'word_problems', difficulty: 'medium',
    question: 'The sum of two numbers is 20 and their difference is 4. Find the larger number.',
    options: ['10', '12', '14', '16'],
    correctAnswer: '12',
    explanation: 'x + y = 20, x - y = 4 → 2x = 24 → x = 12.',
  },
  {
    grade: 8, subject: 'maths', topic: 'word_problems', difficulty: 'hard',
    question: 'A shopkeeper sells an item for ₹600 at a loss of 20%. What was the cost price?',
    options: ['₹480', '₹720', '₹750', '₹800'],
    correctAnswer: '₹750',
    hint: 'CP = SP / (1 - loss%)',
    explanation: 'CP = 600 / (1 - 0.20) = 600 / 0.8 = ₹750.',
  },

  // ============== SCIENCE ==============
  {
    grade: 3, subject: 'science', topic: 'general', difficulty: 'easy',
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 'Mars',
    explanation: 'Mars appears red due to iron oxide (rust) on its surface.',
  },
  {
    grade: 5, subject: 'science', topic: 'general', difficulty: 'easy',
    question: 'What is photosynthesis?',
    options: [
      'Plants making food from sunlight',
      'Animals eating plants',
      'Water flowing in plants',
      'Soil being formed',
    ],
    correctAnswer: 'Plants making food from sunlight',
    explanation: 'Photosynthesis is how plants use sunlight, water, and CO₂ to make glucose and oxygen.',
  },
  {
    grade: 7, subject: 'science', topic: 'general', difficulty: 'medium',
    question: "State Newton's third law of motion.",
    options: [
      'F = ma',
      'Every action has an equal and opposite reaction',
      'Energy is conserved',
      'Objects at rest stay at rest',
    ],
    correctAnswer: 'Every action has an equal and opposite reaction',
    explanation: 'For every force, there is a reaction force of equal magnitude in the opposite direction.',
  },
  {
    grade: 9, subject: 'science', topic: 'general', difficulty: 'medium',
    question: 'Why is the sky blue?',
    options: [
      'Reflection from oceans',
      'Rayleigh scattering of sunlight',
      'Ozone layer color',
      'Water vapor in air',
    ],
    correctAnswer: 'Rayleigh scattering of sunlight',
    explanation: 'Shorter wavelengths (blue) scatter more in air than longer wavelengths, so the sky appears blue.',
  },

  // ============== HINDI ==============
  {
    grade: 3, subject: 'hindi', topic: 'वर्णमाला', difficulty: 'easy',
    question: 'हिंदी वर्णमाला में कुल कितने व्यंजन होते हैं?',
    options: ['33', '44', '13', '54'],
    correctAnswer: '33',
    explanation: 'हिंदी वर्णमाला में 33 व्यंजन और 11 स्वर होते हैं।',
  },
  {
    grade: 5, subject: 'hindi', topic: 'संधि', difficulty: 'medium',
    question: '"विद्यालय" शब्द में कौन-सी संधि है?',
    options: ['स्वर संधि', 'व्यंजन संधि', 'विसर्ग संधि', 'कोई नहीं'],
    correctAnswer: 'स्वर संधि',
    hint: 'विद्या + आलय — दोनों में स्वर है।',
    explanation: 'विद्या + आलय = विद्यालय। आ + आ = आ, यह स्वर संधि है।',
  },
  {
    grade: 7, subject: 'hindi', topic: 'समास', difficulty: 'medium',
    question: '"राजा का पुत्र" का समास पहचानिए।',
    options: ['राजपुत्र', 'राजकुमारी', 'राजदरबार', 'राजमार्ग'],
    correctAnswer: 'राजपुत्र',
    explanation: 'राजा + पुत्र = राजपुत्र (तत्पुरुष समास)।',
  },
  {
    grade: 9, subject: 'hindi', topic: 'रस', difficulty: 'hard',
    question: 'किस रस का स्थायी भाव रोमांच है?',
    options: ['श्रृंगार रस', 'वीर रस', 'बीभत्स रस', 'अद्भुत रस'],
    correctAnswer: 'वीर रस',
    explanation: 'वीर रस का स्थायी भाव उत्साह/रोमांच होता है।',
  },

  // ============== KANNADA ==============
  {
    grade: 3, subject: 'kannada', topic: 'ವರ್ಣಮಾಲೆ', difficulty: 'easy',
    question: 'ಕನ್ನಡ ವರ್ಣಮಾಲೆಯಲ್ಲಿ ಒಟ್ಟು ಎಷ್ಟು ಸ್ವರಗಳಿವೆ?',
    options: ['13', '14', '15', '16'],
    correctAnswer: '14',
    explanation: 'ಕನ್ನಡದಲ್ಲಿ 14 ಸ್ವರಗಳು ಮತ್ತು 34 ವ್ಯಂಜನಗಳು ಇವೆ.',
  },
  {
    grade: 5, subject: 'kannada', topic: 'ಸಂಧಿ', difficulty: 'medium',
    question: '"ವಿದ್ಯಾಲಯ" ಪದದಲ್ಲಿ ಯಾವ ಸಂಧಿ ಇದೆ?',
    options: ['ಸ್ವರ ಸಂಧಿ', 'ವ್ಯಂಜನ ಸಂಧಿ', 'ವಿಸರ್ಗ ಸಂಧಿ', 'ಯಾವುದೂ ಇಲ್ಲ'],
    correctAnswer: 'ಸ್ವರ ಸಂಧಿ',
    hint: 'ವಿದ್ಯಾ + ಆಲಯ — ಎರಡೂ ಸ್ವರ.',
    explanation: 'ವಿದ್ಯಾ + ಆಲಯ = ವಿದ್ಯಾಲಯ. ಆ + ಆ = ಆ, ಇದು ಸ್ವರ ಸಂಧಿ.',
  },
  {
    grade: 7, subject: 'kannada', topic: 'ಸಮಾಸ', difficulty: 'medium',
    question: '"ರಾಜನ ಮಗ" ಎಂಬ ಪದದ ಸಮಾಸ ಗುರುತಿಸಿ.',
    options: ['ರಾಜಪುತ್ರ', 'ರಾಜಕುಮಾರಿ', 'ರಾಜದರ್ಬಾರ್', 'ರಾಜಮಾರ್ಗ'],
    correctAnswer: 'ರಾಜಪುತ್ರ',
    explanation: 'ರಾಜ + ಪುತ್ರ = ರಾಜಪುತ್ರ (ತತ್ಪುರುಷ ಸಮಾಸ).',
  },
  {
    grade: 9, subject: 'kannada', topic: 'ರಸ', difficulty: 'hard',
    question: 'ಯಾವ ರಸದ ಸ್ಥಾಯಿ ಭಾವ ಉತ್ಸಾಹ/ರೋಮಾಂಚನ?',
    options: ['ಶೃಂಗಾರ ರಸ', 'ವೀರ ರಸ', 'ಬೀಭತ್ಸ ರಸ', 'ಅದ್ಭುತ ರಸ'],
    correctAnswer: 'ವೀರ ರಸ',
    explanation: 'ವೀರ ರಸದ ಸ್ಥಾಯಿ ಭಾವ ಉತ್ಸಾಹವಾಗಿರುತ್ತದೆ.',
  },
]
