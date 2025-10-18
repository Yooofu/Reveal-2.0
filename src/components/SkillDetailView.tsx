import { motion } from "motion/react";
import { X, ExternalLink, TrendingUp, TrendingDown, Shield, Handshake, Rocket } from "lucide-react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

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
    skillId?: string;
    riskScore?: number;
    // Per-skill strategies from database
    defendStrategies?: string[];
    augmentStrategies?: string[];
    pivotStrategies?: string[];
  };
  analysis?: {
    recommendations?: string[];
    defendStrategies?: string[];
    augmentStrategies?: string[];
    pivotStrategies?: string[];
  } | null;
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

const getRiskMessage = (risk: 'low' | 'medium' | 'high'): string => {
  switch (risk) {
    case 'low': return 'You Safe, You Good, You Lucky';
    case 'medium': return 'You better hurry, you might be next';
    case 'high': return "I'm COOOOOOKKKKK lahhhh";
  }
};

// Default pathways structure - strategies come from database analysis
const defaultPathwayDescriptions = [
  {
    id: 'defend' as const,
    title: 'Defend',
    icon: <Shield className="w-6 h-6" />,
    description: 'Double down and specialize in areas AI struggles with',
  },
  {
    id: 'augment' as const,
    title: 'Augment',
    icon: <Handshake className="w-6 h-6" />,
    description: 'Learn to work WITH AI to amplify your capabilities',
  },
  {
    id: 'pivot' as const,
    title: 'Pivot',
    icon: <Rocket className="w-6 h-6" />,
    description: 'Transition to adjacent roles with lower AI risk',
  }
];

export function SkillDetailView({ skill, analysis, onClose }: SkillDetailViewProps) {
  const [expandedPathway, setExpandedPathway] = useState<string | null>(null);
  
  // Use actual risk score from database if available, otherwise use fallback based on risk level
  const riskScore = skill.riskScore ?? getRiskScore(skill.risk);
  const riskColor = getRiskColor(skill.risk);
  const riskLabel = getRiskLabel(skill.risk);
  
  // Use AI-generated pathways from SKILL-SPECIFIC database strategies
  // Fallback to analysis-level strategies for backward compatibility
  const pathways: Pathway[] = defaultPathwayDescriptions.map(pathway => ({
    ...pathway,
    strategy: skill[`${pathway.id}Strategies`] || analysis?.[`${pathway.id}Strategies`] || []
  }));
  
  // Debug: Log if we're using skill-specific or fallback strategies
  const hasSkillStrategies = skill.defendStrategies || skill.augmentStrategies || skill.pivotStrategies;
  if (hasSkillStrategies) {
    console.log(`✅ Using skill-specific strategies for: ${skill.text}`);
  } else if (analysis) {
    console.log(`⚠️ Falling back to resume-level strategies for: ${skill.text}`);
  }
  
  // Query real AI tools from database - NO MOCK DATA
  const dbAITools = useQuery(
    api.controllers.aiToolController.getAIToolsForSkill,
    skill.skillId ? { skillId: skill.skillId as any } : "skip"
  );
  
  // Check if query is still loading
  const isLoadingTools = dbAITools === undefined;
  
  // Convert database AI tools to component format
  const aiTools: AITool[] = dbAITools?.map(tool => ({
    name: tool.name,
    description: tool.description,
    launchDate: tool.createdAt ? new Date(tool.createdAt).toISOString().slice(0, 7) : '2024-01',
    relevanceScore: 85, // Could be calculated based on capabilities match
    website: tool.homepageUrl || tool.documentationUrl || '#',
    threatLevel: (skill.risk || 'medium') as 'low' | 'medium' | 'high',
  })) || [];
  
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

              {/* Risk Message */}
              <div className="flex items-center gap-2 pixelated-border border-2 px-6 py-2" style={{
                borderColor: riskColor,
                backgroundColor: `${riskColor}20`
              }}>
                {skill.risk === 'low' && <TrendingDown className="w-4 h-4" style={{ color: riskColor }} />}
                {skill.risk === 'medium' && <TrendingUp className="w-4 h-4" style={{ color: riskColor }} />}
                {skill.risk === 'high' && <TrendingUp className="w-4 h-4" style={{ color: riskColor }} />}
                <span className="pixel-text" style={{ fontSize: '0.5rem', color: riskColor }}>
                  {getRiskMessage(skill.risk)}
                </span>
              </div>
            </div>
          </section>

          {/* Current AI Tools Section */}
          <section>
            <h3 className="pixel-text text-white mb-6">
              CURRENT AI REPLACEMENT TOOLS
            </h3>
            
            {isLoadingTools ? (
              <div className="text-center py-8">
                <div className="pixel-text text-[#ff4500]" style={{ fontSize: '0.5rem' }}>
                  Loading AI tools...
                </div>
              </div>
            ) : aiTools.length === 0 ? (
              <div className="pixelated-border border-2 border-[#343536] bg-[#0a0a0a] p-6 text-center">
                <div className="pixel-text text-[#d7dadc] mb-2" style={{ fontSize: '0.5rem' }}>
                  No AI tools discovered yet for this skill
                </div>
                <div className="pixel-text text-[#808080]" style={{ fontSize: '0.4rem', lineHeight: '1.6' }}>
                  AI tools will be discovered by Exa when you upload a resume
                </div>
              </div>
            ) : (
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
            )}
          </section>

          {/* AI Augmentation Pathways Section */}
          <section>
            <h3 className="pixel-text text-white mb-6">
              AI AUGMENTATION PATHWAYS
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pathways.map((pathway, index) => (
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
                      {pathway.strategy.length === 0 ? (
                        <div className="text-center py-4">
                          <div className="pixel-text text-[#808080]" style={{ fontSize: '0.4rem', lineHeight: '1.6' }}>
                            No personalized strategies yet. Upload your resume to get AI-powered career recommendations tailored to your skills.
                          </div>
                        </div>
                      ) : (
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
                      )}
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