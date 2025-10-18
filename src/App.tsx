import { useState, useEffect, useRef } from "react";
import { ScrollingSkillRow } from "./components/ScrollingSkillRow";
import { ResumeUploadModal } from "./components/ResumeUploadModal";
import { WorkflowDiagram } from "./components/WorkflowDiagram";
import { ChevronRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

const skillsRow1 = [
  { icon: "💻", text: "advanced python programming", risk: "high" as const },
  { icon: "🎨", text: "ui/ux design principles", risk: "medium" as const },
  { icon: "🔧", text: "system architecture", risk: "medium" as const },
  { icon: "📊", text: "data visualization techniques", risk: "high" as const },
  { icon: "🚀", text: "react performance optimization", risk: "high" as const },
  { icon: "🎯", text: "product management basics", risk: "low" as const },
];

const skillsRow2 = [
  { icon: "📱", text: "mobile app development", risk: "high" as const },
  { icon: "🎮", text: "game development fundamentals", risk: "medium" as const },
  { icon: "🔐", text: "cybersecurity best practices", risk: "medium" as const },
  { icon: "🤖", text: "machine learning algorithms", risk: "high" as const },
  { icon: "📝", text: "technical writing skills", risk: "high" as const },
  { icon: "🎵", text: "audio engineering basics", risk: "medium" as const },
];

const skillsRow3 = [
  { icon: "💡", text: "creative problem solving", risk: "low" as const },
  { icon: "🌐", text: "web3 and blockchain", risk: "medium" as const },
  { icon: "📈", text: "growth hacking strategies", risk: "medium" as const },
  { icon: "🎭", text: "public speaking confidence", risk: "low" as const },
  { icon: "🔬", text: "scientific research methods", risk: "medium" as const },
  { icon: "✨", text: "animation and motion design", risk: "medium" as const },
];

const skillsRow4 = [
  { icon: "🎪", text: "event planning mastery", risk: "low" as const },
  { icon: "🔮", text: "future trend forecasting", risk: "medium" as const },
  { icon: "🎬", text: "video editing techniques", risk: "high" as const },
  { icon: "📸", text: "professional photography", risk: "medium" as const },
  { icon: "🛠️", text: "devops and ci/cd", risk: "high" as const },
  { icon: "🌟", text: "personal branding strategies", risk: "low" as const },
];

// Helper function to map category to icon
function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    programming: "💻",
    framework: "⚡",
    backend: "🔧",
    database: "💾",
    tool: "🛠️",
    cloud: "☁️",
    devops: "🚀",
    architecture: "🏗️",
    frontend: "🎨",
    mobile: "📱",
  };
  return iconMap[category.toLowerCase()] || "📦";
}

// No mock data - all data comes from database after resume upload

