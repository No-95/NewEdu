'use client';

import React, { useEffect, useState } from 'react';

interface ImageCubeProps {
  images?: string[];
  size?: number;
  className?: string;
}

export const ImageCube: React.FC<ImageCubeProps> = ({
  images = [],
  size = 280,
  className = '',
}) => {
  const [currentFace, setCurrentFace] = useState(0);
  
  const faces = [
    { transform: 'rotateY(0deg)', label: 'Front' },
    { transform: 'rotateY(90deg)', label: 'Right' },
    { transform: 'rotateY(180deg)', label: 'Back' },
    { transform: 'rotateY(-90deg)', label: 'Left' },
  ];
  
  const handleHover = () => {
    setCurrentFace((prev) => (prev + 1) % 4);
  };

  // Auto-rotate cube every 5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setCurrentFace((prev) => (prev + 1) % 4);
    }, 5000);

    return () => clearInterval(id);
  }, []);
  
  const getRotation = () => {
    switch (currentFace) {
      case 0: return 'rotateY(0deg)';
      case 1: return 'rotateY(-90deg)';
      case 2: return 'rotateY(-180deg)';
      case 3: return 'rotateY(-270deg)';
      default: return 'rotateY(0deg)';
    }
  };
  
  const halfSize = size / 2;
  
  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        width: size, 
        height: size,
        perspective: '1000px',
      }}
      onMouseEnter={handleHover}
    >
      {/* Glow effect behind cube */}
      <div 
        className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl animate-pulse"
        style={{ transform: 'scale(1.2)' }}
      />
      
      {/* 3D Cube */}
      <div
        className="relative w-full h-full transition-transform duration-700 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: getRotation(),
        }}
      >
        {faces.map((face, index) => (
          <div
            key={index}
            className="absolute inset-0 border-2 border-primary/30 bg-card/80 backdrop-blur-sm rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
              transform: `${face.transform} translateZ(${halfSize}px)`,
              backfaceVisibility: 'hidden',
            }}
          >
            {images[index] ? (
              <img 
                src={images[index]} 
                alt={`Cube face ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
                <div className="w-20 h-20 border-2 border-dashed border-primary/40 rounded-xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground text-center">Image {index + 1}</span>
              </div>
            )}
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/50 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/50 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/50 rounded-br-2xl" />
          </div>
        ))}
      </div>
      
      {/* Face indicator dots */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {faces.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentFace(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentFace === index 
                ? 'bg-primary scale-125' 
                : 'bg-primary/30 hover:bg-primary/50'
            }`}
            aria-label={`View face ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
