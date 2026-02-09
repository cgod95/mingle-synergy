// Tinder-style Loading Spinner for App Initialization

export default function MingleLoader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center z-[9999]">
      <div className="flex flex-col items-center">
        {/* M Logo - Large */}
        <div className="w-24 h-24 mb-6 animate-pulse">
          <div className="w-full h-full rounded-2xl bg-neutral-800 flex items-center justify-center shadow-2xl border border-neutral-700">
            <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              M
            </span>
          </div>
        </div>
        
        {/* Loading dots */}
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-white rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '0.8s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}






