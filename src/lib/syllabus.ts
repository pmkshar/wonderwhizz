// Indian school syllabus catalog: boards, subjects, and chapters per grade.
// Used by the Ask Tutor UI to let students pick their board + grade + subject
// + chapter, then inject that curriculum context into the AI tutor's prompt
// so answers align with the student's textbook.

export interface SyllabusBoard {
  id: string
  label: string
  shortLabel: string
  emoji: string
  description: string
  grades: number[]
  // Subject ids (referencing SUBJECTS in ./subjects.ts) supported for this board
  subjectIds: string[]
}

export interface SyllabusChapter {
  id: string
  number: number
  title: string
  topics: string[]
}

export interface SyllabusSubjectGrade {
  boardId: string
  subjectId: string
  grade: number
  textbook: string
  chapters: SyllabusChapter[]
}

// ---------------------------------------------------------------------------
// Boards
// ---------------------------------------------------------------------------

export const SYLLABUS_BOARDS: SyllabusBoard[] = [
  {
    id: 'cbse',
    label: 'CBSE (NCERT)',
    shortLabel: 'CBSE',
    emoji: '📘',
    description: 'Central Board of Secondary Education — NCERT textbooks, used by Kendriya Vidyalayas, DAV, DPS and most central schools.',
    grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    subjectIds: ['maths', 'science', 'hindi', 'english', 'english_grammar', 'kannada'],
  },
  {
    id: 'icse',
    label: 'ICSE (CISCE)',
    shortLabel: 'ICSE',
    emoji: '📗',
    description: 'Indian Certificate of Secondary Education — rigorous English-medium syllabus with separate Physics/Chemistry/Biology papers in high school.',
    grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    subjectIds: ['maths', 'science', 'hindi', 'english', 'english_grammar', 'kannada'],
  },
  {
    id: 'kseab',
    label: 'Karnataka State (KSEAB)',
    shortLabel: 'KTMB',
    emoji: '📕',
    description: 'Karnataka School Examination and Assessment Board — state syllabus in Kannada & English medium.',
    grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    subjectIds: ['maths', 'science', 'hindi', 'english', 'english_grammar', 'kannada'],
  },
  {
    id: 'msbshe',
    label: 'Maharashtra State (MSBSHSE)',
    shortLabel: 'MH',
    emoji: '📙',
    description: 'Maharashtra State Board of Secondary & Higher Secondary Education — state syllabus in Marathi & English medium.',
    grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    subjectIds: ['maths', 'science', 'hindi', 'english', 'english_grammar', 'kannada'],
  },
]

export function getBoard(id: string): SyllabusBoard | undefined {
  return SYLLABUS_BOARDS.find((b) => b.id === id)
}

// ---------------------------------------------------------------------------
// Chapters per board × subject × grade
// Real NCERT / ICSE / state-board chapter names so the AI gets authentic
// curriculum context. Coverage prioritises grades 6–10 (the most common
// homework years); other grades fall back to a generic subject prompt.
// ---------------------------------------------------------------------------

type ChapterSeed = [number, string, string[]] // [chapterNumber, title, topics]
type GradeMap = Record<number, ChapterSeed[]>

// Helper to convert a GradeMap into a flat list of SyllabusChapter entries
function toChapters(map: GradeMap): SyllabusChapter[] {
  return Object.entries(map).flatMap(([gradeStr, seeds]) =>
    seeds.map(([number, title, topics]) => ({
      id: `ch${number}`,
      number,
      title,
      topics,
    }))
  )
}

// ---------------------------------------------------------------------------
// CBSE (NCERT) — chapters from the official NCERT textbooks
// ---------------------------------------------------------------------------

const CBSE_MATHS: GradeMap = {
  6: [
    [1, 'Knowing Our Numbers', ['Comparing numbers', 'Estimation', 'Roman numerals']],
    [2, 'Whole Numbers', ['Number line', 'Properties of operations']],
    [3, 'Playing with Numbers', ['Factors & multiples', 'Prime factorisation', 'HCF & LCM']],
    [4, 'Basic Geometrical Ideas', ['Points, lines, angles', 'Polygons']],
    [5, 'Understanding Elementary Shapes', ['Polygons', 'Angle types', 'Triangles']],
    [6, 'Integers', ['Addition & subtraction', 'Multiplication']],
    [7, 'Fractions', ['Equivalent fractions', 'Addition & subtraction', 'Mixed numbers']],
    [8, 'Decimals', ['Tenths & hundredths', 'Addition & subtraction', 'Multiplication']],
    [9, 'Data Handling', ['Pictographs', 'Bar graphs']],
    [10, 'Mensuration', ['Perimeter & area']],
    [11, 'Algebra', ['Variables', 'Expressions', 'Equations']],
    [12, 'Ratio and Proportion', ['Ratio', 'Proportion', 'Unitary method']],
  ],
  7: [
    [1, 'Integers', ['Multiplication & division rules', 'Properties']],
    [2, 'Fractions and Decimals', ['Multiplication & division of fractions', 'Decimals']],
    [3, 'Data Handling', ['Mean, median, mode', 'Bar graphs', 'Probability']],
    [4, 'Simple Equations', ['Setting up equations', 'Solving linear equations']],
    [5, 'Lines and Angles', ['Pairs of angles', 'Parallel lines']],
    [6, 'The Triangle and its Properties', ['Medians & altitudes', 'Angle sum property', 'Pythagoras theorem']],
    [7, 'Congruence of Triangles', ['SSS, SAS, ASA, RHS criteria']],
    [8, 'Comparing Quantities', ['Percentage', 'Profit & loss', 'Simple interest']],
    [9, 'Rational Numbers', ['Operations', 'Number line']],
    [10, 'Practical Geometry', ['Construction of triangles']],
    [11, 'Perimeter and Area', ['Squares, rectangles, circles', 'Parallelograms']],
    [12, 'Algebraic Expressions', ['Terms', 'Like & unlike terms', 'Addition & subtraction']],
    [13, 'Exponents and Powers', ['Laws of exponents', 'Standard form']],
    [14, 'Symmetry', ['Line symmetry', 'Rotational symmetry']],
    [15, 'Visualising Solid Shapes', ['Faces, edges, vertices', 'Nets']],
  ],
  8: [
    [1, 'Rational Numbers', ['Properties', 'Addition, subtraction, multiplication, division']],
    [2, 'Linear Equations in One Variable', ['Solving linear equations', 'Word problems']],
    [3, 'Understanding Quadrilaterals', ['Polygons', 'Parallelograms', 'Trapeziums']],
    [4, 'Data Handling', ['Histograms', 'Pie charts', 'Probability']],
    [5, 'Squares and Square Roots', ['Properties of squares', 'Square roots']],
    [6, 'Cubes and Cube Roots', ['Cubes', 'Cube roots']],
    [7, 'Comparing Quantities', ['Percentage', 'Discount', 'Compound interest']],
    [8, 'Algebraic Expressions and Identities', ['Multiplication of expressions', 'Identities']],
    [9, 'Mensuration', ['Area of polygons', 'Surface area & volume of solids']],
    [10, 'Exponents and Powers', ['Negative exponents', 'Standard form']],
    [11, 'Direct and Inverse Proportions', ['Direct proportion', 'Inverse proportion']],
    [12, 'Factorisation', ['Common factors', 'Grouping', 'Division of expressions']],
    [13, 'Introduction to Graphs', ['Bar graphs', 'Line graphs', 'Linear graphs']],
    [14, 'Playing with Numbers', ['Divisibility rules', 'Number puzzles']],
  ],
  9: [
    [1, 'Number Systems', ['Rational & irrational numbers', 'Real numbers', 'Laws of exponents']],
    [2, 'Polynomials', ['Types of polynomials', 'Zeroes', 'Factor theorem']],
    [3, 'Coordinate Geometry', ['Cartesian plane', 'Plotting points']],
    [4, 'Linear Equations in Two Variables', ['Graph of linear equations']],
    [5, 'Introduction to Euclid\'s Geometry', ['Axioms & postulates', 'Equivalent versions']],
    [6, 'Lines and Angles', ['Pair of angles', 'Parallel lines & transversal']],
    [7, 'Triangles', ['Congruence', 'Inequalities']],
    [8, 'Quadrilaterals', ['Properties of parallelograms', 'Mid-point theorem']],
    [9, 'Circles', ['Chord & arc properties', 'Cyclic quadrilaterals']],
    [10, 'Heron\'s Formula', ['Area of triangles', 'Area of quadrilaterals']],
    [11, 'Surface Areas and Volumes', ['Cuboid, cube, cylinder, cone, sphere']],
    [12, 'Statistics', ['Collection & presentation of data', 'Mean, median, mode']],
    [13, 'Probability', ['Empirical probability']],
  ],
  10: [
    [1, 'Real Numbers', ['Euclid\'s lemma', 'Fundamental theorem of arithmetic', 'Rational & irrational numbers']],
    [2, 'Polynomials', ['Zeroes', 'Relationship between zeroes & coefficients', 'Division algorithm']],
    [3, 'Pair of Linear Equations in Two Variables', ['Graphical method', 'Substitution, elimination, cross-multiplication']],
    [4, 'Quadratic Equations', ['Solution by factorisation', 'Completing the square', 'Quadratic formula', 'Nature of roots']],
    [5, 'Arithmetic Progressions', ['nth term', 'Sum of n terms']],
    [6, 'Triangles', ['Similarity of triangles', 'Pythagoras theorem']],
    [7, 'Coordinate Geometry', ['Distance formula', 'Section formula', 'Area of triangle']],
    [8, 'Introduction to Trigonometry', ['Trigonometric ratios', 'Complementary angles', 'Identities']],
    [9, 'Some Applications of Trigonometry', ['Heights and distances']],
    [10, 'Circles', ['Tangent to a circle', 'Number of tangents from a point']],
    [11, 'Areas Related to Circles', ['Sector & segment', 'Combination of figures']],
    [12, 'Surface Areas and Volumes', ['Combination of solids', 'Frustum of a cone']],
    [13, 'Statistics', ['Mean of grouped data', 'Mode & median of grouped data']],
    [14, 'Probability', ['Classical definition', 'Sample space', 'Simple events']],
  ],
}

