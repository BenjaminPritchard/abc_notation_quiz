/**
 * Core ABC Notation Domain Models, Parser, Audio Synthesizer, and Diagnostic Engine
 * Standard ABC v2.1 Specification with L:1/8 (Eighth note default unit length)
 */

export type PitchLetter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type AccidentalType = 'none' | 'sharp' | 'flat' | 'natural';
export type DurationCode = '/2' | '' | '2' | '3' | '4';
export type FocusMode = 'all' | 'octaves' | 'accidentals' | 'durations';

export interface ABCNote {
  letter: PitchLetter;
  octave: 2 | 3 | 4 | 5 | 6;
  accidental: AccidentalType;
  duration: DurationCode;
}

export interface DiagnosticFinding {
  category: 'octave' | 'accidental' | 'duration' | 'pitch';
  status: 'correct' | 'wrong';
  targetToken: string;
  selectedToken: string;
  title: string;
  explanation: string;
  ruleReminder: string;
}

export interface QuizQuestion {
  id: string;
  target: ABCNote;
  targetABC: string;
  choices: {
    abc: string;
    note: ABCNote;
    distractorReason?: string;
  }[];
}

const LETTER_SEMITONES: Record<PitchLetter, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const DIATONIC_INDEX: Record<PitchLetter, number> = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
};

export const DURATION_INFO: Record<
  DurationCode,
  {
    name: string;
    beatsIn44: string;
    abcSuffix: string;
    description: string;
    seconds: number;
  }
> = {
  '/2': {
    name: 'Sixteenth Note',
    beatsIn44: '1/4 beat',
    abcSuffix: '/2',
    description: 'Half of the default eighth note unit (L:1/8), written with "/2" or "/".',
    seconds: 0.22,
  },
  '': {
    name: 'Eighth Note',
    beatsIn44: '1/2 beat',
    abcSuffix: '(none)',
    description: 'The standard unit length (L:1/8) requires no number after the note.',
    seconds: 0.4,
  },
  '2': {
    name: 'Quarter Note',
    beatsIn44: '1 beat',
    abcSuffix: '2',
    description: '2× the eighth-note unit length (L:1/8), written by appending "2".',
    seconds: 0.75,
  },
  '3': {
    name: 'Dotted Quarter Note',
    beatsIn44: '1½ beats',
    abcSuffix: '3',
    description: '3× the eighth-note unit length (L:1/8), written by appending "3".',
    seconds: 1.05,
  },
  '4': {
    name: 'Half Note',
    beatsIn44: '2 beats',
    abcSuffix: '4',
    description: '4× the eighth-note unit length (L:1/8), written by appending "4".',
    seconds: 1.4,
  },
};

export const ACCIDENTAL_INFO: Record<
  AccidentalType,
  {
    symbol: string;
    abcPrefix: string;
    name: string;
    rule: string;
  }
> = {
  none: {
    symbol: '',
    abcPrefix: '(none)',
    name: 'Unaltered (Diatonic)',
    rule: 'No prefix is placed before the pitch letter when there is no accidental sign on the staff.',
  },
  sharp: {
    symbol: '♯',
    abcPrefix: '^',
    name: 'Sharp',
    rule: 'A caret (^) BEFORE the note letter raises the pitch by a half-step (e.g., ^F or ^c).',
  },
  flat: {
    symbol: '♭',
    abcPrefix: '_',
    name: 'Flat',
    rule: 'An underscore (_) BEFORE the note letter lowers the pitch by a half-step (e.g., _B or _e).',
  },
  natural: {
    symbol: '♮',
    abcPrefix: '=',
    name: 'Natural',
    rule: 'An equals sign (=) BEFORE the note letter explicitly cancels a sharp or flat (e.g., =F or =c).',
  },
};

export const OCTAVE_INFO: Record<
  2 | 3 | 4 | 5 | 6,
  {
    name: string;
    abcSyntax: string;
    exampleRange: string;
    staffRegion: string;
    rule: string;
  }
