// MingleLoader - Dark theme with brand purple

export default function MingleLoader() {
  return (
    <div className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center z-[9999]">
      <div className="flex flex-col items-center">
        {/* M Logo - Large */}
        <div className="w-24 h-24 mb-6 animate-pulse">
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center shadow-2xl shadow-[#7C3AED]/30">
            <span className="text-5xl font-bold text-white">
              M
            </span>
          </div>
        </div>
        
        {/* Loading dots */}
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-[#7C3AED] rounded-full animate-pulse"
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
