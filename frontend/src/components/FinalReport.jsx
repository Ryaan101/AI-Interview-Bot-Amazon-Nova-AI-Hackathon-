import { useState, useEffect } from 'react';

function Background() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="rg-e1" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#FF9900" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FF9900" stopOpacity="0"    />
          </radialGradient>
          <radialGradient id="rg-e2" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#6366F1" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0"    />
          </radialGradient>
          <radialGradient id="rg-e3" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#10B981" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0"    />
          </radialGradient>
        </defs>
        <ellipse className="orb-2" cx="14%"  cy="18%"  rx="320" ry="320" fill="url(#rg-e1)" />
        <ellipse className="orb-1" cx="88%"  cy="82%"  rx="300" ry="300" fill="url(#rg-e2)" />
        <ellipse className="orb-3" cx="58%"  cy="42%"  rx="210" ry="210" fill="url(#rg-e3)" />
      </svg>
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotgrid-e" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="#64748B" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid-e)" />
      </svg>
    </div>
  );
}

function CircleScore({ label, score, max = 5, delay = 0 }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const r = 30;
  const size = 84;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / max);
  const color = score >= 4 ? '#FF9900' : score >= 3 ? '#F59E0B' : '#D97706';

  return (
    <div className="flex flex-col items-center gap-2 animate-fade-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#E5E7EB" strokeWidth="6.5" />
          {/* Progress */}
          <circle
            cx={cx} cy={cx} r={r} fill="none"
            stroke={color}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? offset : circumference}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34, 1.1, 0.64, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className="text-[1.2rem] font-extrabold text-gray-900">{score}</span>
          <span className="text-[10px] text-gray-400 font-normal">/{max}</span>
        </div>
      </div>
      <span className="text-[11px] font-medium text-gray-500 text-center capitalize leading-tight" style={{ maxWidth: 84 }}>
        {label.replace(/_/g, ' ')}
      </span>
    </div>
  );
}

