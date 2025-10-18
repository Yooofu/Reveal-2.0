import React, { useState } from "react";
import { ScrollingSkillRow } from "./components/ScrollingSkillRow";
import { ResumeUploadModal } from "./components/ResumeUploadModal";
import { WorkflowDiagram } from "./components/WorkflowDiagram";
import { ChevronRight } from "lucide-react";

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

// Mock extracted skills - would come from AI analysis in production
const extractedSkills = [
  { icon: "💻", text: "advanced python programming", risk: "high" as const },
  { icon: "🎨", text: "ui/ux design principles", risk: "medium" as const },
  { icon: "🔧", text: "system architecture", risk: "medium" as const },
  { icon: "📊", text: "data visualization", risk: "high" as const },
  { icon: "🚀", text: "react optimization", risk: "high" as const },
  { icon: "🎯", text: "product management", risk: "low" as const },
  { icon: "🤖", text: "machine learning", risk: "high" as const },
  { icon: "📝", text: "technical writing", risk: "high" as const },
  { icon: "💡", text: "creative problem solving", risk: "low" as const },
  { icon: "🎭", text: "public speaking", risk: "low" as const },
  { icon: "📈", text: "growth strategies", risk: "medium" as const },
  { icon: "🔐", text: "cybersecurity", risk: "medium" as const },
];

export default function App() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);

  const handleAnalysisComplete = () => {
    setShowWorkflow(true);
  };

  const handleBackToLanding = () => {
    setShowWorkflow(false);
  };

  if (showWorkflow) {
    return (
      <WorkflowDiagram 
        skills={extractedSkills}
        onBack={handleBackToLanding}
      />
    );
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
      <div className="h-full w-full flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center max-w-6xl w-full px-4 sm:px-6 md:px-8">
          <h1 className="pixel-heading mb-4 sm:mb-6 md:mb-8 text-center tracking-wider">
            Reveal
          </h1>
          
          <p className="text-[#d7dadc] text-center max-w-2xl mb-8 sm:mb-12 md:mb-16 pixel-text">
            You vs AI – see where you stand
          </p>

          {/* Scrolling skill tags */}
          <div className="w-full mb-8 sm:mb-12 md:mb-16 overflow-hidden">
            <ScrollingSkillRow skills={skillsRow1} duration={35} />
            <ScrollingSkillRow skills={skillsRow2} duration={40} reverse />
            <ScrollingSkillRow skills={skillsRow3} duration={38} />
            <ScrollingSkillRow skills={skillsRow4} duration={42} reverse />
          </div>

          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="pixelated-border bg-transparent border-2 border-[#ff4500] text-[#ff4500] px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 hover:bg-[#ff4500] hover:text-white transition-all flex items-center gap-2 pixel-text"
          >
            Start Now
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>

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