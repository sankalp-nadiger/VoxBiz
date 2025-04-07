import React, { useState, useEffect, useRef } from 'react';

export const PreviewOption = ({ title, imageSrc }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);
  
  // Preload the image immediately on component mount
  useEffect(() => {
    const preloadImage = new Image();
    preloadImage.src = imageSrc;
    preloadImage.onload = () => setImageLoaded(true);
  }, [imageSrc]);
  
  return (
    <div className="flex flex-col items-center bg-gray-800 rounded-lg p-4 shadow-md relative">
      <span 
        className="text-blue-400 cursor-pointer relative z-10"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {title}
      </span>
      
      {imageLoaded && (
  <div 
    className={`fixed z-50 rounded shadow-lg transition-opacity duration-150 ${
      isHovering ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}
    style={{ 
      backgroundColor: '#1F2937',
      border: '1px solid #374151',
      top: '60%',
      left: '40%',
      transform: 'translate(-50%, -50%)',
      width: '50vw',
    }}
  >
    <img 
      ref={imgRef}
      src={imageSrc} 
      alt={`${title} preview`} 
      style={{
        width: '100%',         // fills container width now
        height: 'auto',        // keeps aspect ratio
        objectFit: 'cover',
        borderRadius: '0.25rem',
      }}
    />
  </div>
)}


    </div>
  );
};