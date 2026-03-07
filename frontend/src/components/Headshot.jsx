import { useMemo } from 'react';

const SKIN = ['#FDDCB5', '#F5C7A1', '#D4A57B', '#C18E6B', '#A0714F', '#7B5338', '#4E3629'];
const HAIR_COLORS = ['#1A1A1A', '#3B2314', '#6B3A1F', '#8C5A3C', '#C7943A', '#E6BE6C', '#A53C2E', '#D16B3A', '#555555', '#F5DEB3'];

function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }

function seededRng(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function darken(hex, amt = 0.15) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) * (1 - amt)) | 0;
  const g = Math.max(0, ((n >> 8) & 0xff) * (1 - amt)) | 0;
  const b = Math.max(0, (n & 0xff) * (1 - amt)) | 0;
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/* ── Hair styles ──
   Head ellipse: cx=50 cy=38 rx=24 ry=28  →  top at y≈10, widest at y=38
   All caps must reach at least y=32 on the sides to cover the crown fully.
*/
const HAIR_STYLES = [
  // 0  Buzz cut (masc) — thin cap hugging the head
  (c) => (
    <path d="M27 34 C27 16, 37 8, 50 8 C63 8, 73 16, 73 34 C73 28, 27 28, 27 34Z" fill={c} />
  ),

  // 1  Short cropped (masc) — a bit more volume
  (c) => (
    <path d="M26 34 C26 14, 37 5, 50 5 C63 5, 74 14, 74 34 C74 26, 26 26, 26 34Z" fill={c} />
  ),

  // 2  Side part (masc)
  (c) => (
    <>
      <path d="M26 34 C26 14, 37 4, 50 4 C63 4, 74 14, 74 34 C74 26, 26 26, 26 34Z" fill={c} />
      <path d="M30 28 C30 22, 36 16, 44 14 C38 18, 34 24, 34 32 Z" fill={c} opacity="0.55" />
    </>
  ),

  // 3  Textured crop / fade (masc)
  (c) => (
    <>
      <path d="M27 34 C27 16, 37 6, 50 6 C63 6, 73 16, 73 34 C73 26, 27 26, 27 34Z" fill={c} />
      <path d="M30 34 C30 30, 31 26, 33 24 L35 34 Z" fill={c} opacity="0.4" />
      <path d="M67 24 C69 26, 70 30, 70 34 L67 34 Z" fill={c} opacity="0.4" />
    </>
  ),

  // 4  Slicked back (masc) — cap + side tails
  (c) => (
    <>
      <path d="M26 34 C26 12, 38 3, 50 3 C62 3, 74 12, 74 34 C74 26, 26 26, 26 34Z" fill={c} />
      <path d="M26 34 Q24 42, 26 48 Q28 42, 28 36 Z" fill={c} opacity="0.5" />
      <path d="M74 34 Q76 42, 74 48 Q72 42, 72 36 Z" fill={c} opacity="0.5" />
    </>
  ),

  // 5  Bob (fem) — cap + side curtains
  (c) => (
    <>
      <path d="M24 34 C24 12, 36 2, 50 2 C64 2, 76 12, 76 34 C76 26, 24 26, 24 34Z" fill={c} />
      <path d="M24 34 Q22 50, 26 58 Q28 48, 28 36 Z" fill={c} />
      <path d="M76 34 Q78 50, 74 58 Q72 48, 72 36 Z" fill={c} />
    </>
  ),

  // 6  Long straight (fem) — cap + long side strands
  (c) => (
    <>
      <path d="M24 34 C24 12, 36 2, 50 2 C64 2, 76 12, 76 34 C76 26, 24 26, 24 34Z" fill={c} />
      <path d="M24 34 Q20 56, 24 74 Q28 56, 28 36 Z" fill={c} />
      <path d="M76 34 Q80 56, 76 74 Q72 56, 72 36 Z" fill={c} />
    </>
  ),

  // 7  Long wavy (fem) — cap + wavy side strands
  (c) => (
    <>
      <path d="M24 34 C24 12, 36 2, 50 2 C64 2, 76 12, 76 34 C76 26, 24 26, 24 34Z" fill={c} />
      <path d="M24 34 Q20 44, 24 52 Q20 60, 24 70 Q28 58, 26 46 Q28 38, 28 34Z" fill={c} />
      <path d="M76 34 Q80 44, 76 52 Q80 60, 76 70 Q72 58, 74 46 Q72 38, 72 34Z" fill={c} />
    </>
  ),

  // 8  High bun (fem) — cap + bun on top
  (c) => (
    <>
      <path d="M26 34 C26 14, 38 5, 50 5 C62 5, 74 14, 74 34 C74 26, 26 26, 26 34Z" fill={c} />
      <circle cx="50" cy="5" r="9" fill={c} />
    </>
  ),

  // 9  Afro (unisex) — big round shape covers everything
  (c) => (
    <ellipse cx="50" cy="22" rx="32" ry="26" fill={c} />
  ),

  // 10  Ponytail (fem) — cap + tail sweeping to the right
  (c) => (
    <>
      <path d="M26 34 C26 12, 38 3, 50 3 C62 3, 74 12, 74 34 C74 26, 26 26, 26 34Z" fill={c} />
      <path d="M68 24 Q78 28, 80 42 Q82 56, 76 66 Q74 54, 72 42 Q70 30, 68 24Z" fill={c} />
    </>
  ),

  // 11  Shoulder length (fem) — cap + medium side curtains
  (c) => (
    <>
      <path d="M24 34 C24 12, 36 3, 50 3 C64 3, 76 12, 76 34 C76 26, 24 26, 24 34Z" fill={c} />
      <path d="M24 34 Q22 46, 26 56 Q28 46, 28 36 Z" fill={c} />
      <path d="M76 34 Q78 46, 74 56 Q72 46, 72 36 Z" fill={c} />
    </>
  ),
];

