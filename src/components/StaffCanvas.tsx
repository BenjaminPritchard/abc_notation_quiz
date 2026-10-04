import React from 'react';
import {
  ABCNote,
  ACCIDENTAL_INFO,
  DURATION_INFO,
  formatABC,
  getDiatonicStepFromC4,
  getScientificPitchName,
} from '../abcNotation';

interface StaffCanvasProps {
  targetNote: ABCNote;
  comparisonNote?: ABCNote | null;
  showOctaveGuides: boolean;
  revealTargetLabel: boolean;
}

/**
 * High-precision SVG Grand Staff (Treble + Bass Clef) with Middle C (C4) anchor,
 * interactive Octave Band Zones (Octaves 2, 3, 4, 5, 6), ledger lines,
 * accidentals (♯, ♭, ♮), rhythmic durations (16th, 8th, quarter, dotted quarter, half),
 * and side-by-side comparison of Target vs. User's Mistaken Selection.
 */
export const StaffCanvas: React.FC<StaffCanvasProps> = ({
  targetNote,
  comparisonNote,
  showOctaveGuides,
  revealTargetLabel,
}) => {
  // Coordinate system:
  // Middle C (C4, step = 0) sits at Y = 220, exactly halfway between:
  // - Treble bottom line E4 (step = +2) at Y = 200
  // - Bass top line A3 (step = -2) at Y = 240
  // Half-space (1 diatonic step) = 10px; Full line spacing (2 steps) = 20px.
  const MIDDLE_C_Y = 220;
  const STEP_PX = 10;

  const stepToY = (stepFromC4: number) => MIDDLE_C_Y - stepFromC4 * STEP_PX;

  // Treble staff lines: E4 (+2), G4 (+4), B4 (+6), D5 (+8), F5 (+10)
  const trebleSteps = [2, 4, 6, 8, 10];
  // Bass staff lines: G2 (-10), B2 (-8), D3 (-6), F3 (-4), A3 (-2)
  const bassSteps = [-10, -8, -6, -4, -2];

  // Octave Band Definitions for visual learner overlay
  const octaveBands: {
    octave: 2 | 3 | 4 | 5 | 6;
    minStep: number;
    maxStep: number;
    syntax: string;
    label: string;
    fill: string;
    stroke: string;
    textColor: string;
  }[] = [
    {
      octave: 6,
      minStep: 14, // C6
      maxStep: 19, // A6
      syntax: "c' – a'",
      label: "Octave 6 (lowercase + ')",
      fill: 'rgba(139, 92, 246, 0.06)',
      stroke: '#8B5CF6',
      textColor: '#6D28D9',
    },
    {
      octave: 5,
      minStep: 7, // C5
      maxStep: 13, // B5
      syntax: 'c – b',
      label: 'Octave 5 (lowercase)',
      fill: 'rgba(14, 165, 233, 0.07)',
      stroke: '#0284C7',
      textColor: '#0369A1',
    },
    {
      octave: 4,
      minStep: 0, // C4 (Middle C)
      maxStep: 6, // B4
      syntax: 'C – B',
      label: 'Octave 4 (UPPERCASE · Middle C)',
      fill: 'rgba(16, 185, 129, 0.07)',
      stroke: '#059669',
      textColor: '#047857',
    },
    {
      octave: 3,
      minStep: -7, // C3
      maxStep: -1, // B3
      syntax: 'C, – B,',
      label: 'Octave 3 (UPPERCASE + ,)',
      fill: 'rgba(245, 158, 11, 0.07)',
      stroke: '#D97706',
      textColor: '#B45309',
    },
    {
      octave: 2,
      minStep: -14, // C2
      maxStep: -8, // B2
      syntax: 'C,, – B,,',
      label: 'Octave 2 (UPPERCASE + ,,)',
      fill: 'rgba(244, 63, 94, 0.06)',
      stroke: '#E11D48',
      textColor: '#BE123C',
    },
  ];

  /**
   * Computes which ledger lines are needed for a given diatonic step from C4
   */
  const getLedgerSteps = (step: number): number[] => {
    const ledgers: number[] = [];
    if (step === 0) {
      // Middle C (C4)
      ledgers.push(0);
    } else if (step >= 12) {
      // Above Treble top line F5 (step 10): A5 (12), C6 (14), E6 (16), G6 (18)
      for (let s = 12; s <= step; s += 2) {
        ledgers.push(s);
      }
    } else if (step <= -12) {
      // Below Bass bottom line G2 (step -10): E2 (-12), C2 (-14)
      for (let s = -12; s >= step; s -= 2) {
        ledgers.push(s);
      }
    }
    return ledgers;
  };

  /**
   * Renders a complete musical note (ledger lines, accidental, notehead, dot, stem, flags, and callout badge)
   */
  const renderMusicalNote = (
    note: ABCNote,
    centerX: number,
    variant: 'target' | 'comparison'
  ) => {
    const step = getDiatonicStepFromC4(note);
    const y = stepToY(step);
    const ledgers = getLedgerSteps(step);

    // Stem direction rule:
    // In Treble zone (step >= 0): B4 (step 6) and above stem DOWN; below B4 stem UP.
    // In Bass zone (step < 0): D3 (step -6) and above stem DOWN; below D3 stem UP.
    const stemUp = step >= 0 ? step < 6 : step < -6;
    const stemX = stemUp ? centerX + 11.5 : centerX - 11.5;
    const stemTipY = stemUp ? y - 62 : y + 62;

    const isHollow = note.duration === '4'; // Half note has open notehead
    const isDotted = note.duration === '3'; // Dotted quarter note
    const flagCount = note.duration === '/2' ? 2 : note.duration === '' ? 1 : 0;

    const primaryColor =
      variant === 'target'
        ? '#0F172A'
        : '#DC2626';

    const badgeBg =
      variant === 'target'
        ? revealTargetLabel
          ? '#059669'
          : '#0284C7'
        : '#DC2626';

    return (
      <g key={`${variant}-${formatABC(note)}`} className="transition-all duration-200">
        {/* Highlight halo around the notehead */}
        <circle
          cx={centerX}
          cy={y}
          r={24}
          fill={
            variant === 'target'
              ? revealTargetLabel
                ? 'rgba(5, 150, 105, 0.10)'
                : 'rgba(2, 132, 199, 0.09)'
              : 'rgba(220, 38, 38, 0.10)'
          }
        />

        {/* Ledger lines */}
        {ledgers.map((lStep) => {
          const ly = stepToY(lStep);
          return (
            <line
              key={lStep}
              x1={centerX - 24}
              y1={ly}
              x2={centerX + 24}
              y2={ly}
              stroke={variant === 'target' ? '#0F172A' : '#DC2626'}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* Accidental symbol before the notehead */}
        {note.accidental !== 'none' && (
          <g transform={`translate(${centerX - 38}, ${y})`}>
            {note.accidental === 'sharp' && (
              <text
                x={0}
                y={11}
                textAnchor="middle"
                fill={variant === 'target' ? '#0284C7' : '#DC2626'}
                fontSize="36"
                fontWeight="700"
                style={{ fontFamily: 'serif' }}
              >
                ♯
              </text>
            )}
            {note.accidental === 'flat' && (
              <text
                x={0}
                y={10}
                textAnchor="middle"
                fill={variant === 'target' ? '#0284C7' : '#DC2626'}
                fontSize="38"
                fontWeight="700"
                style={{ fontFamily: 'serif' }}
              >
                ♭
              </text>
            )}
            {note.accidental === 'natural' && (
              <text
                x={0}
                y={11}
                textAnchor="middle"
                fill={variant === 'target' ? '#0284C7' : '#DC2626'}
                fontSize="36"
                fontWeight="700"
                style={{ fontFamily: 'serif' }}
              >
                ♮
              </text>
            )}
          </g>
        )}

        {/* Notehead (tilted ellipse; hollow for half note, solid for quarter/8th/16th) */}
        <g transform={`translate(${centerX}, ${y}) rotate(-18)`}>
          {isHollow ? (
            <>
              <ellipse
                cx={0}
                cy={0}
                rx={13.5}
                ry={9.2}
                fill="#FFFFFF"
                stroke={primaryColor}
                strokeWidth={3.2}
              />
              <ellipse
                cx={0}
                cy={0}
                rx={7.5}
                ry={4.2}
                fill="none"
                stroke={primaryColor}
                strokeWidth={1.2}
                transform="rotate(12)"
              />
            </>
          ) : (
            <ellipse cx={0} cy={0} rx={13.5} ry={9.2} fill={primaryColor} />
          )}
        </g>

        {/* Augmentation Dot for Dotted Quarter Note (duration '3') */}
        {isDotted && (
          <circle
            cx={centerX + 23}
            cy={step % 2 === 0 ? y - 5 : y}
            r={4}
            fill={primaryColor}
          />
        )}

        {/* Note Stem */}
        <line
          x1={stemX}
          y1={y}
          x2={stemX}
          y2={stemTipY}
          stroke={primaryColor}
          strokeWidth={2.8}
          strokeLinecap="round"
        />

        {/* Flags for Eighth (1 flag) and Sixteenth (2 flags) notes */}
        {flagCount >= 1 && (
          <path
            d={
              stemUp
                ? `M ${stemX} ${stemTipY} C ${stemX + 14} ${stemTipY + 10}, ${stemX + 22} ${stemTipY + 24}, ${stemX + 14} ${stemTipY + 38} C ${stemX + 18} ${stemTipY + 24}, ${stemX + 10} ${stemTipY + 14}, ${stemX} ${stemTipY + 11} Z`
                : `M ${stemX} ${stemTipY} C ${stemX + 14} ${stemTipY - 10}, ${stemX + 22} ${stemTipY - 24}, ${stemX + 14} ${stemTipY - 38} C ${stemX + 18} ${stemTipY - 24}, ${stemX + 10} ${stemTipY - 14}, ${stemX} ${stemTipY - 11} Z`
            }
            fill={primaryColor}
          />
        )}
        {flagCount >= 2 && (
          <path
            d={
              stemUp
                ? `M ${stemX} ${stemTipY + 15} C ${stemX + 14} ${stemTipY + 25}, ${stemX + 22} ${stemTipY + 39}, ${stemX + 14} ${stemTipY + 53} C ${stemX + 18} ${stemTipY + 39}, ${stemX + 10} ${stemTipY + 29}, ${stemX} ${stemTipY + 26} Z`
                : `M ${stemX} ${stemTipY - 15} C ${stemX + 14} ${stemTipY - 25}, ${stemX + 22} ${stemTipY - 39}, ${stemX + 14} ${stemTipY - 53} C ${stemX + 18} ${stemTipY - 39}, ${stemX + 10} ${stemTipY - 29}, ${stemX} ${stemTipY - 26} Z`
            }
            fill={primaryColor}
          />
        )}

        {/* Top/Bottom Callout Annotation for Target vs Comparison */}
        {variant === 'comparison' && (
          <g transform={`translate(${centerX}, 380)`}>
            <rect
              x={-84}
              y={-16}
              width={168}
              height={32}
              rx={6}
              fill="#FEF2F2"
              stroke="#FECACA"
              strokeWidth={1.2}
            />
            <text
              x={0}
              y={4}
              textAnchor="middle"
              fill="#B91C1C"
              fontSize="12"
              fontWeight="600"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Your Pick: {formatABC(note)} ({getScientificPitchName(note)})
            </text>
          </g>
        )}

        {variant === 'target' && revealTargetLabel && (
          <g transform={`translate(${centerX}, 380)`}>
            <rect
              x={-88}
              y={-16}
              width={176}
              height={32}
              rx={6}
              fill="#ECFDF5"
              stroke="#A7F3D0"
              strokeWidth={1.2}
            />
            <text
              x={0}
              y={4}
              textAnchor="middle"
              fill={badgeBg}
              fontSize="12"
              fontWeight="600"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Target: {formatABC(note)} ({getScientificPitchName(note)})
            </text>
          </g>
        )}
      </g>
    );
  };

  const targetX = comparisonNote ? 290 : 350;
  const comparisonX = 485;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Subtle Top Stage Bar showing ABC Header Context */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-slate-50/80 border-b border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-3 font-mono">
          <span className="font-semibold text-slate-900">M:4/4</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-sky-700">L:1/8 (Eighth Note = 1 Unit)</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-slate-900">K:C</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <span>
            Rhythm Cue:{' '}
            <strong className="text-slate-800 font-medium">
              {DURATION_INFO[targetNote.duration].name} ({DURATION_INFO[targetNote.duration].beatsIn44})
            </strong>
          </span>
          {targetNote.accidental !== 'none' && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Accidental:{' '}
                <strong className="text-sky-700 font-medium">
                  {ACCIDENTAL_INFO[targetNote.accidental].name} ({ACCIDENTAL_INFO[targetNote.accidental].symbol})
                </strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Responsive SVG Grand Staff */}
      <div className="relative w-full px-2 py-2 sm:px-4">
        <svg
          viewBox="0 0 740 410"
          className="w-full h-auto select-none"
          role="img"
          aria-label="Musical Grand Staff showing a note for ABC notation identification"
        >
          {/* Optional Octave Range Visual Overlay Bands */}
          {showOctaveGuides &&
            octaveBands.map((band) => {
              const topY = stepToY(band.maxStep) - 8;
              const bottomY = stepToY(band.minStep) + 8;
              const isTargetBand = targetNote.octave === band.octave;
              return (
                <g key={band.octave}>
                  <rect
                    x={58}
                    y={topY}
                    width={666}
                    height={bottomY - topY}
                    rx={4}
                    fill={band.fill}
                    stroke={isTargetBand ? band.stroke : 'transparent'}
                    strokeWidth={isTargetBand ? 1.5 : 0}
                    strokeDasharray={isTargetBand ? '4 3' : undefined}
                  />
                  <text
                    x={714}
                    y={(topY + bottomY) / 2 + 4}
                    textAnchor="end"
                    fill={band.textColor}
                    fontSize="11"
                    fontWeight={isTargetBand ? '700' : '500'}
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {band.label}: {band.syntax}
                  </text>
                </g>
              );
            })}

          {/* Grand Staff Left Brace & Vertical Barline */}
          <line
            x1={70}
            y1={stepToY(10)}
            x2={70}
            y2={stepToY(-10)}
            stroke="#1E293B"
            strokeWidth={3}
          />
          <path
            d={`M 68 ${stepToY(10)} C 52 ${stepToY(10) + 15}, 56 ${MIDDLE_C_Y - 18}, 44 ${MIDDLE_C_Y} C 56 ${MIDDLE_C_Y + 18}, 52 ${stepToY(-10) - 15}, 68 ${stepToY(-10)}`}
            fill="none"
            stroke="#1E293B"
            strokeWidth={2.5}
          />

          {/* Right Closing Barlines */}
          <line
            x1={585}
            y1={stepToY(10)}
            x2={585}
            y2={stepToY(2)}
            stroke="#334155"
            strokeWidth={1.5}
          />
          <line
            x1={591}
            y1={stepToY(10)}
            x2={591}
            y2={stepToY(2)}
            stroke="#1E293B"
            strokeWidth={3.5}
          />
          <line
            x1={585}
            y1={stepToY(-2)}
            x2={585}
            y2={stepToY(-10)}
            stroke="#334155"
            strokeWidth={1.5}
          />
          <line
            x1={591}
            y1={stepToY(-2)}
            x2={591}
            y2={stepToY(-10)}
            stroke="#1E293B"
            strokeWidth={3.5}
          />

          {/* Treble Staff 5 Horizontal Lines */}
          {trebleSteps.map((step) => {
            const y = stepToY(step);
            return (
              <line
                key={`treble-${step}`}
                x1={70}
                y1={y}
                x2={592}
                y2={y}
                stroke="#334155"
                strokeWidth={1.6}
              />
            );
          })}

          {/* Bass Staff 5 Horizontal Lines */}
          {bassSteps.map((step) => {
            const y = stepToY(step);
            return (
              <line
                key={`bass-${step}`}
                x1={70}
                y1={y}
                x2={592}
                y2={y}
                stroke="#334155"
                strokeWidth={1.6}
              />
            );
          })}

          {/* Subtle Middle C (C4) Reference Dashed Line across the staff */}
          <line
            x1={145}
            y1={MIDDLE_C_Y}
            x2={575}
            y2={MIDDLE_C_Y}
            stroke="#94A3B8"
            strokeWidth={1}
            strokeDasharray="3 5"
          />
          <text
            x={152}
            y={MIDDLE_C_Y - 5}
            fill="#64748B"
            fontSize="10.5"
            fontWeight="600"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Middle C (C4 = &quot;C&quot;)
          </text>

          {/* Treble Clef (G Clef) Glyph & Label */}
          <g transform="translate(86, 0)">
            <text
              x={0}
              y={stepToY(2) - 4}
              fontSize="94"
              fill="#0F172A"
              style={{ fontFamily: 'serif' }}
            >
              𝄞
            </text>
            <text
              x={44}
              y={stepToY(10) - 8}
              fill="#64748B"
              fontSize="10"
              fontWeight="600"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              TREBLE CLEF
            </text>
          </g>

          {/* Bass Clef (F Clef) Glyph & Label */}
          <g transform="translate(86, 0)">
            <text
              x={0}
              y={stepToY(-2) + 64}
              fontSize="74"
              fill="#0F172A"
              style={{ fontFamily: 'serif' }}
            >
              𝄢
            </text>
            <text
              x={44}
              y={stepToY(-10) + 18}
              fill="#64748B"
              fontSize="10"
              fontWeight="600"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              BASS CLEF
            </text>
          </g>

          {/* Line/Space Quick Letter Hints on Left Margin when Octave Guides are active */}
          {showOctaveGuides && (
            <g>
              {/* Treble line letters: E4, G4, B4, D5, F5 */}
              {[
                { step: 2, txt: 'E' },
                { step: 4, txt: 'G' },
                { step: 6, txt: 'B' },
                { step: 8, txt: 'd' },
                { step: 10, txt: 'f' },
                { step: 7, txt: 'c (C5)' },
              ].map((item) => (
                <text
                  key={`hint-t-${item.step}`}
                  x={218}
                  y={stepToY(item.step) + 3.5}
                  fill="#0369A1"
                  fontSize="10.5"
                  fontWeight="600"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {item.txt}
                </text>
              ))}
              {/* Bass line letters: G2, B2, D3, F3, A3 */}
              {[
                { step: -10, txt: 'G,,' },
                { step: -8, txt: 'B,,' },
                { step: -6, txt: 'D,' },
                { step: -4, txt: 'F,' },
                { step: -2, txt: 'A,' },
              ].map((item) => (
                <text
                  key={`hint-b-${item.step}`}
                  x={218}
                  y={stepToY(item.step) + 3.5}
                  fill="#B45309"
                  fontSize="10.5"
                  fontWeight="600"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {item.txt}
                </text>
              ))}
            </g>
          )}

          {/* Render the Target Note */}
          {renderMusicalNote(targetNote, targetX, 'target')}

          {/* If the user picked a wrong option, also render what their picked ABC string actually looks like on the staff! */}
          {comparisonNote && renderMusicalNote(comparisonNote, comparisonX, 'comparison')}
        </svg>
      </div>
    </div>
  );
};
