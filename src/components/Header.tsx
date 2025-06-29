import React from 'react';
import { Zap, Github, Heart, Palette, Sun, Moon, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onBackgroundChange: (background: string) => void;
  currentBackground: string;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  showBackgroundMenu: boolean;
  onToggleBackgroundMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onBackgroundChange,
  currentBackground,
  isDarkMode,
  onThemeToggle,
  showBackgroundMenu,
  onToggleBackgroundMenu
}) => {
  const backgroundOptions = [
    {
      id: 'gradient-purple',
      name: 'Purple Gradient',
      preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      class: 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900'
    },
    {
      id: 'gradient-ocean',
      name: 'Ocean Waves',
      preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      class: 'bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900'
    },
    {
      id: 'gradient-sunset',
      name: 'Sunset Glow',
      preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      class: 'bg-gradient-to-br from-orange-900 via-red-900 to-pink-900'
    },
    {
      id: 'gradient-forest',
      name: 'Forest Deep',
      preview: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
      class: 'bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900'
    },
    {
      id: 'gradient-cosmic',
      name: 'Cosmic Space',
      preview: 'linear-gradient(135deg, #2c3e50 0%, #4a6741 100%)',
      class: 'bg-gradient-to-br from-gray-900 via-purple-900 to-black'
    },
    {
      id: 'gradient-aurora',
      name: 'Aurora Lights',
      preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      class: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900'
    },
    {
      id: 'solid-dark',
      name: 'Pure Dark',
      preview: '#1a1a1a',
      class: 'bg-gray-900'
    },
    {
      id: 'solid-light',
      name: 'Clean Light',
      preview: '#f8fafc',
      class: 'bg-slate-50'
    }
  ];

  return (
    <header className="w-full py-8 px-6 relative z-20">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              SVG Path Animator
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Modern Animation Studio
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Background Selector */}
          <div className="relative">
            <button
              onClick={onToggleBackgroundMenu}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-white/10 hover:bg-white/20 text-gray-300' 
                  : 'bg-black/10 hover:bg-black/20 text-gray-700'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span className="text-sm font-medium">Background</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                showBackgroundMenu ? 'rotate-180' : ''
              }`} />
            </button>
            
            {showBackgroundMenu && (
              <div className={`absolute right-0 top-12 w-64 rounded-2xl shadow-2xl border backdrop-blur-sm z-30 ${
                isDarkMode 
                  ? 'bg-gray-800/95 border-white/10' 
                  : 'bg-white/95 border-gray-200'
              }`}>
                <div className="p-4">
                  <h3 className={`text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    Choose Background
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {backgroundOptions.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => {
                          onBackgroundChange(bg.id);
                          onToggleBackgroundMenu();
                        }}
                        className={`group relative p-3 rounded-xl transition-all duration-300 ${
                          currentBackground === bg.id
                            ? isDarkMode
                              ? 'ring-2 ring-purple-400 bg-purple-500/20'
                              : 'ring-2 ring-purple-500 bg-purple-100'
                            : isDarkMode
                              ? 'hover:bg-white/10'
                              : 'hover:bg-gray-100'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded-lg mb-2 border"
                          style={{
                            background: bg.preview,
                            borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                          }}
                        />
                        <p className={`text-xs font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {bg.name}
                        </p>
                        {currentBackground === bg.id && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className={`p-2 rounded-xl transition-all duration-300 ${
              isDarkMode 
                ? 'bg-white/10 hover:bg-white/20 text-yellow-400' 
                : 'bg-black/10 hover:bg-black/20 text-orange-500'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* GitHub Button */}
          <button className={`p-2 rounded-xl transition-colors ${
            isDarkMode 
              ? 'bg-white/10 hover:bg-white/20 text-gray-300' 
              : 'bg-black/10 hover:bg-black/20 text-gray-700'
          }`}>
            <Github className="w-5 h-5" />
          </button>
          
          {/* Made with Love */}
          <div className={`flex items-center space-x-1 text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <span>Made with</span>
            <Heart className="w-3 h-3 text-red-400" />
            <span>by Bolt</span>
          </div>
        </div>
      </div>
    </header>
  );
};