function BulletList({ items, accent }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-gray-700">
          <span className="mt-0.5 shrink-0" style={{ color: accent }}>•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function FinalReport({ report, role, difficulty, conductTerminated, onRestart, onRestartSameRole }) {
  if (!report && !conductTerminated) return null;

  const roleTitle = difficulty === 'intern' ? `${role} Intern` : difficulty ? `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${role}` : role;

  // Conduct termination screen
  if (conductTerminated) {
    return (
      <div
        className="animate-chat-enter relative min-h-screen overflow-x-hidden text-gray-900 px-4 py-12"
        style={{ background: 'linear-gradient(145deg, #FEFCF8 0%, #FFF8EE 45%, #F5F4FF 100%)' }}
      >
        <Background />
        <div className="relative z-10 w-full max-w-2xl mx-auto">
          <div className="flex flex-col items-center mb-10 animate-fade-slide-up" style={{ animationDelay: '0ms' }}>
            <div
              className="icon-pulse w-[64px] h-[64px] rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Interview Ended Early</h2>
            <p className="text-gray-500 text-sm mt-1">{roleTitle}</p>
          </div>

          <div
            className="bg-red-50 border border-red-200 rounded-2xl px-6 py-5 mb-8 shadow-md animate-fade-slide-up"
            style={{ animationDelay: '100ms' }}
          >
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-red-500 mb-2">Session Terminated</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              The interviewer ended this session early due to repeated unprofessional conduct.
              In a real interview setting, this behavior would result in immediate disqualification.
              Please reflect on your responses and try again with a professional approach.
            </p>
          </div>

          <div className="animate-fade-slide-up flex flex-col sm:flex-row gap-3" style={{ animationDelay: '220ms' }}>
            <button
              onClick={onRestart}
              className="btn-orange flex-1 py-3 rounded-xl font-semibold text-sm
                         transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
                         active:translate-y-0 active:shadow-none"
            >
              Choose New Role →
            </button>
            <button
              onClick={onRestartSameRole}
              className="flex-1 bg-white/80 backdrop-blur-sm border border-[#FF9900] text-[#FF9900] font-semibold text-sm
                         py-3 rounded-xl transition-all duration-200
                         hover:bg-[#FF9900] hover:text-white hover:shadow-lg hover:-translate-y-0.5
                         active:translate-y-0 active:shadow-none"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { summary, overall_summary, scores, strengths, improvements, practice_plan } = report;
  const summaryText = overall_summary || summary;
  const scoreEntries = scores ? Object.entries(scores) : [];

  return (
    <div
      className="animate-chat-enter relative min-h-screen overflow-x-hidden text-gray-900 px-4 py-12"
      style={{ background: 'linear-gradient(145deg, #FEFCF8 0%, #FFF8EE 45%, #F5F4FF 100%)' }}
    >
      <Background />

      <div className="relative z-10 w-full max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex flex-col items-center mb-10 animate-fade-slide-up" style={{ animationDelay: '0ms' }}>
          <div
            className="icon-pulse w-[64px] h-[64px] rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg, #FF9900 0%, #F97316 100%)' }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                 stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4a2 2 0 0 1-2-2V5h4" />
              <path d="M18 9h2a2 2 0 0 0 2-2V5h-4" />
              <path d="M12 17v4" />
              <path d="M8 21h8" />
              <path d="M6 3h12v8a6 6 0 0 1-12 0V3Z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Interview Complete</h2>
          <p className="text-gray-500 text-sm mt-1">{roleTitle}</p>
        </div>

        {/* Summary */}
        {summaryText && (
          <div
            className="bg-white/80 backdrop-blur-sm border border-white rounded-2xl px-6 py-5 mb-5 shadow-md animate-fade-slide-up"
            style={{ animationDelay: '100ms' }}
          >
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[#FF9900] mb-2">Summary</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{summaryText}</p>
          </div>
        )}

        {/* Circular scores */}
        {scoreEntries.length > 0 && (
          <div
            className="bg-white/80 backdrop-blur-sm border border-white rounded-2xl px-6 py-7 mb-5 shadow-md animate-fade-slide-up"
            style={{ animationDelay: '200ms' }}
          >
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[#FF9900] mb-7">Scores</h3>
            <div className="flex flex-wrap justify-center gap-7">
              {scoreEntries.map(([key, val], i) => (
                <CircleScore key={key} label={key} score={val} delay={340 + i * 90} />
              ))}
            </div>
          </div>
        )}

        {/* Strengths & improvements */}
        <div className={`grid gap-4 mb-5 ${strengths?.length > 0 && improvements?.length > 0 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
          {strengths?.length > 0 && (
            <div
              className="bg-white/80 backdrop-blur-sm border border-white rounded-2xl px-5 py-5 shadow-md animate-fade-slide-up"
              style={{ animationDelay: '420ms' }}
            >
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 mb-3">Strengths</h3>
              <BulletList items={strengths} accent="#10B981" />
            </div>
          )}
          {improvements?.length > 0 && (
            <div
              className="bg-white/80 backdrop-blur-sm border border-white rounded-2xl px-5 py-5 shadow-md animate-fade-slide-up"
              style={{ animationDelay: '500ms' }}
            >
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 mb-3">Areas to Improve</h3>
              <BulletList items={improvements} accent="#F59E0B" />
            </div>
          )}
        </div>

        {/* Practice plan */}
        {practice_plan?.length > 0 && (
          <div
            className="bg-white/80 backdrop-blur-sm border border-white rounded-2xl px-5 py-5 mb-8 shadow-md animate-fade-slide-up"
            style={{ animationDelay: '580ms' }}
          >
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-blue-500 mb-3">Practice Plan</h3>
            <BulletList items={practice_plan} accent="#3B82F6" />
          </div>
        )}

        {/* CTAs */}
        <div className="animate-fade-slide-up flex flex-col sm:flex-row gap-3" style={{ animationDelay: '660ms' }}>
          <button
            onClick={onRestart}
            className="btn-orange flex-1 py-3 rounded-xl font-semibold text-sm
                       transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
                       active:translate-y-0 active:shadow-none"
          >
            Choose New Role →
          </button>
          <button
            onClick={onRestartSameRole}
            className="flex-1 bg-white/80 backdrop-blur-sm border border-[#FF9900] text-[#FF9900] font-semibold text-sm
                       py-3 rounded-xl transition-all duration-200
                       hover:bg-[#FF9900] hover:text-white hover:shadow-lg hover:-translate-y-0.5
                       active:translate-y-0 active:shadow-none"
          >
            Retry Same Role
          </button>
        </div>
      </div>
    </div>
  );
}