/* ── Outfit renderers (clothes color + optional accent) ── */
const OUTFITS = [
  // 0  Suit jacket + tie
  (clr, acc) => (
    <>
      <path d="M20 120 C20 90, 32 76, 50 74 C68 76, 80 90, 80 120 Z" fill={clr} />
      {/* Lapels */}
      <path d="M42 78 L50 96 L44 96 Z" fill={darken(clr, 0.2)} />
      <path d="M58 78 L50 96 L56 96 Z" fill={darken(clr, 0.2)} />
      {/* Shirt triangle */}
      <path d="M44 78 L50 96 L56 78 Z" fill="white" />
      {/* Tie */}
      <path d="M48 82 L50 100 L52 82 Z" fill={acc} />
    </>
  ),

  // 1  Suit jacket + no tie (open collar)
  (clr) => (
    <>
      <path d="M20 120 C20 90, 32 76, 50 74 C68 76, 80 90, 80 120 Z" fill={clr} />
      <path d="M42 78 L48 94 L44 94 Z" fill={darken(clr, 0.2)} />
      <path d="M58 78 L52 94 L56 94 Z" fill={darken(clr, 0.2)} />
      <path d="M44 78 L50 92 L56 78 Z" fill="white" />
    </>
  ),

  // 2  Blouse with collar
  (clr) => (
    <>
      <path d="M20 120 C20 90, 32 76, 50 74 C68 76, 80 90, 80 120 Z" fill={clr} />
      {/* Collar */}
      <path d="M40 76 Q44 82, 50 80 Q46 76, 40 76Z" fill="white" />
      <path d="M60 76 Q56 82, 50 80 Q54 76, 60 76Z" fill="white" />
    </>
  ),

  // 3  Crew-neck blouse (simple)
  (clr) => (
    <>
      <path d="M20 120 C20 90, 32 76, 50 74 C68 76, 80 90, 80 120 Z" fill={clr} />
      <path d="M42 76 Q50 80, 58 76" fill="none" stroke={darken(clr, 0.15)} strokeWidth="1.5" />
    </>
  ),

  // 4  V-neck dress top
  (clr) => (
    <>
      <path d="M20 120 C20 90, 32 76, 50 74 C68 76, 80 90, 80 120 Z" fill={clr} />
      <path d="M42 74 L50 90 L58 74 Z" fill={darken(clr, 0.12)} />
    </>
  ),

  // 5  Mock turtleneck
  (clr) => (
    <>
      <path d="M20 120 C20 90, 32 76, 50 74 C68 76, 80 90, 80 120 Z" fill={clr} />
      <rect x="42" y="70" width="16" height="6" rx="3" fill={darken(clr, 0.08)} />
    </>
  ),

  // 6  Blazer over round-neck top
  (clr, acc) => (
    <>
      <path d="M20 120 C20 90, 32 76, 50 74 C68 76, 80 90, 80 120 Z" fill={clr} />
      {/* Inner top visible at neckline */}
      <path d="M42 76 Q50 82, 58 76 L58 74 Q50 78, 42 74 Z" fill={acc} />
      {/* Lapel lines */}
      <path d="M38 80 L46 98" fill="none" stroke={darken(clr, 0.25)} strokeWidth="1.2" />
      <path d="M62 80 L54 98" fill="none" stroke={darken(clr, 0.25)} strokeWidth="1.2" />
    </>
  ),

  // 7  Button-up shirt
  (clr) => (
    <>
      <path d="M20 120 C20 90, 32 76, 50 74 C68 76, 80 90, 80 120 Z" fill={clr} />
      {/* Collar */}
      <path d="M40 76 Q44 82, 50 80 Q46 76, 40 76Z" fill={darken(clr, -0.1)} />
      <path d="M60 76 Q56 82, 50 80 Q54 76, 60 76Z" fill={darken(clr, -0.1)} />
      {/* Button line */}
      <line x1="50" y1="82" x2="50" y2="110" stroke={darken(clr, 0.2)} strokeWidth="0.8" />
      <circle cx="50" cy="88" r="1" fill={darken(clr, 0.2)} />
      <circle cx="50" cy="96" r="1" fill={darken(clr, 0.2)} />
      <circle cx="50" cy="104" r="1" fill={darken(clr, 0.2)} />
    </>
  ),
];