> = {
  2: {
    name: 'Octave 2 (Great Octave)',
    abcSyntax: 'Uppercase + ,, (two commas)',
    exampleRange: 'C,, D,, E,, ... B,,',
    staffRegion: 'Bottom of Bass Clef (two octaves below Middle C)',
    rule: 'Start with uppercase (Octave 4) and add TWO commas (,,) to drop down two octaves.',
  },
  3: {
    name: 'Octave 3 (Small Octave)',
    abcSyntax: 'Uppercase + , (one comma)',
    exampleRange: 'C, D, E, ... B,',
    staffRegion: 'Upper Bass Clef / Low Treble Ledger Lines (one octave below Middle C)',
    rule: 'Start with uppercase (Octave 4) and add ONE comma (,) to drop down one octave.',
  },
  4: {
    name: 'Octave 4 (Middle C Octave)',
    abcSyntax: 'Uppercase letter only',
    exampleRange: 'C D E F G A B',
    staffRegion: 'Middle C (C4) up to the middle line B4 of Treble Clef',
    rule: 'Notes from Middle C (C4) up to B4 are written as plain UPPERCASE letters (C through B) with no commas or apostrophes.',
  },
  5: {
    name: 'Octave 5 (Treble Upper Octave)',
    abcSyntax: 'Lowercase letter only',
    exampleRange: 'c d e f g a b',
    staffRegion: 'Third space C5 (Treble Clef) up to B5 just above the top line',
    rule: 'Notes one octave above Middle C (C5 to B5) switch to plain LOWERCASE letters (c through b) — no apostrophe yet!',
  },
  6: {
    name: 'Octave 6 (High Ledger Octave)',
    abcSyntax: "Lowercase + ' (one apostrophe)",
    exampleRange: "c' d' e' f' g' a'",
    staffRegion: 'High C (C6, two ledger lines above Treble Clef) and above',
    rule: "Start with a lowercase letter (Octave 5) and add an apostrophe (') to raise it one octave higher into Octave 6.",
  },
};

/**
 * Formats an ABCNote into its canonical ABC notation string
 */
export function formatABC(note: ABCNote): string {
  const accPrefix =
    note.accidental === 'sharp'
      ? '^'
      : note.accidental === 'flat'
      ? '_'
      : note.accidental === 'natural'
      ? '='
      : '';

  let pitchCore = '';
  if (note.octave === 2) {
    pitchCore = `${note.letter},,`;
  } else if (note.octave === 3) {
    pitchCore = `${note.letter},`;
  } else if (note.octave === 4) {
    pitchCore = note.letter.toUpperCase();
  } else if (note.octave === 5) {
    pitchCore = note.letter.toLowerCase();
  } else if (note.octave === 6) {
    pitchCore = `${note.letter.toLowerCase()}'`;
  }

  return `${accPrefix}${pitchCore}${note.duration}`;
}

/**
 * Splits an ABC string into its syntactic tokens for color-coded display:
 * [accidentalPrefix, letterAndOctave, durationSuffix]
 */
