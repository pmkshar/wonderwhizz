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

  // =====================================================================
  // EXPANDED QUESTION BANK — added 2026-06 to ensure Practice page always
  // has questions for every grade 6-10 × subject × common-topic filter
  // combination. Covers CBSE / ICSE / Karnataka / Maharashtra syllabus
  // topics for the most common homework years.
  // =====================================================================

  // ===== MATHS GRADE 6 — CBSE/ICSE Chapter 1: Knowing Our Numbers =====
  {
    grade: 6, subject: 'maths', topic: 'pre_algebra', difficulty: 'easy',
    question: 'Write the number name for 85,432 in the Indian system.',
    options: ['Eighty-five thousand four hundred thirty-two', 'Eight lakh fifty-four thousand thirty-two', 'Eighty-five lakh four hundred', 'Eighty-five hundred thirty-two'],
    correctAnswer: 'Eighty-five thousand four hundred thirty-two',
    explanation: '85,432 = 85 thousand + 4 hundred + 32 = "Eighty-five thousand four hundred thirty-two".',
  },
  {
    grade: 6, subject: 'maths', topic: 'pre_algebra', difficulty: 'easy',
    question: 'Place value of 7 in 3,75,420 (Indian system)?',
    options: ['700', '7,000', '70,000', '7'],
    correctAnswer: '70,000',
    explanation: 'In 3,75,420 the digit 7 is in the ten-thousands place, so its value is 7 × 10,000 = 70,000.',
  },
  {
    grade: 6, subject: 'maths', topic: 'pre_algebra', difficulty: 'medium',
    question: 'Round 4,562 to the nearest hundred.',
    options: ['4,500', '4,600', '4,560', '4,570'],
    correctAnswer: '4,600',
    explanation: 'Tens digit is 6 (≥5), so round up: 4,562 → 4,600.',
  },
  {
    grade: 6, subject: 'maths', topic: 'pre_algebra', difficulty: 'medium',
    question: 'Estimate: 730 + 998 by rounding to nearest hundred.',
    options: ['1,700', '1,730', '1,800', '1,600'],
    correctAnswer: '1,700',
    explanation: '730 ≈ 700, 998 ≈ 1,000. Sum ≈ 700 + 1,000 = 1,700.',
  },

  // ===== MATHS GRADE 6 — Whole numbers / Integers =====
  {
    grade: 6, subject: 'maths', topic: 'pre_algebra', difficulty: 'easy',
    question: 'What is the predecessor of 1000?',
    options: ['999', '1001', '990', '100'],
    correctAnswer: '999',
    explanation: 'The predecessor of a number is the number just before it. 1000 − 1 = 999.',
  },
  {
    grade: 6, subject: 'maths', topic: 'pre_algebra', difficulty: 'medium',
    question: 'Evaluate: (−8) + (−5) + 3',
    options: ['−16', '−10', '0', '−6'],
    correctAnswer: '−10',
    explanation: '−8 + (−5) = −13. Then −13 + 3 = −10.',
  },
  {
    grade: 6, subject: 'maths', topic: 'pre_algebra', difficulty: 'medium',
    question: 'Which is smaller: −15 or −8?',
    options: ['−15', '−8', 'they are equal', 'cannot compare'],
    correctAnswer: '−15',
    explanation: 'On the number line, −15 is to the left of −8, so −15 is smaller (more negative).',
  },
  {
    grade: 6, subject: 'maths', topic: 'pre_algebra', difficulty: 'easy',
    question: 'Simplify the fraction 25/35.',
    options: ['5/7', '4/5', '3/5', '5/8'],
    correctAnswer: '5/7',
    explanation: 'GCD(25,35) = 5. 25÷5 = 5, 35÷5 = 7. So 25/35 = 5/7.',
  },

  // ===== MATHS GRADE 6 — Geometry =====
  {
    grade: 6, subject: 'maths', topic: 'geometry', difficulty: 'easy',
    question: 'How many lines of symmetry does an equilateral triangle have?',
    options: ['1', '2', '3', '0'],
    correctAnswer: '3',
    explanation: 'An equilateral triangle has 3 lines of symmetry, one through each vertex to the midpoint of the opposite side.',
  },
  {
    grade: 6, subject: 'maths', topic: 'geometry', difficulty: 'medium',
    question: 'The three angles of a triangle are 50°, 60°, and x°. Find x.',
    options: ['50°', '60°', '70°', '80°'],
    correctAnswer: '70°',
    explanation: 'Sum of angles in a triangle = 180°. So x = 180 − 50 − 60 = 70°.',
  },
  {
    grade: 6, subject: 'maths', topic: 'geometry', difficulty: 'easy',
    question: 'Perimeter of a square with side 9 cm?',
    options: ['18 cm', '36 cm', '81 cm', '27 cm'],
    correctAnswer: '36 cm',
    explanation: 'Perimeter of square = 4 × side = 4 × 9 = 36 cm.',
  },
  {
    grade: 6, subject: 'maths', topic: 'geometry', difficulty: 'medium',
    question: 'Area of a rectangle 12 cm × 7 cm?',
    options: ['19 cm²', '38 cm²', '84 cm²', '72 cm²'],
    correctAnswer: '84 cm²',
    explanation: 'Area = length × width = 12 × 7 = 84 cm².',
  },

  // ===== MATHS GRADE 6 — Decimals / Ratio =====
  {
    grade: 6, subject: 'maths', topic: 'pre_algebra', difficulty: 'easy',
    question: 'Express 0.5 as a fraction in lowest terms.',
    options: ['1/2', '5/10', '1/5', '2/5'],
    correctAnswer: '1/2',
    explanation: '0.5 = 5/10 = 1/2 (dividing both by 5).',
  },
  {
    grade: 6, subject: 'maths', topic: 'pre_algebra', difficulty: 'medium',
    question: 'Find the ratio of 25 cm to 1 metre.',
    options: ['1:4', '1:40', '25:100', '4:1'],
    correctAnswer: '1:4',
    explanation: '1 m = 100 cm. Ratio = 25 : 100 = 1 : 4 (dividing by 25).',
  },
  {
    grade: 6, subject: 'maths', topic: 'pre_algebra', difficulty: 'medium',
    question: 'Convert 35% to a fraction.',
    options: ['7/20', '35/100', '3/5', '5/20'],
    correctAnswer: '7/20',
    explanation: '35% = 35/100 = 7/20 (dividing by 5).',
  },

  // ===== MATHS GRADE 7 — Integers / Fractions =====
  {
    grade: 7, subject: 'maths', topic: 'pre_algebra', difficulty: 'medium',
    question: 'Evaluate: (−12) × (−4) + (−3) × 5',
    options: ['33', '63', '−33', '−63'],
    correctAnswer: '33',
    explanation: '(−12) × (−4) = 48. (−3) × 5 = −15. So 48 + (−15) = 33.',
  },
  {
    grade: 7, subject: 'maths', topic: 'pre_algebra', difficulty: 'easy',
    question: 'Add: 3/4 + 1/8',
    options: ['4/12', '7/8', '4/8', '1/2'],
    correctAnswer: '7/8',
    explanation: 'LCM(4,8) = 8. 3/4 = 6/8. 6/8 + 1/8 = 7/8.',
  },
  {
    grade: 7, subject: 'maths', topic: 'pre_algebra', difficulty: 'medium',
    question: 'Multiply: 2/3 × 9/10',
    options: ['18/30', '3/5', '6/13', '3/10'],
    correctAnswer: '3/5',
    explanation: '2/3 × 9/10 = 18/30 = 3/5 (simplified by dividing by 6).',
  },
  {
    grade: 7, subject: 'maths', topic: 'pre_algebra', difficulty: 'hard',
    question: 'Divide: (3/5) ÷ (9/20)',
    options: ['4/3', '3/4', '27/100', '1/3'],
    correctAnswer: '4/3',
    explanation: '(3/5) ÷ (9/20) = (3/5) × (20/9) = 60/45 = 4/3.',
  },

  // ===== MATHS GRADE 7 — Algebra =====
  {
    grade: 7, subject: 'maths', topic: 'algebra', difficulty: 'easy',
    question: 'Simplify: 5x + 3x − 2x',
    options: ['6x', '10x', '4x', '8x'],
    correctAnswer: '6x',
    explanation: '5x + 3x − 2x = (5+3−2)x = 6x.',
  },
  {
    grade: 7, subject: 'maths', topic: 'algebra', difficulty: 'medium',
    question: 'If 3x = 24, find x.',
    options: ['6', '7', '8', '9'],
    correctAnswer: '8',
    explanation: '3x = 24 → x = 24/3 = 8.',
  },
  {
    grade: 7, subject: 'maths', topic: 'algebra', difficulty: 'medium',
    question: 'Solve: 4(x − 3) = 20',
    options: ['x = 5', 'x = 7', 'x = 8', 'x = 6'],
    correctAnswer: 'x = 8',
    explanation: '4(x−3) = 20 → x − 3 = 5 → x = 8.',
  },

  // ===== MATHS GRADE 7 — Geometry =====
  {
    grade: 7, subject: 'maths', topic: 'geometry', difficulty: 'easy',
    question: 'Two angles of a triangle are 35° and 65°. Find the third angle.',
    options: ['80°', '90°', '100°', '70°'],
    correctAnswer: '80°',
    explanation: 'Third angle = 180° − 35° − 65° = 80°.',
  },
  {
    grade: 7, subject: 'maths', topic: 'geometry', difficulty: 'medium',
    question: 'A square has area 81 m². Find its perimeter.',
    options: ['36 m', '18 m', '40 m', '9 m'],
    correctAnswer: '36 m',
    explanation: 'Area = side² = 81 → side = 9 m. Perimeter = 4 × 9 = 36 m.',
  },
  {
    grade: 7, subject: 'maths', topic: 'geometry', difficulty: 'medium',
    question: 'In ΔPQR, if PQ = QR, what kind of triangle is it?',
    options: ['Scalene', 'Isosceles', 'Equilateral', 'Right-angled'],
    correctAnswer: 'Isosceles',
    explanation: 'A triangle with two equal sides is called isosceles.',
  },

  // ===== MATHS GRADE 8 — Algebra / Linear equations =====
  {
    grade: 8, subject: 'maths', topic: 'algebra', difficulty: 'easy',
    question: 'Solve: 3x + 7 = 22',
    options: ['x = 5', 'x = 6', 'x = 7', 'x = 8'],
    correctAnswer: 'x = 5',
    explanation: '3x + 7 = 22 → 3x = 15 → x = 5.',
  },
  {
    grade: 8, subject: 'maths', topic: 'algebra', difficulty: 'medium',
    question: 'Solve the pair: x + y = 7, x − y = 1',
    options: ['x=4, y=3', 'x=3, y=4', 'x=5, y=2', 'x=6, y=1'],
    correctAnswer: 'x=4, y=3',
    explanation: 'Add: 2x = 8 → x = 4. Then y = 7 − 4 = 3.',
  },
  {
    grade: 8, subject: 'maths', topic: 'algebra', difficulty: 'medium',
    question: 'Factorise: x² + 7x + 12',
    options: ['(x+3)(x+4)', '(x+2)(x+6)', '(x+1)(x+12)', '(x+3)(x+5)'],
    correctAnswer: '(x+3)(x+4)',
    explanation: 'Find two numbers that multiply to 12 and add to 7: 3 and 4. So x²+7x+12 = (x+3)(x+4).',
  },
  {
    grade: 8, subject: 'maths', topic: 'algebra', difficulty: 'hard',
    question: 'Simplify: (2x²y)³',
    options: ['6x⁶y³', '8x⁶y³', '2x⁶y³', '8x⁵y³'],
    correctAnswer: '8x⁶y³',
    explanation: '(2x²y)³ = 2³ × (x²)³ × y³ = 8x⁶y³.',
  },

  // ===== MATHS GRADE 8 — Geometry / Mensuration =====
  {
    grade: 8, subject: 'maths', topic: 'geometry', difficulty: 'medium',
    question: 'Volume of a cube with edge 5 cm?',
    options: ['25 cm³', '75 cm³', '125 cm³', '100 cm³'],
    correctAnswer: '125 cm³',
    explanation: 'Volume of cube = side³ = 5³ = 125 cm³.',
  },
  {
    grade: 8, subject: 'maths', topic: 'geometry', difficulty: 'medium',
    question: 'Surface area of a cuboid 10 × 8 × 5 cm?',
    options: ['220 cm²', '300 cm²', '340 cm²', '400 cm²'],
    correctAnswer: '340 cm²',
    explanation: 'SA = 2(lb + bh + lh) = 2(80 + 40 + 50) = 2 × 170 = 340 cm².',
  },
  {
    grade: 8, subject: 'maths', topic: 'geometry', difficulty: 'hard',
    question: 'A cylinder has r = 7 cm, h = 10 cm. Find its volume. (π = 22/7)',
    options: ['1540 cm³', '770 cm³', '440 cm³', '308 cm³'],
    correctAnswer: '1540 cm³',
    explanation: 'V = πr²h = (22/7) × 49 × 10 = 22 × 7 × 10 = 1540 cm³.',
  },

  // ===== MATHS GRADE 8 — Statistics / Probability =====
  {
    grade: 8, subject: 'maths', topic: 'statistics', difficulty: 'easy',
    question: 'Find the mode of: 4, 5, 6, 5, 7, 5, 8, 9',
    options: ['4', '5', '6', '7'],
    correctAnswer: '5',
    explanation: '5 appears three times — more than any other value. Mode = 5.',
  },
  {
    grade: 8, subject: 'maths', topic: 'statistics', difficulty: 'medium',
    question: 'Probability of getting a head when tossing a fair coin?',
    options: ['1/4', '1/3', '1/2', '2/3'],
    correctAnswer: '1/2',
    explanation: '1 favourable outcome (head) out of 2 possible. P(head) = 1/2.',
  },
  {
    grade: 8, subject: 'maths', topic: 'statistics', difficulty: 'medium',
    question: 'A bag has 4 red and 6 blue marbles. P(red)?',
    options: ['2/5', '3/5', '1/3', '4/5'],
    correctAnswer: '2/5',
    explanation: 'Total = 10 marbles. P(red) = 4/10 = 2/5.',
  },

  // ===== MATHS GRADE 9 — Number systems / Polynomials =====
  {
    grade: 9, subject: 'maths', topic: 'algebra', difficulty: 'easy',
    question: 'Which of these is an irrational number?',
    options: ['0.25', '√2', '3/4', '−7'],
    correctAnswer: '√2',
    explanation: '√2 ≈ 1.4142... cannot be expressed as p/q, so it is irrational.',
  },
  {
    grade: 9, subject: 'maths', topic: 'algebra', difficulty: 'medium',
    question: 'Find the zero of the polynomial p(x) = 2x − 10.',
    options: ['x = 2', 'x = 5', 'x = 10', 'x = −5'],
    correctAnswer: 'x = 5',
    explanation: 'p(x) = 0 → 2x − 10 = 0 → x = 5.',
  },
  {
    grade: 9, subject: 'maths', topic: 'algebra', difficulty: 'medium',
    question: 'Factorise: x² − 5x + 6',
    options: ['(x−2)(x−3)', '(x−1)(x−6)', '(x+2)(x+3)', '(x−2)(x+3)'],
    correctAnswer: '(x−2)(x−3)',
    explanation: 'Numbers that multiply to 6 and add to −5: −2 and −3. So x²−5x+6 = (x−2)(x−3).',
  },
  {
    grade: 9, subject: 'maths', topic: 'algebra', difficulty: 'hard',
    question: 'If (x − 2) is a factor of x² − 3x + k, find k.',
    options: ['2', '−2', '4', '6'],
    correctAnswer: '2',
    explanation: 'Substitute x = 2: 4 − 6 + k = 0 → k = 2.',
  },

  // ===== MATHS GRADE 9 — Geometry / Lines & Angles =====
  {
    grade: 9, subject: 'maths', topic: 'geometry', difficulty: 'easy',
    question: 'Two angles are supplementary. One is 70°. Other angle?',
    options: ['110°', '90°', '20°', '70°'],
    correctAnswer: '110°',
    explanation: 'Supplementary angles sum to 180°. Other = 180 − 70 = 110°.',
  },
  {
    grade: 9, subject: 'maths', topic: 'geometry', difficulty: 'medium',
    question: 'In ΔABC, AB = AC and ∠B = 50°. Find ∠A.',
    options: ['50°', '80°', '100°', '60°'],
    correctAnswer: '80°',
    explanation: 'AB = AC → ∠B = ∠C = 50°. ∠A = 180 − 50 − 50 = 80°.',
  },
  {
    grade: 9, subject: 'maths', topic: 'geometry', difficulty: 'hard',
    question: 'Diagonals of a rectangle are 10 cm each. If one side is 6 cm, other side?',
    options: ['6 cm', '8 cm', '10 cm', '12 cm'],
    correctAnswer: '8 cm',
    explanation: 'Diagonals are equal. 10² = 6² + b² → 100 = 36 + b² → b² = 64 → b = 8 cm.',
  },

  // ===== MATHS GRADE 9 — Trigonometry intro =====
  {
    grade: 9, subject: 'maths', topic: 'trigonometry', difficulty: 'easy',
    question: 'In a right triangle, the side opposite the right angle is called the…',
    options: ['Adjacent', 'Opposite', 'Hypotenuse', 'Perpendicular'],
    correctAnswer: 'Hypotenuse',
    explanation: 'The hypotenuse is the longest side, opposite the right angle.',
  },
  {
    grade: 9, subject: 'maths', topic: 'trigonometry', difficulty: 'medium',
    question: 'In ΔABC right-angled at B, if AB = 3, BC = 4, find AC.',
    options: ['5', '6', '7', '√7'],
    correctAnswer: '5',
    explanation: 'AC is hypotenuse. AC = √(3² + 4²) = √25 = 5.',
  },

  // ===== MATHS GRADE 10 — Quadratic / Arithmetic Progressions =====
  {
    grade: 10, subject: 'maths', topic: 'algebra', difficulty: 'medium',
    question: 'Find the discriminant of x² − 4x + 4 = 0.',
    options: ['0', '4', '8', '16'],
    correctAnswer: '0',
    explanation: 'D = b² − 4ac = (−4)² − 4(1)(4) = 16 − 16 = 0. The roots are equal.',
  },
  {
    grade: 10, subject: 'maths', topic: 'algebra', difficulty: 'hard',
    question: 'Solve: x² − 7x + 12 = 0',
    options: ['x = 3, 4', 'x = −3, −4', 'x = 2, 6', 'x = 1, 12'],
    correctAnswer: 'x = 3, 4',
    explanation: 'x² − 7x + 12 = (x−3)(x−4) = 0. So x = 3 or x = 4.',
  },
  {
    grade: 10, subject: 'maths', topic: 'algebra', difficulty: 'medium',
    question: '5th term of the AP: 2, 5, 8, 11, ...',
    options: ['14', '17', '11', '20'],
    correctAnswer: '14',
    explanation: 'a = 2, d = 3. a₅ = a + 4d = 2 + 4(3) = 14.',
  },
  {
    grade: 10, subject: 'maths', topic: 'algebra', difficulty: 'hard',
    question: 'Sum of first 10 natural numbers (1 + 2 + ... + 10)?',
    options: ['45', '55', '65', '50'],
    correctAnswer: '55',
    explanation: 'Sum = n(n+1)/2 = 10 × 11 / 2 = 55.',
  },

  // ===== MATHS GRADE 10 — Trigonometry / Circles =====
  {
    grade: 10, subject: 'maths', topic: 'trigonometry', difficulty: 'easy',
    question: 'Value of sin 30° + cos 60°?',
    options: ['1/2', '1', '0', '√3/2'],
    correctAnswer: '1',
    explanation: 'sin 30° = 1/2 and cos 60° = 1/2. Sum = 1/2 + 1/2 = 1.',
  },
  {
    grade: 10, subject: 'maths', topic: 'trigonometry', difficulty: 'medium',
    question: 'If sin θ = 3/5, find cos θ (θ acute).',
    options: ['4/5', '3/4', '5/4', '5/3'],
    correctAnswer: '4/5',
    explanation: 'cos²θ = 1 − sin²θ = 1 − 9/25 = 16/25. cos θ = 4/5.',
  },
  {
    grade: 10, subject: 'maths', topic: 'geometry', difficulty: 'medium',
    question: 'Length of tangent from external point P, 10 cm from circle centre O (r = 6 cm)?',
    options: ['10 cm', '8 cm', '14 cm', '2 cm'],
    correctAnswer: '8 cm',
    explanation: 'Tangent ⊥ radius at point of contact. Using Pythagoras: PT² = OP² − r² = 10² − 6² = 100 − 36 = 64. PT = 8 cm.',
  },

  // ===== SCIENCE GRADE 6 — Food, Materials, Living world =====
  {
    grade: 6, subject: 'science', topic: 'general', difficulty: 'easy',
    question: 'Which part of the plant makes food?',
    options: ['Root', 'Stem', 'Leaf', 'Flower'],
    correctAnswer: 'Leaf',
    explanation: 'Leaves contain chlorophyll and carry out photosynthesis to make food for the plant.',
  },
  {
    grade: 6, subject: 'science', topic: 'general', difficulty: 'easy',
    question: 'Which of these is a herbivore?',
    options: ['Lion', 'Tiger', 'Cow', 'Vulture'],
    correctAnswer: 'Cow',
    explanation: 'Cows eat only plants, so they are herbivores. Lions, tigers, and vultures eat other animals.',
  },
  {
    grade: 6, subject: 'science', topic: 'general', difficulty: 'medium',
    question: 'Which gas do humans need to breathe in to live?',
    options: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'],
    correctAnswer: 'Oxygen',
    explanation: 'Humans breathe in oxygen for respiration, which releases energy from food.',
  },
  {
    grade: 6, subject: 'science', topic: 'general', difficulty: 'medium',
    question: 'Which of these is a reversible change?',
    options: ['Burning of paper', 'Melting of ice', 'Cooking of food', 'Rusting of iron'],
    correctAnswer: 'Melting of ice',
    explanation: 'Melting ice can be reversed by freezing the water back into ice. The others cannot be reversed.',
  },
  {
    grade: 6, subject: 'science', topic: 'general', difficulty: 'easy',
    question: 'How many bones are there in the adult human body?',
    options: ['206', '201', '215', '198'],
    correctAnswer: '206',
    explanation: 'An adult human skeleton has 206 bones. Babies are born with more, but some fuse as they grow.',
  },

  // ===== SCIENCE GRADE 7 — Heat, Acids/Bases, Life processes =====
  {
    grade: 7, subject: 'science', topic: 'general', difficulty: 'easy',
    question: 'Heat always flows from…',
    options: ['cold to hot', 'hot to cold', 'low to high pressure', 'north to south'],
    correctAnswer: 'hot to cold',
    explanation: 'Heat flows from a hotter object to a colder one until both reach the same temperature.',
  },
  {
    grade: 7, subject: 'science', topic: 'general', difficulty: 'medium',
    question: 'Which is an acidic substance?',
    options: ['Baking soda', 'Vinegar', 'Milk of magnesia', 'Soap solution'],
    correctAnswer: 'Vinegar',
    explanation: 'Vinegar contains acetic acid and turns blue litmus red. The others are basic.',
  },
  {
    grade: 7, subject: 'science', topic: 'general', difficulty: 'medium',
    question: 'Which organ in humans pumps blood?',
    options: ['Lungs', 'Liver', 'Heart', 'Kidney'],
    correctAnswer: 'Heart',
    explanation: 'The heart is a muscular organ that pumps blood throughout the body via the circulatory system.',
  },
  {
    grade: 7, subject: 'science', topic: 'general', difficulty: 'easy',
    question: 'Which colour of light is dispersed the most by a prism?',
    options: ['Red', 'Yellow', 'Green', 'Violet'],
    correctAnswer: 'Violet',
    explanation: 'Violet light has the shortest wavelength and bends the most when passing through a prism.',
  },
  {
    grade: 7, subject: 'science', topic: 'general', difficulty: 'hard',
    question: 'Speed of sound is maximum in…',
    options: ['Vacuum', 'Air', 'Water', 'Steel'],
    correctAnswer: 'Steel',
    explanation: 'Sound travels fastest in solids because particles are tightly packed. Speed: steel > water > air > vacuum.',
  },

  // ===== SCIENCE GRADE 8 — Metals, Force, Light, Cells =====
  {
    grade: 8, subject: 'science', topic: 'general', difficulty: 'easy',
    question: 'Which of these is a metal?',
    options: ['Oxygen', 'Sulphur', 'Iron', 'Chlorine'],
    correctAnswer: 'Iron',
    explanation: 'Iron is a metal — it is lustrous, malleable, ductile, and conducts electricity. The others are non-metals.',
  },
  {
    grade: 8, subject: 'science', topic: 'general', difficulty: 'medium',
    question: 'SI unit of force?',
    options: ['Joule', 'Watt', 'Newton', 'Pascal'],
    correctAnswer: 'Newton',
    explanation: 'Force is measured in Newtons (N). 1 N = 1 kg·m/s².',
  },
  {
    grade: 8, subject: 'science', topic: 'general', difficulty: 'medium',
    question: 'Which part of the cell contains genetic material?',
    options: ['Cytoplasm', 'Nucleus', 'Cell membrane', 'Mitochondria'],
    correctAnswer: 'Nucleus',
    explanation: 'The nucleus contains DNA, the genetic material that controls the cell\'s activities.',
  },
  {
    grade: 8, subject: 'science', topic: 'general', difficulty: 'easy',
    question: 'What type of image is formed by a plane mirror?',
    options: ['Real and inverted', 'Virtual and erect', 'Real and erect', 'Virtual and inverted'],
    correctAnswer: 'Virtual and erect',
    explanation: 'A plane mirror always forms a virtual, erect, laterally inverted image of the same size as the object.',
  },
  {
    grade: 8, subject: 'science', topic: 'general', difficulty: 'hard',
    question: 'Friction always acts…',
    options: ['in the direction of motion', 'opposite to the direction of motion', 'perpendicular to motion', 'upwards'],
    correctAnswer: 'opposite to the direction of motion',
    explanation: 'Friction is a contact force that always opposes the relative motion between two surfaces.',
  },

  // ===== SCIENCE GRADE 9 — Matter, Atoms, Cells =====
  {
    grade: 9, subject: 'science', topic: 'general', difficulty: 'easy',
    question: 'Which state of matter has neither definite shape nor definite volume?',
    options: ['Solid', 'Liquid', 'Gas', 'Plasma'],
    correctAnswer: 'Gas',
    explanation: 'Gases take the shape of their container and fill all available space — no definite shape or volume.',
  },
  {
    grade: 9, subject: 'science', topic: 'general', difficulty: 'medium',
    question: 'Atomic number of an element is the number of…',
    options: ['Neutrons', 'Protons', 'Electrons + Neutrons', 'Nucleons'],
    correctAnswer: 'Protons',
    explanation: 'Atomic number (Z) = number of protons in the nucleus. In a neutral atom, this also equals the number of electrons.',
  },
  {
    grade: 9, subject: 'science', topic: 'general', difficulty: 'medium',
    question: 'Which organelle is called the "powerhouse of the cell"?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'],
    correctAnswer: 'Mitochondria',
    explanation: 'Mitochondria carry out cellular respiration and produce ATP, the cell\'s energy currency.',
  },
  {
    grade: 9, subject: 'science', topic: 'general', difficulty: 'hard',
    question: 'Newton\'s second law of motion: F = ?',
    options: ['mv', 'ma', 'mgh', '1/2 mv²'],
    correctAnswer: 'ma',
    explanation: 'Force = mass × acceleration. SI unit is the Newton (N).',
  },
  {
    grade: 9, subject: 'science', topic: 'general', difficulty: 'easy',
    question: 'What is the chemical formula of water?',
    options: ['H₂O', 'CO₂', 'O₂', 'NaCl'],
    correctAnswer: 'H₂O',
    explanation: 'Water is made of 2 hydrogen atoms bonded to 1 oxygen atom: H₂O.',
  },

  // ===== SCIENCE GRADE 10 — Light, Electricity, Chemistry =====
  {
    grade: 10, subject: 'science', topic: 'general', difficulty: 'medium',
    question: 'SI unit of electric current?',
    options: ['Volt', 'Ampere', 'Ohm', 'Watt'],
    correctAnswer: 'Ampere',
    explanation: 'Current is measured in Amperes (A). 1 A = 1 Coulomb/second.',
  },
  {
    grade: 10, subject: 'science', topic: 'general', difficulty: 'easy',
    question: 'Which lens is used to correct myopia (short-sightedness)?',
    options: ['Convex', 'Concave', 'Cylindrical', 'Bifocal'],
    correctAnswer: 'Concave',
    explanation: 'A concave (diverging) lens shifts the image back onto the retina for a myopic eye.',
  },
  {
    grade: 10, subject: 'science', topic: 'general', difficulty: 'medium',
    question: 'pH of a neutral solution at 25°C?',
    options: ['0', '7', '14', '1'],
    correctAnswer: '7',
    explanation: 'Pure water has pH 7 at 25°C. Below 7 is acidic, above 7 is basic.',
  },
  {
    grade: 10, subject: 'science', topic: 'general', difficulty: 'hard',
    question: 'Which gas is liberated when zinc reacts with dilute HCl?',
    options: ['Oxygen', 'Hydrogen', 'Chlorine', 'Carbon dioxide'],
    correctAnswer: 'Hydrogen',
    explanation: 'Zn + 2HCl → ZnCl₂ + H₂↑. Active metals displace hydrogen from dilute acids.',
  },
  {
    grade: 10, subject: 'science', topic: 'general', difficulty: 'medium',
    question: 'Which part of the human eye controls the amount of light entering?',
    options: ['Cornea', 'Iris', 'Retina', 'Lens'],
    correctAnswer: 'Iris',
    explanation: 'The iris adjusts the pupil size — constricting in bright light, dilating in dim light.',
  },

  // ===== HINDI GRADE 6-10 =====
  {
    grade: 6, subject: 'hindi', topic: 'संज्ञा', difficulty: 'easy',
    question: '"राम आम खाता है" में कौन-सा शब्द संज्ञा है?',
    options: ['राम', 'आम', 'खाता', 'राम और आम दोनों'],
    correctAnswer: 'राम और आम दोनों',
    explanation: 'राम (व्यक्तिवाचक संज्ञा) और आम (जातिवाचक संज्ञा) दोनों संज्ञा हैं।',
  },
  {
    grade: 6, subject: 'hindi', topic: 'लिंग', difficulty: 'easy',
    question: '"बंदर" का स्त्रीलिंग रूप बताइए।',
    options: ['बंदरी', 'बंदरिन', 'बंदरिया', 'बंदरीन'],
    correctAnswer: 'बंदरिया',
    explanation: '"बंदर" का स्त्रीलिंग रूप "बंदरिया" होता है।',
  },
  {
    grade: 7, subject: 'hindi', topic: 'कारक', difficulty: 'medium',
    question: '"मोहन ने रोटी खाई" — इस वाक्य में "रोटी" किस कारक में है?',
    options: ['कर्ता', 'कर्म', 'करण', 'संप्रदान'],
    correctAnswer: 'कर्म',
    explanation: '"रोटी" यहाँ खाने की क्रिया का गुण है (जिसे खाया गया), अतः यह कर्म कारक है। "ने" कर्ता कारक का चिह्न है।',
  },
  {
    grade: 7, subject: 'hindi', topic: 'संधि', difficulty: 'medium',
    question: '"विद्यालय" में कौन-सी संधि है?',
    options: ['व्यंजन संधि', 'स्वर संधि', 'विसर्ग संधि', 'कोई नहीं'],
    correctAnswer: 'स्वर संधि',
    explanation: 'विद्या + आलय = विद्यालय। आ + आ = आ — यह स्वर संधि (दीर्घ संधि) है।',
  },
  {
    grade: 8, subject: 'hindi', topic: 'समास', difficulty: 'medium',
    question: '"राजपुत्र" किस समास का उदाहरण है?',
    options: ['तत्पुरुष', 'बहुव्रीहि', 'द्वंद्व', 'कर्मधारय'],
    correctAnswer: 'तत्पुरुष',
    explanation: 'राजा का पुत्र = राजपुत्र। यह तत्पुरुष समास है (अर्थ में संबंध सूचक का लोप)।',
  },
  {
    grade: 8, subject: 'hindi', topic: 'अलंकार', difficulty: 'hard',
    question: '"चाँद सा चेहरा" में कौन-सा अलंकार है?',
    options: ['अनुप्रास', 'उपमा', 'रूपक', 'यमक'],
    correctAnswer: 'उपमा',
    explanation: 'चेहरे की तुलना चाँद से की गई है — उपमेद (चेहरा), उपमान (चाँद), साधर्म्य (सा) — यह उपमा अलंकार है।',
  },
  {
    grade: 9, subject: 'hindi', topic: 'रस', difficulty: 'hard',
    question: 'श्रृंगार रस का स्थायी भाव क्या है?',
    options: ['रति', 'उत्साह', 'हास्य', 'क्रोध'],
    correctAnswer: 'रति',
    explanation: 'श्रृंगार रस का स्थायी भाव रति (प्रेम/आकर्षण) है।',
  },
  {
    grade: 10, subject: 'hindi', topic: 'रस', difficulty: 'hard',
    question: 'करुण रस का स्थायी भाव क्या कहलाता है?',
    options: ['शोक', 'भय', 'घृणा', 'आश्चर्य'],
    correctAnswer: 'शोक',
    explanation: 'करुण रस का स्थायी भाव शोक (विषाद) है — जब किसी प्रिय वस्तु की हानि होती है।',
  },
  {
    grade: 10, subject: 'hindi', topic: 'समास', difficulty: 'hard',
    question: '"दशानन" (दस ही मुख वाला रावण) किस समास का उदाहरण है?',
    options: ['बहुव्रीहि', 'द्विगु', 'कर्मधारय', 'द्वंद्व'],
    correctAnswer: 'बहुव्रीहि',
    explanation: 'दश + आनन = दशानन। यह बहुव्रीहि समास है — संकेत अन्य (रावण) की ओर है, न कि स्वयं की।',
  },

  // ===== KANNADA GRADE 6-10 =====
  {
    grade: 6, subject: 'kannada', topic: 'ಸಂಜ್ಞೆ', difficulty: 'easy',
    question: '"ರಾಮ ಮಾವಿನಹಣ್ಣು ತಿನ್ನುತ್ತಾನೆ" — ಇದರಲ್ಲಿ ಸಂಜ್ಞೆ ಯಾವುದು?',
    options: ['ರಾಮ', 'ಮಾವಿನಹಣ್ಣು', 'ತಿನ್ನುತ್ತಾನೆ', 'ರಾಮ ಮತ್ತು ಮಾವಿನಹಣ್ಣು ಎರಡೂ'],
    correctAnswer: 'ರಾಮ ಮತ್ತು ಮಾವಿನಹಣ್ಣು ಎರಡೂ',
    explanation: 'ರಾಮ (ವ್ಯಕ್ತಿವಾಚಕ) ಮತ್ತು ಮಾವಿನಹಣ್ಣು (ಜಾತಿವಾಚಕ) — ಎರಡೂ ಸಂಜ್ಞೆಗಳು.',
  },
  {
    grade: 6, subject: 'kannada', topic: 'ಲಿಂಗ', difficulty: 'easy',
    question: '"ಸಿಂಹ" ಪದದ ಸ್ತ್ರೀಲಿಂಗ ರೂಪವೇನು?',
    options: ['ಸಿಂಹಿಣಿ', 'ಸಿಂಹಳು', 'ಸಿಂಹೀ', 'ಸಿಂಹಿನ'],
    correctAnswer: 'ಸಿಂಹಿಣಿ',
    explanation: '"ಸಿಂಹ" ಪದದ ಸ್ತ್ರೀಲಿಂಗ ರೂಪ "ಸಿಂಹಿಣಿ" ಆಗಿದೆ.',
  },
  {
    grade: 7, subject: 'kannada', topic: 'ಸಂಧಿ', difficulty: 'medium',
    question: '"ವಿದ್ಯಾಲಯ" ಪದದಲ್ಲಿ ಯಾವ ಸಂಧಿ ಇದೆ?',
    options: ['ಸ್ವರ ಸಂಧಿ', 'ವ್ಯಂಜನ ಸಂಧಿ', 'ವಿಸರ್ಗ ಸಂಧಿ', 'ಯಾವುದೂ ಇಲ್ಲ'],
    correctAnswer: 'ಸ್ವರ ಸಂಧಿ',
    explanation: 'ವಿದ್ಯಾ + ಆಲಯ = ವಿದ್ಯಾಲಯ. ಆ + ಆ = ಆ — ಇದು ಸ್ವರ ಸಂಧಿ (ದೀರ್ಘ ಸಂಧಿ).',
  },
  {
    grade: 8, subject: 'kannada', topic: 'ಸಮಾಸ', difficulty: 'medium',
    question: '"ರಾಜಪುತ್ರ" ಯಾವ ಸಮಾಸಕ್ಕೆ ಉದಾಹರಣೆ?',
    options: ['ತತ್ಪುರುಷ', 'ಬಹುವ್ರೀಹಿ', 'ದ್ವಂದ್ವ', 'ಕರ್ಮಧಾರಯ'],
    correctAnswer: 'ತತ್ಪುರುಷ',
    explanation: 'ರಾಜನ ಮಗ = ರಾಜಪುತ್ರ. ಇದು ತತ್ಪುರುಷ ಸಮಾಸ (ಸಂಬಂಧಸೂಚಕದ ಲೋಪ).',
  },
  {
    grade: 8, subject: 'kannada', topic: 'ಅಲಂಕಾರ', difficulty: 'hard',
    question: '"ಚಂದ್ರನಂತ ಮುಖ" — ಯಾವ ಅಲಂಕಾರ?',
    options: ['ಅನುಪ್ರಾಸ', 'ಉಪಮಾ', 'ರೂಪಕ', 'ಯಮಕ'],
    correctAnswer: 'ಉಪಮಾ',
    explanation: 'ಮುಖವನ್ನು ಚಂದ್ರನೊಂದಿಗೆ ಹೋಲಿಸಲಾಗಿದೆ — ಉಪಮೇಯ (ಮುಖ), ಉಪಮಾನ (ಚಂದ್ರ), ಸಾಧಾರಣ್ಯ (ಅಂತ) — ಇದು ಉಪಮಾ ಅಲಂಕಾರ.',
  },
  {
    grade: 9, subject: 'kannada', topic: 'ರಸ', difficulty: 'hard',
    question: 'ಶೃಂಗಾರ ರಸದ ಸ್ಥಾಯಿ ಭಾವ ಯಾವುದು?',
    options: ['ರತಿ', 'ಉತ್ಸಾಹ', 'ಹಾಸ್ಯ', 'ಕ್ರೋಧ'],
    correctAnswer: 'ರತಿ',
    explanation: 'ಶೃಂಗಾರ ರಸದ ಸ್ಥಾಯಿ ಭಾವ ರತಿ (ಪ್ರೇಮ/ಆಕರ್ಷಣೆ).',
  },
  {
    grade: 10, subject: 'kannada', topic: 'ರಸ', difficulty: 'hard',
    question: 'ಕರುಣ ರಸದ ಸ್ಥಾಯಿ ಭಾವವೇನು?',
    options: ['ಶೋಕ', 'ಭಯ', 'ಘೃಣೆ', 'ಆಶ್ಚರ್ಯ'],
    correctAnswer: 'ಶೋಕ',
    explanation: 'ಕರುಣ ರಸದ ಸ್ಥಾಯಿ ಭಾವ ಶೋಕ (ವಿಷಾದ) — ಪ್ರಿಯವಸ್ತುವಿನ ನಷ್ಟದಿಂದ ಉಂಟಾಗುತ್ತದೆ.',
  },
  {
    grade: 10, subject: 'kannada', topic: 'ಸಮಾಸ', difficulty: 'hard',
    question: '"ದಶಾನನ" (ಹತ್ತು ಮುಖಗಳಿರುವ ರಾವಣ) ಯಾವ ಸಮಾಸ?',
    options: ['ಬಹುವ್ರೀಹಿ', 'ದ್ವಿಗು', 'ಕರ್ಮಧಾರಯ', 'ದ್ವಂದ್ವ'],
    correctAnswer: 'ಬಹುವ್ರೀಹಿ',
    explanation: 'ದಶ + ಆನನ = ದಶಾನನ. ಸಂಕೇತ ಬೇರೆ (ರಾವಣ) — ಇದು ಬಹುವ್ರೀಹಿ ಸಮಾಸ.',
  },

  // ===== KANNADA GRADE 7-9 — Additional grammar practice =====
  {
    grade: 7, subject: 'kannada', topic: 'ಕಾರಕ', difficulty: 'medium',
    question: '"ನಾನು ಪುಸ್ತಕ ಓದುತ್ತೇನೆ" — ಇದರಲ್ಲಿ "ಪುಸ್ತಕ" ಯಾವ ಕಾರಕ?',
    options: ['ಕರ್ತೃ', 'ಕರ್ಮ', 'ಕರಣ', 'ಸಂಪ್ರದಾನ'],
    correctAnswer: 'ಕರ್ಮ',
    explanation: 'ಓದುವ ಕ್ರಿಯೆಯ ಗುರಿ (object) "ಪುಸ್ತಕ" — ಇದು ಕರ್ಮ ಕಾರಕ.',
  },
  {
    grade: 8, subject: 'kannada', topic: 'ವಚನ', difficulty: 'medium',
    question: 'ವಚನ ಸಾಹಿತ್ಯದ ಪ್ರಮುಖ ಪ್ರವರ್ತಕ ಯಾರು?',
    options: ['ಬಸವಣ್ಣ', 'ಪಂಪ', 'ರನ್ನ', 'ಕುಮಾರವ್ಯಾಸ'],
    correctAnswer: 'ಬಸವಣ್ಣ',
    explanation: 'ಬಸವಣ್ಣ (12ನೇ ಶತಮಾನ) ವಚನ ಸಾಹಿತ್ಯದ ಪ್ರಮುಖ ಪ್ರವರ್ತಕರು.',
  },
  {
    grade: 9, subject: 'kannada', topic: 'ಕಾವ್ಯ', difficulty: 'medium',
    question: 'ಕುಮಾರವ್ಯಾಸ ರಚಿಸಿದ ಮಹಾಕಾವ್ಯ ಯಾವುದು?',
    options: ['ಕರ್ನಾಟ ಭಾರತ ಕಥಾಮಂಜರಿ', 'ವಿಕ್ರಮಾರ್ಕ ವಿಜಯ', 'ಪಂಪ ಭಾರತ', 'ರಾಮಾಯಣ'],
    correctAnswer: 'ಕರ್ನಾಟ ಭಾರತ ಕಥಾಮಂಜರಿ',
    explanation: 'ಕುಮಾರವ್ಯಾಸ ಕನ್ನಡದ ಮಹಾಕವಿ — "ಕರ್ನಾಟ ಭಾರತ ಕಥಾಮಂಜರಿ" ಅವರ ಮಹಾಕಾವ್ಯ (ಭಾಗವತ ಆಧಾರಿತ).',
  },

  // ===== MATHS GRADE 7-8 — Word problems =====
  {
    grade: 7, subject: 'maths', topic: 'word_problems', difficulty: 'medium',
    question: 'A shopkeeper bought a pen for ₹50 and sold it for ₹65. Find his profit percent.',
    options: ['15%', '25%', '30%', '20%'],
    correctAnswer: '30%',
    explanation: 'Profit = 65 − 50 = ₹15. Profit% = (15/50) × 100 = 30%.',
  },
  {
    grade: 8, subject: 'maths', topic: 'word_problems', difficulty: 'hard',
    question: 'A car travels 240 km in 4 hours. What is its speed in km/h?',
    options: ['50 km/h', '60 km/h', '70 km/h', '80 km/h'],
    correctAnswer: '60 km/h',
    explanation: 'Speed = Distance / Time = 240 / 4 = 60 km/h.',
  },
  {
    grade: 8, subject: 'maths', topic: 'word_problems', difficulty: 'medium',
    question: 'If 5 workers can build a wall in 12 days, how long will 6 workers take? (same rate)',
    options: ['10 days', '8 days', '15 days', '14 days'],
    correctAnswer: '10 days',
    explanation: 'Work = 5 × 12 = 60 worker-days. Time for 6 workers = 60/6 = 10 days.',
  },
  {
    grade: 9, subject: 'maths', topic: 'word_problems', difficulty: 'hard',
    question: 'The length of a rectangle is 5 cm more than its width. If perimeter is 50 cm, find length.',
    options: ['10 cm', '12 cm', '15 cm', '20 cm'],
    correctAnswer: '15 cm',
    explanation: 'Let width = w. Length = w + 5. Perimeter = 2(w + w+5) = 50. 4w + 10 = 50 → w = 10. Length = 15 cm.',
  },

  // ===== SCIENCE GRADE 6-8 — Plants / Animals / Environment =====
  {
    grade: 6, subject: 'science', topic: 'general', difficulty: 'medium',
    question: 'Which of these is a non-flowering plant?',
    options: ['Mango', 'Rose', 'Fern', 'Sunflower'],
    correctAnswer: 'Fern',
    explanation: 'Ferns reproduce via spores, not seeds or flowers. They are non-flowering plants.',
  },
  {
    grade: 7, subject: 'science', topic: 'general', difficulty: 'easy',
    question: 'Which of these is a renewable source of energy?',
    options: ['Coal', 'Petroleum', 'Solar energy', 'Natural gas'],
    correctAnswer: 'Solar energy',
    explanation: 'Solar energy is renewable — the sun will keep shining for billions of years. Coal, petroleum, and gas are finite fossil fuels.',
  },
  {
    grade: 8, subject: 'science', topic: 'general', difficulty: 'medium',
    question: 'Crops like wheat and rice are grown in which season in India?',
    options: ['Zaid only', 'Rabi (winter)', 'Kharif (monsoon)', 'Both Rabi and Kharif'],
    correctAnswer: 'Both Rabi and Kharif',
    explanation: 'Wheat is a Rabi crop (sown in winter). Rice is a Kharif crop (sown in monsoon). Both are staple food crops in India.',
  },
  {
    grade: 9, subject: 'science', topic: 'general', difficulty: 'medium',
    question: 'Which of these is NOT a communicable disease?',
    options: ['Tuberculosis', 'Common cold', 'Diabetes', 'Malaria'],
    correctAnswer: 'Diabetes',
    explanation: 'Diabetes is a non-communicable (lifestyle/genetic) disease. The others spread from person to person.',
  },
  {
    grade: 10, subject: 'science', topic: 'general', difficulty: 'hard',
    question: 'Which hormone regulates blood sugar levels in humans?',
    options: ['Insulin', 'Thyroxine', 'Adrenaline', 'Testosterone'],
    correctAnswer: 'Insulin',
    explanation: 'Insulin, secreted by the pancreas, lowers blood sugar. Glucagon raises it. Together they regulate glucose levels.',
  },
]
