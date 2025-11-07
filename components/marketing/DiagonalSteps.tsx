'use client';

import { m, useReducedMotion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Step {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface DiagonalStepsProps {
  steps: Step[];
}

// Grid positions for diagonal chess pattern (col-start, row-start)
const GRID_POSITIONS = [
  { col: 1, row: 2 }, // Step 1: bottom-left
  { col: 2, row: 1 }, // Step 2: top
  { col: 3, row: 2 }, // Step 3: bottom
  { col: 4, row: 1 }, // Step 4: top-right
  { col: 5, row: 2 }, // Step 5 (extensible): bottom-right
];

// Convert grid position to SVG coordinates (percentage)
// Takes into account the actual visual layout with overlapping tiles
const gridToSvgCoords = (col: number, row: number) => {
  // With 4 columns and overlap (md:-mr-6), tiles are closer together
  // Adjusted positions based on visual layout:
  // Col 1: ~15%, Col 2: ~40%, Col 3: ~60%, Col 4: ~85%
  const columnCenters: Record<number, number> = {
    1: 15,
    2: 40, 
    3: 60,
    4: 85
  };
  const x = columnCenters[col] || 50;
  
  // Two rows with gap-y-6: top row at ~35%, bottom row at ~65%
  const y = row === 1 ? 35 : 65;
  
  return { x, y };
};

/**
 * Diagonal chess-path step component with tilted grid background,
 * curved arrow connectors, and parallax feel.
 */
export function DiagonalSteps({ steps }: DiagonalStepsProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative w-full min-h-[calc(100dvh-var(--header-h,4rem))] flex items-center justify-center">
      {/* Tilted Grid Background */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0.1) 52%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0.08) 52%, transparent 52%)
          `,
          backgroundSize: '120px 120px',
          transform: 'rotate(15deg) scale(1.5)',
          transformOrigin: 'center'
        }}
        aria-hidden="true"
      />

      {/* Decorative rounded squares scattered in background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'absolute rounded-2xl',
              i % 3 === 0 ? 'bg-white/5' : i % 3 === 1 ? 'bg-white/3' : 'bg-white/7'
            )}
            style={{
              width: `${80 + (i % 3) * 20}px`,
              height: `${80 + (i % 3) * 20}px`,
              top: `${(i * 11 + 5) % 85}%`,
              left: `${(i * 17 + 3) % 90}%`,
              transform: `rotate(${(i * 13) % 360}deg)`,
              opacity: 0.4
            }}
          />
        ))}
      </div>

      {/* Steps Container */}
      <div className="relative z-10 w-full">
        {/* Mobile: Vertical Stack */}
        <div className="block md:hidden relative px-6 py-8">
          {/* Vertical dotted line connector */}
          <div className="absolute left-14 top-0 bottom-0 w-0.5 border-l-2 border-dotted border-white/20" aria-hidden="true" />
          
          <ol className="relative space-y-8">
            {steps.map((step, index) => (
              <li key={step.step}>
                <m.div
                  {...(shouldReduceMotion
                    ? {}
                    : {
                        initial: { opacity: 0, y: 20 },
                        whileInView: { opacity: 1, y: 0 },
                        transition: { duration: 0.4, delay: index * 0.1 }
                      })}
                  viewport={{ once: true }}
                  className="relative w-full max-w-sm mx-auto rounded-2xl bg-linear-to-br from-white/10 to-white/5 p-6 shadow-lg backdrop-blur-sm border border-white/10 hover:from-white/15 hover:to-white/8 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                      <step.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/60">
                        Étape {step.step}
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
                      <p className="text-sm text-white/80">{step.description}</p>
                    </div>
                  </div>
                </m.div>
              </li>
            ))}
          </ol>
        </div>

        {/* Desktop: Diagonal Chess Grid */}
        <div className="hidden md:block relative px-6">
          {/* Grid of Step Tiles */}
          <ol className="relative grid grid-cols-4 md:grid-rows-2 items-center justify-items-center gap-x-0 gap-y-6 min-h-[500px]">
            {/* SVG Arrows Layer - positioned absolutely over the grid */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 5 }}
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Arrow 1 -> 2: bottom-left to top-center */}
              <path
                d="M 12.5 75 Q 20 50, 37.5 25"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                strokeOpacity="0.3"
                strokeDasharray="4 2"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="12"
                  to="0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>
              <path
                d="M 36 23 L 37.5 25 L 39 24"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                strokeOpacity="0.3"
                strokeLinecap="round"
              />
              
              {/* Arrow 2 -> 3: top-center to bottom-center-right */}
              <path
                d="M 37.5 25 Q 50 50, 62.5 75"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                strokeOpacity="0.3"
                strokeDasharray="4 2"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="12"
                  to="0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>
              <path
                d="M 61 76 L 62.5 75 L 64 76"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                strokeOpacity="0.3"
                strokeLinecap="round"
              />
              
              {/* Arrow 3 -> 4: bottom-center-right to top-right */}
              <path
                d="M 62.5 75 Q 75 50, 87.5 25"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                strokeOpacity="0.3"
                strokeDasharray="4 2"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="12"
                  to="0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>
              <path
                d="M 86 23 L 87.5 25 L 89 24"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                strokeOpacity="0.3"
                strokeLinecap="round"
              />
            </svg>

            {steps.map((step, index) => {
              const position = GRID_POSITIONS[index];
              if (!position) return null;
              
              const rotation = index % 2 === 0 ? 2 : -2;
              const gradient = `from-white/${25 - index * 3} to-white/${18 - index * 3}`;

              return (
                <li
                  key={step.step}
                  className={cn('relative', position.col >= 2 && 'md:-mr-6')}
                  style={{ 
                    zIndex: 10 + index,
                    gridColumn: position.col,
                    gridRow: position.row
                  }}
                >
                  <m.div
                    {...(shouldReduceMotion
                      ? {}
                      : {
                          initial: { opacity: 0, scale: 0.8, y: 40 },
                          whileInView: { opacity: 1, scale: 1, y: 0 },
                          transition: {
                            duration: 0.5,
                            delay: index * 0.15,
                            ease: [0.4, 0, 0.2, 1]
                          }
                        })}
                    viewport={{ once: true, amount: 0.3 }}
                    className="group cursor-pointer"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      width: '220px',
                      height: '220px',
                    }}
                  >
                    <div
                      className={cn(
                        'relative h-full w-full rounded-3xl bg-linear-to-br p-6 shadow-2xl backdrop-blur-sm border border-white/15',
                        'transition-all duration-500 ease-out',
                        'hover:scale-110 hover:rotate-0 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]',
                        'hover:from-white/30 hover:to-white/22',
                        gradient
                      )}
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 rounded-3xl bg-white/0 group-hover:bg-white/5 transition-all duration-500" />

                      <div className="relative h-full flex flex-col items-center justify-center text-center gap-3">
                        {/* Icon */}
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <step.icon className="h-7 w-7" aria-hidden="true" />
                        </div>

                        {/* Step number */}
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 group-hover:text-white/90 transition-colors">
                          Étape {step.step}
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-white leading-tight px-2 group-hover:text-white transition-colors">
                          {step.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-white/80 leading-relaxed px-2 group-hover:text-white/90 transition-colors">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </m.div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
