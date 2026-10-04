import React from 'react';
import {
  ABCNote,
  ACCIDENTAL_INFO,
  DURATION_INFO,
  OCTAVE_INFO,
  diagnoseMistake,
  formatABC,
  getScientificPitchName,
  playABCNoteAudio,
  tokenizeABC,
} from '../abcNotation';
import { Volume2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface DiagnosticCardProps {
  targetNote: ABCNote;
  selectedNote: ABCNote;
  isCorrect: boolean;
  onNextQuestion: () => void;
}

/**
 * Renders a color-coded breakdown of an ABC notation string into its 3 syntactic parts:
 * [Accidental Prefix] + [Pitch Letter & Octave Modifiers] + [Duration Multiplier]
 */
export const TokenizedABCBadge: React.FC<{
  abc: string;
  size?: 'md' | 'lg';
}> = ({ abc, size = 'md' }) => {
  const tokens = tokenizeABC(abc);
  const textSize = size === 'lg' ? 'text-xl' : 'text-base';

  return (
    <span className={`inline-flex items-baseline font-mono font-semibold tracking-tight ${textSize}`}>
      {tokens.accidental && (
        <span
          className="text-amber-700 bg-amber-50 border-b-2 border-amber-400 px-1 rounded-t-sm"
          title="Accidental Prefix (^ sharp, _ flat, = natural)"
        >
          {tokens.accidental}
        </span>
      )}
      <span
        className="text-sky-800 bg-sky-50 border-b-2 border-sky-500 px-1 rounded-t-sm"
        title="Pitch & Octave (C,, C, C c c')"
      >
        {tokens.pitchOctave}
      </span>
      {tokens.duration && (
        <span
          className="text-emerald-800 bg-emerald-50 border-b-2 border-emerald-500 px-1 rounded-t-sm"
          title="Duration Multiplier (L:1/8 base)"
        >
          {tokens.duration}
        </span>
      )}
    </span>
  );
};

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({
  targetNote,
  selectedNote,
  isCorrect,
  onNextQuestion,
}) => {
  const targetABC = formatABC(targetNote);
  const selectedABC = formatABC(selectedNote);
  const findings = diagnoseMistake(targetNote, selectedNote);
  const wrongFindings = findings.filter((f) => f.status === 'wrong');
  const correctFindings = findings.filter((f) => f.status === 'correct');

  const targetTokens = tokenizeABC(targetABC);

  if (isCorrect) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-semibold text-emerald-950 font-sans">
                  Spot On! <span className="font-mono font-bold">{targetABC}</span> is {getScientificPitchName(targetNote)} ({DURATION_INFO[targetNote.duration].name})
                </h3>
              </div>
              <p className="text-sm text-emerald-800 mt-1 leading-relaxed">
                {targetNote.accidental !== 'none' && (
                  <span>
                    Prefix <code className="font-mono font-semibold">{targetTokens.accidental}</code> ({ACCIDENTAL_INFO[targetNote.accidental].name}) ·{' '}
                  </span>
                )}
                <span>
                  Pitch <code className="font-mono font-semibold">{targetTokens.pitchOctave}</code> ({OCTAVE_INFO[targetNote.octave].name})
                </span>
                <span>
                  {' '}· Duration <code className="font-mono font-semibold">{targetTokens.duration || '(none)'}</code> ({DURATION_INFO[targetNote.duration].name}, {DURATION_INFO[targetNote.duration].beatsIn44})
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => playABCNoteAudio(targetNote)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-900 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              Replay Note
            </button>
            <button
              type="button"
              onClick={onNextQuestion}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap cursor-pointer"
            >
              Next Note (Space / Enter)
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-rose-200 rounded-xl overflow-hidden">
      {/* Header Banner */}
      <div className="bg-rose-50/90 border-b border-rose-200 px-5 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
          <div>
            <h3 className="text-base font-semibold text-rose-950 font-sans">
              Why <code className="font-mono font-bold text-rose-700">{selectedABC}</code> Didn&apos;t Match — Step-by-Step Breakdown
            </h3>
            <p className="text-xs text-rose-800 mt-0.5">
              Compare the target note on the staff (left) with what your selection actually produces (right in red).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNextQuestion}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
        >
          Got It · Next Note
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Side-by-Side Token Comparison Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200 bg-slate-50/50">
        <div className="p-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-emerald-800">
              Correct ABC Notation ({getScientificPitchName(targetNote)} · {DURATION_INFO[targetNote.duration].name})
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <TokenizedABCBadge abc={targetABC} size="lg" />
              <span className="text-xs text-slate-500 font-mono">
                [{targetTokens.accidental || 'no-acc'}] + [{targetTokens.pitchOctave}] + [{targetTokens.duration || '1-unit'}]
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => playABCNoteAudio(targetNote)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            Hear Target
          </button>
        </div>

        <div className="p-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-rose-800">
              Your Selection ({getScientificPitchName(selectedNote)} · {DURATION_INFO[selectedNote.duration].name})
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <TokenizedABCBadge abc={selectedABC} size="lg" />
              <span className="text-xs text-slate-500 font-mono">
                {OCTAVE_INFO[selectedNote.octave].name.split(' (')[0]}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => playABCNoteAudio(selectedNote)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            <Volume2 className="w-3.5 h-3.5 text-rose-600" />
            Hear Yours
          </button>
        </div>
      </div>

      {/* Detailed Diagnostic Findings for What Went Wrong */}
      <div className="p-5 space-y-4">
        {wrongFindings.map((item) => (
          <div
            key={item.category}
            className="p-4 rounded-lg bg-rose-50/50 border border-rose-200/80 space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-rose-950 font-sans">
                ✗ {item.title}
              </h4>
              <span className="text-xs font-mono text-rose-700 font-medium">
                {item.selectedToken} → {item.targetToken}
              </span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed">
              {item.explanation}
            </p>
            {item.ruleReminder && (
              <p className="text-xs font-mono text-slate-600 pt-1 border-t border-rose-200/60">
                Rule: {item.ruleReminder}
              </p>
            )}
          </div>
        ))}

        {/* Quick acknowledgment of what the user got right */}
        {correctFindings.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
            <span className="font-semibold text-emerald-700">What you got right:</span>
            {correctFindings.map((cf, idx) => (
              <React.Fragment key={cf.category}>
                {idx > 0 && <span aria-hidden="true">·</span>}
                <span>✓ {cf.title}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
