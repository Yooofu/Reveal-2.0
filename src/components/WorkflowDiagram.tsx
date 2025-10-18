import { motion } from "motion/react";
import { User, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { SkillDetailView } from "./SkillDetailView";

interface Skill {
  icon: string;
  text: string;
  risk: 'low' | 'medium' | 'high';
  skillId?: string;
  riskScore?: number; // Actual risk score from database
  // Per-skill strategies
  defendStrategies?: string[];
  augmentStrategies?: string[];
  pivotStrategies?: string[];
}

interface WorkflowDiagramProps {
  skills: Skill[];
  analysis?: {
    recommendations?: string[];
    averageRiskScore?: number;
    overallRiskLevel?: string;
    defendStrategies?: string[];
    augmentStrategies?: string[];
    pivotStrategies?: string[];
  } | null;
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

export function WorkflowDiagram({ skills, analysis, onBack }: WorkflowDiagramProps) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate positions for skills filling the entire page
  // Leave space around the center circle
  const centerX = 0;
  const centerY = 0;
  const centerRadius = 70; // Radius of the center "YOU" circle
  const minDistanceFromCenter = 150; // Minimum distance from center circle
  const viewBoxWidth = 1100;
  const viewBoxHeight = 900;
  const padding = 100; // Padding from edges

  // Helper function to calculate line endpoint at circle edge
  const getLineEndPoint = (skillX: number, skillY: number) => {
    const angle = Math.atan2(skillY - centerY, skillX - centerX);
    return {
      x: centerX + centerRadius * Math.cos(angle),
      y: centerY + centerRadius * Math.sin(angle)
    };
  };

  // Generate positions that fill the page and avoid the center circle
  const generatePosition = (index: number, existingPositions: Array<{x: number, y: number}>) => {
    // Use golden ratio for natural distribution
    const goldenRatio = 1.618033988749895;
    const goldenAngle = Math.PI * 2 * goldenRatio;
    const minSkillDistance = 200; // Minimum distance between skills to prevent overlap
    
    let x: number = 0;
    let y: number = 0;
    let distanceFromCenter: number = 0;
    let attempts = 0;
    let tooClose = false;
    
    do {
      // Create well-distributed positions using golden angle
      const angle = (index * goldenAngle + attempts * 0.5) % (Math.PI * 2);
      const distance = minDistanceFromCenter + Math.sqrt((index + attempts * 7) / skills.length) * 420;
      
      // Convert polar to cartesian with reduced randomness for better spacing
      const randomOffset = ((index * 73 + attempts * 97) % 100) / 100;
      x = Math.cos(angle) * distance + (randomOffset - 0.5) * 40; // Reduced from 80
      y = Math.sin(angle) * distance * 0.85 + (randomOffset - 0.5) * 40; // Reduced from 80
      
      // Clamp to viewBox bounds
      x = Math.max(-viewBoxWidth/2 + padding, Math.min(viewBoxWidth/2 - padding, x));
      y = Math.max(-viewBoxHeight/2 + padding, Math.min(viewBoxHeight/2 - padding, y));
      
      distanceFromCenter = Math.sqrt(x * x + y * y);
      
      // Check distance from existing positions to avoid overlaps
      tooClose = existingPositions.some(pos => {
        const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
        return dist < minSkillDistance;
      });
      
      attempts++;
    } while ((distanceFromCenter < minDistanceFromCenter || tooClose) && attempts < 100);
    
    return { x, y };
  };

  // Generate positions with collision detection
  const skillPositions: Array<typeof skills[0] & {x: number, y: number, index: number}> = [];
  for (let index = 0; index < skills.length; index++) {
    const existingPositions = skillPositions.map(s => ({x: s.x, y: s.y}));
    const { x, y } = generatePosition(index, existingPositions);
    skillPositions.push({ ...skills[index], x, y, index });
  }

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
        {/* Back Button */}
        <button
          onClick={onBack}
          className="pixelated-border bg-[#1a1a1b] border-2 border-[#343536] text-[#d7dadc] px-3 sm:px-4 py-1.5 sm:py-2 hover:border-[#ff4500] hover:text-[#ff4500] transition-colors pixel-text flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          Back
        </button>
        
        <h2 className="pixel-text text-[#ff4500] text-xs sm:text-sm md:text-base">
          SKILL MAP
        </h2>
        
        {/* Spacer to keep title centered */}
        <div className="w-[72px] sm:w-[88px]"></div>
      </div>

      {/* Empty State - when no skills found */}
      {skills.length === 0 && (
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="pixel-text text-[#ff4500] text-base mb-4">No Skills Detected</h3>
            <p className="pixel-text text-[#d7dadc] text-xs leading-relaxed mb-6">
              We couldn't identify any skills from your resume. Please make sure your resume contains information about your experience, education, skills, or projects.
            </p>
            <button
              onClick={onBack}
              className="pixelated-border bg-[#ff4500] border-2 border-[#ff4500] text-white px-4 py-2 hover:bg-[#ff5722] hover:border-[#ff5722] transition-colors pixel-text text-xs"
            >
              Try Another Resume
            </button>
          </div>
        </div>
      )}

      {/* SVG Container for the diagram */}
      {skills.length > 0 && (
        <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <svg
            className="w-full h-full"
            viewBox="-550 -450 1100 900"
            preserveAspectRatio="xMidYMid meet"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          >
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

            {/* Skill nodes with their connection lines - non-hovered first */}
            {skillPositions.map((skill, index) => {
              if (hoveredIndex === index) return null;
              const riskColor = getRiskColor(skill.risk);
              const animationDelay = 0.5 + (index * 0.05); // Staggered animation
              const lineEnd = getLineEndPoint(skill.x, skill.y);
              
              return (
                <g
                  key={`skill-group-${index}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Connection line for this skill */}
                  <motion.line
                    x1={lineEnd.x}
                    y1={lineEnd.y}
                    x2={skill.x}
                    y2={skill.y}
                    stroke="#343536"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                      pathLength: 1, 
                      opacity: 0.3
                    }}
                    transition={{ duration: 0.4, delay: animationDelay }}
                  />
                  
                  {/* Skill tag */}
                  <motion.g
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: animationDelay }}
                  >
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
                    <circle
                      cx={skill.x + 75}
                      cy={skill.y}
                      r="10"
                      fill={riskColor}
                      stroke={riskColor}
                      strokeWidth="2"
                    />
                    <circle
                      cx={skill.x + 75}
                      cy={skill.y}
                      r="5"
                      fill="#1a1a1b"
                      opacity="0.5"
                    />
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
                  </motion.g>
                  <rect
                    x={skill.x - 90}
                    y={skill.y - 22}
                    width="180"
                    height="44"
                    fill="transparent"
                    stroke="transparent"
                    strokeWidth="0"
                    rx="4"
                    onClick={() => setSelectedSkill(skill)}
                  />
                </g>
              );
            })}

            {/* Hovered skill with highlighted line - rendered last for z-index */}
            {hoveredIndex !== null && (() => {
              const skill = skillPositions[hoveredIndex];
              const riskColor = getRiskColor(skill.risk);
              const lineEnd = getLineEndPoint(skill.x, skill.y);
              
              return (
                <g
                  key={`skill-hovered-group-${hoveredIndex}`}
                  onMouseEnter={() => setHoveredIndex(hoveredIndex)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Highlighted connection line for hovered skill */}
                  <motion.line
                    x1={lineEnd.x}
                    y1={lineEnd.y}
                    x2={skill.x}
                    y2={skill.y}
                    stroke={riskColor}
                    strokeWidth="3"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 1, opacity: 0.3 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  />
                  
                  <motion.g
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.15 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    {/* Glow effect for hovered skill */}
                    <rect
                      x={skill.x - 90}
                      y={skill.y - 22}
                      width="180"
                      height="44"
                      fill={riskColor}
                      opacity="0.15"
                      rx="4"
                      filter="blur(8px)"
                    />
                    <rect
                      x={skill.x - 90}
                      y={skill.y - 22}
                      width="180"
                      height="44"
                      fill="#1a1a1b"
                      stroke={riskColor}
                      strokeWidth="3"
                      rx="4"
                    />
                    <circle
                      cx={skill.x + 75}
                      cy={skill.y}
                      r="12"
                      fill={riskColor}
                      opacity="0.3"
                      filter="blur(4px)"
                    />
                    <circle
                      cx={skill.x + 75}
                      cy={skill.y}
                      r="10"
                      fill={riskColor}
                      stroke={riskColor}
                      strokeWidth="2"
                    />
                    <circle
                      cx={skill.x + 75}
                      cy={skill.y}
                      r="5"
                      fill="#1a1a1b"
                      opacity="0.5"
                    />
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
                  </motion.g>
                  <rect
                    x={skill.x - 90}
                    y={skill.y - 22}
                    width="180"
                    height="44"
                    fill="transparent"
                    stroke="transparent"
                    strokeWidth="0"
                    rx="4"
                    onClick={() => setSelectedSkill(skill)}
                  />
                </g>
              );
            })()}
          </svg>
        </div>
      </div>
      )}

      {/* Legend - only show when there are skills */}
      {skills.length > 0 && (
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
      )}

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <SkillDetailView 
          skill={selectedSkill}
          analysis={analysis}
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
