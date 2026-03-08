import { useState, useRef, useEffect } from 'react';

const ROLES = [
  'Software Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'Data Engineer',
  'ML Engineer',
];

function RoleDropdown({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const select = (role) => {
    onChange(role);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium
                    bg-gray-50 transition-all duration-150
                    focus:outline-none focus:ring-2 focus:ring-[#FF9900]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${open ? 'border-[#FF9900] ring-2 ring-[#FF9900]' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
          {value || 'Select a role…'}
        </span>
        {/* Chevron — rotates when open */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform 200ms ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl
                     overflow-hidden animate-fade-slide-up"
          style={{ animationDuration: '180ms' }}
        >
          {ROLES.map((role) => (
            <li
              key={role}
              role="option"
              aria-selected={value === role}
              onClick={() => select(role)}
              className={`flex items-center justify-between px-4 py-3 text-sm cursor-pointer
                          transition-colors duration-100 select-none
                          ${value === role
                            ? 'bg-[#FF9900] text-white font-semibold'
                            : 'text-gray-700 hover:bg-orange-50 hover:text-[#FF9900]'
                          }`}
            >
              {role}
              {value === role && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const DIFFICULTIES = [
  { value: 'intern', label: 'Intern', desc: 'Fundamentals & guided discussion' },
  { value: 'junior', label: 'Junior', desc: 'Applied problems & moderate depth' },
  { value: 'senior', label: 'Senior', desc: 'System design & deep tradeoffs' },
];

export default function RoleSelector({ onStart, loading }) {
  const [selected, setSelected] = useState('');
  const [difficulty, setDifficulty] = useState('junior');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selected && !loading) onStart(selected, difficulty);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden text-gray-900 px-4"
      style={{ background: 'linear-gradient(145deg, #FEFCF8 0%, #FFF8EE 45%, #F5F4FF 100%)' }}
    >
      {/* ── Animated SVG background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="rg1" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#FF9900" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#FF9900" stopOpacity="0"    />
            </radialGradient>
            <radialGradient id="rg2" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#6366F1" stopOpacity="0.13" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0"    />
            </radialGradient>
            <radialGradient id="rg3" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#F59E0B" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0"    />
            </radialGradient>
          </defs>
          <ellipse className="orb-1" cx="80%" cy="12%" rx="380" ry="380" fill="url(#rg1)" />
          <ellipse className="orb-2" cx="12%" cy="88%" rx="340" ry="340" fill="url(#rg2)" />
          <ellipse className="orb-3" cx="52%" cy="52%" rx="240" ry="240" fill="url(#rg3)" />
        </svg>
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.035 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotgrid" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#64748B" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotgrid)" />
        </svg>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-sm">

        {/* Bot icon */}
        <div className="flex justify-center mb-7 animate-fade-slide-up" style={{ animationDelay: '0ms' }}>
          <div
            className="icon-pulse w-[68px] h-[68px] rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF9900 0%, #F97316 100%)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                 stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="8" width="18" height="13" rx="3" />
              <line x1="12" y1="3" x2="12" y2="8" />
              <circle cx="12" cy="2.5" r="1.5" fill="white" stroke="none" />
              <circle cx="8.5" cy="14" r="1.5" />
              <circle cx="15.5" cy="14" r="1.5" />
              <path d="M9 18 Q12 20 15 18" />
            </svg>
          </div>
        </div>

        {/* Headline */}
        <h1
          className="text-[2.6rem] font-extrabold text-center mb-3 tracking-tight leading-tight animate-fade-slide-up"
          style={{ animationDelay: '80ms' }}
        >
          <span className="text-gray-900">AI Interview </span>
          <span style={{ color: '#FF9900' }}>Bot</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-gray-500 text-center mb-10 text-[0.95rem] leading-relaxed animate-fade-slide-up"
          style={{ animationDelay: '160ms' }}
        >
          Powered by{' '}
          <span className="font-semibold text-gray-700">Amazon Nova</span>
          {' '}— practice real technical interviews.
        </p>

        {/* ── Form card ── */}
        <form
          onSubmit={handleSubmit}
          className="animate-fade-slide-up bg-white/80 backdrop-blur-sm border border-white rounded-2xl shadow-md px-6 py-7 flex flex-col gap-5"
          style={{ animationDelay: '240ms' }}
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">
              What role are you interviewing for?
            </span>
            <p className="text-xs text-gray-400">
              Choose the position that best matches your target job.
            </p>
          </div>

          {/* Custom dropdown */}
          <RoleDropdown value={selected} onChange={setSelected} disabled={loading} />

          {/* Difficulty selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">
              Difficulty level
            </span>
            <p className="text-xs text-gray-400">
              Select the experience level to tailor your questions.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                type="button"
                disabled={loading}
                onClick={() => setDifficulty(d.value)}
                className={`flex flex-col items-center gap-0.5 px-2 py-2.5 rounded-xl border text-center
                            transition-all duration-150 cursor-pointer
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${difficulty === d.value
                              ? 'border-[#FF9900] bg-orange-50 ring-2 ring-[#FF9900]'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                            }`}
              >
                <span className={`text-sm font-semibold ${difficulty === d.value ? 'text-[#FF9900]' : 'text-gray-700'}`}>
                  {d.label}
                </span>
                <span className="text-[10px] text-gray-400 leading-tight">{d.desc}</span>
              </button>
            ))}
          </div>

          {/* CTA button */}
          <button
            type="submit"
            disabled={!selected || loading}
            className="btn-orange w-full rounded-xl py-3 text-sm font-semibold
                       transition-all duration-200 ease-out
                       hover:shadow-lg hover:-translate-y-0.5
                       active:translate-y-0 active:shadow-none
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
          >
            {loading ? 'Starting interview…' : 'Start Interview →'}
          </button>
        </form>
      </div>
    </div>
  );
}
