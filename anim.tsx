import React, { useState, useEffect } from 'react';

const DNAEvolution = () => {
  const [generation, setGeneration] = useState(0);
  const [parentColors, setParentColors] = useState([
    { r: 255, g: 0, b: 0 },   // Red
    { r: 0, g: 0, b: 255 }    // Blue
  ]);

  // Blend colors with random weights
  const blendColors = (color1, color2) => {
    const weight = Math.random();
    return {
      r: Math.floor(color1.r * weight + color2.r * (1 - weight)),
      g: Math.floor(color1.g * weight + color2.g * (1 - weight)),
      b: Math.floor(color1.b * weight + color2.b * (1 - weight))
    };
  };

  // Generate next generation
  useEffect(() => {
    const interval = setInterval(() => {
      const [parent1, parent2] = parentColors;
      const child1 = blendColors(parent1, parent2);
      const child2 = blendColors(parent1, parent2);
      
      setParentColors([child1, child2]);
      setGeneration(prev => prev + 1);
    }, 3000); // New generation every 3 seconds

    return () => clearInterval(interval);
  }, [parentColors]);

  // Convert RGB to CSS color string
  const rgbToColor = (color) => `rgb(${color.r}, ${color.g}, ${color.b})`;

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#000',
      flexDirection: 'column'
    }}>
      <div style={{ 
        display: 'flex', 
        gap: '100px',
        marginBottom: '40px'
      }}>
        {parentColors.map((color, index) => (
          <DNAStructure 
            key={index} 
            color={rgbToColor(color)} 
            isAnimating={generation % 2 === 0} 
          />
        ))}
      </div>
      <div style={{ 
        color: 'white', 
        fontSize: '18px',
        marginTop: '20px'
      }}>
        Generation: {generation}
      </div>
    </div>
  );
};

// Single DNA helix component
const DNAStructure = ({ color, isAnimating }) => {
  return (
    <div style={{ 
      position: 'relative',
      width: '80px',
      height: '200px'
    }}>
      {/* Backbone */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '4px',
        height: '100%',
        backgroundColor: color,
        borderRadius: '2px'
      }}></div>
      
      {/* Base pairs */}
      {[...Array(10)].map((_, i) => (
        <div 
          key={i}
          style={{
            position: 'absolute',
            top: `${i * 20 + 10}px`,
            left: '50%',
            transform: `translateX(-50%) ${isAnimating ? 'scale(1)' : 'scale(0)'}`,
            width: '40px',
            height: '2px',
            backgroundColor: color,
            transition: 'transform 0.5s ease'
          }}
        ></div>
      ))}
      
      {/* Helix strands */}
      <div className="helix-strand" style={{
        left: '25%',
        borderColor: color,
        animation: isAnimating ? 'rotate 8s linear infinite' : 'none'
      }}></div>
      <div className="helix-strand" style={{
        right: '25%',
        borderColor: color,
        animation: isAnimating ? 'rotateReverse 8s linear infinite' : 'none'
      }}></div>
    </div>
  );
};

export default DNAEvolution;