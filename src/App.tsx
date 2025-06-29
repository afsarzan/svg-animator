import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { SVGViewer } from './components/SVGViewer';
import { Header } from './components/Header';
import { BackgroundAnimation } from './components/BackgroundAnimation';
import { FileText, Sparkles } from 'lucide-react';

interface UploadedFile {
  file: File;
  content: string;
  uploadedAt: Date;
}

function App() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentBackground, setCurrentBackground] = useState('gradient-purple');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showBackgroundMenu, setShowBackgroundMenu] = useState(false);

  const handleFileUpload = (file: File, content: string) => {
    setIsUploading(true);
    
    // Simulate processing time for better UX
    setTimeout(() => {
      setUploadedFile({
        file,
        content,
        uploadedAt: new Date(),
      });
      setIsUploading(false);
    }, 1000);
  };

  const clearFile = () => {
    setUploadedFile(null);
  };

  const handleBackgroundChange = (backgroundId: string) => {
    setCurrentBackground(backgroundId);
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleToggleBackgroundMenu = () => {
    setShowBackgroundMenu(!showBackgroundMenu);
  };

  // Close background menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showBackgroundMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-background-menu]')) {
          setShowBackgroundMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showBackgroundMenu]);

  const getTextColors = () => {
    if (isDarkMode) {
      return {
        primary: 'text-white',
        secondary: 'text-gray-300',
        muted: 'text-gray-400'
      };
    } else {
      return {
        primary: 'text-gray-900',
        secondary: 'text-gray-700',
        muted: 'text-gray-600'
      };
    }
  };

  const textColors = getTextColors();

  return (
    <div className="min-h-screen relative">
      <BackgroundAnimation backgroundType={currentBackground} isDarkMode={isDarkMode} />
      
      <div className="relative z-10" data-background-menu>
        <Header 
          onBackgroundChange={handleBackgroundChange}
          currentBackground={currentBackground}
          isDarkMode={isDarkMode}
          onThemeToggle={handleThemeToggle}
          showBackgroundMenu={showBackgroundMenu}
          onToggleBackgroundMenu={handleToggleBackgroundMenu}
        />
        
        <main className="px-6 pb-12">
          <div className="max-w-6xl mx-auto">
            {!uploadedFile ? (
              <div className="flex flex-col items-center text-center space-y-8">
                {/* Hero Section */}
                <div className="space-y-6 max-w-3xl">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      isDarkMode 
                        ? 'bg-yellow-400/20 text-yellow-300' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      AI-Powered Animation
                    </span>
                  </div>
                  
                  <h2 className={`text-5xl md:text-6xl font-bold leading-tight ${textColors.primary}`}>
                    Bring Your
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                      {' '}SVG Icons{' '}
                    </span>
                    to Life
                  </h2>
                  
                  <p className={`text-xl leading-relaxed ${textColors.secondary}`}>
                    Upload any SVG file and watch as our advanced animation engine traces every path with precision. 
                    Perfect for logos, icons, and illustrations.
                  </p>
                  
                  <div className={`flex items-center justify-center space-x-8 text-sm ${textColors.muted}`}>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span>Instant Preview</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Custom Speed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>Path Tracing</span>
                    </div>
                  </div>
                </div>
                
                {/* Upload Section */}
                <FileUpload 
                  onFileUpload={handleFileUpload} 
                  isUploading={isUploading} 
                  isDarkMode={isDarkMode}
                />
                
                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mt-16">
                  <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/10' 
                      : 'bg-white/50 border-white/20'
                  }`}>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${textColors.primary}`}>Smart Path Detection</h3>
                    <p className={`text-sm ${textColors.muted}`}>
                      Automatically detects and analyzes all paths in your SVG for optimal animation sequencing.
                    </p>
                  </div>
                  
                  <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/10' 
                      : 'bg-white/50 border-white/20'
                  }`}>
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${textColors.primary}`}>Smooth Animations</h3>
                    <p className={`text-sm ${textColors.muted}`}>
                      Buttery-smooth path tracing with customizable timing and easing functions.
                    </p>
                  </div>
                  
                  <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/10' 
                      : 'bg-white/50 border-white/20'
                  }`}>
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${textColors.primary}`}>Real-time Controls</h3>
                    <p className={`text-sm ${textColors.muted}`}>
                      Adjust animation speed, reset, and control playback with intuitive real-time controls.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* File Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={clearFile}
                      className={`px-4 py-2 rounded-xl transition-colors ${
                        isDarkMode 
                          ? 'bg-white/10 hover:bg-white/20 text-gray-300' 
                          : 'bg-black/10 hover:bg-black/20 text-gray-700'
                      }`}
                    >
                      ← Upload New File
                    </button>
                  </div>
                  
                  <div className={`text-right text-sm ${textColors.muted}`}>
                    <p>Uploaded: {uploadedFile.uploadedAt.toLocaleTimeString()}</p>
                    <p>Size: {(uploadedFile.file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                
                {/* SVG Viewer */}
                <div className="flex justify-center">
                  <SVGViewer 
                    svgContent={uploadedFile.content} 
                    fileName={uploadedFile.file.name}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;