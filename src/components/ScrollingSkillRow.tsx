interface ScrollingSkillRowProps {
  skills: Array<{ icon: string; text: string; risk: 'low' | 'medium' | 'high' }>;
  duration?: number;
  reverse?: boolean;
}

const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
  switch (risk) {
    case 'low':
      return {
        border: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.1)',
        text: '#22c55e',
      };
    case 'medium':
      return {
        border: '#eab308',
        bg: 'rgba(234, 179, 8, 0.1)',
        text: '#eab308',
      };
    case 'high':
      return {
        border: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.1)',
        text: '#ef4444',
      };
  }
};

const getRiskLabel = (risk: 'low' | 'medium' | 'high') => {
  switch (risk) {
    case 'low':
      return 'LOW RISK';
    case 'medium':
      return 'MEDIUM RISK';
    case 'high':
      return 'HIGH RISK';
  }
};

export function ScrollingSkillRow({ skills, duration = 40, reverse = false }: ScrollingSkillRowProps) {
  // Duplicate skills array to create seamless loop
  const duplicatedSkills = [...skills, ...skills];

  return (
    <div className="overflow-hidden w-full mb-2 sm:mb-3 md:mb-4">
      <div
        className="flex gap-2 sm:gap-2.5 md:gap-3 w-fit"
        style={{
          animation: `scroll ${duration}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {duplicatedSkills.map((skill, index) => {
          const colors = getRiskColor(skill.risk);
          return (
            <div
              key={index}
              className="pixelated-border bg-[#1a1a1b] border-2 border-[#343536] px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer flex-shrink-0 group relative overflow-visible"
              style={{ 
                imageRendering: 'pixelated',
              }}
            >
              <span className="text-base sm:text-lg md:text-xl">{skill.icon}</span>
              <span className="text-white pixel-text whitespace-nowrap">{skill.text}</span>
              
              {/* Hover overlay with risk color */}
              <div
                className="absolute inset-0 border-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.bg,
                }}
              />
              
              {/* Risk badge on hover */}
              <div
                className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all pixelated-border border-2 px-2 sm:px-3 py-0.5 sm:py-1 whitespace-nowrap pointer-events-none z-10"
                style={{
                  borderColor: colors.border,
                  backgroundColor: '#1a1a1b',
                  color: colors.text,
                  fontSize: 'clamp(0.4rem, 0.4vw + 0.25rem, 0.5rem)',
                  fontFamily: "'Press Start 2P', cursive",
                }}
              >
                {getRiskLabel(skill.risk)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