const CBSE_SCIENCE: GradeMap = {
  6: [
    [1, 'Food: Where Does It Come From?', ['Variety of food', 'Plant & animal sources']],
    [2, 'Components of Food', ['Nutrients', 'Balanced diet']],
    [3, 'Fibre to Fabric', ['Natural & synthetic fibres', 'Processing']],
    [4, 'Sorting Materials into Groups', ['Properties', 'Classification']],
    [5, 'Separation of Substances', ['Methods of separation']],
    [6, 'Changes Around Us', ['Reversible & irreversible changes']],
    [7, 'Getting to Know Plants', ['Stem, leaf, root, flower']],
    [8, 'Body Movements', ['Skeletal & muscular system']],
    [9, 'The Living Organisms and Their Surroundings', ['Habitat', 'Adaptation']],
    [10, 'Motion and Measurement of Distances', ['Standard units', 'Types of motion']],
    [11, 'Light, Shadows and Reflections', ['Light', 'Shadows', 'Mirrors']],
    [12, 'Electricity and Circuits', ['Electric circuit', 'Conductors & insulators']],
    [13, 'Fun with Magnets', ['Properties of magnets']],
    [14, 'Water', ['Water cycle', 'Conservation']],
    [15, 'Air Around Us', ['Composition of air']],
    [16, 'Garbage In, Garbage Out', ['Waste management']],
  ],
  7: [
    [1, 'Nutrition in Plants', ['Photosynthesis', 'Other modes of nutrition']],
    [2, 'Nutrition in Animals', ['Digestion in humans', 'Digestion in grass-eating animals']],
    [3, 'Fibre to Fabric', ['Wool', 'Silk']],
    [4, 'Heat', ['Conduction, convection, radiation', 'Thermometers']],
    [5, 'Acids, Bases and Salts', ['Indicators', 'Neutralisation']],
    [6, 'Physical and Chemical Changes', ['Reactions', 'Rusting']],
    [7, 'Weather, Climate and Adaptations', ['Weather vs climate', 'Adaptations']],
    [8, 'Winds, Storms and Cyclones', ['Air pressure', 'Wind currents', 'Cyclones']],
    [9, 'Soil', ['Soil profile', 'Properties', 'Soil conservation']],
    [10, 'Respiration in Organisms', ['Aerobic & anaerobic respiration']],
    [11, 'Transportation in Animals and Plants', ['Circulatory system', 'Transpiration']],
    [12, 'Reproduction in Plants', ['Asexual & sexual reproduction']],
    [13, 'Motion and Time', ['Speed', 'Measurement of time']],
    [14, 'Electric Current and its Effects', ['Electromagnet', 'Fuse']],
    [15, 'Light', ['Reflection', 'Colours']],
    [16, 'Water: A Precious Resource', ['Groundwater', 'Water management']],
    [17, 'Forests: Our Lifeline', ['Ecosystem']],
    [18, 'Wastewater Story', ['Wastewater treatment']],
  ],
  8: [
    [1, 'Crop Production and Management', ['Kharif & rabi crops', 'Agricultural practices']],
    [2, 'Microorganisms: Friend and Foe', ['Bacteria, fungi, viruses', 'Useful & harmful microorganisms']],
    [3, 'Synthetic Fibres and Plastics', ['Nylon, polyester, acrylic', 'Plastics & the environment']],
    [4, 'Materials: Metals and Non-Metals', ['Physical & chemical properties']],
    [5, 'Coal and Petroleum', ['Fossil fuels', 'Conservation']],
    [6, 'Combustion and Flame', ['Types of combustion', 'Fuel efficiency']],
    [7, 'Conservation of Plants and Animals', ['Deforestation', 'Wildlife conservation']],
    [8, 'Cell — Structure and Functions', ['Plant & animal cells', 'Organelles']],
    [9, 'Reproduction in Animals', ['Sexual & asexual reproduction']],
    [10, 'Reaching the Age of Adolescence', ['Puberty', 'Hormones']],
    [11, 'Force and Pressure', ['Types of forces', 'Pressure']],
    [12, 'Friction', ['Types of friction', 'Reducing & increasing friction']],
    [13, 'Sound', ['Production & propagation', 'Hearing']],
    [14, 'Chemical Effects of Electric Current', ['Electrolysis', 'Electroplating']],
    [15, 'Some Natural Phenomena', ['Lightning', 'Earthquakes']],
    [16, 'Light', ['Reflection', 'Human eye', 'Braille']],
    [17, 'Stars and the Solar System', ['Phases of moon', 'Constellations']],
    [18, 'Pollution of Air and Water', ['Air & water pollution', 'Conservation']],
  ],
  9: [
    [1, 'Matter in Our Surroundings', ['States of matter', 'Change of state']],
    [2, 'Is Matter Around Us Pure?', ['Mixtures', 'Solutions', 'Compounds & elements']],
    [3, 'Atoms and Molecules', ['Laws of chemical combination', 'Mole concept']],
    [4, 'Structure of the Atom', ['Sub-atomic particles', 'Bohr\'s model']],
    [5, 'The Fundamental Unit of Life', ['Cell organelles', 'Prokaryotic vs eukaryotic']],
    [6, 'Tissues', ['Plant & animal tissues']],
    [7, 'Diversity in Living Organisms', ['Classification', 'Hierarchy']],
    [8, 'Motion', ['Displacement, velocity, acceleration', 'Equations of motion']],
    [9, 'Force and Laws of Motion', ['Newton\'s laws', 'Momentum']],
    [10, 'Gravitation', ['Universal law of gravitation', 'Free fall', 'Buoyancy']],
    [11, 'Work and Energy', ['Kinetic & potential energy', 'Power']],
    [12, 'Sound', ['Wave nature', 'Echo', 'SONAR']],
    [13, 'Why Do We Fall Ill?', ['Diseases', 'Immunity']],
    [14, 'Natural Resources', ['Air, water, soil', 'Biogeochemical cycles']],
    [15, 'Improvement in Food Resources', ['Crops', 'Animal husbandry']],
  ],
  10: [
    [1, 'Chemical Reactions and Equations', ['Balancing equations', 'Types of reactions']],
    [2, 'Acids, Bases and Salts', ['pH scale', 'Salt formation']],
    [3, 'Metals and Non-Metals', ['Reactivity series', 'Extraction of metals']],
    [4, 'Carbon and its Compounds', ['Bonding', 'Hydrocarbons', 'Functional groups']],
    [5, 'Periodic Classification of Elements', ['Mendeleev\'s table', 'Modern periodic table']],
    [6, 'Life Processes', ['Nutrition', 'Respiration', 'Transportation', 'Excretion']],
    [7, 'Control and Coordination', ['Nervous system', 'Hormones']],
    [8, 'How do Organisms Reproduce?', ['Sexual & asexual reproduction']],
    [9, 'Heredity and Evolution', ['Mendel\'s laws', 'Evolution']],
    [10, 'Light — Reflection and Refraction', ['Laws of reflection', 'Lens formula']],
    [11, 'Human Eye and Colourful World', ['Eye defects', 'Dispersion']],
    [12, 'Electricity', ['Ohm\'s law', 'Circuits', 'Heating effect']],
    [13, 'Magnetic Effects of Electric Current', ['Magnetic field', 'Electromagnetic induction']],
    [14, 'Sources of Energy', ['Conventional & non-conventional sources']],
    [15, 'Our Environment', ['Ecosystem', 'Food chains', 'Waste management']],
    [16, 'Sustainable Management of Natural Resources', ['Conservation', '5 R\'s']],
  ],
}

