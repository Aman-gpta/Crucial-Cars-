// frontend/src/components/layout/AnimatedBackground.js
import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-[-1] overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-theme-black-950 opacity-50"></div>
      
      {/* Animated purple orbs/circles */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      <div className="orb orb-4"></div>
      
      {/* Gradient overlay */}
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-theme-black-950 via-transparent to-theme-black-950 opacity-70"></div>
      
      {/* CSS for the orbs */}
      <style jsx>{`
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.3;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, rgba(76, 29, 149, 0) 70%);
          animation-duration: var(--duration);
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-name: float;
        }
        
        .orb-1 {
          --duration: 20s;
          width: 40vw;
          height: 40vw;
          left: -10vw;
          top: 10vh;
          animation-delay: 0s;
        }
        
        .orb-2 {
          --duration: 25s;
          width: 30vw;
          height: 30vw;
          right: -5vw;
          top: 30vh;
          animation-delay: -5s;
        }
        
        .orb-3 {
          --duration: 30s;
          width: 35vw;
          height: 35vw;
          left: 25vw;
          bottom: -10vh;
          animation-delay: -10s;
        }
        
        .orb-4 {
          --duration: 22s;
          width: 25vw;
          height: 25vw;
          right: 20vw;
          bottom: 20vh;
          animation-delay: -8s;
        }
        
        @keyframes float {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(3vw, 2vh) scale(1.05);
          }
          66% {
            transform: translate(-3vw, -3vh) scale(0.95);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;
