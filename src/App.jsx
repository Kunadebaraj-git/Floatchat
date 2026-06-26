import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import OceanMap from './components/OceanMap';
import DepthProfile from './components/DepthProfile';

const FloatChat = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [visualizationData, setVisualizationData] = useState({
    parameter: 'salinity',
    region: 'equator',
    month: 'March',
    year: '2023',
    floatCount: 342,
    selectedFloat: null
  });
  const [chatMessages, setChatMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello! I can help you explore ARGO ocean data. What would you like to know?' }
  ]);
  const [userInput, setUserInput] = useState('');

  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const spinalCordRef = useRef(null);
  const oceanRef = useRef(null);
  const particlesRef = useRef(null);
  const animationFrameId = useRef(null);
  const videoRef = useRef(null);

  // Function to handle visualization requests
  const handleVisualizationRequest = (parameter, region, month, year, floatCount) => {
    setVisualizationData({
      parameter,
      region,
      month,
      year,
      floatCount,
      selectedFloat: null
    });
    setShowVisualization(true);

    // Add bot response to chat
    const newMessage = {
      id: Date.now(),
      type: 'bot',
      text: `Retrieving ${parameter} data from ${floatCount} ARGO floats near the ${region} in ${month} ${year}...`
    };
    setChatMessages(prev => [...prev, newMessage]);

    // Scroll to visualization section
    setTimeout(() => {
      document.getElementById('visualization')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  // Function to handle float selection
  const handleFloatSelect = (floatId) => {
    setVisualizationData(prev => ({
      ...prev,
      selectedFloat: floatId
    }));
  };

  // Function to handle user input
  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: userInput
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Simple command parsing
    const input = userInput.toLowerCase();
    if (input.includes('salinity') && input.includes('equator')) {
      handleVisualizationRequest('salinity', 'equator', 'March', '2023', 342);
    } else if (input.includes('temperature') && input.includes('pacific')) {
      handleVisualizationRequest('temperature', 'pacific', 'January', '2024', 156);
    } else if (input.includes('indian ocean')) {
      handleVisualizationRequest('salinity', 'indian', 'December', '2023', 89);
    } else if (input.includes('atlantic')) {
      handleVisualizationRequest('temperature', 'atlantic', 'June', '2023', 203);
    } else {
      // Default response
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: "I can help you visualize ocean data. Try asking about 'salinity near equator' or 'temperature in Pacific ocean'!"
      };
      setChatMessages(prev => [...prev, botResponse]);
    }

    setUserInput('');
  };

  // Function to handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Initialize Three.js scene
  useEffect(() => {
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    if (canvasRef.current) {
      canvasRef.current.appendChild(renderer.domElement);
    }

    // Create ocean background
    const oceanGeometry = new THREE.PlaneGeometry(20, 20, 50, 50);
    const oceanMaterial = new THREE.MeshPhongMaterial({
      color: 0x0a2647,
      wireframe: false,
      shininess: 80,
      specular: 0x1155aa
    });

    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    scene.add(ocean);
    oceanRef.current = ocean;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x0a2647, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0x2C74B3, 0.8);
    directionalLight.position.set(0, 10, 5);
    scene.add(directionalLight);

    // Create spinal cord animation (light ray)
    const spinalCordGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -10, 0),
        new THREE.Vector3(0, -5, 0.5),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 5, -0.5),
        new THREE.Vector3(0, 10, 0)
      ]),
      100,
      0.5,
      20,
      false
    );

    const spinalCordMaterial = new THREE.MeshPhongMaterial({
      color: 0x4fc3f7,
      emissive: 0x2C74B3,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    const spinalCord = new THREE.Mesh(spinalCordGeometry, spinalCordMaterial);
    scene.add(spinalCord);
    spinalCordRef.current = spinalCord;

    // Create particles for additional effect
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x4fc3f7,
      transparent: true,
      opacity: 0.6
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    particlesRef.current = particlesMesh;

    // Handle mouse move for interactive effects
    const handleMouseMove = (event) => {
      mouseRef.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Animate ocean surface
      if (oceanRef.current) {
        const oceanPosition = oceanRef.current.geometry.attributes.position;
        for (let i = 0; i < oceanPosition.count; i++) {
          const x = oceanPosition.getX(i);
          const y = oceanPosition.getY(i);

          const waveX1 = 0.5 * Math.sin(x * 2 + elapsedTime);
          const waveY1 = 0.5 * Math.sin(y * 2 + elapsedTime * 1.5);
          const waveX2 = 0.25 * Math.sin(x * 3 + elapsedTime * 2);

          oceanPosition.setZ(i, waveX1 + waveY1 + waveX2);
        }
        oceanPosition.needsUpdate = true;
      }

      // Animate spinal cord
      if (spinalCordRef.current) {
        spinalCordRef.current.rotation.y = elapsedTime * 0.2;
        spinalCordRef.current.scale.y = 1 + 0.1 * Math.sin(elapsedTime);

        // React to mouse movement
        spinalCordRef.current.position.x = mouseRef.current.x * 0.5;
        spinalCordRef.current.position.z = mouseRef.current.y * 0.5;
      }

      // Animate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsedTime * 0.1;
      }

      // Render scene
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      if (canvasRef.current && renderer.domElement) {
        canvasRef.current.removeChild(renderer.domElement);
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cursor effects with Framer Motion
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });

      // Create ripple effect
      const newRipple = {
        x: e.clientX,
        y: e.clientY,
        id: Date.now(),
      };
      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Navigation items
  const navItems = ['Home', 'Problem', 'Features', 'Demo', 'Data', 'Contact'];

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      {/* Three.js canvas */}
      <div ref={canvasRef} className="fixed inset-0 z-0" />

      {/* VIDEO BACKGROUND - ADD YOUR VIDEO FILE PATH HERE */}
      <div className="fixed inset-0 z-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.5) contrast(1.2)' }}
        >
          <source src="/src/assets/background-video.mp4" type="video/mp4" />
          {/* Fallback image if video doesn't load */}
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Cursor ripple effects - UNCHANGED */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute w-16 h-16 rounded-full border-2 border-cyan-400 opacity-70"
            style={{
              left: ripple.x - 32,
              top: ripple.y - 32,
            }}
            initial={{ scale: 0, opacity: 0.7 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1 }}
          />
        ))}

        {/* Cursor glow */}
        <motion.div
          className="absolute w-8 h-8 rounded-full bg-cyan-400 blur-md"
          style={{
            left: cursorPosition.x - 16,
            top: cursorPosition.y - 16,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* DARKER OVERLAY for better text readability */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-5" />

      {/* Navigation with better text visibility */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'py-3 bg-black/80 backdrop-blur-md' : 'py-5 bg-transparent'} enhanced-text`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          >
            FloatChat
          </motion.div>

          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`transition-all hover:text-cyan-300 enhanced-text ${activeSection === item.toLowerCase() ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/90'}`}
                onClick={() => setActiveSection(item.toLowerCase())}
              >
                {item}
              </a>
            ))}
          </div>

          <button className="md:hidden text-white enhanced-text">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero Section with better text visibility */}
      <section id="home" className="min-h-screen flex flex-col justify-center items-center px-4 pt-20 relative z-20 enhanced-text">
        <motion.div
          className="text-center max-w-4xl"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
         <h1 className="text-5xl md:text-7xl font-bold mb-6 text-cyan-300 drop-shadow-2xl">
  FloatChat
