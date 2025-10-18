import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface SkillTagProps {
  icon: string;
  text: string;
  delay: number;
  bounds?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

export function SkillTag({ icon, text, delay, bounds }: SkillTagProps) {
  const defaultBounds = {
    minX: 0,
    maxX: typeof window !== 'undefined' ? window.innerWidth - 300 : 1000,
    minY: 0,
    maxY: 600,
  };

  const activeBounds = bounds || defaultBounds;

  // Fixed Y position (random within small range for visual interest)
  const [initialY] = useState(
    activeBounds.minY + Math.random() * (activeBounds.maxY - activeBounds.minY)
  );

  const getRandomX = () => 
    activeBounds.minX + Math.random() * (activeBounds.maxX - activeBounds.minX);

  const [positionX, setPositionX] = useState(getRandomX);

  useEffect(() => {
    const interval = setInterval(() => {
      setPositionX(getRandomX());
    }, 8000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: positionX,
        y: initialY,
      }}
      transition={{ 
        duration: 0.5, 
        delay,
        x: { duration: 3, ease: "easeInOut" },
      }}
      className="absolute pixelated-border bg-[#1a1a1b] border-2 border-[#343536] px-4 py-2 flex items-center gap-2 hover:border-[#ff4500] transition-colors cursor-pointer pointer-events-auto"
      style={{
        imageRendering: 'pixelated',
      }}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-white pixel-text whitespace-nowrap">{text}</span>
    </motion.div>
  );
}