const CBSE_HINDI: GradeMap = {
  6: [
    [1, 'वह चिड़िया जो (कविता)', ['कवयित्री', 'भाव सारांश']],
    [2, 'बचपन (संस्मरण)', ['लेखक', 'भाव सारांश']],
    [3, 'नादान दोस्त (कहानी)', ['लेखक', 'कहानी का सारांश']],
    [4, 'चाँद से थोड़ी सी गप्पें (कविता)', ['कवयित्री', 'भाव सारांश']],
    [5, 'अक्षरों का महत्व (निबंध)', ['लेखक', 'भाव सारांश']],
    [6, 'पार नज़र के (कहानी)', ['लेखक', 'कहानी का सारांश']],
    [7, 'साथी हाथ बढ़ाना (कविता)', ['कवि', 'भाव सारांश']],
    [8, 'ऐसे ऐसे (एकांकी)', ['लेखक', 'भाव सारांश']],
    [9, 'टिकट अलबम (कहानी)', ['लेखक', 'कहानी का सारांश']],
    [10, 'झांसी की रानी (कविता)', ['कवयित्री', 'भाव सारांश']],
    [11, 'जो देखकर भी नहीं देखते (निबंध)', ['लेखक', 'भाव सारांश']],
    [12, 'संसार पुस्तक है (निबंध)', ['लेखक', 'भाव सारांश']],
    [13, 'मैं सबसे छोटी होऊं (कविता)', ['कवयित्री', 'भाव सारांश']],
    [14, 'लोकगीत (निबंध)', ['लेखक', 'भाव सारांश']],
    [15, 'नोकर (निबंध)', ['लेखक', 'भाव सारांश']],
    [16, 'वन के मार्ग में (कविता)', ['कवि', 'भाव सारांश']],
    [17, 'साँस साँस बातें (निबंध)', ['लेखक', 'भाव सारांश']],
  ],
  7: [
    [1, 'हम पंछी उन्मुक्त गगन के (कविता)', ['कवि', 'भाव सारांश']],
    [2, 'दादी माँ (संस्मरण)', ['लेखक', 'भाव सारांश']],
    [3, 'हम धरती के लाल (कहानी)', ['लेखक', 'कहानी का सारांश']],
    [4, 'जलप्रलय (कहानी)', ['लेखक', 'कहानी का सारांश']],
    [5, 'मिठाईवाला (कहानी)', ['लेखक', 'कहानी का सारांश']],
    [6, 'रक्त और हमारा शरीर (निबंध)', ['लेखक', 'भाव सारांश']],
    [7, 'पप्पूही (कहानी)', ['लेखक', 'कहानी का सारांश']],
    [8, 'शाम एक किसान (कविता)', ['कवि', 'भाव सारांश']],
    [9, 'चिड़िया की बच्ची (कविता)', ['कवयित्री', 'भाव सारांश']],
    [10, 'अपूर्व अनुभव (संस्मरण)', ['लेखक', 'भाव सारांश']],
    [11, 'रहीम के दोहे (कविता)', ['कवि', 'दोहों के अर्थ']],
    [12, 'कंचा (कहानी)', ['लेखक', 'कहानी का सारांश']],
    [13, 'खिलौनेवाला (कविता)', ['कवि', 'भाव सारांश']],
    [14, 'फूलवारी (कहानी)', ['लेखक', 'कहानी का सारांश']],
    [15, 'पठन की प्रसन्नता (निबंध)', ['लेखक', 'भाव सारांश']],
  ],
  8: [
    [1, 'ध्वनि (कविता)', ['कवयित्री', 'भाव सारांश']],
    [2, 'लाख की चूड़ियाँ (कहानी)', ['लेखक', 'कहानी का सारांश']],
    [3, 'बस की यात्रा (व्यंग्य)', ['लेखक', 'भाव सारांश']],
    [4, 'दीवानों की हस्ती (कविता)', ['कवि', 'भाव सारांश']],
    [5, 'चिट्ठियाँ और डाक (संस्मरण)', ['लेखक', 'भाव सारांश']],
    [6, 'भगवान के डाकिए (कविता)', ['कवि', 'भाव सारांश']],
    [7, 'क्या निराश हुआ जाए (निबंध)', ['लेखक', 'भाव सारांश']],
    [8, 'यह सबसे कठिन समय नहीं (कविता)', ['कवि', 'भाव सारांश']],
    [9, 'कबीर के साखी (कविता)', ['कवि', 'साखियों के अर्थ']],
    [10, 'कामचोर (कहानी)', ['लेखक', 'कहानी का सारांश']],
    [11, 'जब सिनेमा ने बोलना सीखा (निबंध)', ['लेखक', 'भाव सारांश']],
    [12, 'सुदामा चरित (कविता)', ['कवि', 'भाव सारांश']],
    [13, 'जहाँ पहिया है (रेखाचित्र)', ['लेखक', 'भाव सारांश']],
    [14, 'अकबरी लोटा (कहानी)', ['लेखक', 'कहानी का सारांश']],
    [15, 'सूर के पद (कविता)', ['कवि', 'पदों के अर्थ']],
    [16, 'पानी की कहानी (निबंध)', ['लेखक', 'भाव सारांश']],
    [17, 'बाज और साँप (कहानी)', ['लेखक', 'कहानी का सारांश']],
    [18, 'टोपी (कहानी)', ['लेखक', 'कहानी का सारांश']],
  ],
  9: [
    [1, 'दो बैलों की कथा (प्रेमचंद)', ['लेखक परिचय', 'कहानी का सारांश']],
    [2, 'ल्हासा की ओर (रहुल सांकृत्यायन)', ['लेखक परिचय', 'यात्रा वृत्तांत']],
    [3, 'उपभोक्तावाद की संस्कृति (श्यामाचरण दुबे)', ['लेखक परिचय', 'भाव सारांश']],
    [4, 'साँवले सपनों की याद (अमृता प्रीतम)', ['कवयित्री', 'भाव सारांश']],
    [5, 'नाना साहेब की पुत्री देवी मैना को भग्न-हृदय देना', ['कवि', 'भाव सारांश']],
    [6, 'प्रेमचंद के फटे जूते (हरिशंकर परसाई)', ['लेखक परिचय', 'व्यंग्य']],
    [7, 'मेरे बचपन के दिन (महादेवी वर्मा)', ['कवयित्री', 'संस्मरण']],
    [8, 'एक कुत्ता और एक मैना (सर्वेश्वर दयाल सक्सेना)', ['कवि', 'भाव सारांश']],
    [9, 'कबीर के दोहे', ['कवि', 'दोहों के अर्थ']],
    [10, 'वाख (ललद्यद)', ['कवयित्री', 'वाखों के अर्थ']],
    [11, 'सवैये (रसखान)', ['कवि', 'सवैयों के अर्थ']],
    [12, 'कैदी और कोकिला (माखनलाल चतुर्वेदी)', ['कवि', 'भाव सारांश']],
    [13, 'ग्राम श्री (सुमित्रानंदन पंत)', ['कवि', 'भाव सारांश']],
    [14, 'चंद्र गहना से लौटती बेर (अय्यप्पा पणिक्कर)', ['कवि', 'भाव सारांश']],
    [15, 'मेघ आए (सर्वेश्वर दयाल सक्सेना)', ['कवि', 'भाव सारांश']],
    [16, 'यमराज की दिशा (धूमिल)', ['कवि', 'भाव सारांश']],
    [17, 'बच्चे काम पर जा रहे हैं (केदारनाथ सिंह)', ['कवि', 'भाव सारांश']],
  ],
  10: [
    [1, 'सूरदास के पद', ['कवि परिचय', 'पदों के अर्थ']],
    [2, 'तुलसीदास — राम-लक्ष्मण-परशुराम संवाद', ['कवि परिचय', 'भाव सारांश']],
    [3, 'देव — सवैये और कवित्त', ['कवि परिचय', 'पदों के अर्थ']],
    [4, 'जयशंकर प्रसाद — आत्मकथ्य', ['कवि परिचय', 'भाव सारांश']],
    [5, 'सूर्यकांत त्रिपाठी निराला — उत्साह', ['कवि परिचय', 'भाव सारांश']],
    [6, 'नागार्जुन — यह दंतुरहित मुस्कान', ['कवि परिचय', 'भाव सारांश']],
    [7, 'गिरिजाकुमार माथुर — छाया मत छूना', ['कवि परिचय', 'भाव सारांश']],
    [8, 'ऋतुराज — कन्यादान', ['कवि परिचय', 'भाव सारांश']],
    [9, 'भानुभक्त — नेपाली लोकगीत', ['कवि परिचय', 'भाव सारांश']],
    [10, 'यतीन्द्र मिश्र — नए इलाके में — खुशबू रचते हैं तुम हाथ', ['कवि परिचय', 'भाव सारांश']],
    [11, 'भदंत आनंद कौसल्यायन — स्त्री शिक्षा के विरोधी कुतर्कों का खंडन', ['लेखक परिचय', 'भाव सारांश']],
    [12, 'प्रेमचंद — बालगोबिन भगत', ['लेखक परिचय', 'कहानी का सारांश']],
    [13, 'सुनीता जैन — पर्वत प्रदेश के पावस', ['लेखक परिचय', 'भाव सारांश']],
    [14, 'उषा नंदा — एक कहानी यह भी', ['लेखक परिचय', 'भाव सारांश']],
  ],
}