export function tokenizeABC(abc: string): {
  accidental: string;
  pitchOctave: string;
  duration: string;
} {
  const match = abc.match(/^([\^_=]?)([A-Ga-g][,']*)(\/2|[234]?)$/);
  if (!match) {
    return { accidental: '', pitchOctave: abc, duration: '' };
  }
  return {
    accidental: match[1] || '',
    pitchOctave: match[2] || '',
    duration: match[3] || '',
  };
}

/**
 * Computes the diatonic step distance from Middle C (C4 = 0).
 * C4 = 0, D4 = 1, E4 = 2, ... B4 = 6, C5 = 7, B3 = -1, C3 = -7, etc.
 */
export function getDiatonicStepFromC4(note: ABCNote): number {
  return (note.octave - 4) * 7 + DIATONIC_INDEX[note.letter];
}

/**
 * Computes human-readable scientific pitch name (e.g., "F♯4", "B♭3", "C♮5", "G5")
 */
export function getScientificPitchName(note: ABCNote): string {
  const sym = ACCIDENTAL_INFO[note.accidental].symbol;
  return `${note.letter}${sym}${note.octave}`;
}

/**
 * Computes frequency in Hz for Web Audio playback (A4 = 440 Hz)
 */
export function getNoteFrequency(note: ABCNote): number {
  let semitonesFromC4 = (note.octave - 4) * 12 + LETTER_SEMITONES[note.letter];
  if (note.accidental === 'sharp') semitonesFromC4 += 1;
  if (note.accidental === 'flat') semitonesFromC4 -= 1;
  const midiNote = 60 + semitonesFromC4;
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

/**
 * Web Audio API synthesizer to play any ABCNote with a warm piano/marimba-like envelope
 */
let sharedAudioCtx: AudioContext | null = null;

export function playABCNoteAudio(note: ABCNote): void {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }

    const now = sharedAudioCtx.currentTime;
    const freq = getNoteFrequency(note);
    const dur = DURATION_INFO[note.duration].seconds;

    // Fundamental + soft harmonic overtone for warm acoustic tone
    const osc1 = sharedAudioCtx.createOscillator();
    const osc2 = sharedAudioCtx.createOscillator();
    const gainNode = sharedAudioCtx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);

    const osc2Gain = sharedAudioCtx.createGain();
    osc2Gain.gain.setValueAtTime(0.18, now);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.32, now + 0.025);
    gainNode.gain.exponentialRampToValueAtTime(0.14, now + dur * 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.0008, now + dur + 0.08);

    osc1.connect(gainNode);
    osc2.connect(osc2Gain);
    osc2Gain.connect(gainNode);
    gainNode.connect(sharedAudioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur + 0.1);
    osc2.stop(now + dur + 0.1);
  } catch {
    // Ignore audio errors if blocked by browser autoplay policy
  }
}

/**
 * Detailed Diagnostic Engine:
 * Compares the user's selected ABCNote against the target ABCNote and explains
 * every difference in plain, constructive musical and ABC syntax terms.
 */
