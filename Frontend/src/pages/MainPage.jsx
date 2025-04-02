"use client";

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from "motion/react";
import { FlipWords } from "../components/ui/flip-words";
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import Navbar from '../components/Navbar';

export function MainPage() {
  const navigate = useNavigate();
  const features = [
    "AI-powered",
    "Collaborative",
    "Real-time",
    "Multilingual",
    "Intuitive"
  ];
  
  // Languages with their native scripts
  const languages = [
    { name: "English", native: "English" },
    { name: "Hindi", native: "हिन्दी" },
    { name: "Kannada", native: "ಕನ್ನಡ" },
    { name: "Tamil", native: "தமிழ்" },
    { name: "Telugu", native: "తెలుగు" },
    { name: "Malayalam", native: "മലയാളം" }
  ];
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);
  const scrollToDemo = () => {
    // Find the demo element and scroll to it
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const handleButtonClick = () => {
    setShowVideo(true);
    // Wait for state update and DOM to render before playing
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
      }
    }, 100);
  };
  
  // Handle visibility change
  const handleVisibilityChange = (isVisible) => {
    if (videoRef.current) {
      if (isVisible) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };
  React.useEffect(() => {
    const handleScroll = () => {
      // Calculate which viewport (page) the user is on
      const viewportIndex = Math.floor(window.scrollY / window.innerHeight);
      // Rotate the background 0° on even viewports and 180° on odd viewports
      setRotation(viewportIndex % 2 === 0 ? 0 : 180);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // For FlipWords component, we need just the native scripts
  const nativeScripts = languages.map(lang => lang.native);
  const [rotation, setRotation] = React.useState(0);

  // Ref for query animation section
  const queryAnimationRef = useRef(null);
  
  // Sample queries for visualization
  const queries = [
    "SELECT * FROM speech WHERE language='Kannada' AND confidence > 0.8",
    "ANALYZE sentiment GROUPBY speaker ORDER BY positivity DESC",
    "VISUALIZE word_frequency ACROSS languages LIMIT 15"
  ];

  return (
    <div className="w-screen overflow-x-hidden mx-auto my-10 flex flex-col items-center justify-center">
           <Navbar />
    {/* Background image container */}
    <div
  className="fixed inset-0 -z-10"
  style={{
    backgroundImage: 'url("/main-page-bg.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transform: `rotate(${rotation}deg) scale(0.95)`, // zoom out a bit with scale
    opacity: 0.7,
    transition: 'transform 0.5s ease'
  }}
/>

 
      <div className="absolute overflow-hidden inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="px-4 py-10 md:py-20">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
          {"Transform Speech into Visual Data".split(" ").map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: "easeInOut",
              }}
              className="mr-2 inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <div className="relative z-10 mx-auto max-w-2xl py-8 text-center text-2xl font-normal text-neutral-600 dark:text-neutral-400">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center"
          >
            Your <FlipWords words={features} />visualization platform
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="relative z-10 mx-auto max-w-2xl py-4 text-center text-xl font-normal text-neutral-600 dark:text-neutral-400"
        >
          <div className="flex flex-wrap items-center justify-center">
            Supporting <FlipWords words={nativeScripts} /> and more
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1.5 }}
          className="relative z-10 mx-auto max-w-xl py-6 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
        >
          Convert spoken words into dynamic visualizations instantly. Our platform understands multiple languages and creates meaningful visual representations in real-time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1.8 }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <button 
  className="w-60 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-wite dark:hover:bg-gray-200"
  onClick={() => navigate('/dblist')}
>
  Start Visualizing
</button>
          <button 
  onClick={scrollToDemo}
  className="w-60 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-wite dark:hover:bg-gray-200"
>
  View Demo
</button>
        </motion.div>

        {/* Query Animation Section */}
        <div ref={queryAnimationRef} className="relative z-10 mt-32 mb-32">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, margin: "-100px" }}
            className="text-center text-4xl font-bold mb-16 text-slate-700 dark:text-slate-300"
          >
            Powerful Query Visualization
          </motion.h2>
          <div className="relative bg-slate-900 rounded-xl p-6 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
            {queries.map((query, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.3,
                  ease: "easeOut" 
                }}
                className="font-mono mb-6 last:mb-0"
              >
                <div className="flex items-start">
                  <span className="text-green-400 mr-2">{'>'}</span>
                  <motion.span 
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: false, margin: "-100px" }}
                    transition={{ 
                      duration: 1.2, 
                      delay: 0.2 + index * 0.3,
                      ease: "easeInOut"
                    }}
                    className="text-green-300 overflow-hidden whitespace-nowrap block"
                  >
                    {query}
                  </motion.span>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 1 + index * 0.3,
                    ease: "easeOut" 
                  }}
                  className="ml-6 mt-2 h-3 bg-gradient-to-r from-green-400/50 to-blue-400/50 rounded-full"
                  style={{ width: `${65 - index * 10}%` }}
                ></motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
        id="demo-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 2.1 }}
          className="relative z-10 mt-20 rounded-3xl border border-neutral-200 bg-neutral-100 p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="w-full overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
  <div className="aspect-[16/9] h-auto w-full bg-gradient-to-br from-blue-500 to-purple-600 p-8">
    <div className="flex h-full flex-col items-center justify-center text-white bg-gray-900 p-8 rounded-xl">
      <div className="text-3xl font-bold mb-6">Speech Visualization Demo</div>
      
      {!showVideo ? (
        <>
          <p className="text-gray-300 mb-6">Click any button below to start the demo</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
            {["Welcome", "नमस्ते", "ಸ್ವಾಗತ", "স্বাগतम", "வணக்கம்", "స్వాగతం"].map((word, index) => (
              <div
                key={index}
                onClick={handleButtonClick}
                className="bg-indigo-900/50 hover:bg-indigo-800/70 backdrop-blur-sm rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 shadow-lg"
              >
                {word}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="w-full h-full flex-grow flex items-center justify-center">
          <div className="w-full h-full max-w-2xl">
            <video 
              ref={videoRef}
              src="/demo.mp4" 
              className="w-full h-full object-contain rounded-lg" 
              controls
              onPlay={() => {
                if (videoRef.current) {
                  const observer = new IntersectionObserver(
                    ([entry]) => {
                      handleVisibilityChange(entry.isIntersecting);
                    },
                    { threshold: 0.5 }
                  );
                  observer.observe(videoRef.current);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  </div>
</div>
        </motion.div>
      </div>
    </div>
  );
}

// ThreeJS Query Animation Component (optional for 3D visualization)
const QueryAnimation3D = ({ queries }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const textMeshes = useRef([]);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create text geometries
    const fontLoader = new FontLoader();
    fontLoader.load('https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      queries.forEach((query, index) => {
        const textGeometry = new TextGeometry(query, {
          font: font,
          size: 0.1,
          height: 0.01
        });
        
        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
        
        const textMaterial = new THREE.MeshBasicMaterial({
          color: 0x33ffaa,
          transparent: true,
          opacity: 0
        });
        
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-textWidth / 2, -1.5 - index * 0.5, 1);
        scene.add(textMesh);
        textMeshes.current.push(textMesh);
      });
    });
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup
    return () => {
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, [queries]);
  
  return <div ref={containerRef} className="w-full h-64" />;
};