</h1>
          <h2 className="text-xl md:text-2xl mb-8 text-cyan-100 font-semibold">
            AI-Powered Conversational Interface for ARGO Ocean Data Discovery and Visualization
          </h2>
          <p className="text-lg mb-12 max-w-2xl mx-auto text-cyan-50">
            Democratizing access to global oceanographic data through AI + Visualization.
          </p>

          <motion.button
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all enhanced-text"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Ocean Data
          </motion.button>
        </motion.div>

        {/* Floating ARGO model placeholder */}
        <motion.div
          className="w-64 h-64 mt-16 bg-gradient-to-br from-blue-600/30 to-cyan-500/30 rounded-full flex items-center justify-center border border-cyan-400/40 backdrop-blur-lg enhanced-text"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 3, 0, -3, 0]
          }}
          transition={{
            y: { duration: 6, repeat: Infinity },
            rotate: { duration: 8, repeat: Infinity }
          }}
        >
          <div className="text-center">
            <div className="text-5xl mb-2">🌊</div>
            <p className="text-cyan-200 font-semibold">ARGO Float</p>
          </div>
        </motion.div>
      </section>

      {/* Problem Statement Section */}
      <section id="problem" className="min-h-screen py-20 px-4 relative z-20 enhanced-text">
        <motion.h2
          className="text-4xl font-bold text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            The Challenge of Ocean Data Access
          </span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Background",
              content: "Oceanographic data from ARGO floats is vast but difficult to access and interpret for non-experts."
            },
            {
              title: "Description",
              content: "Billions of data points collected by thousands of floats worldwide remain underutilized due to technical barriers."
            },
            {
              title: "Expected Solution",
              content: "An intuitive AI interface that allows natural language queries about ocean data with visualizations."
            },
            {
              title: "Acronyms",
              content: "ARGO: Array for Real-time Geostrophic Oceanography • RAG: Retrieval Augmented Generation"
            }
          ].map((card, index) => (
            <motion.div
              key={index}
              className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/30 hover:border-cyan-400/60 transition-all glass-card enhanced-text"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(34, 211, 238, 0.4)" }}
            >
              <h3 className="text-2xl font-semibold mb-4 text-cyan-300">{card.title}</h3>
              <p className="text-white/90">{card.content}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="min-h-screen py-20 px-4 bg-black/40 relative z-20 enhanced-text">
        <motion.h2
          className="text-4xl font-bold text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Powerful Features
          </span>
        </motion.h2>

        <div className="max-w-6xl mx-auto">
          {[
            {
              icon: "💬",
              title: "AI-Powered Chatbot",
              description: "Natural language interface for querying ocean data with contextual understanding"
            },
            {
              icon: "📊",
              title: "Data Processing",
              description: "Conversion of NetCDF files to SQL/Parquet formats for efficient querying"
            },
            {
              icon: "🔍",
              title: "Vector Database + RAG",
              description: "Advanced retrieval system for accurate, context-aware responses"
            },
            {
              icon: "🌐",
              title: "Interactive Dashboards",
              description: "Geospatial and profile visualizations of ocean parameters"
            },
            {
              icon: "🚀",
              title: "Future Extensibility",
              description: "Support for satellite, buoy, and glider datasets"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-start mb-12 glass-card p-6 rounded-xl border border-cyan-500/20"
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-4xl mr-6">{feature.icon}</div>
              <div>
                <h3 className="text-2xl font-semibold mb-2 text-cyan-300">{feature.title}</h3>
                <p className="text-white/90">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demo Section - ENHANCED WITH VISUALIZATION */}
      <section id="demo" className="min-h-screen py-20 px-4 relative z-20 enhanced-text">
        <motion.h2
          className="text-4xl font-bold text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Interactive Demo
          </span>
        </motion.h2>

        <div className="max-w-6xl mx-auto bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/30 glass-card">
          {/* Enhanced Chat Interface */}
          <div className="bg-gray-900/80 rounded-lg p-4 mb-6 h-64 overflow-y-auto enhanced-text">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`rounded-lg p-3 max-w-md ${message.type === 'user'
                    ? 'bg-green-900/60'
                    : 'bg-cyan-900/60'
                  }`}>
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="flex mb-6">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about ocean data (e.g., 'Show salinity profiles near equator in March 2023')..."
              className="flex-grow bg-gray-900/80 border border-cyan-600 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 enhanced-text"
            />
            <button
              className="bg-cyan-600 hover:bg-cyan-700 px-6 rounded-r-lg transition-colors enhanced-text"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <button
              className="bg-cyan-700/50 hover:bg-cyan-600/60 py-2 px-3 rounded text-sm transition-colors"
              onClick={() => handleVisualizationRequest('salinity', 'equator', 'March', '2023', 342)}
            >
              🌊 Salinity Data
            </button>
            <button
              className="bg-cyan-700/50 hover:bg-cyan-600/60 py-2 px-3 rounded text-sm transition-colors"
              onClick={() => handleVisualizationRequest('temperature', 'pacific', 'January', '2024', 156)}
            >
              🔥 Temperature
            </button>
            <button
              className="bg-cyan-700/50 hover:bg-cyan-600/60 py-2 px-3 rounded text-sm transition-colors"
              onClick={() => handleVisualizationRequest('salinity', 'indian', 'December', '2023', 89)}
            >
              🇮🇳 Indian Ocean
            </button>
            <button
              className="bg-cyan-700/50 hover:bg-cyan-600/60 py-2 px-3 rounded text-sm transition-colors"
              onClick={() => handleVisualizationRequest('temperature', 'atlantic', 'June', '2023', 203)}
            >
              🌎 Atlantic Data
            </button>
          </div>

          {/* Interactive Visualization Section */}
          {showVisualization && (
            <div id="visualization" className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl font-semibold mb-4 text-cyan-300 text-center">
                  {visualizationData.parameter.charAt(0).toUpperCase() + visualizationData.parameter.slice(1)}
                  Data from {visualizationData.floatCount} ARGO Floats near {visualizationData.region}
                </h3>
                <p className="text-center text-cyan-100 mb-6">
                  Showing data for {visualizationData.month} {visualizationData.year}
                </p>

                {/* Ocean Map Visualization */}
                <OceanMap
                  region={visualizationData.region}
                  parameter={visualizationData.parameter}
                  month={visualizationData.month}
                  year={visualizationData.year}
                  floatCount={visualizationData.floatCount}
                  onFloatSelect={handleFloatSelect}
                />

                {/* Depth Profile */}
                {visualizationData.selectedFloat && (
                  <DepthProfile
                    floatId={visualizationData.selectedFloat}
                    parameter={visualizationData.parameter}
                  />
                )}

                <div className="mt-4 text-sm text-cyan-200 text-center">
                  <p>💡 <strong>Tip:</strong> Click on any ARGO float marker to view detailed depth profiles</p>
                  <p>🗺️ <strong>Navigation:</strong> Zoom and pan to explore different regions</p>
                  <p>🎯 <strong>Data:</strong> {visualizationData.floatCount} active floats in this region</p>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Datasets Section */}
      <section id="data" className="min-h-screen py-20 px-4 bg-black/40 relative z-20 enhanced-text">
        <motion.h2
          className="text-4xl font-bold text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Data Resources
          </span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              title: "Argo Global Data Repository",
              description: "Access to global ARGO float data collected since 1999",
              link: "https://argo.ucsd.edu/data/"
            },
            {
              title: "Indian Argo Project",
              description: "Regional ARGO data from the Indian Ocean region",
              link: "https://incois.gov.in/argo/"
            }
          ].map((resource, index) => (
            <motion.a
              key={index}
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/30 hover:border-cyan-400/60 transition-all glass-card enhanced-text"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(23, 147, 167, 0.81)",
                scale: 1.02
              }}
            >
              <h3 className="text-2xl font-semibold mb-4 text-cyan-300">{resource.title}</h3>
              <p className="mb-4 text-white/90">{resource.description}</p>
              <span className="text-cyan-400 hover:text-cyan-300">Visit resource →</span>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 relative z-20 enhanced-text">
        <motion.h2
          className="text-4xl font-bold text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Contact & Organization
          </span>
        </motion.h2>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-2xl font-semibold mb-4 text-cyan-300">Ministry of Earth Sciences (MoES)</h3>
            <p className="text-cyan-100">Government of India</p>
          </motion.div>

          <motion.div
            className="mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-2xl font-semibold mb-4 text-cyan-300">Indian National Centre for Ocean Information Services (INCOIS)</h3>
            <p className="text-cyan-100">Hyderabad, India</p>
          </motion.div>

          <motion.div
            className="pt-12 border-t border-cyan-700"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-cyan-300 font-semibold">FloatChat - Democratizing Ocean Data Access</p>
            <p className="mt-2 text-cyan-400">© {new Date().getFullYear()} INCOIS, MoES</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FloatChat;