export function diagnoseMistake(target: ABCNote, selected: ABCNote): DiagnosticFinding[] {
  const findings: DiagnosticFinding[] = [];
  const targetTokens = tokenizeABC(formatABC(target));
  const selectedTokens = tokenizeABC(formatABC(selected));

  // 1. Check Pitch Letter
  if (target.letter !== selected.letter) {
    findings.push({
      category: 'pitch',
      status: 'wrong',
      targetToken: target.letter,
      selectedToken: selected.letter,
      title: `Base Note Letter: Expected "${target.letter}", You Picked "${selected.letter}"`,
      explanation: `The note on the staff sits on the ${target.letter}${target.octave} position, but your choice uses the letter "${selected.letter}".`,
      ruleReminder: 'Count lines (E-G-B-D-F in treble) and spaces (F-A-C-E in treble) carefully from Middle C (C4).',
    });
  } else {
    findings.push({
      category: 'pitch',
      status: 'correct',
      targetToken: target.letter,
      selectedToken: selected.letter,
      title: `Base Note Letter "${target.letter}" is Correct`,
      explanation: `You correctly identified the note letter as ${target.letter}.`,
      ruleReminder: '',
    });
  }

  // 2. Check Octave (The most common point of confusion in ABC!)
  if (target.octave !== selected.octave) {
    let specificAdvice = '';
    if (target.octave === 4 && selected.octave === 5) {
      specificAdvice = `Because ${target.letter}4 is in the Middle C octave (C4–B4), it uses an UPPERCASE "${target.letter}", not lowercase "${selected.letter.toLowerCase()}". Lowercase is reserved for Octave 5 (starting at C5, third space in Treble Clef).`;
    } else if (target.octave === 5 && selected.octave === 4) {
      specificAdvice = `Because ${target.letter}5 is in the octave above Middle C (C5–B5), it requires a LOWERCASE "${target.letter.toLowerCase()}", not uppercase "${selected.letter.toUpperCase()}".`;
    } else if (target.octave === 5 && selected.octave === 6) {
      specificAdvice = `A plain lowercase "${target.letter.toLowerCase()}" ALREADY places the note in Octave 5 (the octave above Middle C). Adding an apostrophe (${selectedTokens.pitchOctave}) pushes it an extra octave too high into Octave 6!`;
    } else if (target.octave === 6 && selected.octave === 5) {
      specificAdvice = `High ${target.letter}6 sits two octaves above Middle C. Plain lowercase "${selected.letter.toLowerCase()}" only reaches Octave 5 — you need an apostrophe ("${target.letter.toLowerCase()}'") to reach Octave 6.`;
    } else if (target.octave === 3 && selected.octave === 4) {
      specificAdvice = `${target.letter}3 is BELOW Middle C (Octave 3). Plain uppercase "${selected.letter}" is in Octave 4 — you must add a comma ("${target.letter},") to drop it down one octave.`;
    } else if (target.octave === 4 && selected.octave === 3) {
      specificAdvice = `${target.letter}4 is at or above Middle C (Octave 4), so it uses plain uppercase "${target.letter}" WITHOUT a comma. Adding a comma ("${selectedTokens.pitchOctave}") drops it down into Octave 3.`;
    } else if (target.octave === 2 && selected.octave === 3) {
      specificAdvice = `${target.letter}2 is two octaves below Middle C (Octave 2), so it requires TWO commas ("${target.letter},,"), whereas "${selectedTokens.pitchOctave}" only drops one octave.`;
    } else {
      specificAdvice = `Target is in ${OCTAVE_INFO[target.octave].name} (${OCTAVE_INFO[target.octave].abcSyntax}), whereas "${selectedTokens.pitchOctave}" represents ${OCTAVE_INFO[selected.octave].name}.`;
    }

    findings.push({
      category: 'octave',
      status: 'wrong',
      targetToken: targetTokens.pitchOctave,
      selectedToken: selectedTokens.pitchOctave,
      title: `Octave Mismatch: Expected "${targetTokens.pitchOctave}" (Octave ${target.octave}), You Picked "${selectedTokens.pitchOctave}" (Octave ${selected.octave})`,
      explanation: specificAdvice,
      ruleReminder: `ABC Octave Ladder: C,, (Oct 2) → C, (Oct 3) → C (Oct 4, Middle C) → c (Oct 5) → c' (Oct 6).`,
    });
  } else {
    findings.push({
      category: 'octave',
      status: 'correct',
      targetToken: targetTokens.pitchOctave,
      selectedToken: selectedTokens.pitchOctave,
      title: `Octave Syntax "${targetTokens.pitchOctave}" (Octave ${target.octave}) is Correct`,
      explanation: `Your octave casing and modifier match Octave ${target.octave}.`,
      ruleReminder: '',
    });
  }

  // 3. Check Accidental
  if (target.accidental !== selected.accidental) {
    const targetAcc = ACCIDENTAL_INFO[target.accidental];
    const selectedAcc = ACCIDENTAL_INFO[selected.accidental];

    let accExplanation = '';
    if (target.accidental === 'none') {
      accExplanation = `The note on the staff has NO accidental symbol in front of it, so no prefix should be used. Your choice included "${selectedTokens.accidental}" (${selectedAcc.name}).`;
    } else if (selected.accidental === 'none') {
      accExplanation = `The staff shows a ${targetAcc.name} (${targetAcc.symbol}) before the note, which requires the "${targetAcc.abcPrefix}" prefix BEFORE the letter in ABC notation. Your choice omitted the accidental prefix.`;
    } else {
      accExplanation = `The staff shows a ${targetAcc.name} (${targetAcc.symbol}), which is written with "${targetAcc.abcPrefix}" in ABC. You selected "${selectedTokens.accidental}", which means ${selectedAcc.name} (${selectedAcc.symbol}).`;
    }

    findings.push({
      category: 'accidental',
      status: 'wrong',
      targetToken: targetTokens.accidental || '(no prefix)',
      selectedToken: selectedTokens.accidental || '(no prefix)',
      title: `Accidental Prefix: Expected "${targetTokens.accidental || 'none'}" (${targetAcc.name}), You Picked "${selectedTokens.accidental || 'none'}" (${selectedAcc.name})`,
      explanation: accExplanation,
      ruleReminder: 'ABC Accidentals always go BEFORE the note letter: ^ = Sharp (♯), _ = Flat (♭), = = Natural (♮).',
    });
  } else {
    findings.push({
      category: 'accidental',
      status: 'correct',
      targetToken: targetTokens.accidental || '(none)',
      selectedToken: selectedTokens.accidental || '(none)',
      title: `Accidental (${ACCIDENTAL_INFO[target.accidental].name}) is Correct`,
      explanation: `You matched the accidental correctly.`,
      ruleReminder: '',
    });
  }

  // 4. Check Duration
  if (target.duration !== selected.duration) {
    const targetDur = DURATION_INFO[target.duration];
    const selectedDur = DURATION_INFO[selected.duration];

    findings.push({
      category: 'duration',
      status: 'wrong',
      targetToken: target.duration || '(no number)',
      selectedToken: selected.duration || '(no number)',
      title: `Note Duration: Expected "${target.duration || 'none'}" (${targetDur.name}), You Picked "${selected.duration || 'none'}" (${selectedDur.name})`,
      explanation: `On the staff, the note is a ${targetDur.name} (${targetDur.beatsIn44}). With standard ABC unit length L:1/8 (where an eighth note = 1 unit), a ${targetDur.name} requires "${targetDur.abcSuffix}" after the pitch, whereas "${selectedDur.abcSuffix}" produces a ${selectedDur.name} (${selectedDur.beatsIn44}).`,
      ruleReminder: 'With L:1/8 (Eighth-Note Base): /2 = Sixteenth (2 flags) · no number = Eighth (1 flag) · 2 = Quarter (filled head) · 3 = Dotted Quarter · 4 = Half (open head + stem).',
    });
  } else {
    findings.push({
      category: 'duration',
      status: 'correct',
      targetToken: target.duration || '(none)',
      selectedToken: selected.duration || '(none)',
      title: `Duration (${DURATION_INFO[target.duration].name}) is Correct`,
      explanation: `You matched the rhythmic length correctly.`,
      ruleReminder: '',
    });
  }

  // Sort findings so wrong items come first
  return findings.sort((a, b) => (a.status === 'wrong' ? -1 : 1) - (b.status === 'wrong' ? -1 : 1));
}

