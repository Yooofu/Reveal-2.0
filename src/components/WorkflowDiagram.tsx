import { motion } from "motion/react";
import { User, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { SkillDetailView } from "./SkillDetailView";

interface Skill {
  icon: string;
  text: string;
  risk: 'low' | 'medium' | 'high';
}

interface WorkflowDiagramProps {
  skills: Skill[];
  userName?: string;
  onBack: () => void;
}

const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
  switch (risk) {
    case 'low':
      return '#22c55e';
    case 'medium':
      return '#eab308';
    case 'high':
      return '#ef4444';
  }
};

export function WorkflowDiagram({ skills, userName = "Your Profile", onBack }: WorkflowDiagramProps) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // Calculate positions for skills in a radial layout with proportional distribution
  // Use relative units that scale with viewport
  const radius = 380; // This will be scaled by SVG viewBox
  const centerX = 0;
  const centerY = 0;

  const skillPositions = skills.map((skill, index) => {
    // Ensure even distribution by starting at top and going clockwise
    const angle = (index / skills.length) * Math.PI * 2 - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    return { ...skill, x, y };
  });

  return (
    <div className="size-full bg-[#0a0a0a] overflow-hidden relative flex flex-col">
      {/* Pixelated grid background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Header */}
      <div className="relative z-10 p-4 sm:p-6 md:p-8 flex items-center justify-between border-b-2 border-[#343536]">
        <button
          onClick={onBack}
          className="pixelated-border bg-transparent border-2 border-[#343536] text-[#d7dadc] px-3 sm:px-4 py-1.5 sm:py-2 hover:border-[#ff4500] hover:text-[#ff4500] transition-colors pixel-text flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          Back
        </button>
        <h2 className="pixel-text text-[#ff4500] text-xs sm:text-sm md:text-base">
          SKILL MAP
        </h2>
        <div className="w-16 sm:w-20 md:w-24" /> {/* Spacer for alignment */}
      </div>

      {/* SVG Container for the diagram */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <svg
            className="w-full h-full"
            viewBox="-550 -450 1100 900"
            preserveAspectRatio="xMidYMid meet"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          >
            {/* Connection lines */}
            {skillPositions.map((skill, index) => (
              <motion.line
                key={`line-${index}`}
                x1={centerX}
                y1={centerY}
                x2={skill.x}
                y2={skill.y}
                stroke="#343536"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              />
            ))}

            {/* Center profile node */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <circle
                cx={centerX}
                cy={centerY}
                r="70"
                fill="#1a1a1b"
                stroke="#ff4500"
                strokeWidth="4"
              />
              <foreignObject
                x={centerX - 60}
                y={centerY - 60}
                width="120"
                height="120"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <User className="w-10 h-10 text-[#ff4500] mb-2" />
                  <div className="pixel-text text-white text-center" style={{ fontSize: '0.6rem' }}>
                    YOU
                  </div>
                </div>
              </foreignObject>
            </motion.g>

            {/* Skill nodes */}
            {skillPositions.map((skill, index) => {
              const riskColor = getRiskColor(skill.risk);
              return (
                <motion.g
                  key={`skill-${index}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                >
                  {/* Skill card background */}
                  <rect
                    x={skill.x - 90}
                    y={skill.y - 22}
                    width="180"
                    height="44"
                    fill="#1a1a1b"
                    stroke="#343536"
                    strokeWidth="2"
                    rx="4"
                  />
                  
                  {/* Risk indicator circle - moved to the right */}
                  <circle
                    cx={skill.x + 75}
                    cy={skill.y}
                    r="10"
                    fill={riskColor}
                    stroke={riskColor}
                    strokeWidth="2"
                  />
                  
                  {/* Inner circle for depth */}
                  <circle
                    cx={skill.x + 75}
                    cy={skill.y}
                    r="5"
                    fill="#1a1a1b"
                    opacity="0.5"
                  />

                  {/* Skill content */}
                  <foreignObject
                    x={skill.x - 85}
                    y={skill.y - 18}
                    width="155"
                    height="36"
                  >
                    <div className="flex flex-row items-center justify-start h-full px-3 gap-2">
                      <div className="text-xl flex-shrink-0">{skill.icon}</div>
                      <div className="pixel-text text-white" style={{ fontSize: '0.45rem', lineHeight: '1.3' }}>
                        {skill.text}
                      </div>
                    </div>
                  </foreignObject>

                  {/* Hover effect and click handler */}
                  <rect
                    x={skill.x - 90}
                    y={skill.y - 22}
                    width="180"
                    height="44"
                    fill="transparent"
                    stroke={riskColor}
                    strokeWidth="0"
                    rx="4"
                    className="hover-skill-node"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedSkill(skill)}
                  />
                </motion.g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="relative z-10 p-4 sm:p-6 md:p-8 border-t-2 border-[#343536] flex flex-wrap justify-center gap-4 sm:gap-8 md:gap-12">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#22c55e] flex-shrink-0" />
          <span className="pixel-text text-[#d7dadc]" style={{ fontSize: 'clamp(0.5rem, 1vw, 0.65rem)' }}>
            LOW RISK
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#eab308] flex-shrink-0" />
          <span className="pixel-text text-[#d7dadc]" style={{ fontSize: 'clamp(0.5rem, 1vw, 0.65rem)' }}>
            MEDIUM RISK
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#ef4444] flex-shrink-0" />
          <span className="pixel-text text-[#d7dadc]" style={{ fontSize: 'clamp(0.5rem, 1vw, 0.65rem)' }}>
            HIGH RISK
          </span>
        </div>
      </div>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <SkillDetailView 
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .pixel-text {
          font-family: 'Press Start 2P', cursive;
        }
        
        .hover-skill-node:hover {
          stroke-width: 2 !important;
        }
      `}</style>
    </div>
  );
}
