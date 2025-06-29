import React from 'react';

interface BackgroundAnimationProps {
  backgroundType: string;
  isDarkMode: boolean;
}

export const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({ 
  backgroundType, 
  isDarkMode 
}) => {
  const getBackgroundClasses = () => {
    const backgrounds = {
      'gradient-purple': isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900'
        : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50',
      'gradient-ocean': isDarkMode
        ? 'bg-gradient-to-br from-blue-900/30 via-cyan-900/20 to-teal-900/30'
        : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50',
      'gradient-sunset': isDarkMode
        ? 'bg-gradient-to-br from-orange-900/30 via-red-900/20 to-pink-900/30'
        : 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-50',
      'gradient-forest': isDarkMode
        ? 'bg-gradient-to-br from-green-900/30 via-emerald-900/20 to-teal-900/30'
        : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
      'gradient-cosmic': isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/30 to-black'
        : 'bg-gradient-to-br from-gray-100 via-purple-100 to-slate-100',
      'gradient-aurora': isDarkMode
        ? 'bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-pink-900/30'
        : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50',
      'solid-dark': 'bg-gray-900',
      'solid-light': 'bg-slate-50'
    };
    
    return backgrounds[backgroundType as keyof typeof backgrounds] || backgrounds['gradient-purple'];
  };

  const getOrbColors = () => {
    if (!isDarkMode) {
      return {
        orb1: 'bg-purple-200/30',
        orb2: 'bg-blue-200/30',
        orb3: 'bg-cyan-200/30'
      };
    }

    const orbSets = {
      'gradient-purple': {
        orb1: 'bg-purple-500/10',
        orb2: 'bg-blue-500/10',
        orb3: 'bg-indigo-500/10'
      },
      'gradient-ocean': {
        orb1: 'bg-blue-500/10',
        orb2: 'bg-cyan-500/10',
        orb3: 'bg-teal-500/10'
      },
      'gradient-sunset': {
        orb1: 'bg-orange-500/10',
        orb2: 'bg-red-500/10',
        orb3: 'bg-pink-500/10'
      },
      'gradient-forest': {
        orb1: 'bg-green-500/10',
        orb2: 'bg-emerald-500/10',
        orb3: 'bg-teal-500/10'
      },
      'gradient-cosmic': {
        orb1: 'bg-purple-500/10',
        orb2: 'bg-indigo-500/10',
        orb3: 'bg-gray-500/10'
      },
      'gradient-aurora': {
        orb1: 'bg-indigo-500/10',
        orb2: 'bg-purple-500/10',
        orb3: 'bg-pink-500/10'
      }
    };
    
    return orbSets[backgroundType as keyof typeof orbSets] || orbSets['gradient-purple'];
  };

  const orbColors = getOrbColors();
  const particleColor = isDarkMode ? 'bg-white/20' : 'bg-gray-400/30';

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main Background */}
      <div className={`absolute inset-0 ${getBackgroundClasses()}`} />
      
      {/* Skip orbs and particles for solid backgrounds */}
      {!backgroundType.includes('solid') && (
        <>
          {/* Animated Orbs */}
          <div className={`absolute top-1/4 left-1/4 w-72 h-72 ${orbColors.orb1} rounded-full blur-3xl animate-pulse`} />
          <div className={`absolute top-3/4 right-1/4 w-96 h-96 ${orbColors.orb2} rounded-full blur-3xl animate-pulse delay-1000`} />
          <div className={`absolute bottom-1/4 left-1/3 w-80 h-80 ${orbColors.orb3} rounded-full blur-3xl animate-pulse delay-2000`} />
          
          {/* Floating Particles */}
          <div className="absolute inset-0">
            {Array.from({ length: isDarkMode ? 20 : 15 }).map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 ${particleColor} rounded-full animate-float`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>
        </>
      )}
      
      {/* Grid Pattern - Only for non-solid backgrounds */}
      {!backgroundType.includes('solid') && (
        <div 
          className={`absolute inset-0 ${isDarkMode ? 'opacity-5' : 'opacity-10'}`}
          style={{
            backgroundImage: `
              linear-gradient(${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px),
              linear-gradient(90deg, ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      )}
    </div>
  );
};