const CBSE_KANNADA: GradeMap = {
  6: [
    [1, 'ಬೆಂಕಿ ಮತ್ತು ನೀರು', ['ಕಥೆಯ ಸಾರಾಂಶ', 'ಪಾಠ']],
    [2, 'ಕುವೆಂಪು — ಬೆಳ್ಳಿಮೇಘ', ['ಕವಿ', 'ಕವನದ ಅರ್ಥ']],
    [3, 'ಮಾನವ ಜೀವಿ ಮತ್ತು ಪ್ರಕೃತಿ', ['ಪ್ರಬಂಧ', 'ಭಾವ']],
    [4, 'ನಮ್ಮ ಸುತ್ತಲಿನ ಪರಿಸರ', ['ವಿಜ್ಞಾನ', 'ಪರಿಸರ']],
    [5, 'ದಾಸ ಸಾಹಿತ್ಯ', ['ದಾಸರು', 'ಕೀರ್ತನೆ']],
    [6, 'ಕನ್ನಡ ನಾಡು - ನಮ್ಮ ನೆಲ', ['ಕರ್ನಾಟಕ', 'ಸಂಸ್ಕೃತಿ']],
    [7, 'ಬೆಳಗಿನ ಹಾಡು', ['ಕವನ', 'ಭಾವ']],
    [8, 'ಗಾಂಧೀಜಿ — ಜೀವನ ಚರಿತ್ರೆ', ['ವ್ಯಕ್ತಿಚಿತ್ರ']],
    [9, 'ಆನೆ ಮತ್ತು ಮೈಮರಿದ ಜನ', ['ಕಥೆ']],
    [10, 'ನಾನು ನೋಡಿದ ಸ್ವಾತಂತ್ರ್ಯ ಹೋರಾಟ', ['ಸ್ವಾತಂತ್ರ್ಯ ಹೋರಾಟ']],
  ],
  7: [
    [1, 'ಕುವೆಂಪು — ಹುಡುಗನ ಹಾಡು', ['ಕವಿ', 'ಕವನದ ಅರ್ಥ']],
    [2, 'ಪಂಪಾ ಭಾರತ', ['ಪಂಪ', 'ವಚನ']],
    [3, 'ಮಾಧ್ಯಮ ಮತ್ತು ಜನಜೀವನ', ['ಪ್ರಬಂಧ']],
    [4, 'ಅರಣ್ಯ ರಕ್ಷಣೆ', ['ಪರಿಸರ']],
    [5, 'ಸ್ವಾಮಿ ವಿವೇಕಾನಂದ', ['ವ್ಯಕ್ತಿಚಿತ್ರ']],
    [6, 'ಬಸವಣ್ಣ — ವಚನಗಳು', ['ವಚನಕಾರ', 'ವಚನದ ಅರ್ಥ']],
    [7, 'ರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪು', ['ಕವಿಪರಿಚಯ']],
    [8, 'ನಾನು ಕಂಡ ನನ್ನ ಊರು', ['ಪ್ರಬಂಧ']],
    [9, 'ಜನಪದ ಗೀತೆ', ['ಜನಪದ']],
    [10, 'ನಮ್ಮ ಕನ್ನಡ ನಾಡು', ['ಕರ್ನಾಟಕ ಇತಿಹಾಸ']],
  ],
  8: [
    [1, 'ಕುವೆಂಪು — ಎದೆಗೆ ಬಡಿಯಲಾರದ', ['ಕವಿ', 'ಕವನದ ಅರ್ಥ']],
    [2, 'ಬೆಟ್ಟದ ಮೇಲೆ ದೀಪವಿಟ್ಟ ಕಥೆ', ['ಕಥೆ', 'ಸಾರಾಂಶ']],
    [3, 'ಕನ್ನಡ ಸಾಹಿತ್ಯ ಚರಿತ್ರೆ', ['ಸಾಹಿತ್ಯ']],
    [4, 'ವಿನೋಬಾ ಭಾವೆ — ಭೂದಾನ ಚಳುವಳಿ', ['ವ್ಯಕ್ತಿಚಿತ್ರ']],
    [5, 'ಅನಕಾ — ನಮ್ಮ ಊರ ಹುಡುಗ', ['ಕವಿ', 'ಕವನದ ಅರ್ಥ']],
    [6, 'ಮಹಾತ್ಮಾ ಗಾಂಧೀಜಿ', ['ಜೀವನ ಚರಿತ್ರೆ']],
    [7, 'ಚಂದ್ರಶೇಖರ ಕಂಬಾರ — ಕಥೆ', ['ಕಥೆ']],
    [8, 'ಜಾನಪದ ಸಾಹಿತ್ಯ', ['ಜನಪದ']],
    [9, 'ವಿಜ್ಞಾನ ಮತ್ತು ತಂತ್ರಜ್ಞಾನ', ['ವಿಜ್ಞಾನ']],
    [10, 'ಪರಿಸರ ಮತ್ತು ಆರೋಗ್ಯ', ['ಪರಿಸರ']],
  ],
  9: [
    [1, 'ಕುವೆಂಪು — ಹಾವು ಹಿಡಿದ ಹುಡುಗ', ['ಕವಿ', 'ಕವನದ ಅರ್ಥ']],
    [2, 'ಡಾ. ಬಿ. ಆರ್. ಅಂಬೇಡ್ಕರ್', ['ವ್ಯಕ್ತಿಚಿತ್ರ']],
    [3, 'ಶ್ರೀ ರಾಮಕೃಷ್ಣ ಪರಮಹಂಸ', ['ವ್ಯಕ್ತಿಚಿತ್ರ']],
    [4, 'ಸಾರಂಗಧರ', ['ಕಥೆ', 'ಸಾರಾಂಶ']],
    [5, 'ನನ್ನ ಕನಸಿನ ಊರು', ['ಪ್ರಬಂಧ']],
    [6, 'ವಿದ್ಯಾರಣ್ಯ — ಕನ್ನಡ ಸಾಹಿತ್ಯ', ['ಸಾಹಿತ್ಯ']],
    [7, 'ಕುವೆಂಪು — ಮಲೆಗಳಲ್ಲಿ ಮದುಮಗ', ['ಕಾದಂಬರಿ', 'ಸಾರಾಂಶ']],
    [8, 'ಜನಪದ ಗೀತೆಗಳು', ['ಜನಪದ']],
    [9, 'ಪ್ರಕೃತಿ ಮತ್ತು ಪರಿಸರ', ['ಪರಿಸರ']],
    [10, 'ನಾಡಹಬ್ಬಗಳು', ['ಹಬ್ಬ']],
  ],
  10: [
    [1, 'ಗದ್ಯಾಂಜಲಿ — ಕುವೆಂಪು', ['ಕವಿ', 'ಕವನದ ಅರ್ಥ']],
    [2, 'ಕು. ಶಿ. ಹರಿದಾಸಭಟ್ಟ — ಮುನ್ನುಡಿ', ['ಲೇಖಕ', 'ಪ್ರಬಂಧ']],
    [3, 'ಎನ್. ವಿ. ಭಟ್ಟಾಚಾರ್ಯ — ಬೆಂಕಿಗೆ ಕಾರಣರಾದವರು', ['ಲೇಖಕ', 'ಕಥೆ']],
    [4, 'ಎಂ. ಕೆ. ಇಂದಿರಾ — ವಸುಧೈವ ಕುಟುಂಬಕಮ್', ['ಲೇಖಕ', 'ಕಥೆ']],
    [5, 'ಡಾ. ಹಾ. ಮಾ. ನಾಯಕ — ಮನುಷ್ಯ ಮತ್ತು ಪ್ರಕೃತಿ', ['ಲೇಖಕ', 'ಪ್ರಬಂಧ']],
    [6, 'ಕೈಲಾಸಂ — ಟೊಳ್ಳು ಗಂಟು', ['ಲೇಖಕ', 'ಏಕಾಂಕ ನಾಟಕ']],
    [7, 'ತ್ರಿವೇಣಿ — ಮಾನವಿ', ['ಲೇಖಕ', 'ಕಥೆ']],
    [8, 'ಸಾಯಿಸುತೆ — ಲೇಖಕಿಯ ಪರಿಚಯ', ['ಲೇಖಕ', 'ಕಥೆ']],
    [9, 'ಸಿ. ಪಿ. ಕೃಷ್ಣಕುಮಾರ್ — ಬೆಳ್ಳಿಮೇಘ', ['ಲೇಖಕ', 'ಪ್ರಬಂಧ']],
    [10, 'ಜಯಂತ ಕಾಯ್ಕಿಣಿ — ಮಳೆಮುಟ್ಟಿದ ಮನಸು', ['ಲೇಖಕ', 'ಕವನ']],
    [11, 'ನಾ. ಡಿ. ಸೋಜ — ಪ್ರಕೃತಿ ಲಾಲನೆ', ['ಲೇಖಕ', 'ಕವನ']],
    [12, 'ವಚನ ಸಾಹಿತ್ಯ — ಬಸವಣ್ಣ', ['ವಚನಕಾರ', 'ವಚನ']],
    [13, 'ನವ್ಯಕಾವ್ಯ — ಅಕ್ಕಮಹಾದೇವಿ', ['ವಚನಕಾರ', 'ವಚನ']],
    [14, 'ಪಂಪನ ವಚನ', ['ಕವಿ', 'ವಚನ']],
  ],
}

// ---------------------------------------------------------------------------
// ICSE chapters — slightly different ordering and scope than CBSE, but
// aligned to the same concepts. We use ICSE Selina/Concise textbook chapter
// names where they differ; for grades 6–8 the broad topics match NCERT.
// ---------------------------------------------------------------------------