/**
 * Generates a realistic, pedagogical quiz question tailored to the active FocusMode.
 * Distractors are crafted to test real ABC pitfalls (e.g., C vs c vs c', ^ vs _ vs =, quarter vs eighth).
 */
const LETTERS: PitchLetter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateQuizQuestion(mode: FocusMode, previousTargetABC?: string): QuizQuestion {
  let target: ABCNote;
  let attempts = 0;

  do {
    attempts++;
    const letter = randomItem(LETTERS);

    // Choose octave based on mode
    let octave: 2 | 3 | 4 | 5 | 6;
    if (mode === 'octaves') {
      octave = randomItem([2, 3, 4, 4, 5, 5, 6]);
    } else if (mode === 'accidentals' || mode === 'durations') {
      // Keep octave mostly in comfortable Treble/Middle-C range (3, 4, 5) so focus stays sharp, with occasional 6
      octave = randomItem([3, 4, 4, 5, 5, 6]);
    } else {
      octave = randomItem([2, 3, 4, 4, 5, 5, 6]);
    }

    // Restrict extreme high notes in octave 6 to C6-G6 so ledger lines remain clean and readable
    const adjustedLetter: PitchLetter =
      octave === 6 && (letter === 'A' || letter === 'B')
        ? randomItem(['C', 'D', 'E', 'F', 'G'])
        : octave === 2 && (letter === 'C' || letter === 'D')
        ? randomItem(['E', 'F', 'G', 'A', 'B'])
        : letter;

    // Choose accidental based on mode
    let accidental: AccidentalType;
    if (mode === 'octaves') {
      accidental = randomItem(['none', 'none', 'sharp', 'flat']);
    } else if (mode === 'accidentals') {
      accidental = randomItem(['sharp', 'flat', 'natural', 'sharp', 'flat', 'natural', 'none']);
    } else if (mode === 'durations') {
      accidental = randomItem(['none', 'none', 'sharp', 'flat']);
    } else {
      accidental = randomItem(['none', 'sharp', 'flat', 'natural']);
    }

    // Choose duration based on mode
    let duration: DurationCode;
    if (mode === 'octaves') {
      duration = randomItem(['', '2', '4']);
    } else if (mode === 'accidentals') {
      duration = randomItem(['', '2', '4']);
    } else if (mode === 'durations') {
      duration = randomItem(['/2', '', '2', '3', '4']);
    } else {
      duration = randomItem(['/2', '', '2', '3', '4']);
    }

    target = {
      letter: adjustedLetter,
      octave,
      accidental,
      duration,
    };
  } while (formatABC(target) === previousTargetABC && attempts < 10);

  const targetABC = formatABC(target);

  // Build smart distractors that target authentic learner misconceptions
  const candidateNotes: ABCNote[] = [];

  // 1. Octave-casing / modifier distractors (e.g. C vs c, c vs c', C vs C,)
  const adjacentOctaves: (2 | 3 | 4 | 5 | 6)[] = [2, 3, 4, 5, 6].filter(
    (o) => o !== target.octave
  ) as (2 | 3 | 4 | 5 | 6)[];

  // Prioritize the most commonly confused octave pair
  if (target.octave === 4) {
    candidateNotes.push({ ...target, octave: 5 }); // C vs c
    candidateNotes.push({ ...target, octave: 3 }); // C vs C,
  } else if (target.octave === 5) {
    candidateNotes.push({ ...target, octave: 4 }); // c vs C
    candidateNotes.push({ ...target, octave: 6 }); // c vs c'
  } else if (target.octave === 6) {
    candidateNotes.push({ ...target, octave: 5 }); // c' vs c
    candidateNotes.push({ ...target, octave: 4 }); // c' vs C
  } else if (target.octave === 3) {
    candidateNotes.push({ ...target, octave: 4 }); // C, vs C
    candidateNotes.push({ ...target, octave: 2 }); // C, vs C,,
  } else if (target.octave === 2) {
    candidateNotes.push({ ...target, octave: 3 }); // C,, vs C,
    candidateNotes.push({ ...target, octave: 4 }); // C,, vs C
  }

  // 2. Accidental distractors
  const otherAccidentals: AccidentalType[] = (['none', 'sharp', 'flat', 'natural'] as AccidentalType[]).filter(
    (a) => a !== target.accidental
  );
  for (const acc of otherAccidentals) {
    candidateNotes.push({ ...target, accidental: acc });
  }

  // 3. Duration distractors
  const otherDurations: DurationCode[] = (['/2', '', '2', '3', '4'] as DurationCode[]).filter(
    (d) => d !== target.duration
  );
  for (const dur of otherDurations) {
    candidateNotes.push({ ...target, duration: dur });
  }

  // 4. Combined octave + accidental or octave + duration distractors
  if (adjacentOctaves.length > 0 && otherAccidentals.length > 0) {
    candidateNotes.push({
      ...target,
      octave: adjacentOctaves[0],
      accidental: randomItem(otherAccidentals),
    });
  }
  if (adjacentOctaves.length > 0 && otherDurations.length > 0) {
    candidateNotes.push({
      ...target,
      octave: adjacentOctaves[0],
      duration: randomItem(otherDurations),
    });
  }

  // Filter unique ABC strings and prioritize based on mode
  const seenABCs = new Set<string>([targetABC]);
  const uniqueDistractors: ABCNote[] = [];

  // Reorder candidates depending on mode so the quiz emphasizes the user's chosen skill
  const prioritizedCandidates = [...candidateNotes].sort((a, b) => {
    const score = (n: ABCNote) => {
      if (mode === 'octaves' && n.octave !== target.octave && n.accidental === target.accidental) return 0;
      if (mode === 'accidentals' && n.accidental !== target.accidental && n.octave === target.octave) return 0;
      if (mode === 'durations' && n.duration !== target.duration && n.octave === target.octave) return 0;
      return 1;
    };
    return score(a) - score(b) + (Math.random() * 0.4 - 0.2);
  });

  for (const cand of prioritizedCandidates) {
    const abc = formatABC(cand);
    if (!seenABCs.has(abc)) {
      seenABCs.add(abc);
      uniqueDistractors.push(cand);
    }
    if (uniqueDistractors.length >= 3) break;
  }

  const allChoices = [
    { abc: targetABC, note: target },
    ...uniqueDistractors.map((n) => ({ abc: formatABC(n), note: n })),
  ];

  // Shuffle choices
  for (let i = allChoices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allChoices[i], allChoices[j]] = [allChoices[j], allChoices[i]];
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    target,
    targetABC,
    choices: allChoices,
  };
}
