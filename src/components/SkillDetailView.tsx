import { motion } from "motion/react";
import { X, ExternalLink, TrendingUp, TrendingDown, Minus, Shield, Handshake, Rocket } from "lucide-react";
import { useState } from "react";

interface AITool {
  name: string;
  description: string;
  launchDate: string;
  relevanceScore: number;
  website: string;
  threatLevel: 'low' | 'medium' | 'high';
}

interface Pathway {
  id: 'defend' | 'augment' | 'pivot';
  title: string;
  icon: React.ReactNode;
  description: string;
  strategy: string[];
}

interface SkillDetailViewProps {
  skill: {
    icon: string;
    text: string;
    risk: 'low' | 'medium' | 'high';
  };
  onClose: () => void;
}

const getRiskScore = (risk: 'low' | 'medium' | 'high'): number => {
  switch (risk) {
    case 'low': return 25;
    case 'medium': return 55;
    case 'high': return 85;
  }
};

const getRiskLabel = (risk: 'low' | 'medium' | 'high'): string => {
  switch (risk) {
    case 'low': return 'LOW RISK';
    case 'medium': return 'MEDIUM RISK';
    case 'high': return 'HIGH RISK';
  }
};

const getRiskColor = (risk: 'low' | 'medium' | 'high'): string => {
  switch (risk) {
    case 'low': return '#22c55e';
    case 'medium': return '#eab308';
    case 'high': return '#ef4444';
  }
};

const getGradientColor = (percentage: number): string => {
  if (percentage < 33) return '#22c55e';
  if (percentage < 66) return '#eab308';
  return '#ef4444';
};

// Mock AI tools data
const mockAITools: Record<string, AITool[]> = {
  'advanced python programming': [
    {
      name: 'GitHub Copilot',
      description: 'AI pair programmer that suggests code completions',
      launchDate: '2021-06',
      relevanceScore: 92,
      website: 'https://github.com/features/copilot',
      threatLevel: 'high'
    },
    {
      name: 'ChatGPT Code Interpreter',
      description: 'Executes and debugs Python code automatically',
      launchDate: '2023-07',
      relevanceScore: 88,
      website: 'https://openai.com/chatgpt',
      threatLevel: 'high'
    },
    {
      name: 'Cursor AI',
      description: 'AI-first code editor for faster development',
      launchDate: '2023-03',
      relevanceScore: 85,
      website: 'https://cursor.sh',
      threatLevel: 'high'
    }
  ],
  'default': [
    {
      name: 'Generic AI Assistant',
      description: 'Multi-purpose AI tool for various tasks',
      launchDate: '2023-01',
      relevanceScore: 70,
      website: 'https://example.com',
      threatLevel: 'medium'
    }
  ]
};

// Mock pathways data
const mockPathways: Pathway[] = [
  {
    id: 'defend',
    title: 'Defend',
    icon: <Shield className="w-6 h-6" />,
    description: 'Double down and specialize in areas AI struggles with',
    strategy: [
      'Focus on complex problem-solving that requires deep domain expertise',
      'Build interpersonal skills and stakeholder management',
      'Develop creative and strategic thinking capabilities',
      'Master edge cases and nuanced scenarios AI misses'
    ]
  },
  {
    id: 'augment',
    title: 'Augment',
    icon: <Handshake className="w-6 h-6" />,
    description: 'Learn to work WITH AI to amplify your capabilities',
    strategy: [
      'Master prompt engineering and AI tool orchestration',
      'Learn to review and refine AI-generated outputs',
      'Combine your expertise with AI speed and scale',
      'Build AI-enhanced workflows for 10x productivity'
    ]
  },
  {
    id: 'pivot',
    title: 'Pivot',
    icon: <Rocket className="w-6 h-6" />,
    description: 'Transition to adjacent roles with lower AI risk',
    strategy: [
      'Identify transferable skills in your current role',
      'Explore emerging roles created by AI disruption',
      'Build skills in AI-resistant areas like leadership',
      'Consider roles that leverage your unique background'
    ]
  }
];