const ICSE_MATHS: GradeMap = {
  6: [
    [1, 'Number System', ['Natural & whole numbers', 'Integers', 'Fractions']],
    [2, 'Factors and Multiples', ['HCF & LCM', 'Prime factorisation']],
    [3, 'Ratio and Proportion', ['Ratio', 'Proportion', 'Unitary method']],
    [4, 'Fundamental Concepts of Algebra', ['Variables', 'Expressions']],
    [5, 'Linear Equations in One Variable', ['Solving simple equations']],
    [6, 'Fundamental Geometrical Concepts', ['Points, lines, planes', 'Angles']],
    [7, 'Triangles', ['Properties', 'Construction']],
    [8, 'Quadrilaterals and Polygons', ['Types', 'Properties']],
    [9, 'Understanding Shapes', ['Symmetry', 'Nets']],
    [10, 'Mensuration', ['Perimeter & area']],
    [11, 'Data Handling', ['Pictographs', 'Bar graphs']],
    [12, 'Decimal Fractions', ['Operations on decimals']],
  ],
  7: [
    [1, 'Integers', ['Operations', 'Properties']],
    [2, 'Rational Numbers', ['Operations', 'Number line']],
    [3, 'Fractions', ['Operations', 'Mixed numbers']],
    [4, 'Decimals', ['Operations', 'Conversion']],
    [5, 'Exponents', ['Laws of exponents']],
    [6, 'Algebraic Expressions', ['Terms', 'Operations']],
    [7, 'Linear Equations in One Variable', ['Solving & applications']],
    [8, 'Ratio and Proportion', ['Ratio', 'Proportion', 'Applications']],
    [9, 'Unitary Method', ['Direct & inverse variation']],
    [10, 'Percentage', ['Conversion', 'Applications']],
    [11, 'Profit, Loss and Discount', ['Calculations']],
    [12, 'Simple Interest', ['Formula & applications']],
    [13, 'Speed, Distance and Time', ['Relationships']],
    [14, 'Lines and Angles', ['Pairs of angles']],
    [15, 'Properties of Triangles', ['Angle sum', 'Pythagoras']],
    [16, 'Congruence of Triangles', ['Criteria']],
    [17, 'Symmetry', ['Line & rotational']],
    [18, 'Mensuration', ['Perimeter & area']],
    [19, 'Data Handling', ['Mean, median, mode']],
    [20, 'Probability', ['Simple events']],
  ],
  8: [
    [1, 'Rational Numbers', ['Properties', 'Operations']],
    [2, 'Exponents', ['Laws of exponents', 'Negative exponents']],
    [3, 'Squares and Square Roots', ['Properties', 'Methods']],
    [4, 'Cubes and Cube Roots', ['Properties', 'Methods']],
    [5, 'Playing with Numbers', ['Divisibility rules']],
    [6, 'Sets', ['Types of sets', 'Operations']],
    [7, 'Percent and Percentage', ['Calculations']],
    [8, 'Profit, Loss and Discount', ['Applications']],
    [9, 'Simple and Compound Interest', ['Formula', 'Calculations']],
    [10, 'Direct and Inverse Variations', ['Solving problems']],
    [11, 'Algebraic Expressions', ['Operations', 'Identities']],
    [12, 'Linear Equations in One Variable', ['Solving & applications']],
    [13, 'Linear Inequalities', ['Solving inequalities']],
    [14, 'Understanding Shapes', ['Polygons', 'Properties']],
    [15, 'Quadrilaterals', ['Types & properties']],
    [16, 'Symmetry, Reflection and Rotation', ['Symmetry types']],
    [17, 'Mensuration', ['Area & volume']],
    [18, 'Data Handling', ['Histograms', 'Pie charts']],
    [19, 'Probability', ['Events', 'Sample space']],
  ],
  9: [
    [1, 'Rational and Irrational Numbers', ['Real numbers']],
    [2, 'Compound Interest', ['Formula', 'Applications']],
    [3, 'Expansions', ['Algebraic identities']],
    [4, 'Factorisation', ['Common factors', 'Grouping']],
    [5, 'Simultaneous Linear Equations', ['Substitution', 'Elimination']],
    [6, 'Linear Equations', ['Solving & applications']],
    [7, 'Indices', ['Laws of indices']],
    [8, 'Logarithms', ['Laws', 'Applications']],
    [9, 'Triangles', ['Congruence', 'Inequalities']],
    [10, 'Isosceles Triangle', ['Properties']],
    [11, 'Inequalities', ['Triangle inequalities']],
    [12, 'Mid-point Theorem', ['And its converse']],
    [13, 'Pythagoras Theorem', ['And its converse']],
    [14, 'Rectilinear Figures', ['Quadrilaterals', 'Polygons']],
    [15, 'Construction of Polygons', ['Steps']],
    [16, 'Area Theorems', ['On parallelograms & triangles']],
    [17, 'Circle', ['Chord', 'Arc properties']],
    [18, 'Statistics', ['Mean, median, mode']],
    [19, 'Mean and Median', ['Of ungrouped data']],
    [20, 'Area and Perimeter of Plane Figures', ['Triangles', 'Quadrilaterals']],
    [21, 'Solids', ['Surface area & volume']],
    [22, 'Trigonometrical Ratios', ['sin, cos, tan']],
    [23, 'Trigonometrical Ratios of Standard Angles', ['0° to 90°']],
    [24, 'Solution of Right Triangles', ['Applications']],
    [25, 'Complementary Angles', ['Identities']],
    [26, 'Coordinate Geometry', ['Distance formula']],
    [27, 'Graphs of Linear Equations', ['Plotting']],
    [28, 'Probability', ['Simple events']],
  ],
  10: [
    [1, 'Goods and Services Tax (GST)', ['Calculation', 'Applications']],
    [2, 'Banking', ['Recurring deposit', 'Interest']],
    [3, 'Linear Inequations', ['Solving & graphing']],
    [4, 'Quadratic Equations in One Variable', ['Factorisation', 'Formula']],
    [5, 'Factorisation', ['Polynomials']],
    [6, 'Ratio and Proportion', ['Properties', 'Applications']],
    [7, 'Matrices', ['Operations']],
    [8, 'Arithmetic and Geometric Progressions', ['nth term', 'Sum']],
    [9, 'Factor Theorem', ['And applications']],
    [10, 'Remainder Theorem', ['And applications']],
    [11, 'Coordinate Geometry', ['Distance', 'Section formula', 'Slope']],
    [12, 'Symmetry', ['Line & rotational']],
    [13, 'Similarity', ['Of triangles']],
    [14, 'Loci', ['Locus problems']],
    [15, 'Circles', ['Properties', 'Tangents']],
    [16, 'Constructions', ['Circles', 'Tangents']],
    [17, 'Mensuration', ['Area & volume']],
    [18, 'Trigonometry', ['Identities', 'Heights & distances']],
    [19, 'Statistics', ['Mean, median, mode of grouped data']],
    [20, 'Probability', ['Events', 'Sample space']],
  ],
}

const ICSE_SCIENCE: GradeMap = {
  6: [
    [1, 'The Living and Non-Living', ['Characteristics of living things']],
    [2, 'Plants — Structure and Function', ['Root, stem, leaf']],
    [3, 'Animals — Body Structure', ['Skeletal system']],
    [4, 'Food', ['Components', 'Balanced diet']],
    [5, 'Health and Hygiene', ['Diseases', 'Cleanliness']],
    [6, 'Matter', ['States of matter']],
    [7, 'Separation of Substances', ['Methods']],
    [8, 'Changes Around Us', ['Reversible & irreversible']],
    [9, 'Light', ['Reflection', 'Shadows']],
    [10, 'Electricity', ['Circuits', 'Conductors']],
    [11, 'Magnets', ['Properties']],
    [12, 'Water', ['Cycle', 'Conservation']],
    [13, 'Air', ['Composition']],
    [14, 'Our Environment', ['Ecosystem']],
  ],
  7: [
    [1, 'Basic Biology', ['Plant & animal cells']],
    [2, 'Classification of Matter', ['Elements', 'Compounds']],
    [3, 'Atoms and Molecules', ['Laws of combination']],
    [4, 'Acids, Bases and Salts', ['Indicators', 'Neutralisation']],
    [5, 'Heat', ['Conduction', 'Convection']],
    [6, 'Light Energy', ['Reflection', 'Refraction']],
    [7, 'Sound', ['Propagation', 'Hearing']],
    [8, 'Electricity', ['Circuits', 'Heating effect']],
    [9, 'Transportation in Plants and Animals', ['Circulation', 'Transpiration']],
    [10, 'Respiration', ['Aerobic & anaerobic']],
    [11, 'Reproduction in Plants', ['Sexual & asexual']],
    [12, 'Motion', ['Speed', 'Velocity']],
    [13, 'Weather and Climate', ['Factors']],
    [14, 'Soil', ['Types', 'Profile']],
    [15, 'Water', ['Sources', 'Conservation']],
  ],
  8: [
    [1, 'Transport of Food and Minerals in Plants', ['Xylem & phloem']],
    [2, 'Reproduction in Plants', ['Sexual & asexual']],
    [3, 'Ecosystems', ['Components', 'Food chains']],
    [4, 'Human Body — Endocrine, Circulatory, Nervous', ['Systems']],
    [5, 'Diseases and First Aid', ['Types', 'Prevention']],
    [6, 'Food Production', ['Crops', 'Management']],
    [7, 'Microorganisms', ['Useful & harmful']],
    [8, 'Materials — Metals and Non-Metals', ['Properties']],
    [9, 'Air and Water Pollution', ['Causes', 'Solutions']],
    [10, 'Physical and Chemical Changes', ['Reactions']],
    [11, 'Atomic Structure', ['Sub-atomic particles']],
    [12, 'Chemical Effects of Current', ['Electrolysis']],
    [13, 'Sound', ['Wave nature']],
    [14, 'Light Energy', ['Reflection', 'Refraction']],
    [15, 'Electricity and Magnetism', ['Electromagnets']],
    [16, 'Energy', ['Conventional & non-conventional']],
    [17, 'Force and Pressure', ['Types of forces']],
    [18, 'Friction', ['Advantages & disadvantages']],
  ],
  9: [
    [1, 'The Language of Chemistry', ['Symbols', 'Valency']],
    [2, 'Chemical Changes', ['Equations']],
    [3, 'Water', ['Properties', 'Pollution']],
    [4, 'Atomic Structure', ['Models of atom']],
    [5, 'The Periodic Table', ['Mendeleev', 'Modern']],
    [6, 'Study of Gas Laws', ['Boyle\'s law', 'Charles\' law']],
    [7, 'Practical Chemistry', ['Tests']],
    [8, 'Respiratory System', ['Breathing mechanism']],
    [9, 'Skin — Structure and Function', ['Layers']],
    [10, 'Reproductive System', ['Male & female']],
    [11, 'Health and Hygiene', ['Diseases']],
    [12, 'Nutrition', ['Carbohydrates', 'Proteins', 'Fats']],
    [13, 'Nervous System', ['CNS', 'PNS']],
    [14, 'Endocrine System', ['Hormones']],
    [15, 'Motion', ['Equations of motion']],
    [16, 'Laws of Motion', ['Newton\'s laws']],
    [17, 'Gravitation', ['Universal law']],
    [18, 'Fluids', ['Pressure', 'Buoyancy']],
    [19, 'Heat', ['Conduction', 'Convection', 'Radiation']],
    [20, 'Sound', ['Reflection', 'Echo']],
    [21, 'Electricity', ['Ohm\'s law']],
    [22, 'Magnetism', ['Properties']],
  ],
  10: [
    [1, 'Periodic Table', ['Properties']],
    [2, 'Chemical Bonding', ['Ionic', 'Covalent']],
    [3, 'Acids, Bases and Salts', ['Properties', 'Reactions']],
    [4, 'Analytical Chemistry', ['Tests']],
    [5, 'Mole Concept', ['Avogadro\'s number']],
    [6, 'Electrolysis', ['Faraday\'s laws']],
    [7, 'Metallurgy', ['Extraction']],
    [8, 'Study of Compounds', ['HCl', 'Ammonia', 'Sulphuric acid']],
    [9, 'Organic Chemistry', ['Hydrocarbons', 'Alcohols']],
    [10, 'Cell Cycle', ['Mitosis', 'Meiosis']],
    [11, 'Genetics', ['Mendel\'s laws']],
    [12, 'Absorption by Roots', ['Osmosis', 'Active transport']],
    [13, 'Photosynthesis', ['Light & dark reactions']],
    [14, 'The Circulatory System', ['Heart', 'Blood']],
    [15, 'The Excretory System', ['Kidney', 'Nephron']],
    [16, 'Nervous System', ['Brain', 'Reflex']],
    [17, 'Reproductive System', ['Human reproduction']],
    [18, 'Population', ['Growth', 'Control']],
    [19, 'Human Evolution', ['Theories']],
    [20, 'Machines', ['Levers', 'Pulleys']],
    [21, 'Work, Energy and Power', ['Calculations']],
    [22, 'Refraction of Light', ['Laws', 'Lenses']],
    [23, 'Sound', ['Reflection', 'Resonance']],
    [24, 'Electricity', ['Ohm\'s law', 'Circuits']],
    [25, 'Electro-Magnetism', ['Magnetic effect']],
    [26, 'Radioactivity', ['Nuclear reactions']],
  ],
}

