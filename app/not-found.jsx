'use client'
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';

// Animations
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 20px rgba(0, 100, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 150, 255, 0.6); }
  100% { box-shadow: 0 0 20px rgba(0, 100, 255, 0.3); }
`;

const pulse = keyframes`
  0% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.1); }
  100% { opacity: 0.2; transform: scale(1); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1f 0%, #0b1a2e 50%, #0d2135 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const BackgroundGrid = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 150, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 150, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: ${pulse} 4s ease-in-out infinite;
`;

const GlowingOrb = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle at center, 
    rgba(0, 150, 255, 0.3) 0%, 
    rgba(0, 100, 255, 0.1) 50%, 
    transparent 70%);
  border-radius: 50%;
  animation: ${rotate} 20s linear infinite;
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, 
      rgba(0, 200, 255, 0.4) 0%, 
      transparent 70%);
    border-radius: 50%;
    animation: ${pulse} 3s ease-in-out infinite;
  }
`;

const ContentWrapper = styled(motion.div)`
  text-align: center;
  z-index: 10;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
`;

const ErrorNumber = styled(motion.div)`
  font-size: 12rem;
  font-weight: 900;
  color: transparent;
  -webkit-text-stroke: 4px rgba(0, 150, 255, 0.5);
  position: relative;
  line-height: 1;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 8rem;
  }
`;

const GlitchText = styled.span`
  position: relative;
  animation: ${float} 3s ease-in-out infinite;
  display: inline-block;
  
  &::before,
  &::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #0a0f1f, #0d2135);
    -webkit-text-stroke: 4px rgba(0, 150, 255, 0.5);
  }
  
  &::before {
    animation: glitch-1 0.8s infinite linear alternate-reverse;
    left: 2px;
    text-shadow: -2px 0 #00ffff;
  }
  
  &::after {
    animation: glitch-2 0.8s infinite linear alternate-reverse;
    left: -2px;
    text-shadow: 2px 0 #ff00ff;
  }
`;

const Title = styled(motion.h2)`
  font-size: 2.5rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(0, 150, 255, 0.5);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Description = styled(motion.p)`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 3rem;
  line-height: 1.6;
`;

const ButtonGroup = styled(motion.div)`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled(motion.a)`
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 50px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(0, 150, 255, 0.5);
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:hover::before {
    width: 300px;
    height: 300px;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #0066ff, #0099ff);
  color: white;
  border: none;
  box-shadow: 0 0 20px rgba(0, 150, 255, 0.3);
  animation: ${glow} 3s ease-in-out infinite;
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: white;
  
  &:hover {
    background: rgba(0, 150, 255, 0.1);
    border-color: #0099ff;
  }
`;

const Particles = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const Particle = styled(motion.div)`
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(0, 150, 255, 0.3);
  border-radius: 50%;
`;

const FloatingElements = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const FloatingElement = styled(motion.div)`
  position: absolute;
  color: rgba(0, 150, 255, 0.1);
  font-size: 2rem;
  font-weight: 900;
  user-select: none;
`;

export default function NotFound() {
  const particlesRef = useRef(null);
  
  useEffect(() => {
    // Add keyframe animations dynamically
    const style = document.createElement('style');
    style.textContent = `
      @keyframes glitch-1 {
        0% { clip-path: inset(20% 0 30% 0); }
        20% { clip-path: inset(50% 0 10% 0); }
        40% { clip-path: inset(10% 0 40% 0); }
        60% { clip-path: inset(40% 0 20% 0); }
        80% { clip-path: inset(30% 0 50% 0); }
        100% { clip-path: inset(20% 0 30% 0); }
      }
      
      @keyframes glitch-2 {
        0% { clip-path: inset(30% 0 40% 0); }
        20% { clip-path: inset(10% 0 60% 0); }
        40% { clip-path: inset(40% 0 20% 0); }
        60% { clip-path: inset(60% 0 10% 0); }
        80% { clip-path: inset(20% 0 50% 0); }
        100% { clip-path: inset(30% 0 40% 0); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Generate random particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5
  }));
  
  // Floating elements (404 numbers)
  const floatingElements = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    rotation: Math.random() * 360,
    scale: Math.random() * 0.5 + 0.5,
    duration: Math.random() * 20 + 20,
    delay: Math.random() * 5
  }));
  
  return (
    <Container>
      <BackgroundGrid />
      
      <GlowingOrb style={{ top: '10%', left: '10%' }} />
      <GlowingOrb style={{ bottom: '10%', right: '10%', width: '400px', height: '400px' }} />
      
      <Particles ref={particlesRef}>
        {particles.map(particle => (
          <Particle
            key={particle.id}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </Particles>
      
      <FloatingElements>
        {floatingElements.map(element => (
          <FloatingElement
            key={element.id}
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              transform: `rotate(${element.rotation}deg) scale(${element.scale})`
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, 30, 0],
              rotate: [element.rotation, element.rotation + 180, element.rotation],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: element.duration,
              delay: element.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            404
          </FloatingElement>
        ))}
      </FloatingElements>
      
      <ContentWrapper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <ErrorNumber
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <GlitchText data-text="404">404</GlitchText>
        </ErrorNumber>
        
        <Title
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Page Not Found
        </Title>
        
        <Description
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          The page you're looking for has vanished into the digital void.
          <br />
          Let's get you back on track.
        </Description>
        
        <ButtonGroup
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <PrimaryButton
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Return Home
          </PrimaryButton>
          
          <SecondaryButton
            href="/contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Support
          </SecondaryButton>
        </ButtonGroup>
      </ContentWrapper>
    </Container>
  );
}