export interface BlogGif {
  url: string;
  alt: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: "JEE" | "NEET" | "Study Tips" | "Strategy";
  date: string;
  readTime: number;
  tags: string[];
  heroGif?: BlogGif;
  heroGradient?: string;
  heroEmoji?: string;
  content: string;
}

export const CATEGORY_GRADIENTS: Record<string, { gradient: string; emoji: string }> = {
  JEE: { gradient: "from-blue-600 via-indigo-500 to-purple-600", emoji: "⚛️" },
  NEET: { gradient: "from-emerald-500 via-teal-500 to-cyan-600", emoji: "🧬" },
  "Study Tips": { gradient: "from-amber-500 via-orange-500 to-red-500", emoji: "📚" },
  Strategy: { gradient: "from-violet-600 via-purple-500 to-fuchsia-500", emoji: "🎯" },
};

export const TOPIC_GIFS: Record<string, BlogGif> = {
  physics: { url: "https://media4.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif", alt: "Physics animation" },
  biology: { url: "https://media0.giphy.com/media/l46Cy1rHbQ92uuLXa/giphy.gif", alt: "Biology DNA animation" },
  chemistry: { url: "https://media3.giphy.com/media/ccRMvuh3PeuSGgOWVx/giphy.gif", alt: "Chemistry flask" },
  maths: { url: "https://media1.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif", alt: "Math calculations" },
  study: { url: "https://media2.giphy.com/media/WoWm8YzFQJg5i/giphy.gif", alt: "Studying" },
  strategy: { url: "https://media0.giphy.com/media/l0IylOPCNkiqOgMyA/giphy.gif", alt: "Chess strategy" },
  exam: { url: "https://media1.giphy.com/media/bAlGLD0BQBiFa/giphy.gif", alt: "Exam time" },
  celebrate: { url: "https://media0.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif", alt: "Celebration" },
  focus: { url: "https://media3.giphy.com/media/IPbS5R4fSUl5S/giphy.gif", alt: "Deep focus" },
  clock: { url: "https://media2.giphy.com/media/xTiTnxCaP0qE2XYalO/giphy.gif", alt: "Clock ticking" },
  brain: { url: "https://media4.giphy.com/media/xT77XWum9yH7zNkFW0/giphy.gif", alt: "Brain power" },
  writing: { url: "https://media1.giphy.com/media/XIqCQx02E1U9W/giphy.gif", alt: "Writing notes" },
  mistake: { url: "https://media3.giphy.com/media/3oEjHAUOqG3lSS0f1C/giphy.gif", alt: "Facepalm" },
  success: { url: "https://media0.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif", alt: "Success" },
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "top-10-jee-physics-mistakes",
    title: "Top 10 Physics Mistakes JEE Aspirants Make (And How to Fix Them)",
    description: "Avoid the most common physics errors that cost JEE candidates 20-40 marks. From sign conventions to unit analysis, here's what toppers do differently.",
    category: "JEE",
    date: "2026-07-01",
    readTime: 8,
    tags: ["JEE", "Physics", "Mistakes", "Tips"],
    heroGif: TOPIC_GIFS.mistake,
    heroGradient: CATEGORY_GRADIENTS.JEE.gradient,
    heroEmoji: "⚠️",
    content: `!gif[physics]

## 1. Ignoring Sign Conventions in Optics

The single biggest mark-killer in JEE Physics. Students solve the mirror/lens formula correctly but forget the Cartesian sign convention.

**The fix:** Always draw the principal axis, mark the origin at the pole/optical centre, and assign signs *before* substituting values. Practice 10 problems using only sign conventions until it's muscle memory.

## 2. Confusing Velocity and Speed in Circular Motion

When a question says "velocity at the top of a vertical circle," many students use the scalar speed formula. Velocity is a vector — direction matters.

**The fix:** For vertical circular motion, always resolve into tangential and radial components. At the top, velocity is horizontal. At the bottom, it's also horizontal but in the opposite direction.

## 3. Wrong Free Body Diagrams

Missing a force or drawing it in the wrong direction accounts for ~15% of mechanics errors. The most commonly missed: normal reaction on inclined planes, tension in connected body problems.

**The fix:** Use the FNET checklist:
- **F**riction (opposing relative motion)
- **N**ormal (perpendicular to surface)
- **E**xternal forces (applied, tension)
- **T**hings that pull down (gravity, always mg downward)

## 4. Not Checking Dimensions

If your answer for force comes out in kg·m/s, something went wrong. Dimensional analysis catches ~30% of calculation errors.

**The fix:** After every derivation, verify the dimensions of your final expression. If you're getting a velocity, it must be [LT⁻¹].

## 5. Forgetting the Negative in Work-Energy Theorem

W_net = ΔKE, not W_net = KE. And work done *by* friction is negative. Students routinely get the sign of work wrong in problems involving friction on inclines.

**The fix:** Always specify *who* is doing the work. "Work done by gravity" vs "work done by friction" vs "work done by normal force." This eliminates sign confusion.

## 6. Applying Kirchhoff's Laws Incorrectly

Two mistakes dominate: (a) not choosing consistent current directions before applying KVL, and (b) forgetting that EMF has a sign depending on traversal direction.

**The fix:** Mark assumed current directions with arrows *first*. Then traverse each loop consistently (clockwise or anticlockwise). If you go from − to + through a battery, EMF is positive.

## 7. Misusing the Parallel Axis Theorem

I = I_cm + Md², not I = I_cm + md². The M is the *total mass* of the body, and d is the distance between the parallel axes. Students often use the wrong axis as reference.

**The fix:** The parallel axis theorem *only* works when one of the axes passes through the centre of mass. If neither does, you must use the CM axis as an intermediate step.

## 8. Confusing Electric Field and Potential

E = −dV/dr, not E = dV/dr. The field points in the direction of *decreasing* potential. Also, V is a scalar (add directly), while E is a vector (add using superposition with direction).

**The fix:** Remember "HILD" — High to Low for field Direction. Electric field lines go from high to low potential.

## 9. Using Wrong Formulas for SHM

Mixing up x = A sin(ωt) and x = A cos(ωt) based on initial conditions. If the particle starts from the mean position, use sine. If it starts from the extreme position, use cosine.

**The fix:** Always check t = 0 conditions. If x(0) = 0 (mean position), use sine. If x(0) = A (extreme), use cosine. Or use the general form x = A sin(ωt + φ) and find φ.

## 10. Not Reading the Question Fully

This isn't a physics mistake — it's an exam strategy failure. "Find the acceleration" vs "find the magnitude of acceleration" vs "find the component of acceleration along the incline" are three different questions.

**The fix:** Underline what the question asks for *before* solving. Circle whether they want magnitude, direction, component, or the full vector. This alone can save you 8-12 marks in JEE.

---

*Practice these fixes in your next [mock test](/mock-test) and watch your physics score improve.*`,
  },
  {
    slug: "neet-biology-last-30-days-strategy",
    title: "NEET Biology: 30-Day Strategy to Score 340+",
    description: "A day-by-day plan to maximize your NEET Biology score in the last month. NCERT-focused revision with topic prioritization.",
    category: "NEET",
    date: "2026-06-28",
    readTime: 10,
    tags: ["NEET", "Biology", "Strategy", "Last Month"],
    heroGif: TOPIC_GIFS.biology,
    heroGradient: CATEGORY_GRADIENTS.NEET.gradient,
    heroEmoji: "🧬",
    content: `!gif[biology]

## Why Biology Decides Your NEET Rank

Biology carries 360 marks out of 720 in NEET — exactly half. Most top rankers score 340+ in Biology alone. The strategy is simple: **NCERT is the Bible**.

## Week 1 (Days 1-7): High-Yield Chapters

Focus exclusively on chapters that appear every year:

### Botany Priority List
1. **Plant Anatomy** (2-3 questions guaranteed)
2. **Morphology of Flowering Plants** (2-3 questions)
3. **Cell Biology** (3-4 questions)
4. **Genetics & Molecular Biology** (5-6 questions)
5. **Ecology** (4-5 questions)

### Zoology Priority List
1. **Human Physiology** (8-10 questions, the single biggest topic)
2. **Animal Kingdom** (3-4 questions)
3. **Biomolecules** (2-3 questions)
4. **Evolution** (2 questions)
5. **Human Reproduction** (3-4 questions)

**Daily schedule:** 4 hours of reading NCERT + 1 hour of MCQ practice from previous year papers.

## Week 2 (Days 8-14): NCERT Line-by-Line

This is where toppers separate themselves. Read every line, every diagram caption, every table in NCERT. NEET questions often come from:

- Diagram labels (especially flow charts in Respiration, Photosynthesis)
- Tables (comparison tables in Animal Kingdom, Plant Kingdom)
- Example organisms mentioned in passing
- Bold/italicized terms and their definitions

**Pro tip:** Make a separate notebook for NCERT-specific terms. Write the exact NCERT definition — the options in NEET use the same language.

## Week 3 (Days 15-21): Previous Year Papers

Solve NEET papers from the last 5 years (2021-2025). You'll notice:

- ~60% of questions are direct NCERT
- ~25% are NCERT-based but need application
- ~15% are tricky conceptual questions

**Track your weak spots.** Use the [progress tracker](/my-progress) to identify which chapters need more revision.

## Week 4 (Days 22-30): Revision + Mock Tests

- Days 22-25: Revise weak chapters identified in Week 3
- Days 26-28: Full-length mock tests (try our [NEET mocks](/mock-test))
- Days 29-30: Only read your notes and NCERT highlights. No new content.

## 5 Biology Hacks for NEET

1. **Learn the exceptions, not the rules.** NEET loves exceptions (e.g., "Which of the following is NOT a characteristic of monocots?")
2. **Memorize the diagrams.** Draw them from memory — heart cross-section, nephron, DNA replication fork, synapse
3. **Use mnemonics for taxonomic classification.** King Philip Came Over For Good Spaghetti
4. **Connect Botany and Zoology.** Cell division, genetics, ecology concepts overlap — study them together
5. **Read the question twice.** "All of the following EXCEPT" — if you miss "EXCEPT," you'll pick the wrong answer

---

*Start your NEET prep with our [flashcard deck](/flashcards) and [daily practice questions](/question-bank).*`,
  },
  {
    slug: "how-to-study-12-hours-a-day",
    title: "How to Actually Study 12 Hours a Day Without Burning Out",
    description: "The science-backed schedule that IIT toppers use. Pomodoro technique, sleep optimization, and strategic breaks for sustained focus.",
    category: "Study Tips",
    date: "2026-06-20",
    readTime: 7,
    tags: ["Study Tips", "Productivity", "Focus", "Schedule"],
    heroGif: TOPIC_GIFS.focus,
    heroGradient: CATEGORY_GRADIENTS["Study Tips"].gradient,
    heroEmoji: "⏰",
    content: `!gif[study]

## The Problem With "Just Study More"

Every coaching teacher says "study 12-14 hours daily." Nobody explains *how*. Sitting at a desk for 12 hours ≠ 12 hours of effective study. Most students get 4-5 hours of real focus in a 12-hour session.

## The Optimized 12-Hour Schedule

Here's what actually works, based on cognitive science:

### Block 1: Morning Peak (6:00 AM - 9:00 AM)
**3 hours of hard problem-solving**

Your prefrontal cortex is sharpest within 2-3 hours of waking. Use this for:
- Tough math problems
- Physics numericals
- Organic Chemistry mechanisms

Use the [Pomodoro timer](/study-timer): 50 minutes focus, 10 minutes break.

### Block 2: Mid-Morning (9:30 AM - 12:30 PM)
**3 hours of concept building**

- Read theory and derivations
- Watch lectures for new topics
- Make notes (handwritten, not typed — better retention)

### Lunch Break (12:30 - 2:00 PM)
**90 minutes minimum.** Eat, nap for 20 minutes (not more), walk outside. Sunlight resets your circadian rhythm.

### Block 3: Afternoon (2:00 PM - 5:00 PM)
**3 hours of practice and revision**

Afternoon dip is real. Combat it with:
- MCQ practice (active recall fights drowsiness)
- [Flashcard review](/flashcards) (spaced repetition)
- Previous year paper solving

### Block 4: Evening (5:30 PM - 8:00 PM)
**2.5 hours of weak-topic focus**

Check your [progress dashboard](/my-progress) and study your weakest subjects. This is when you do the work that feels hardest — the morning version of you already handled the intellectually demanding stuff.

### Block 5: Night Review (9:00 PM - 10:00 PM)
**1 hour of light revision**

- Review the day's notes
- Solve 10-15 easy MCQs to end on a positive note
- Plan tomorrow's schedule

### Sleep: 10:30 PM - 5:30 AM
**7 hours minimum.** Sleep is when your brain consolidates memories. Cutting sleep to study more is literally counterproductive — you'll forget what you studied.

## The Secret: Strategic Breaks

Every 50 minutes, you MUST break. Not "check your phone" — that's more screen time. Real breaks:
- Walk to the kitchen and drink water
- Do 10 pushups or stretches
- Look at something 20 feet away for 20 seconds (20-20-20 rule for eyes)
- Talk to a family member for 2 minutes

## What Toppers Don't Tell You

1. **They don't study 12 hours every day.** They have 10-hour days and 14-hour days. The average matters, not the daily number.
2. **Quality > Quantity.** 8 focused hours beats 14 distracted hours.
3. **They take one full day off per week.** Your brain needs downtime to form connections.
4. **They track their time.** Use our [study timer](/study-timer) to see how much you actually study vs how much you think you study.

---

*Start tracking your study sessions with the [Pomodoro timer](/study-timer) and see the difference.*`,
  },
  {
    slug: "jee-mains-vs-advanced-strategy",
    title: "JEE Mains vs Advanced: Why You Need Different Strategies",
    description: "The approach that gets you 99 percentile in Mains can fail you in Advanced. Here's how to prepare for both without splitting your brain.",
    category: "Strategy",
    date: "2026-06-15",
    readTime: 9,
    tags: ["JEE", "Strategy", "JEE Mains", "JEE Advanced"],
    heroGif: TOPIC_GIFS.strategy,
    heroGradient: CATEGORY_GRADIENTS.Strategy.gradient,
    heroEmoji: "⚔️",
    content: `!gif[exam]

## The Fundamental Difference

**JEE Mains** tests speed and accuracy. 90 questions in 180 minutes = 2 minutes per question. Most questions are direct formula application.

**JEE Advanced** tests depth and problem-solving. Fewer questions, more time per question, but each question requires chaining 2-3 concepts.

## The Mains Strategy: Speed is King

### What works in Mains:
- **Pattern recognition.** After solving 500+ problems per chapter, you recognize question types instantly.
- **Formula sheet mastery.** You should know 200+ formulas cold. No derivation time.
- **Strategic skipping.** Skip a hard question (save 4 minutes) and solve 2 easy ones (+8 marks vs risking −1).
- **Backward solving.** Plug in answer options when direct solving is slow.

### Practice approach:
- Solve 100 MCQs per day across subjects
- Time yourself: if a question takes >3 minutes, skip and come back
- Weekly full-length mocks in exam conditions (try our [JEE mocks](/mock-test))

## The Advanced Strategy: Depth is King

### What works in Advanced:
- **Concept linking.** A single question might need mechanics + thermodynamics + calculus. You must see connections.
- **Partial marking.** In multi-correct questions, getting 2 out of 3 correct still gives partial marks. Never leave these blank.
- **Paper analysis.** Paper 1 and Paper 2 often have different difficulty distributions. Adjust your time allocation dynamically.

### Practice approach:
- Solve previous 10 years of JEE Advanced papers
- For each wrong answer, trace back to the fundamental concept you missed
- Practice integer-type questions separately — they test precision

## The Combined Strategy

### Phase 1 (6 months before Mains): Build breadth
- Cover entire syllabus at Mains level
- Solve HC Verma, RD Sharma, OP Tandon at basic level
- Take weekly Mains-pattern mocks

### Phase 2 (After Mains, before Advanced): Build depth
- Focus on Advanced-heavy topics: Mechanics, Electrochemistry, Matrices & Determinants
- Solve Irodov (Physics), MS Chauhan (Organic), problems from Arihant Advanced series
- Take Advanced-pattern mocks with negative marking

### Phase 3 (Last 2 weeks before Advanced): Peak performance
- Only solve previous year Advanced papers
- Analyze your time distribution — which section do you spend too much time on?
- Practice the art of "letting go" — if a question is taking too long, move on

## Subject-Wise Differences

| Subject | Mains Focus | Advanced Focus |
|---------|------------|----------------|
| Physics | Formula application, ray optics, modern physics | Mechanics (5-6 Qs), electromagnetism, thermodynamics |
| Chemistry | Inorganic facts, coordination chemistry | Organic mechanisms, equilibrium numericals |
| Maths | Coordinate geometry, calculus | Algebra, complex numbers, combinatorics |

## The Meta-Strategy

Don't prepare for "JEE." Prepare for *two different exams* that share a syllabus. Your Mains score gets you into NITs (perfectly good). Your Advanced score gets you into IITs. Both require different muscles.

---

*Practice both strategies with our [mock tests](/mock-test) — we have mini mocks for speed practice and full mocks for depth.*`,
  },
  {
    slug: "chemistry-organic-reaction-map",
    title: "The Complete Organic Chemistry Reaction Map for JEE & NEET",
    description: "A visual guide to every organic reaction you need to know. Organized by functional group conversions with reagents and conditions.",
    category: "JEE",
    date: "2026-06-10",
    readTime: 12,
    tags: ["JEE", "NEET", "Chemistry", "Organic Chemistry"],
    heroGif: TOPIC_GIFS.chemistry,
    heroGradient: CATEGORY_GRADIENTS.JEE.gradient,
    heroEmoji: "🧪",
    content: `!gif[chemistry]

## Why a Reaction Map Works

Organic Chemistry has 100+ reactions. Learning them as isolated facts is impossible. But if you organize them as *conversions between functional groups*, patterns emerge.

## Alcohols → Everything

Alcohols are the central node of organic chemistry. From an alcohol, you can make:

### Alcohol → Alkene
- **Reagent:** Conc. H₂SO₄ at 170°C (dehydration)
- **Rule:** Zaitsev's rule — more substituted alkene is major product
- **JEE favorite:** Rearrangement during dehydration (carbocation shift)

### Alcohol → Alkyl Halide
- **With HX:** Lucas test (ZnCl₂/HCl) — 3° reacts instantly, 2° in 5 min, 1° slowly
- **With PCl₅:** ROH + PCl₅ → RCl + POCl₃ + HCl
- **With SOCl₂:** Best method (Darzen's process) — byproducts are gases, easy purification

### Alcohol → Aldehyde/Ketone
- **PCC** (Pyridinium Chlorochromate): Mild oxidation, stops at aldehyde for 1° alcohols
- **Jones reagent** (CrO₃/H₂SO₄): Oxidizes 1° alcohol all the way to carboxylic acid
- **2° alcohol → Ketone:** Any oxidizing agent works (PCC, Jones, KMnO₄)

### Alcohol → Ester
- **Fischer esterification:** ROH + R'COOH → R'COOR + H₂O (acid catalyst, reversible)

## Carbonyl Compounds (Aldehydes & Ketones)

### Aldehyde → Carboxylic Acid
- Tollen's test (Ag₂O/NH₃): Silver mirror + acid
- Fehling's test (Cu²⁺): Brick red precipitate + acid
- KMnO₄ (strong): Direct oxidation

### Ketone → Alcohol (Reduction)
- **NaBH₄:** Mild, selective (doesn't reduce C=C)
- **LiAlH₄:** Strong, reduces almost everything
- **Clemmensen:** Zn-Hg/HCl → removes C=O entirely (→ CH₂)
- **Wolff-Kishner:** NH₂NH₂/KOH → removes C=O entirely (basic conditions)

### Aldol Condensation
- Aldehydes/ketones with α-hydrogen → β-hydroxy carbonyl → α,β-unsaturated carbonyl (heat)
- **Crossed Aldol:** One substrate has no α-H (like HCHO or PhCHO)

### Cannizzaro Reaction
- Aldehydes *without* α-hydrogen + conc. NaOH → one molecule oxidized (acid), one reduced (alcohol)
- Classic example: 2 HCHO → HCOO⁻ + CH₃OH

## Named Reactions You Must Know

| Reaction | What it does | Key reagent |
|----------|-------------|-------------|
| Sandmeyer | ArN₂⁺ → ArCl, ArBr, ArCN | CuCl, CuBr, CuCN |
| Gattermann | ArN₂⁺ → ArCl, ArBr | Cu powder + HCl/HBr |
| Kolbe | Phenol → Salicylic acid | CO₂ + NaOH, then H⁺ |
| Reimer-Tiemann | Phenol → Salicylaldehyde | CHCl₃ + NaOH |
| Friedel-Crafts | ArH → ArCOR or ArR | RCOCl/RCl + AlCl₃ |
| Hofmann | Amide → Amine (one fewer C) | Br₂ + NaOH |
| Gabriel | Phthalimide → 1° Amine | RX + KOH/hydrolysis |
| Hell-Volhard-Zelinsky | α-Halogenation of acid | X₂ + P (red) |
| Rosenmund | Acid chloride → Aldehyde | H₂ + Pd/BaSO₄ (poisoned) |
| Stephen | Nitrile → Aldehyde | SnCl₂ + HCl |

## The 3 Reaction Patterns

Every organic reaction is one of these:
1. **Substitution** (SN1, SN2, electrophilic aromatic)
2. **Elimination** (E1, E2, dehydration)
3. **Addition** (to C=C, C=O, C≡C)

If you can classify a reaction into one of these three, you can predict the product even if you've never seen the specific reaction before.

## How to Study This

1. Make a flowchart for each functional group (alcohol, aldehyde, ketone, acid, amine)
2. For each arrow, write the reagent and condition
3. Practice by covering the reagents and trying to recall them
4. Use [flashcards](/flashcards) for the named reactions

---

*Test your organic chemistry knowledge with our [JEE mock tests](/mock-test).*`,
  },
  {
    slug: "time-management-jee-exam-hall",
    title: "Time Management Inside the JEE Exam Hall: A Minute-by-Minute Guide",
    description: "How to allocate your 180 minutes in JEE Mains for maximum marks. The 3-pass strategy that toppers use.",
    category: "Strategy",
    date: "2026-06-05",
    readTime: 6,
    tags: ["JEE", "Strategy", "Time Management", "Exam Tips"],
    heroGif: TOPIC_GIFS.clock,
    heroGradient: CATEGORY_GRADIENTS.Strategy.gradient,
    heroEmoji: "⏱️",
    content: `!gif[clock]

## The 3-Pass Strategy

Most students solve questions sequentially: Q1, Q2, Q3... This is the worst possible approach. Here's what 99+ percentilers do:

### Pass 1: The Quick Sweep (45 minutes)
Go through ALL 75-90 questions in 45 minutes. For each question:
- **Instant solve** (< 1 minute): Solve it immediately
- **Doable** (2-3 minutes): Mark it and move on
- **Hard/unfamiliar**: Skip entirely

Goal: Solve 25-30 easy questions = 100-120 marks secured.

### Pass 2: The Problem-Solving Round (90 minutes)
Go back to all "doable" questions. You now have 90 minutes for ~30 questions = 3 minutes each. This is comfortable.

Goal: Solve 20-25 more questions = 80-100 additional marks.

### Pass 3: The Strategic Gamble (45 minutes)
With 30-45 minutes left, look at remaining questions. For each:
- Can you eliminate 2 options? → Guess (expected value is positive with 2 eliminations)
- Completely clueless? → Leave blank (−1 for wrong > 0 for unanswered)

Goal: Pick up 15-30 more marks from educated guesses.

## Subject Order Strategy

**Start with your strongest subject.** If Physics is your best, do Physics first. This builds confidence and secures marks early.

Common mistake: Starting with the subject you're worst at "to get it over with." This tanks your confidence and wastes time on hard questions.

## The 2-Minute Rule

If you've been staring at a question for 2 minutes with no progress, **move on immediately.** You can always come back. But the 4 minutes you save could solve 2 easy questions elsewhere.

## Numerical Answer Type (NAT) Questions

These have no negative marking in Mains. **Never leave these blank.** Even a random guess has no downside.

Calculate carefully though — there's no "close enough" with NAT. Double-check your decimal points and units.

## The Last 10 Minutes

Stop solving new questions. Use these 10 minutes to:
1. Review bubbled answers (wrong bubbling = marks lost)
2. Check any questions where you were unsure between 2 options
3. Fill in NAT questions you skipped (free guess, no penalty)

## Practice This Strategy

The only way to internalize time management is to practice it under exam conditions:
- Take [full-length mock tests](/mock-test) with a real timer
- After each mock, analyze your time: how long did each question take?
- Identify your "time sinks" — questions where you spent 5+ minutes

The goal isn't to finish all questions. The goal is to maximize marks in 180 minutes. Sometimes that means strategically leaving 10 questions blank.

---

*Practice the 3-pass strategy with our [timed mock tests](/mock-test). The timer is real — no pausing allowed.*`,
  },
  {
    slug: "active-recall-vs-rereading",
    title: "Active Recall vs Re-reading: Why Your Revision Isn't Working",
    description: "Re-reading notes feels productive but retains almost nothing. Here's the science of active recall and how to switch your entire revision to it in a week.",
    category: "Study Tips",
    date: "2026-07-10",
    readTime: 7,
    tags: ["Study Tips", "Active Recall", "Revision", "Memory"],
    heroGif: TOPIC_GIFS.brain,
    heroGradient: CATEGORY_GRADIENTS["Study Tips"].gradient,
    heroEmoji: "🧠",
    content: `!gif[brain]

## The Illusion of Fluency

You read a chapter for the third time. It feels familiar. Your brain interprets that familiarity as knowledge. Then the exam asks you to *produce* the concept from scratch — and it's gone.

Psychologists call this the **illusion of fluency**: recognition feels like recall, but they are completely different memory processes. Recognition is a multiple-choice skill. Recall is what JEE and NEET actually demand in numericals and assertion-reason questions.

## What the Research Says

In a landmark study (Karpicke & Roediger, 2008), students who tested themselves retained **~80%** of material after a week. Students who re-read the same material four times retained **~36%**. Same time invested, double the retention.

## How to Switch to Active Recall

**1. Close-book summaries.** After every chapter, close the book and write everything you remember. Then open it and fill the gaps in a different colour — those gaps are your actual syllabus.

**2. Question-first revision.** Never "revise Thermodynamics." Instead: attempt 15 Thermodynamics questions. Wherever you get stuck, *that's* what you revise.

**3. Flashcards with a twist.** Don't just make definition cards. Make "why" cards: *Why does entropy increase in free expansion?* Explaining beats defining.

**4. The blank-page test.** Before a mock, take a blank page and reconstruct the formula sheet from memory. This single habit covers more revision than 3 hours of note-reading.

## The First Week Feels Worse — That's the Point

Active recall feels harder because it *is* harder. That difficulty is literally the signal that memory is being strengthened (psychologists call it "desirable difficulty"). Re-reading feels smooth because nothing is happening.

---

*Turn any chapter into recall practice with our [flashcards](/flashcards) and [question bank](/question-bank) — both free.*`,
  },
  {
    slug: "jee-2027-preparation-timeline-class-11",
    title: "Starting JEE Prep in Class 11? Here's Your 2-Year Timeline",
    description: "A month-by-month roadmap for Class 11 students starting JEE preparation: what to cover when, when to start mocks, and the mistakes that cost aspirants their first year.",
    category: "JEE",
    date: "2026-07-15",
    readTime: 9,
    tags: ["JEE", "Class 11", "Timeline", "Planning"],
    heroGif: TOPIC_GIFS.strategy,
    heroGradient: CATEGORY_GRADIENTS.JEE.gradient,
    heroEmoji: "🗓️",
    content: `!gif[strategy]

## The Two-Year Advantage (If You Don't Waste It)

Most students who start JEE prep in Class 11 lose their advantage in the first six months — not from laziness, but from the wrong sequence. Here's the timeline that works.

## Class 11: Months 1–6 (June–November)

**Goal: NCERT-level mastery of Class 11 topics, in sync with school.**

- Physics: Units & Measurement → Kinematics → Laws of Motion → Work-Energy-Power
- Chemistry: Mole Concept (do this until it's reflexive), Atomic Structure, Bonding
- Maths: Sets, Quadratics, Sequences & Series, Trigonometry

**The mistake to avoid:** jumping to advanced problem books before NCERT is solid. Advanced problems on a weak foundation teach you tricks, not concepts.

## Class 11: Months 7–12 (December–May)

**Goal: finish the Class 11 syllabus + first exposure to JEE-level problems.**

- Start one standard problem book per subject — not three.
- Take your **first mock in February**, syllabus-limited. The score doesn't matter; the experience of 3 timed hours does.
- Before summer break: complete Rotational Motion and Equilibrium (Chemistry) — these are the two most common "carry-forward" backlogs.

## Class 12: Months 13–18 (June–November)

**Goal: Class 12 syllabus at full speed + weekly revision cycles for Class 11.**

- Class 12 topics carry more JEE weightage (Calculus, Electrodynamics, Organic Chemistry). Don't sacrifice them to revise Class 11 endlessly.
- One full syllabus-so-far mock **every two weeks**.
- Maintain an error notebook. Every mock mistake gets one line: topic, mistake type, fix.

## Class 12: Months 19–24 (December–May)

**Goal: mocks, analysis, and targeted patching.**

- January onwards: **two full mocks a week**, each followed by a 2-hour analysis session. The analysis is where the marks come from — an unanalysed mock is wasted.
- Revise only from your error notebook and formula sheets. No new books. No new topics after February.
- Sleep 7 hours. A rested brain outperforms a crammed one in every study on exam performance.

## The Only Three Metrics That Matter

1. **Syllabus coverage** — are you on pace with the timeline above?
2. **Mock score trend** — direction matters more than absolute score until March.
3. **Repeat-mistake rate** — if the same mistake appears in three mocks, your analysis process is broken, not your knowledge.

---

*Check where you stand right now with our free [2-minute JEE diagnostic](/diagnostic), then track your mock trend on [My Progress](/my-progress).*`,
  },
  {
    slug: "how-to-analyse-mock-tests",
    title: "You're Taking Mocks Wrong: The 2-Hour Analysis Method",
    description: "A mock test without analysis is just 3 hours of stress. This is the exact post-mock routine toppers use to convert every test into a rank boost.",
    category: "Strategy",
    date: "2026-07-18",
    readTime: 6,
    tags: ["Strategy", "Mock Tests", "Analysis", "JEE", "NEET"],
    heroGif: TOPIC_GIFS.exam,
    heroGradient: CATEGORY_GRADIENTS.Strategy.gradient,
    heroEmoji: "🔍",
    content: `!gif[exam]

## The Rule: Analysis Time ≥ ⅔ of Test Time

A 3-hour mock deserves a 2-hour analysis. If you're taking mocks daily and "checking your score," you're building stamina but not rank. Here's the routine.

## Step 1: Sort Every Question into Four Buckets (30 min)

Go question by question and label each one:

- **✅ Right & sure** — skip these, they're done.
- **🍀 Right but guessed** — treat as wrong. You got lucky; the concept is missing.
- **❌ Wrong: silly mistake** — calculation slip, misread question, sign error.
- **🕳️ Wrong: concept gap** — you genuinely didn't know how to approach it.

## Step 2: Attack the Silly Mistakes (30 min)

Silly mistakes aren't random — they cluster. Track them across mocks and you'll find *your* pattern: maybe you drop negative signs under time pressure, or misread "incorrect" as "correct" in statement questions.

**Fix:** for each pattern, write a personal checklist rule ("circle the word NOT/INCORRECT in every question"). Apply it in the next mock. One pattern eliminated = 8–12 marks recovered.

## Step 3: Patch One Concept Gap Fully (45 min)

Don't try to patch every gap from one mock. Pick the **highest-weightage** gap, go back to theory, then solve 10 fresh problems on exactly that concept. One gap fully closed beats five gaps half-closed.

## Step 4: Log It (15 min)

One line per mistake in your error notebook: *topic → what happened → the rule that prevents it.* Before your next mock, read the notebook. That 10-minute read is the highest-ROI revision that exists.

## The Compounding Effect

Do this for 20 mocks and you've eliminated ~15 personal error patterns and closed 20 concept gaps. That's typically a **40–60 mark** improvement — without learning a single new chapter.

---

*Our [mock tests](/mock-test) auto-sort your answers into these buckets and track your repeat mistakes on [My Progress](/my-progress).*`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getPostsByCategory(category: BlogPost["category"] | "all"): BlogPost[] {
  if (category === "all") return BLOG_POSTS;
  return BLOG_POSTS.filter((p) => p.category === category);
}
