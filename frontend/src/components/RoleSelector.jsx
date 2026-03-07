export default function RoleSelector({ onStart, loading }) {
  const roles = [
    'Software Engineer',
    'Frontend Engineer',
    'Backend Engineer',
    'Full Stack Engineer',
    'Data Engineer',
    'ML Engineer',
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">AI Interview Bot</h1>
        <p className="text-gray-500 text-center mb-8">
          Powered by Amazon Nova — practice real technical interviews.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => onStart(role)}
              disabled={loading}
              className="bg-white border border-gray-200 text-gray-800 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors duration-150 rounded-xl py-4 px-3 text-sm font-medium text-center shadow-sm"
            >
              {role}
            </button>
          ))}
        </div>

        {loading && (
          <p className="text-center text-gray-400 text-sm animate-pulse">Starting your interview…</p>
        )}
      </div>
    </div>
  );
}
