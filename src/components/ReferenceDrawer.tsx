import React from 'react';
import {
  ABCNote,
  ACCIDENTAL_INFO,
  DURATION_INFO,
  OCTAVE_INFO,
  playABCNoteAudio,
} from '../abcNotation';
import { Volume2 } from 'lucide-react';

interface ReferenceDrawerProps {
  onLoadNoteToPractice?: (note: ABCNote) => void;
}

export const ReferenceDrawer: React.FC<ReferenceDrawerProps> = ({ onLoadNoteToPractice }) => {
  const octaveExamples: {
    octave: 2 | 3 | 4 | 5 | 6;
    sampleNote: ABCNote;
    abc: string;
    scientific: string;
    colorClass: string;
  }[] = [
    {
      octave: 2,
      sampleNote: { letter: 'G', octave: 2, accidental: 'none', duration: '2' },
      abc: 'C,, – B,,',
      scientific: 'C2 – B2',
      colorClass: 'border-rose-300 bg-rose-50/40 text-rose-900',
    },
    {
      octave: 3,
      sampleNote: { letter: 'C', octave: 3, accidental: 'none', duration: '2' },
      abc: 'C, – B,',
      scientific: 'C3 – B3',
      colorClass: 'border-amber-300 bg-amber-50/40 text-amber-900',
    },
    {
      octave: 4,
      sampleNote: { letter: 'C', octave: 4, accidental: 'none', duration: '2' },
      abc: 'C – B',
      scientific: 'C4 (Middle C) – B4',
      colorClass: 'border-emerald-300 bg-emerald-50/40 text-emerald-900',
    },
    {
      octave: 5,
      sampleNote: { letter: 'C', octave: 5, accidental: 'none', duration: '2' },
      abc: 'c – b',
      scientific: 'C5 – B5',
      colorClass: 'border-sky-300 bg-sky-50/40 text-sky-900',
    },
    {
      octave: 6,
      sampleNote: { letter: 'C', octave: 6, accidental: 'none', duration: '2' },
      abc: "c' – b'",
      scientific: 'C6 – B6',
      colorClass: 'border-violet-300 bg-violet-50/40 text-violet-900',
    },
  ];

  const accidentalExamples: {
    type: 'sharp' | 'flat' | 'natural' | 'none';
    exampleABC: string;
    sampleNote: ABCNote;
  }[] = [
    {
      type: 'sharp',
      exampleABC: '^F or ^c',
      sampleNote: { letter: 'F', octave: 4, accidental: 'sharp', duration: '2' },
    },
    {
      type: 'flat',
      exampleABC: '_B or _e',
      sampleNote: { letter: 'B', octave: 4, accidental: 'flat', duration: '2' },
    },
    {
      type: 'natural',
      exampleABC: '=F or =c',
      sampleNote: { letter: 'C', octave: 5, accidental: 'natural', duration: '2' },
    },
    {
      type: 'none',
      exampleABC: 'F or c',
      sampleNote: { letter: 'G', octave: 4, accidental: 'none', duration: '2' },
    },
  ];

  const durationExamples: {
    code: '/2' | '' | '2' | '3' | '4';
    exampleABC: string;
    visualCue: string;
    sampleNote: ABCNote;
  }[] = [
    {
      code: '/2',
      exampleABC: 'C/2',
      visualCue: 'Filled head + stem + 2 flags',
      sampleNote: { letter: 'C', octave: 5, accidental: 'none', duration: '/2' },
    },
    {
      code: '',
      exampleABC: 'C',
      visualCue: 'Filled head + stem + 1 flag',
      sampleNote: { letter: 'C', octave: 5, accidental: 'none', duration: '' },
    },
    {
      code: '2',
      exampleABC: 'C2',
      visualCue: 'Filled head + stem (no flags)',
      sampleNote: { letter: 'C', octave: 5, accidental: 'none', duration: '2' },
    },
    {
      code: '3',
      exampleABC: 'C3',
      visualCue: 'Filled head + dot + stem',
      sampleNote: { letter: 'C', octave: 5, accidental: 'none', duration: '3' },
    },
    {
      code: '4',
      exampleABC: 'C4',
      visualCue: 'Hollow open head + stem',
      sampleNote: { letter: 'C', octave: 5, accidental: 'none', duration: '4' },
    },
  ];

  return (
    <section
      id="reference-guide"
      className="bg-white border border-slate-200 rounded-xl p-6 space-y-8"
    >
      <div className="border-b border-slate-200 pb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 font-display">
            ABC Notation Syntax Reference
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Every ABC note follows a strict 3-part order:{' '}
            <code className="font-mono font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
              [Accidental]
            </code>{' '}
            +{' '}
            <code className="font-mono font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded">
              [Pitch &amp; Octave]
            </code>{' '}
            +{' '}
            <code className="font-mono font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
              [Duration]
            </code>
          </p>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Click any example below to hear it
        </span>
      </div>

      {/* 1. The Octave Ladder (Most Important) */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900 font-sans">
            01. Octave Modifiers: Uppercase vs. Lowercase, Commas (<code className="font-mono">,</code>) &amp; Apostrophes (<code className="font-mono">&apos;</code>)
          </h3>
          <span className="text-xs text-slate-500">
            Commas lower the octave · Apostrophes raise the octave
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {octaveExamples.map((item) => {
            const info = OCTAVE_INFO[item.octave];
            return (
              <div
                key={item.octave}
                className={`p-3.5 rounded-lg border ${item.colorClass} flex flex-col justify-between gap-3`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold opacity-80">
                      {item.scientific}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        playABCNoteAudio(item.sampleNote);
                        onLoadNoteToPractice?.(item.sampleNote);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-white/80 hover:bg-white rounded border border-current/20 transition-colors cursor-pointer whitespace-nowrap"
                      title="Hear sample note in this octave"
                    >
                      <Volume2 className="w-3 h-3" />
                      Hear
                    </button>
                  </div>
                  <div className="mt-2 text-lg font-mono font-bold tracking-tight">
                    {item.abc}
                  </div>
                  <div className="mt-1 text-xs font-semibold">
                    {info.abcSyntax}
                  </div>
                </div>
                <p className="text-xs opacity-90 leading-relaxed">
                  {info.staffRegion}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Accidentals & 3. Durations side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Accidentals */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900 font-sans">
            02. Accidentals (Always Written BEFORE the Letter)
          </h3>
          <div className="border border-slate-200 rounded-lg divide-y divide-slate-200">
            {accidentalExamples.map((acc) => {
              const info = ACCIDENTAL_INFO[acc.type];
              return (
                <div
                  key={acc.type}
                  className="p-3 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-sm">
                        {info.abcPrefix}
                      </code>
                      <span className="font-semibold text-slate-900">
                        {info.name} {info.symbol && `(${info.symbol})`}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-xs font-mono text-slate-600">
                        e.g. {acc.exampleABC}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{info.rule}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => playABCNoteAudio(acc.sampleNote)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                    Play
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Durations */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-slate-900 font-sans">
            03. Rhythmic Durations (Written AFTER the Octave, Base <code className="font-mono">L:1/8</code>)
          </h3>
          <div className="border border-slate-200 rounded-lg divide-y divide-slate-200">
            {durationExamples.map((dur) => {
              const info = DURATION_INFO[dur.code];
              return (
                <div
                  key={dur.code}
                  className="p-3 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-sm">
                        {dur.exampleABC}
                      </code>
                      <span className="font-semibold text-slate-900">
                        {info.name}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500 tabular-nums">
                        {info.beatsIn44}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      <strong className="font-medium text-slate-700">Staff look:</strong> {dur.visualCue}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => playABCNoteAudio(dur.sampleNote)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                    Play
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
