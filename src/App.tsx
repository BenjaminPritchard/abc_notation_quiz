import React, { useState, useEffect, useCallback } from 'react';
import {
  ABCNote,
  ACCIDENTAL_INFO,
  DURATION_INFO,
  FocusMode,
  OCTAVE_INFO,
  QuizQuestion,
  formatABC,
  generateQuizQuestion,
  getScientificPitchName,
  playABCNoteAudio,
} from './abcNotation';
import { StaffCanvas } from './components/StaffCanvas';
import { DiagnosticCard, TokenizedABCBadge } from './components/DiagnosticCard';
import { ReferenceDrawer } from './components/ReferenceDrawer';
import {
  Volume2,
  Eye,
  EyeOff,
  Check,
  X,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface MissedItem {
  id: string;
  target: ABCNote;
  selected: ABCNote;
}

export default function App() {
  const [focusMode, setFocusMode] = useState<FocusMode>('all');
  const [question, setQuestion] = useState<QuizQuestion>(() =>
    generateQuizQuestion('all')
  );
  const [selectedChoiceABC, setSelectedChoiceABC] = useState<string | null>(null);
  const [showOctaveGuides, setShowOctaveGuides] = useState<boolean>(true);
  const [showReference, setShowReference] = useState<boolean>(true);

  // Session statistics
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
    streak: 0,
  });
  const [missedLog, setMissedLog] = useState<MissedItem[]>([]);

  const selectedChoiceObj = question.choices.find(
    (c) => c.abc === selectedChoiceABC
  );
  const isAnswered = selectedChoiceABC !== null;
  const isCorrect = selectedChoiceABC === question.targetABC;

  // Start a new question
  const handleNextQuestion = useCallback(
    (overrideMode?: FocusMode) => {
      const activeMode = overrideMode ?? focusMode;
      const nextQ = generateQuizQuestion(activeMode, question.targetABC);
      setQuestion(nextQ);
      setSelectedChoiceABC(null);
    },
    [focusMode, question.targetABC]
  );

  // Handle changing the drill focus mode from the top bar
  const handleSelectMode = (newMode: FocusMode) => {
    setFocusMode(newMode);
    handleNextQuestion(newMode);
  };

  // Handle selecting an answer option
  const handleSelectOption = useCallback(
    (choiceABC: string, choiceNote: ABCNote) => {
      if (isAnswered) {
        // Allow clicking any choice after answering to hear how that choice sounds
        playABCNoteAudio(choiceNote);
        return;
      }

      setSelectedChoiceABC(choiceABC);
      playABCNoteAudio(choiceNote);

      const gotItRight = choiceABC === question.targetABC;
      setStats((prev) => ({
        correct: prev.correct + (gotItRight ? 1 : 0),
        total: prev.total + 1,
        streak: gotItRight ? prev.streak + 1 : 0,
      }));

      if (!gotItRight) {
        setMissedLog((prev) => [
          {
            id: `${Date.now()}`,
            target: question.target,
            selected: choiceNote,
          },
          ...prev.slice(0, 7),
        ]);
      }
    },
    [isAnswered, question.target, question.targetABC]
  );

  // Load a specific note (e.g. from Missed Notes review or Reference guide) into a live quiz question
  const handlePracticeSpecificNote = (note: ABCNote) => {
    const baseQ = generateQuizQuestion(focusMode);
    // Replace target with requested note and regenerate choices around it
    const targetABC = formatABC(note);
    const customDistractors: ABCNote[] = [
      { ...note, octave: note.octave === 4 ? 5 : 4 },
      {
        ...note,
        accidental: note.accidental === 'sharp' ? 'flat' : 'sharp',
      },
      {
        ...note,
        duration: note.duration === '2' ? '' : '2',
      },
    ];
    const choices = [
      { abc: targetABC, note },
      ...customDistractors.map((d) => ({ abc: formatABC(d), note: d })),
    ].sort(() => Math.random() - 0.5);

    setQuestion({
      id: `custom-${Date.now()}`,
      target: note,
      targetABC,
      choices,
    });
    setSelectedChoiceABC(null);
    playABCNoteAudio(note);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard shortcuts: 1-4 to pick option, Space/Enter for Next Note, P to play audio
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (!isAnswered && ['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const choice = question.choices[idx];
        if (choice) {
          e.preventDefault();
          handleSelectOption(choice.abc, choice.note);
        }
      } else if (isAnswered && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleNextQuestion();
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        playABCNoteAudio(question.target);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isAnswered, question, handleSelectOption, handleNextQuestion]);

  const modeLabels: { id: FocusMode; label: string }[] = [
    { id: 'all', label: 'All Skills' },
    { id: 'octaves', label: 'Octaves (, & \')' },
    { id: 'accidentals', label: 'Sharps & Flats (^ _ =)' },
    { id: 'durations', label: 'Durations (L:1/8)' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Title (single text element wordmark) */}
        <a
          href="#top"
          className="text-lg font-semibold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0"
        >
          ABC Sight &amp; Syntax
        </a>

        {/* Zone 2: 4–5 Clean Text Navigation Links for Drill Focus Modes */}
        <nav
          aria-label="Practice Focus Modes"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          {modeLabels.map((m) => {
            const active = focusMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectMode(m.id)}
                className={`py-1 transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
                  active
                    ? 'text-slate-900 font-semibold border-sky-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {m.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setShowReference(true);
              setTimeout(() => {
                document
                  .getElementById('reference-guide')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="py-1 text-slate-600 hover:text-slate-900 border-b-2 border-transparent hover:border-slate-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            Syntax Guide
          </button>
        </nav>

        {/* Zone 3: 1–2 Primary Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowOctaveGuides((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
              showOctaveGuides
                ? 'bg-sky-50 text-sky-900 border-sky-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {showOctaveGuides ? (
              <Eye className="w-3.5 h-3.5 text-sky-600" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            )}
            {showOctaveGuides ? 'Octave Guides: On' : 'Octave Guides: Off'}
          </button>

          <button
            type="button"
            onClick={() => playABCNoteAudio(question.target)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Hear Note
          </button>
        </div>
      </header>

      {/* Main Content Container (1440px Desktop Presence) */}
      <main id="top" className="flex-1 w-full max-w-[1320px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Compact Subheader / Mobile Focus Switcher + Unboxed Session Telemetry */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 font-display tracking-tight">
              Identify the ABC Notation for the Staff Note
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Read the clef, ledger lines, accidental, and note duration — then choose the matching ABC code.
            </p>
          </div>

          {/* Clean Unboxed Session Progress Metadata (Zero-Pill Discipline) */}
          <div className="flex items-center gap-3 text-xs text-slate-600 font-mono tabular-nums">
            <span>
              Score: <strong className="text-slate-900">{stats.correct}/{stats.total}</strong>
              {stats.total > 0 && ` (${Math.round((stats.correct / stats.total) * 100)}%)`}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Streak: <strong className="text-emerald-700">{stats.streak}</strong>
            </span>
            {stats.total > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => {
                    setStats({ correct: 0, total: 0, streak: 0 });
                    setMissedLog([]);
                  }}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 underline underline-offset-2 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Segmented Control for Drill Modes */}
        <div className="flex md:hidden items-center gap-1 p-1 bg-slate-200/70 rounded-lg overflow-x-auto">
          {modeLabels.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleSelectMode(m.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                focusMode === m.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Primary Two-Zone Interactive Stage (65% Left Staff Canvas / 35% Right Choice Deck) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Zone (8 cols): Interactive Grand Staff + Live Mistake Diagnostic Card */}
          <div className="lg:col-span-8 space-y-5">
            <StaffCanvas
              targetNote={question.target}
              comparisonNote={
                isAnswered && !isCorrect && selectedChoiceObj
                  ? selectedChoiceObj.note
                  : null
              }
              showOctaveGuides={showOctaveGuides}
              revealTargetLabel={isAnswered}
            />

            {/* Contextual Mistake Breakdown or Success Confirmation */}
            {isAnswered && selectedChoiceObj ? (
              <DiagnosticCard
                targetNote={question.target}
                selectedNote={selectedChoiceObj.note}
                isCorrect={isCorrect}
                onNextQuestion={() => handleNextQuestion()}
              />
            ) : (
              /* Helpful Pre-Answer Reading Prompt */
              <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold text-slate-900">Reading Checklist:</span>
                  <span>1. Check Accidental (<code className="font-mono text-amber-800">^ _ =</code>)</span>
                  <span aria-hidden="true">·</span>
                  <span>2. Find Octave (<code className="font-mono text-sky-800">C,, C, C c c&apos;</code>)</span>
                  <span aria-hidden="true">·</span>
                  <span>3. Count Duration (<code className="font-mono text-emerald-800">/2, none, 2, 3, 4</code>)</span>
                </div>
                <span className="text-slate-400 font-mono hidden sm:inline">
                  Keys 1–4 to answer · P to hear
                </span>
              </div>
            )}
          </div>

          {/* Right Zone (4 cols): Multiple-Choice Deck & Quick Syntax Decoder */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 font-sans">
                    Select Correct ABC Notation
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isAnswered
                      ? 'Click any choice below to compare its pitch & rhythm.'
                      : 'Choose 1 of the 4 ABC codes below:'}
                  </p>
                </div>
                {isAnswered && (
                  <button
                    type="button"
                    onClick={() => handleNextQuestion()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Next Note
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 4 Choice Buttons */}
              <div className="space-y-3">
                {question.choices.map((choice, index) => {
                  const isThisTarget = choice.abc === question.targetABC;
                  const isThisSelected = choice.abc === selectedChoiceABC;

                  let buttonStyle =
                    'bg-white border-slate-200 hover:border-sky-400 hover:bg-sky-50/20 text-slate-900';
                  let statusIcon = null;
                  let statusLabel = null;

                  if (isAnswered) {
                    if (isThisTarget) {
                      buttonStyle =
                        'bg-emerald-50/70 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500';
                      statusIcon = (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      );
                      statusLabel = (
                        <span className="text-xs font-semibold text-emerald-700 whitespace-nowrap">
                          ✓ Correct Answer
                        </span>
                      );
                    } else if (isThisSelected && !isThisTarget) {
                      buttonStyle =
                        'bg-rose-50/80 border-rose-400 text-rose-950 ring-1 ring-rose-400';
                      statusIcon = (
                        <X className="w-4 h-4 text-rose-600 shrink-0" />
                      );
                      statusLabel = (
                        <span className="text-xs font-semibold text-rose-700 whitespace-nowrap">
                          ✗ Your Pick
                        </span>
                      );
                    } else {
                      buttonStyle =
                        'bg-slate-50/60 border-slate-200 text-slate-500 opacity-75 hover:opacity-100';
                    }
                  }

                  return (
                    <button
                      key={choice.abc}
                      type="button"
                      onClick={() => handleSelectOption(choice.abc, choice.note)}
                      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2 ${buttonStyle}`}
                    >
                      <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-600 flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <TokenizedABCBadge abc={choice.abc} size="lg" />
                        </div>

                        <div className="flex items-center gap-1.5">
                          {statusLabel}
                          {statusIcon}
                        </div>
                      </div>

                      {/* After answering, reveal what each option means so the user learns from all 4 options */}
                      {isAnswered && (
                        <div className="pl-9 pt-1 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                          <span>
                            <strong>{getScientificPitchName(choice.note)}</strong>{' '}
                            ({OCTAVE_INFO[choice.note.octave].name.split(' (')[0]}) ·{' '}
                            {DURATION_INFO[choice.note.duration].name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-slate-500 font-mono">
                            <Volume2 className="w-3 h-3" />
                            Listen
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Compact Octave & Syntax Cheat Card right below choices */}
              <div className="pt-3 border-t border-slate-200 space-y-2.5 text-xs text-slate-600">
                <div className="font-semibold text-slate-800">
                  Quick ABC Decoder:
                </div>
                <div className="grid grid-cols-1 gap-1.5 font-mono text-[11.5px]">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-amber-800 font-semibold">^  _  =</span>
                    <span className="font-sans text-slate-600">Sharp (♯) · Flat (♭) · Natural (♮)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-sky-800 font-semibold">C,, → C, → C</span>
                    <span className="font-sans text-slate-600">Oct 2 → Oct 3 → Oct 4 (Mid C)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-sky-800 font-semibold">C → c → c&apos;</span>
                    <span className="font-sans text-slate-600">Oct 4 → Oct 5 → Oct 6 (High)</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-emerald-800 font-semibold">/2 · (none) · 2 · 4</span>
                    <span className="font-sans text-slate-600">16th · 8th · Quarter · Half</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Missed Notes Review List (Only appears when the user has made at least 1 mistake) */}
            {missedLog.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 font-sans">
                    Recent Mistakes to Review ({missedLog.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Click to retry
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {missedLog.map((item) => {
                    const targetStr = formatABC(item.target);
                    const pickedStr = formatABC(item.selected);
                    return (
                      <div
                        key={item.id}
                        className="py-2.5 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-rose-700 line-through">
                            {pickedStr}
                          </span>
                          <span aria-hidden="true" className="text-slate-400">
                            →
                          </span>
                          <span className="text-emerald-800 font-bold">
                            {targetStr}
                          </span>
                          <span className="font-sans text-slate-500">
                            ({getScientificPitchName(item.target)} · { ACCIDENTAL_INFO[item.target.accidental].symbol || 'diatonic' })
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePracticeSpecificNote(item.target)}
                          className="px-2.5 py-1 text-xs font-medium text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Practice Note
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full Interactive Reference Guide at the Bottom */}
        {showReference && (
          <ReferenceDrawer onLoadNoteToPractice={handlePracticeSpecificNote} />
        )}
      </main>
    </div>
  );
}