// ICSE Hindi textbook chapters (similar to CBSE but adapted for ICSE syllabus)
const ICSE_HINDI: GradeMap = {
  6: [
    [1, 'साँवले सपनों की याद', ['कविता', 'भाव सारांश']],
    [2, 'बाल कहानी — प्यारी लड़की', ['कहानी', 'सारांश']],
    [3, 'व्याकरण — संज्ञा और सर्वनाम', ['व्याकरण']],
    [4, 'व्याकरण — विशेषण और क्रिया', ['व्याकरण']],
    [5, 'निबंध — मेरा विद्यालय', ['निबंध लेखन']],
    [6, 'पत्र लेखन', ['औपचारिक पत्र']],
    [7, 'वाचन — प्रकृति', ['वाचन अभ्यास']],
    [8, 'अनुवाद — हिंदी से अंग्रेज़ी', ['अनुवाद कौशल']],
  ],
  7: [
    [1, 'हम पंछी उन्मुक्त गगन के', ['कविता', 'भाव सारांश']],
    [2, 'दादी माँ', ['संस्मरण', 'सारांश']],
    [3, 'व्याकरण — कारक और विभक्ति', ['व्याकरण']],
    [4, 'व्याकरण — संधि और समास', ['व्याकरण']],
    [5, 'निबंध — पर्यावरण संरक्षण', ['निबंध']],
    [6, 'पत्र लेखन — औपचारिक', ['पत्र']],
    [7, 'अपठित गद्यांश', ['अर्थग्रहण']],
    [8, 'वाचन — भारत के त्योहार', ['वाचन अभ्यास']],
  ],
  8: [
    [1, 'ध्वनि', ['कविता', 'भाव सारांश']],
    [2, 'लाख की चूड़ियाँ', ['कहानी', 'सारांश']],
    [3, 'व्याकरण — अलंकार', ['व्याकरण']],
    [4, 'व्याकरण — रस', ['व्याकरण']],
    [5, 'निबंध — विज्ञान के चमत्कार', ['निबंध']],
    [6, 'पत्र लेखन — अनौपचारिक', ['पत्र']],
    [7, 'अपठित गद्यांश', ['अर्थग्रहण']],
    [8, 'वाचन — महापुरुष', ['वाचन अभ्यास']],
  ],
  9: [
    [1, 'दो बैलों की कथा', ['प्रेमचंद', 'कहानी का सारांश']],
    [2, 'ल्हासा की ओर', ['रहुल सांकृत्यायन', 'यात्रा वृत्तांत']],
    [3, 'व्याकरण — समास', ['व्याकरण']],
    [4, 'व्याकरण — अलंकार', ['व्याकरण']],
    [5, 'निबंध — समाचार पत्र का महत्व', ['निबंध']],
    [6, 'पत्र लेखन', ['औपचारिक पत्र']],
    [7, 'अपठित गद्यांश', ['अर्थग्रहण']],
    [8, 'वाचन — भारतीय संस्कृति', ['वाचन अभ्यास']],
  ],
  10: [
    [1, 'सूरदास के पद', ['कवि परिचय', 'पदों के अर्थ']],
    [2, 'तुलसीदास — राम-लक्ष्मण-परशुराम संवाद', ['कवि परिचय', 'भाव सारांश']],
    [3, 'व्याकरण — समास', ['व्याकरण']],
    [4, 'व्याकरण — अलंकार', ['व्याकरण']],
    [5, 'निबंध — वैज्ञानिक विकास', ['निबंध']],
    [6, 'पत्र लेखन', ['औपचारिक पत्र']],
    [7, 'अपठित गद्यांश', ['अर्थग्रहण']],
    [8, 'वाचन — भारतीय संस्कृति', ['वाचन अभ्यास']],
  ],
}

// ---------------------------------------------------------------------------
// Karnataka State Board chapters (KSEAB) — Kannada medium textbook contents
// ---------------------------------------------------------------------------

const KTMB_MATHS: GradeMap = {
  6: [
    [1, 'ಸಂಖ್ಯೆಗಳ ಪರಿಚಯ', ['ಸಂಖ್ಯೆಗಳು', 'ಹೋಲಿಕೆ']],
    [2, 'ಪೂರ್ಣಾಂಕಗಳು', ['ಕೂಡುವಿಕೆ', 'ತೆಗೆಯುವಿಕೆ']],
    [3, 'ಭಿನ್ನರಾಶಿಗಳು', ['ಪ್ರಕಾರ', 'ಲಸಾಅಸ']],
    [4, 'ದಶಮಾಂಶ ಭಿನ್ನಗಳು', ['ಕ್ರಿಯೆಗಳು']],
    [5, 'ಅಳತೆ ಮತ್ತು ಪ್ರಮಾಣ', ['ಅಳತೆ ಘಟಕಗಳು']],
    [6, 'ಮೂಲಭೂತ ರೇಖಾಗಣಿತ', ['ಬಿಂದು', 'ರೇಖೆ', 'ಕೋನ']],
    [7, 'ತ್ರಿಭುಜ ಮತ್ತು ಚತುರ್ಭುಜಗಳು', ['ಗುಣಗಳು']],
    [8, 'ವೃತ್ತ ಮತ್ತು ವೃತ್ತಖಂಡಗಳು', ['ಗುಣಗಳು']],
    [9, 'ಬೀಜಗಣಿತ — ಪರಿಚಯ', ['ಚರ', 'ಸಮೀಕರಣ']],
    [10, 'ಅನುಪಾತ ಮತ್ತು ಸಮಾನುಪಾತ', ['ಅನುಪಾತ']],
    [11, 'ಮೇಲ್ಮೈ ಮತ್ತು ಘನಫಲ', ['ಕ್ಷೇತ್ರಫಲ']],
    [12, 'ದತ್ತಾಂಶ ನಿರ್ವಹಣೆ', ['ಸರಾಸರಿ', 'ಲೇಖನ ಚಿತ್ರ']],
  ],
  7: [
    [1, 'ಪೂರ್ಣಾಂಕಗಳು', ['ಗುಣಾಕಾರ', 'ಭಾಗಾಕಾರ']],
    [2, 'ಭಿನ್ನರಾಶಿ ಮತ್ತು ದಶಮಾಂಶಗಳು', ['ಕ್ರಿಯೆಗಳು']],
    [3, 'ದತ್ತಾಂಶ ನಿರ್ವಹಣೆ', ['ಸರಾಸರಿ', 'ಪ್ರಸರಣೆ']],
    [4, 'ಸರಳ ಸಮೀಕರಣಗಳು', ['ಪರಿಹಾರ']],
    [5, 'ರೇಖೆಗಳು ಮತ್ತು ಕೋನಗಳು', ['ಕೋನ ಜೋಡಿ']],
    [6, 'ತ್ರಿಭುಜ — ಗುಣಗಳು', ['ಕೋನ ಮೊತ್ತ', 'ಪೈಥಾಗರಸ್']],
    [7, 'ತ್ರಿಭುಜಗಳ ಸರ್ವಸಮತೆ', ['ನಿಯಮಗಳು']],
    [8, 'ಪ್ರಮಾಣಗಳ ಹೋಲಿಕೆ', ['ಶೇಕಡಾ', 'ಲಾಭ-ನಷ್ಟ']],
    [9, 'ಅಭಿವ್ಯಕ್ತಿಗಳು', ['ಪದಗಳು', 'ಕ್ರಿಯೆಗಳು']],
    [10, 'ಘಾತಾಂಕ ಮತ್ತು ಘಾತಗಳು', ['ನಿಯಮಗಳು']],
    [11, 'ಹೊರಮೈ ಮತ್ತು ಘನಫಲ', ['ಗಣನೆ']],
    [12, 'ಪ್ರಮಾಣ ಮತ್ತು ಸಮಾನುಪಾತ', ['ಅನುಪಾತ']],
  ],
  8: [
    [1, 'ಪರಿಮೇಯ ಸಂಖ್ಯೆಗಳು', ['ಗುಣಗಳು']],
    [2, 'ಏಕಚರ ರೇಖೀಯ ಸಮೀಕರಣಗಳು', ['ಪರಿಹಾರ']],
    [3, 'ಚತುರ್ಭುಜಗಳ ಅರಿವು', ['ಪ್ರಕಾರ']],
    [4, 'ವೃತ್ತಗಳು', ['ಗುಣಗಳು']],
    [5, 'ಪ್ರಮಾಣಗಳ ಹೋಲಿಕೆ', ['ಶೇಕಡಾ', 'ಬಡ್ಡಿ']],
    [6, 'ವರ್ಗ ಮತ್ತು ವರ್ಗಮೂಲಗಳು', ['ಗುಣಗಳು']],
    [7, 'ಘನಫಲ', ['ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ']],
    [8, 'ಬೀಜಗಣಿತೀಯ ಅಭಿವ್ಯಕ್ತಿಗಳು', ['ಕ್ರಿಯೆಗಳು']],
    [9, 'ಸಂಯುಕ್ತ ಆಸಕ್ತಿ', ['ಸೂತ್ರ']],
    [10, 'ಅನುಕ್ರಮ ಮತ್ತು ಶ್ರೇಢಿ', ['ಸಮಾನ್ತರ ಶ್ರೇಢಿ']],
    [11, 'ಅನುಪಾತ ಮತ್ತು ಸಮಾನುಪಾತ', ['ಅನುಪಾತ']],
    [12, 'ತ್ರಿಕೋನಮಿತಿ — ಪರಿಚಯ', ['ಅನುಪಾತ']],
  ],
  9: [
    [1, 'ಸಂಖ್ಯಾ ಪದ್ಧತಿಗಳು', ['ವಾಸ್ತವ ಸಂಖ್ಯೆಗಳು']],
    [2, 'ಬಹುಪದೋಕ್ತಿಗಳು', ['ಪ್ರಕಾರ', 'ಶೂನ್ಯಗಳು']],
    [3, 'ನಿರ್ದೇಶಾಂಕ ರೇಖಾಗಣಿತ', ['ಕಾರ್ಟೀಸಿಯನ್ ತಲ']],
    [4, 'ಏಕಚರ ರೇಖೀಯ ಸಮೀಕರಣಗಳು', ['ಪರಿಹಾರ']],
    [5, 'ಯೂಕ್ಲಿಡ್‌ನ ರೇಖಾಗಣಿತ', ['ಸ್ವಯಂಸಿದ್ಧ']],
    [6, 'ರೇಖೆ ಮತ್ತು ಕೋನಗಳು', ['ಕೋನ ಜೋಡಿ']],
    [7, 'ತ್ರಿಭುಜಗಳು', ['ಸರ್ವಸಮತೆ']],
    [8, 'ಚತುರ್ಭುಜಗಳು', ['ಸಮಾಂತರ ಚತುರ್ಭುಜ ಗುಣಗಳು']],
    [9, 'ವೃತ್ತಗಳು', ['ಜ್ಯಾ', 'ಚಾಪ']],
    [10, 'ಹೀರೋನ ಸೂತ್ರ', ['ಕ್ಷೇತ್ರಫಲ']],
    [11, 'ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ ಮತ್ತು ಘನಫಲ', ['ಘನಾಕೃತಿಗಳು']],
    [12, 'ಸಂಖ್ಯಾಶಾಸ್ತ್ರ', ['ಸರಾಸರಿ']],
    [13, 'ಸಂಭವನೀಯತೆ', ['ಪ್ರಾಯೋಗಿಕ']],
  ],
  10: [
    [1, 'ವಾಸ್ತವ ಸಂಖ್ಯೆಗಳು', ['ಯೂಕ್ಲಿಡ್‌ನ ಲೆಮ್ಮ']],
    [2, 'ಬಹುಪದೋಕ್ತಿಗಳು', ['ಶೂನ್ಯಗಳು']],
    [3, 'ದ್ವಿಚರ ರೇಖೀಯ ಸಮೀಕರಣಗಳ ಜೋಡಿ', ['ಪರಿಹಾರ ವಿಧಾನ']],
    [4, 'ದ್ವಿಘಾತ ಸಮೀಕರಣಗಳು', ['ಗುಣಕಾರಕ', 'ಸೂತ್ರ']],
    [5, 'ಸಮಾನಾಂತರ ಶ್ರೇಢಿ', ['nನೇ ಪದ', 'ಮೊತ್ತ']],
    [6, 'ತ್ರಿಭುಜಗಳು', ['ಸಾಮ್ಯತೆ']],
    [7, 'ನಿರ್ದೇಶಾಂಕ ರೇಖಾಗಣಿತ', ['ದೂರ ಸೂತ್ರ']],
    [8, 'ತ್ರಿಕೋನಮಿತಿ — ಪರಿಚಯ', ['ಅನುಪಾತ']],
    [9, 'ತ್ರಿಕೋನಮಿತಿಯ ಅನ್ವಯಗಳು', ['ಎತ್ತರ ಮತ್ತು ದೂರ']],
    [10, 'ವೃತ್ತಗಳು', ['ಸ್ಪರ್ಶಕ']],
    [11, 'ವೃತ್ತಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ ಕ್ಷೇತ್ರಫಲಗಳು', ['ವಲಯ', 'ಖಂಡ']],
    [12, 'ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ ಮತ್ತು ಘನಫಲ', ['ಘನಾಕೃತಿಗಳು']],
    [13, 'ಸಂಖ್ಯಾಶಾಸ್ತ್ರ', ['ವರ್ಗೀಕೃತ ದತ್ತಾಂಶ']],
    [14, 'ಸಂಭವನೀಯತೆ', ['ಪ್ರಾಯೋಗಿಕ']],
  ],
}