const OUTFIT_COLORS = [
  { main: '#1E293B', accent: '#991B1B' },  // dark navy suit + burgundy tie
  { main: '#374151', accent: '#1E40AF' },  // charcoal suit + blue tie
  { main: '#1F2937', accent: '#065F46' },  // black suit + forest tie
  { main: '#4338CA', accent: '#FBBF24' },  // indigo blazer + gold
  { main: '#1E3A5F', accent: '#DC2626' },  // navy suit + red tie
  { main: '#FAFAFA', accent: '#6B7280' },  // white blouse
  { main: '#0F766E', accent: '#FAFAFA' },  // teal top
  { main: '#7C3AED', accent: '#FAFAFA' },  // purple blouse
  { main: '#B91C1C', accent: '#1E293B' },  // burgundy dress top
  { main: '#1E40AF', accent: '#E5E7EB' },  // royal blue top
  { main: '#115E59', accent: '#FAFAFA' },  // dark teal blazer
  { main: '#44403C', accent: '#FAFAFA' },  // warm grey suit
  { main: '#581C87', accent: '#E5E7EB' },  // deep purple
  { main: '#064E3B', accent: '#FCD34D' },  // forest blazer + gold
  { main: '#1C1917', accent: '#F97316' },  // black suit + orange tie
];

export default function Headshot({ seed = 0, active = false, label }) {
  const parts = useMemo(() => {
    const rng = seededRng(seed);
    const outfitIdx = Math.floor(rng() * OUTFITS.length);
    const colorSet = pick(OUTFIT_COLORS, rng);
    return {
      skin: pick(SKIN, rng),
      hair: pick(HAIR_COLORS, rng),
      hairStyle: Math.floor(rng() * HAIR_STYLES.length),
      outfitIdx,
      outfitColor: colorSet.main,
      accentColor: colorSet.accent,
      mouthWidth: 6 + rng() * 5,
      mouthCurve: 1 + rng() * 2.5,
    };
  }, [seed]);

  const { skin, hair, hairStyle, outfitIdx, outfitColor, accentColor, mouthWidth, mouthCurve } = parts;
  const mouthHalf = mouthWidth / 2;

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div
        className={`relative rounded-2xl p-1 transition-all duration-500 ${
          active ? 'ring-[3px] ring-[#FF9900] shadow-lg shadow-orange-200/60' : 'ring-transparent opacity-60'
        }`}
      >
        {active && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9900] opacity-60" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF9900]" />
          </span>
        )}

        <svg
          width="100"
          height="120"
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block"
        >
          {/* Neck — positioned to overlap both head and torso */}
          <rect x="42" y="58" width="16" height="20" rx="5" fill={skin} />

          {/* Shoulders / outfit — starts high enough to cover neck base */}
          {OUTFITS[outfitIdx](outfitColor, accentColor)}

          {/* Head */}
          <ellipse cx="50" cy="38" rx="24" ry="28" fill={skin} />

          {/* Hair */}
          {HAIR_STYLES[hairStyle](hair)}

          {/* Ears */}
          <ellipse cx="26" cy="40" rx="4" ry="6" fill={skin} />
          <ellipse cx="74" cy="40" rx="4" ry="6" fill={skin} />

          {/* Mouth */}
          <path
            d={`M${50 - mouthHalf} 50 Q50 ${50 + mouthCurve}, ${50 + mouthHalf} 50`}
            stroke="#9A7B6B"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
      <span className={`text-[10px] font-semibold tracking-wide uppercase transition-colors duration-300 ${
        active ? 'text-[#FF9900]' : 'text-gray-400'
      }`}>
        {label}
      </span>
    </div>
  );
}
