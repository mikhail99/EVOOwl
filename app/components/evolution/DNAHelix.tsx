import React from 'react';
import { motion } from 'framer-motion';

export default function DNAHelix({ className = "", size = "md" }) {
    const sizes = {
        sm: { width: 24, height: 48, strands: 4 },
        md: { width: 40, height: 80, strands: 6 },
        lg: { width: 60, height: 120, strands: 8 }
    };

    const { width, height, strands } = sizes[size];

    return (
        <div className={`relative ${className}`} style={{ width, height }}>
            {[...Array(strands)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute left-1/2 w-full"
                    style={{ top: `${(i / strands) * 100}%` }}
                    animate={{
                        x: ["-50%", "-30%", "-50%", "-70%", "-50%"],
                        scale: [1, 1.1, 1, 0.9, 1],
                    }}
                    transition={{
                        duration: 2,
                        delay: i * 0.15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <div className="flex items-center justify-center gap-1">
                        <motion.div
                            className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
                        />
                        <div className="h-px w-4 bg-gradient-to-r from-violet-500/50 to-teal-400/50" />
                        <motion.div
                            className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500"
                            animate={{ scale: [1, 0.7, 1] }}
                            transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}