const KTMB_SCIENCE: GradeMap = {
  6: [
    [1, 'ಆಹಾರ — ಅದು ಎಲ್ಲಿಂದ ಬರುತ್ತದೆ', ['ಆಹಾರ ಮೂಲ']],
    [2, 'ಆಹಾರದ ಘಟಕಗಳು', ['ಪೌಷ್ಟಿಕಾಂಶ']],
    [3, 'ನಾರು — ಬಟ್ಟೆ', ['ನೈಸರ್ಗಿಕ ನಾರು']],
    [4, 'ವಸ್ತುಗಳ ವರ್ಗೀಕರಣ', ['ಗುಣಗಳು']],
    [5, 'ವಸ್ತುಗಳ ಪ್ರತ್ಯೇಕತೆ', ['ವಿಧಾನಗಳು']],
    [6, 'ನಮ್ಮ ಸುತ್ತಲಿನ ಬದಲಾವಣೆಗಳು', ['ಮಾದರಿ']],
    [7, 'ಸಸ್ಯಗಳ ಪರಿಚಯ', ['ಕಾಂಡ', 'ಎಲೆ', 'ಬೇರು']],
    [8, 'ದೇಹದ ಚಲನೆ', ['ಅಸ್ಥಿಪಂಜರ']],
    [9, 'ಜೀವಿಗಳು ಮತ್ತು ಅವುಗಳ ಪರಿಸರ', ['ಆವಾಸ']],
    [10, 'ಚಲನೆ ಮತ್ತು ಅಳತೆ', ['ಪ್ರಮಾಣ']],
    [11, 'ಬೆಳಕು — ನೆರಳು — ಪ್ರತಿಫಲನ', ['ಕನ್ನಡಿ']],
    [12, 'ವಿದ್ಯುತ್ — ವಿದ್ಯುತ್ ಪರಿಪಥ', ['ಪರಿಪಥ']],
    [13, 'ಕಾಂತಗಳು', ['ಗುಣಗಳು']],
    [14, 'ನೀರು', ['ಚಕ್ರ']],
  ],
  7: [
    [1, 'ಸಸ್ಯಗಳಲ್ಲಿ ಪೋಷಣೆ', ['ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ']],
    [2, 'ಪ್ರಾಣಿಗಳಲ್ಲಿ ಪೋಷಣೆ', ['ಜೀರ್ಣಾಂಗ']],
    [3, 'ನಾರು — ಬಟ್ಟೆ (ಉಣ್ಣೆ, ರೇಷ್ಮೆ)', ['ನಾರು ಮೂಲ']],
    [4, 'ಉಷ್ಣತೆ', ['ವರ್ಗಾವಣೆ']],
    [5, 'ಆಮ್ಲ — ಕ್ಷಾರ — ಲವಣಗಳು', ['ಸೂಚಕ']],
    [6, 'ಭೌತಿಕ ಮತ್ತು ರಾಸಾಯನಿಕ ಬದಲಾವಣೆಗಳು', ['ಕ್ರಿಯೆ']],
    [7, 'ಹವಾಮಾನ — ಹವಾಗುಣ — ಹೊಂದಾಣಿಕೆ', ['ಹವಾಗುಣ']],
    [8, 'ಮಾರುತ — ಚಂಡಮಾರುತ — ಸುಂಟರಗಾಳಿ', ['ವಾಯು ಒತ್ತಡ']],
    [9, 'ಮಣ್ಣು', ['ಮಣ್ಣಿನ ಪ್ರೊಫೈಲ್']],
    [10, 'ಜೀವಿಗಳಲ್ಲಿ ಶ್ವಸನ', ['ವಾಯುವಿನ ಶ್ವಸನ']],
    [11, 'ಸಸ್ಯ ಮತ್ತು ಪ್ರಾಣಿಗಳಲ್ಲಿ ಸಾರಿಗೆ', ['ರಕ್ತ ಪರಿಚಲನೆ']],
    [12, 'ಸಸ್ಯಗಳಲ್ಲಿ ಸಂತಾನೋತ್ಪತ್ತಿ', ['ಲೈಂಗಿಕ', 'ಅಲೈಂಗಿಕ']],
    [13, 'ಚಲನೆ ಮತ್ತು ಸಮಯ', ['ವೇಗ']],
    [14, 'ವಿದ್ಯುತ್ ಪ್ರವಾಹ', ['ಪರಿಣಾಮ']],
    [15, 'ಬೆಳಕು', ['ಪ್ರತಿಫಲನ']],
  ],
  8: [
    [1, 'ಬೆಳೆ ಉತ್ಪಾದನೆ ಮತ್ತು ನಿರ್ವಹಣೆ', ['ಕೃಷಿ']],
    [2, 'ಸೂಕ್ಷ್ಮಜೀವಿಗಳು', ['ಉಪಯುಕ್ತ', 'ಹಾನಿಕಾರಕ']],
    [3, 'ಸಂಶ್ಲೇಷಿತ ನಾರುಗಳು ಮತ್ತು ಪ್ಲಾಸ್ಟಿಕ್', ['ಪ್ಲಾಸ್ಟಿಕ್']],
    [4, 'ಲೋಹ ಮತ್ತು ಅಲೋಹಗಳು', ['ಗುಣಗಳು']],
    [5, 'ಕಲ್ಲಿದ್ದಲು ಮತ್ತು ಪೆಟ್ರೋಲಿಯಮ್', ['ಇಂಧನ']],
    [6, 'ದಹನ ಮತ್ತು ಜ್ವಾಲೆ', ['ದಹನ']],
    [7, 'ಸಸ್ಯ ಮತ್ತು ಪ್ರಾಣಿಗಳ ಸಂರಕ್ಷಣೆ', ['ಅರಣ್ಯ']],
    [8, 'ಜೀಕೋಶ — ರಚನೆ ಮತ್ತು ಕ್ರಿಯೆ', ['ಜೀಕೋಶಾಂಗಗಳು']],
    [9, 'ಪ್ರಾಣಿಗಳಲ್ಲಿ ಸಂತಾನೋತ್ಪತ್ತಿ', ['ಲೈಂಗಿಕ']],
    [10, 'ಹರೆಯದ ತಲುಪುವಿಕೆ', ['ಹಾರ್ಮೋನ್']],
    [11, 'ಬಲ ಮತ್ತು ಒತ್ತಡ', ['ಬಲ ಪ್ರಕಾರ']],
    [12, 'ಘರ್ಷಣೆ', ['ಪ್ರಕಾರ']],
    [13, 'ಧ್ವನಿ', ['ತರಂಗ']],
    [14, 'ವಿದ್ಯುತ್ ಪ್ರವಾಹದ ರಾಸಾಯನಿಕ ಪರಿಣಾಮ', ['ವಿದ್ಯುದ್ವಿಶ್ಲೇಷಣೆ']],
    [15, 'ಕೆಲವು ನೈಸರ್ಗಿಕ ವಿದ್ಯಮಾನಗಳು', ['ಮಿಂಚು']],
    [16, 'ಬೆಳಕು', ['ಪ್ರತಿಫಲನ']],
    [17, 'ನಕ್ಷತ್ರಗಳು ಮತ್ತು ಸೌರಮಂಡಲ', ['ಗ್ರಹಗಳು']],
  ],
  9: [
    [1, 'ನಮ್ಮ ಸುತ್ತಲಿನ ದ್ರವ್ಯ', ['ದ್ರವ್ಯ ಸ್ಥಿತಿ']],
    [2, 'ನಮ್ಮ ಸುತ್ತಲಿನ ದ್ರವ್ಯ ಶುದ್ಧವೇ', ['ಮಿಶ್ರಣ']],
    [3, 'ಪರಮಾಣು ಮತ್ತು ಅಣುಗಳು', ['ಮೋಲ್ ಪರಿಕಲ್ಪನೆ']],
    [4, 'ಪರಮಾಣು ರಚನೆ', ['ಉಪಪರಮಾಣು ಕಣ']],
    [5, 'ಜೀವಕೋಶ — ಜೀವದ ಮೂಲ ಘಟಕ', ['ಜೀವಕೋಶಾಂಗಗಳು']],
    [6, 'ಅಂಗಾಂಶಗಳು', ['ಸಸ್ಯ ಅಂಗಾಂಶ']],
    [7, 'ಜೀವ ವೈವಿಧ್ಯತೆ', ['ವರ್ಗೀಕರಣ']],
    [8, 'ಚಲನೆ', ['ವೇಗ', 'ತ್ವರಣ']],
    [9, 'ಬಲ ಮತ್ತು ನ್ಯೂಟನ್‌ನ ನಿಯಮಗಳು', ['ನಿಯಮಗಳು']],
    [10, 'ಗುರುತ್ವಾಕರ್ಷಣೆ', ['ಸಾರ್ವತ್ರಿಕ ನಿಯಮ']],
    [11, 'ಕಾರ್ಯ ಮತ್ತು ಶಕ್ತಿ', ['ಶಕ್ತಿ ರೂಪ']],
    [12, 'ಧ್ವನಿ', ['ತರಂಗ']],
    [13, 'ನಾವು ಏಕೆ ಅಸ್ವಸ್ಥರಾಗುತ್ತೇವೆ', ['ರೋಗ']],
    [14, 'ನೈಸರ್ಗಿಕ ಸಂಪನ್ಮೂಲಗಳು', ['ಗಾಳಿ', 'ನೀರು']],
    [15, 'ಆಹಾರ ಸಂಪನ್ಮೂಲಗಳ ಸುಧಾರಣೆ', ['ಬೆಳೆ']],
  ],
  10: [
    [1, 'ರಾಸಾಯನಿಕ ಕ್ರಿಯೆಗಳು ಮತ್ತು ಸಮೀಕರಣಗಳು', ['ಸಮೀಕರಣ ಸಮತೋಲನ']],
    [2, 'ಆಮ್ಲ — ಕ್ಷಾರ — ಲವಣಗಳು', ['pH ಮಾಪಕ']],
    [3, 'ಲೋಹ ಮತ್ತು ಅಲೋಹಗಳು', ['ಕ್ರಿಯಾಶೀಲತೆ ಶ್ರೇಣಿ']],
    [4, 'ಇಂಗಾಲ ಮತ್ತು ಅದರ ಸಂಯುಕ್ತಗಳು', ['ಹೈಡ್ರೋಕಾರ್ಬನ್']],
    [5, 'ಮೂಲಧಾತುಗಳ ಆವರ್ತ ವರ್ಗೀಕರಣ', ['ಆವರ್ತ ಕೋಷ್ಟಕ']],
    [6, 'ಜೀವ ಪ್ರಕ್ರಿಯೆಗಳು', ['ಪೋಷಣೆ', 'ಶ್ವಸನ']],
    [7, 'ನಿಯಂತ್ರಣ ಮತ್ತು ಸಮನ್ವಯ', ['ನರಮಂಡಲ']],
    [8, 'ಜೀವಿಗಳು ಹೇಗೆ ಸಂತಾನೋತ್ಪತ್ತಿ ಮಾಡುತ್ತವೆ', ['ಲೈಂಗಿಕ', 'ಅಲೈಂಗಿಕ']],
    [9, 'ಆನುವಂಶಿಕತೆ ಮತ್ತು ವಿಕಾಸ', ['ಮೆಂಡಲ್‌ನ ನಿಯಮ']],
    [10, 'ಬೆಳಕು — ಪ್ರತಿಫಲನ ಮತ್ತು ವಕ್ರೀಭವನ', ['ಲೆನ್ಸ್ ಸೂತ್ರ']],
    [11, 'ಮಾನವ ಕಣ್ಣು ಮತ್ತು ವರ್ಣಮಯ ಪ್ರಪಂಚ', ['ಕಣ್ಣಿನ ದೋಷ']],
    [12, 'ವಿದ್ಯುತ್', ['ಓಮ್‌ನ ನಿಯಮ']],
    [13, 'ವಿದ್ಯುತ್ ಪ್ರವಾಹದ ಕಾಂತೀಯ ಪರಿಣಾಮ', ['ಕಾಂತ ಕ್ಷೇತ್ರ']],
    [14, 'ಶಕ್ತಿಯ ಮೂಲಗಳು', ['ನವೀಕರಿಸಬಲ್ಲ']],
    [15, 'ನಮ್ಮ ಪರಿಸರ', ['ಪರಿಸರ ವ್ಯವಸ್ಥೆ']],
    [16, 'ನೈಸರ್ಗಿಕ ಸಂಪನ್ಮೂಲಗಳ ಸುಸ್ಥಿರ ನಿರ್ವಹಣೆ', ['ಸಂರಕ್ಷಣೆ']],
  ],
}

