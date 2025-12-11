import React, { useMemo } from "react";
import { motion } from "framer-motion";

type DNAHelixSize = "sm" | "md" | "lg";
type DNAHelixProps = {
  className?: string;
  size?: DNAHelixSize;
  active?: boolean;
};

export default function DNAHelix({ className = "", size = "md" as DNAHelixSize, active = true }: DNAHelixProps) {
  const sizes: Record<DNAHelixSize, { width: number; height: number; beads: number }> = {
    sm: { width: 80, height: 70, beads: 5 },
    md: { width: 120, height: 100, beads: 6 },
    lg: { width: 160, height: 140, beads: 8 },
  };

  const { width, height, beads } = sizes[size];
  const cycle = 8; // seconds for full animation cycle

  // Only 4 colors available for all balls
  const colorPalette = ["#ef4444", "#22c55e", "#3b82f6", "#eab308"]; // red, green, blue, yellow

  // Track evolutionary generations
  const [generation, setGeneration] = React.useState(0);

  // Create parent DNA sequences using specific color patterns
  const createPatternedDNA = () => {
    // Color patterns: Blue-Yellow, Yellow-Blue, Green-Red, Red-Green
    const patterns = [
      { left: colorPalette[2], right: colorPalette[3] }, // Blue-Yellow
      { left: colorPalette[3], right: colorPalette[2] }, // Yellow-Blue
      { left: colorPalette[1], right: colorPalette[0] }, // Green-Red
      { left: colorPalette[0], right: colorPalette[1] }, // Red-Green
    ];

    const leftColors: string[] = [];
    const rightColors: string[] = [];

    for (let i = 0; i < beads; i++) {
      const pattern = patterns[i % patterns.length];
      leftColors.push(pattern.left);
      rightColors.push(pattern.right);
    }

    return { left: leftColors, right: rightColors };
  };

  // Crossover function: take half segments from each parent
  const crossover = (parentA: { left: string[]; right: string[] }, parentB: { left: string[]; right: string[] }) => {
    const halfPoint = Math.floor(beads / 2);
    return {
      left: [...parentA.left.slice(0, halfPoint), ...parentB.left.slice(halfPoint)],
      right: [...parentA.right.slice(0, halfPoint), ...parentB.right.slice(halfPoint)],
    };
  };

  // Mutate a DNA sequence by randomly changing a small number of segments to other palette colors
  const mutate = (dna: { left: string[]; right: string[] }, strength: number) => {
    const mutatedLeft = [...dna.left];
    const mutatedRight = [...dna.right];
    const changes = Math.max(1, Math.floor((beads * strength) / 100));
    for (let i = 0; i < changes; i++) {
      const idx = Math.floor(Math.random() * beads);
      mutatedLeft[idx] = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      const idxR = Math.floor(Math.random() * beads);
      mutatedRight[idxR] = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    }
    return { left: mutatedLeft, right: mutatedRight };
  };

  // Initial parent DNA sequences with specific color patterns
  const initialParentA = React.useMemo(() => createPatternedDNA(), []);
  const initialParentB = React.useMemo(() => {
    // Offset the pattern for variety: start with Yellow-Blue instead of Blue-Yellow
    const patterns = [
      { left: colorPalette[3], right: colorPalette[2] }, // Yellow-Blue (offset from parent A)
      { left: colorPalette[2], right: colorPalette[3] }, // Blue-Yellow
      { left: colorPalette[0], right: colorPalette[1] }, // Red-Green
      { left: colorPalette[1], right: colorPalette[0] }, // Green-Red
    ];

    const leftColors: string[] = [];
    const rightColors: string[] = [];

    for (let i = 0; i < beads; i++) {
      const pattern = patterns[i % patterns.length];
      leftColors.push(pattern.left);
      rightColors.push(pattern.right);
    }

    return { left: leftColors, right: rightColors };
  }, []);

  // Log colors of all balls
  const logBallColors = () => {
    console.log(`=== Generation ${generation} ===`);
    console.log(`Parent A (${beads * 2} balls):`);
    for (let i = 0; i < beads; i++) {
      console.log(`  Segment ${i}: Left=${currentParents.parentA.left[i]}, Right=${currentParents.parentA.right[i]}`);
    }
    console.log(`Parent B (${beads * 2} balls):`);
    for (let i = 0; i < beads; i++) {
      console.log(`  Segment ${i}: Left=${currentParents.parentB.left[i]}, Right=${currentParents.parentB.right[i]}`);
    }
    console.log(`Child A (${beads * 2} balls):`);
    for (let i = 0; i < beads; i++) {
      console.log(`  Segment ${i}: Left=${currentOffspring.child1.left[i]}, Right=${currentOffspring.child1.right[i]}`);
    }
    console.log(`Child B (${beads * 2} balls):`);
    for (let i = 0; i < beads; i++) {
      console.log(`  Segment ${i}: Left=${currentOffspring.child2.left[i]}, Right=${currentOffspring.child2.right[i]}`);
    }
    console.log('='.repeat(50));
  };

  // Current parent DNA sequences
  const [currentParents, setCurrentParents] = React.useState({
    parentA: initialParentA,
    parentB: initialParentB,
  });

  // Current offspring DNA sequences (created via crossover)
  const [currentOffspring, setCurrentOffspring] = React.useState(() => ({
    child1: crossover(initialParentA, initialParentB),
    child2: crossover(initialParentB, initialParentA), // Reverse crossover for variety
  }));

  // Log initial colors
  React.useEffect(() => {
    logBallColors();
  }, []);

  // Generate new offspring and evolve parents only when active
  React.useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setGeneration(prev => prev + 1);
      logBallColors();

      // Parents become the previous offspring
      setCurrentParents({
        parentA: currentOffspring.child1,
        parentB: currentOffspring.child2,
      });

      // Generate new offspring via crossover + light mutation for variety
      setCurrentOffspring({
        child1: mutate(crossover(currentParents.parentA, currentParents.parentB), 20),
        child2: mutate(crossover(currentParents.parentB, currentParents.parentA), 20),
      });
    }, cycle * 1000);

    return () => clearInterval(interval);
  }, [active, currentParents, currentOffspring]);

  // Reset to initial state when deactivated
  React.useEffect(() => {
    if (active) return;
    setGeneration(0);
    setCurrentParents({ parentA: initialParentA, parentB: initialParentB });
    setCurrentOffspring({
      child1: crossover(initialParentA, initialParentB),
      child2: crossover(initialParentB, initialParentA),
    });
  }, [active, initialParentA, initialParentB]);

  // Single DNA strand component
  const Strand = ({
    segmentColors,
    xStart,
    xEnd,
    opacity,
    delay = 0,
    repeat = true,
    isParent = false,
  }: {
    segmentColors: { left: string[]; right: string[] };
    xStart: number;
    xEnd: number;
    opacity: number[];
    delay?: number;
    repeat?: boolean;
    isParent?: boolean;
  }) => (
    <motion.div
      className="absolute top-0"
      initial={{ x: xStart, opacity: opacity[0] }}
      animate={{ x: xEnd, opacity }}
      transition={{
        duration: cycle,
        ease: "easeInOut",
        repeat: repeat ? Infinity : 0,
        delay,
      }}
    >
      {[...Array(beads)].map((_, i) => {
        const yPos = (i / (beads - 1)) * height;
        const phase = (i / beads) * Math.PI;
        const wobble = Math.sin(phase) * 4;

        return (
          <motion.div
            key={i}
            className="absolute flex items-center gap-1"
            style={{ top: yPos, left: wobble }}
            animate={{ x: [-wobble, wobble, -wobble] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          >
            {/* Left bead */}
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${segmentColors.left[i]}, ${segmentColors.left[i]}88, ${segmentColors.left[i]}44)`,
                boxShadow: `0 0 8px ${segmentColors.left[i]}66, inset -1px -1px 2px rgba(0,0,0,0.3)`,
              }}
            />
            {/* Connection line */}
            <div
              className="h-[2px] w-5"
              style={{
                background: `linear-gradient(to right, ${segmentColors.left[i]}88, ${segmentColors.right[i]}88)`,
              }}
            />
            {/* Right bead */}
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${segmentColors.right[i]}, ${segmentColors.right[i]}88, ${segmentColors.right[i]}44)`,
                boxShadow: `0 0 8px ${segmentColors.right[i]}66, inset -1px -1px 2px rgba(0,0,0,0.3)`,
              }}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );

  const centerX = width / 2 - 20;

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Fusion glow in center */}
      <motion.div
        className="absolute rounded-full blur-md"
        style={{
          left: "50%",
          top: "50%",
          width: 30,
          height: 30,
          marginLeft: -15,
          marginTop: -15,
          background: "radial-gradient(circle, rgba(168,85,247,0.4), rgba(20,184,166,0.3), transparent)",
        }}
        animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: cycle * 0.5, repeat: Infinity, delay: cycle * 0.2 }}
      />

      {/* Parent A - continuous cycle */}
      <Strand
        segmentColors={currentParents.parentA}
        xStart={0}
        xEnd={centerX - 15}
        opacity={[1, 1, 1, 1, 1]}
        delay={0}
        repeat={true}
        isParent={true}
      />

      {/* Parent B - continuous cycle */}
      <Strand
        segmentColors={currentParents.parentB}
        xStart={width - 40}
        xEnd={centerX + 15}
        opacity={[1, 1, 1, 1, 1]}
        delay={0}
        repeat={true}
        isParent={true}
      />

      {/* Child 1 - appears during crossover, stays */}
      <Strand
        segmentColors={currentOffspring.child1}
        xStart={centerX}
        xEnd={10}
        opacity={[0, 0, 1, 1, 1]}
        delay={0}
        repeat={true}
      />

      {/* Child 2 - appears during crossover, stays */}
      <Strand
        segmentColors={currentOffspring.child2}
        xStart={centerX}
        xEnd={width - 50}
        opacity={[0, 0, 1, 1, 1]}
        delay={0}
        repeat={true}
      />
    </div>
  );
}