export default function App() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const hasLoggedSkills = useRef(false);

  // Fetch analysis for the specific resume that was uploaded
  const analysisData = useQuery(
    api.controllers.analysisController.getAnalysisWithSkills,
    currentResumeId ? { resumeId: currentResumeId as any } : "skip"
  );

  const handleAnalysisComplete = (resumeId: string) => {
    setCurrentResumeId(resumeId);
    setShowWorkflow(true);
    hasLoggedSkills.current = false; // Reset for new resume
  };

  const handleBackToLanding = () => {
    setShowWorkflow(false);
    // Keep the resumeId so they can come back to their results
  };

  // Debug logging - only once when data is first loaded
  useEffect(() => {
    if (analysisData && analysisData.skills && analysisData.skills.length > 0 && !hasLoggedSkills.current) {
      hasLoggedSkills.current = true;
      console.log(`✅ Loaded ${analysisData.skills.length} skills with per-skill strategies`);
      console.log('Sample skill strategies:', {
        skill: analysisData.skills[0].skillName,
        defend: analysisData.skills[0].defendStrategies?.slice(0, 1),
        augment: analysisData.skills[0].augmentStrategies?.slice(0, 1),
        pivot: analysisData.skills[0].pivotStrategies?.slice(0, 1),
      });
    }
  }, [analysisData]);

  if (showWorkflow) {
    // Convert skills from database format to WorkflowDiagram format
    // Now each skill includes its OWN unique strategies
    const skills = analysisData?.skills.map(skill => ({
      icon: skill.icon || getCategoryIcon(skill.category || ""),
      text: skill.skillName || skill.name || "",
      risk: (skill.riskLevel || "medium") as "low" | "medium" | "high",
      skillId: skill.skillId,
      riskScore: skill.riskScore, // Pass actual risk score from database
      // Pass skill-specific strategies
      defendStrategies: skill.defendStrategies || [],
      augmentStrategies: skill.augmentStrategies || [],
      pivotStrategies: skill.pivotStrategies || [],
    })) || [];

    // Show workflow when we have analysis data (even if no skills found)
    // WorkflowDiagram has empty state UI for zero skills
    if (analysisData) {
      return (
        <WorkflowDiagram 
          skills={skills}
          analysis={analysisData?.analysis}
          onBack={handleBackToLanding}
        />
      );
    }
  }

  return (
    <div className="h-full w-full bg-[#0a0a0a] relative overflow-hidden">
      {/* Pixelated grid background */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '20px 20px',
          backgroundColor: '#0a0a0a',
        }}
      />

      {/* Body - Flex container with centering */}
      <div className="h-full w-full flex items-center justify-center py-12 sm:py-16 md:py-20">
        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center max-w-6xl w-full px-4 sm:px-6 md:px-8">
          <h1 className="pixel-heading mb-3 sm:mb-4 text-center tracking-wider">
            Reveal
          </h1>
          
          <p className="text-[#d7dadc] text-center max-w-2xl mb-6 sm:mb-8 pixel-text">
            You vs AI – see where you stand
          </p>

          {/* Scrolling skill tags */}
          <div className="w-full mb-6 sm:mb-8 overflow-hidden">
            <ScrollingSkillRow skills={skillsRow1} duration={35} />
            <ScrollingSkillRow skills={skillsRow2} duration={40} reverse />
            <ScrollingSkillRow skills={skillsRow3} duration={38} />
            <ScrollingSkillRow skills={skillsRow4} duration={42} reverse />
          </div>

          <div className="w-full flex justify-center mt-8 sm:mt-12">
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="pixelated-border bg-transparent border-2 border-[#ff4500] text-[#ff4500] px-4 sm:px-5 md:px-5 py-2 sm:py-2.5 md:py-3 hover:bg-[#ff4500] hover:text-white transition-all flex items-center gap-2 pixel-text"
            >
              Start Now
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Resume Upload Modal */}
          <ResumeUploadModal 
            open={isUploadModalOpen} 
            onOpenChange={setIsUploadModalOpen}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .pixel-heading {
          font-family: 'Press Start 2P', cursive;
          font-size: clamp(1.5rem, 5vw + 1rem, 4rem);
          color: #ff4500;
          text-shadow: 
            clamp(2px, 0.4vw, 4px) clamp(2px, 0.4vw, 4px) 0px rgba(0, 0, 0, 0.8),
            clamp(4px, 0.8vw, 8px) clamp(4px, 0.8vw, 8px) 0px rgba(255, 69, 0, 0.3);
          image-rendering: pixelated;
        }
        
        .pixel-text {
          font-family: 'Press Start 2P', cursive;
          font-size: clamp(0.45rem, 0.5vw + 0.3rem, 0.65rem);
          line-height: 1.8;
        }

        .pixelated-border {
          box-shadow: 
            2px 2px 0px rgba(0, 0, 0, 0.5);
          image-rendering: pixelated;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 640px) {
          .pixel-text {
            line-height: 1.6;
          }
        }
      `}</style>
    </div>
  );
}