// ---------------------------------------------------------------------------
// Maharashtra State Board chapters (MSBSHSE) — overlapping with NCERT
// but using Marathi/English medium textbook chapter names. We reuse the
// ICSE Maths/Science chapters for grades 6-10 since the Maharashtra board
// adopts very similar content scope.
// ---------------------------------------------------------------------------

const MSBSHE_MATHS = ICSE_MATHS // Maharashtra board maths closely follows the
                                 // ICSE-like division of topics for grades 6-10.
const MSBSHE_SCIENCE = ICSE_SCIENCE
const MSBSHE_HINDI = CBSE_HINDI // Maharashtra board Hindi uses NCERT-aligned books.

// ---------------------------------------------------------------------------
// Chapter registry: all (boardId × subjectId × grade) entries flattened.
// Lazy-built map for O(1) lookup.
// ---------------------------------------------------------------------------

const REGISTRY: Record<string, SyllabusChapter[]> = {}

function key(boardId: string, subjectId: string, grade: number) {
  return `${boardId}::${subjectId}::${grade}`
}

function register(
  boardId: string,
  subjectId: string,
  map: GradeMap
) {
  for (const gradeStr of Object.keys(map)) {
    const grade = Number(gradeStr)
    REGISTRY[key(boardId, subjectId, grade)] = map[grade].map(
      ([number, title, topics]) => ({
        id: `ch${number}`,
        number,
        title,
        topics,
      })
    )
  }
}

register('cbse', 'maths', CBSE_MATHS)
register('cbse', 'science', CBSE_SCIENCE)
register('cbse', 'hindi', CBSE_HINDI)
register('cbse', 'kannada', CBSE_KANNADA)
register('icse', 'maths', ICSE_MATHS)
register('icse', 'science', ICSE_SCIENCE)
register('icse', 'hindi', ICSE_HINDI)
register('kseab', 'maths', KTMB_MATHS)
register('kseab', 'science', KTMB_SCIENCE)
register('kseab', 'kannada', CBSE_KANNADA) // Karnataka Kannada textbooks overlap with CBSE Kannada for now
register('msbshe', 'maths', MSBSHE_MATHS)
register('msbshe', 'science', MSBSHE_SCIENCE)
register('msbshe', 'hindi', MSBSHE_HINDI)

// For Kannada subject on ICSE / Maharashtra, fall back to the CBSE Kannada
// chapters (better than showing "no chapters available").
register('icse', 'kannada', CBSE_KANNADA)
register('msbshe', 'kannada', CBSE_KANNADA)

export function getChapters(
  boardId: string,
  subjectId: string,
  grade: number
): SyllabusChapter[] {
  return REGISTRY[key(boardId, subjectId, grade)] ?? []
}

export function getChapter(
  boardId: string,
  subjectId: string,
  grade: number,
  chapterId: string
): SyllabusChapter | undefined {
  return getChapters(boardId, subjectId, grade).find((c) => c.id === chapterId)
}

export function hasChapters(
  boardId: string,
  subjectId: string,
  grade: number
): boolean {
  return getChapters(boardId, subjectId, grade).length > 0
}

// Pretty-printed label for showing current syllabus context in the UI
export function describeSyllabusContext(opts: {
  boardId?: string | null
  grade: number
  subjectId: string
  chapterId?: string | null
}): string {
  const board = opts.boardId ? getBoard(opts.boardId) : undefined
  const chapter = opts.chapterId
    ? getChapter(opts.boardId ?? '', opts.subjectId, opts.grade, opts.chapterId)
    : undefined
  if (!board) return ''
  const parts: string[] = [`${board.shortLabel} Class ${opts.grade}`]
  if (chapter) parts.push(`Ch. ${chapter.number}: ${chapter.title}`)
  return parts.join(' · ')
}
