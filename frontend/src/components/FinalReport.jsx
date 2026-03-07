function ScoreBar({ label, score }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="capitalize text-gray-300">{label}</span>
        <span className="text-gray-400">{score}/5</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-gray-300">
          <span className="text-indigo-400 mt-0.5">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function FinalReport({ report, role, onRestart }) {
  if (!report) return null;

  const { overall_summary, scores, strengths, improvements, practice_plan } = report;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-1">Interview Complete</h2>
        <p className="text-center text-gray-400 text-sm mb-8">{role}</p>

        {overall_summary && (
          <div className="bg-gray-800 rounded-2xl p-5 mb-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-400 mb-2">
              Summary
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">{overall_summary}</p>
          </div>
        )}

        {scores && (
          <div className="bg-gray-800 rounded-2xl p-5 mb-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-400 mb-4">
              Scores
            </h3>
            {Object.entries(scores).map(([key, val]) => (
              <ScoreBar key={key} label={key} score={val} />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {strengths?.length > 0 && (
            <div className="bg-gray-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-green-400 mb-3">
                Strengths
              </h3>
              <BulletList items={strengths} />
            </div>
          )}

          {improvements?.length > 0 && (
            <div className="bg-gray-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-yellow-400 mb-3">
                Areas to Improve
              </h3>
              <BulletList items={improvements} />
            </div>
          )}
        </div>

        {practice_plan?.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-5 mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-400 mb-3">
              Practice Plan
            </h3>
            <BulletList items={practice_plan} />
          </div>
        )}

        <button
          onClick={onRestart}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl
                     font-medium transition-colors"
        >
          Start New Interview
        </button>
      </div>
    </div>
  );
}