export function SkillDetailView({ skill, onClose }: SkillDetailViewProps) {
  const [expandedPathway, setExpandedPathway] = useState<string | null>(null);
  
  const riskScore = getRiskScore(skill.risk);
  const riskColor = getRiskColor(skill.risk);
  const riskLabel = getRiskLabel(skill.risk);
  
  // Get AI tools for this skill or use default
  const aiTools = mockAITools[skill.text] || mockAITools['default'];
  
  // Calculate the circumference for the circular gauge
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1a1a1b] border-4 border-[#ff4500] pixelated-border max-w-6xl w-full max-h-[90vh] overflow-auto"
      >
        {/* Header */}
        <div className="border-b-4 border-[#343536] p-6 flex items-center justify-between sticky top-0 bg-[#1a1a1b] z-10">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{skill.icon}</span>
            <h2 className="pixel-text text-[#ff4500] text-lg">
              {skill.text.toUpperCase()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#d7dadc] hover:text-[#ff4500] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Risk Gauge Section */}
          <section>
            <h3 className="pixel-text text-white mb-6 text-center">
              AI REPLACEMENT RISK
            </h3>
            
            <div className="flex flex-col items-center gap-6">
              {/* Circular Gauge */}
              <div className="relative">
                <svg width="200" height="200" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    stroke="#343536"
                    strokeWidth="12"
                    fill="none"
                  />
                  
                  {/* Animated progress circle */}
                  <motion.circle
                    cx="100"
                    cy="100"
                    r={radius}
                    stroke={riskColor}
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="square"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{
                      strokeDasharray: circumference,
                    }}
                  />
                </svg>
                
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="pixel-text text-4xl" style={{ color: riskColor }}>
                    {riskScore}%
                  </div>
                  <div className="pixel-text text-[#d7dadc] mt-2" style={{ fontSize: '0.5rem' }}>
                    {riskLabel}
                  </div>
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="flex items-center gap-2 pixelated-border border-2 border-[#343536] bg-[#0a0a0a] px-4 py-2">
                <TrendingUp className="w-4 h-4 text-[#ef4444]" />
                <span className="pixel-text text-[#d7dadc]" style={{ fontSize: '0.5rem' }}>
                  RISK INCREASING
                </span>
              </div>
            </div>
          </section>

          {/* Current AI Tools Section */}
          <section>
            <h3 className="pixel-text text-white mb-6">
              CURRENT AI REPLACEMENT TOOLS
            </h3>
            
            <div className="space-y-4">
              {aiTools.map((tool, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="pixelated-border border-2 border-[#343536] bg-[#0a0a0a] p-4 hover:border-[#ff4500] transition-colors"
                >
                  <div className="flex items-center justify-between gap-6 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="pixel-text text-white" style={{ fontSize: '0.6rem' }}>
                          {tool.name}
                        </h4>
                        <a
                          href={tool.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ff4500] hover:text-[#ff5722] transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <p className="pixel-text text-[#d7dadc]" style={{ fontSize: '0.45rem', lineHeight: '1.6' }}>
                        {tool.description}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <div className="pixelated-border border-2 px-4 py-2 flex items-center justify-center" style={{
                        borderColor: getRiskColor(tool.threatLevel),
                        backgroundColor: `${getRiskColor(tool.threatLevel)}20`
                      }}>
                        <span className="pixel-text text-center whitespace-nowrap" style={{ 
                          fontSize: '0.55rem',
                          color: getRiskColor(tool.threatLevel),
                          lineHeight: '1.4'
                        }}>
                          {tool.threatLevel.toUpperCase()} THREAT
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[#d7dadc]">
                    <div className="flex items-center gap-2">
                      <span className="pixel-text" style={{ fontSize: '0.4rem' }}>
                        LAUNCHED: {tool.launchDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="pixel-text" style={{ fontSize: '0.4rem' }}>
                        RELEVANCE: {tool.relevanceScore}%
                      </span>
                      <div className="w-20 h-2 bg-[#343536] pixelated-border border border-[#343536]">
                        <div 
                          className="h-full bg-[#ff4500]"
                          style={{ width: `${tool.relevanceScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* AI Augmentation Pathways Section */}
          <section>
            <h3 className="pixel-text text-white mb-6">
              AI AUGMENTATION PATHWAYS
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockPathways.map((pathway, index) => (
                <motion.div
                  key={pathway.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="pixelated-border border-2 border-[#343536] bg-[#0a0a0a] p-4 hover:border-[#ff4500] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-[#ff4500]">
                      {pathway.icon}
                    </div>
                    <h4 className="pixel-text text-white" style={{ fontSize: '0.6rem' }}>
                      {pathway.title.toUpperCase()}
                    </h4>
                  </div>
                  
                  <p className="pixel-text text-[#d7dadc] mb-4" style={{ fontSize: '0.4rem', lineHeight: '1.6' }}>
                    {pathway.description}
                  </p>
                  
                  <button
                    onClick={() => setExpandedPathway(
                      expandedPathway === pathway.id ? null : pathway.id
                    )}
                    className="pixelated-border bg-transparent border-2 border-[#ff4500] text-[#ff4500] px-3 py-2 hover:bg-[#ff4500] hover:text-white transition-all pixel-text w-full"
                    style={{ fontSize: '0.45rem' }}
                  >
                    {expandedPathway === pathway.id ? 'HIDE DETAILS' : 'VIEW DETAILS'}
                  </button>
                  
                  {expandedPathway === pathway.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t-2 border-[#343536]"
                    >
                      <ul className="space-y-3">
                        {pathway.strategy.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#ff4500] flex-shrink-0" style={{ lineHeight: '1.6' }}>▸</span>
                            <span className="pixel-text text-[#d7dadc]" style={{ fontSize: '0.4rem', lineHeight: '1.6' }}>
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .pixel-text {
          font-family: 'Press Start 2P', cursive;
        }
        
        .pixelated-border {
          box-shadow: 
            2px 2px 0px rgba(0, 0, 0, 0.5);
          image-rendering: pixelated;
        }
      `}</style>
    </motion.div>
  );
}