import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Zap, Clock, Maximize2, Repeat, Download, FileImage, Code, Palette, Sparkles, Eye, RotateCw, Infinity } from 'lucide-react';

interface SVGViewerProps {
  svgContent: string;
  fileName: string;
  isDarkMode: boolean;
}

export const SVGViewer: React.FC<SVGViewerProps> = ({ svgContent, fileName, isDarkMode }) => {
  const svgRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(5);
  const [svgSize, setSvgSize] = useState(300);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [pathCount, setPathCount] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showLoadingPreview, setShowLoadingPreview] = useState(true);
  const [hasPlayedInitialAnimation, setHasPlayedInitialAnimation] = useState(false);
  
  // Creative options
  const [strokeColor, setStrokeColor] = useState('#8b5cf6');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [glowIntensity, setGlowIntensity] = useState(3);
  const [animationStyle, setAnimationStyle] = useState<'bounce' | 'draw' | 'fade' | 'scale' | 'wave' | 'spiral' | 'pulse' | 'elastic' | 'rainbow'>('bounce');
  const [showFill, setShowFill] = useState(false);
  const [rotateAnimation, setRotateAnimation] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);
  const [trailEffect, setTrailEffect] = useState(false);
  
  // Loop controls
  const [isLooping, setIsLooping] = useState(false);
  const [restDuration, setRestDuration] = useState(1);
  const [loopCount, setLoopCount] = useState(0);

  // Color presets
  const colorPresets = [
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Yellow', value: '#eab308' },
  ];

  // Clean SVG content to prevent XML parsing errors
  const cleanSVGContent = (svgString: string): string => {
    try {
      // Remove XML declaration and DOCTYPE if present
      let cleaned = svgString.replace(/<\?xml[^>]*\?>/gi, '');
      cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '');
      
      // Remove CDATA sections
      cleaned = cleaned.replace(/<!\[CDATA\[[\s\S]*?\]\]>/gi, '');
      
      // Remove comments
      cleaned = cleaned.replace(/<!--[\s\S]*?-->/gi, '');
      
      // Remove script tags for security
      cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      
      // Remove style tags that might conflict
      cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      
      // Normalize whitespace
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
      
      // Ensure proper SVG namespace
      if (!cleaned.includes('xmlns="http://www.w3.org/2000/svg"')) {
        cleaned = cleaned.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      
      // Validate with DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleaned, 'image/svg+xml');
      const parserError = doc.querySelector('parsererror');
      
      if (parserError) {
        console.warn('SVG parsing error, attempting to fix...');
        // Try to fix common issues
        cleaned = cleaned.replace(/&(?!amp;|lt;|gt;|quot;|apos;)/g, '&amp;');
        cleaned = cleaned.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        cleaned = cleaned.replace(/&lt;(\/?[a-zA-Z][^&]*?)&gt;/g, '<$1>');
      }
      
      return cleaned;
    } catch (error) {
      console.error('Error cleaning SVG:', error);
      return svgString; // Return original if cleaning fails
    }
  };

  // Auto-play animation on component mount
  useEffect(() => {
    if (svgContent && !hasPlayedInitialAnimation) {
      const timer = setTimeout(() => {
        startLoadingPreview();
        setHasPlayedInitialAnimation(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [svgContent, hasPlayedInitialAnimation]);

  useEffect(() => {
    if (svgRef.current && svgContent) {
      const cleanedContent = cleanSVGContent(svgContent);
      svgRef.current.innerHTML = cleanedContent;
      const svg = svgRef.current.querySelector('svg');
      
      if (svg) {
        // Apply size control
        svg.setAttribute('width', `${svgSize}px`);
        svg.setAttribute('height', `${svgSize}px`);
        svg.style.maxWidth = '100%';
        svg.style.maxHeight = '100%';
        
        // Apply rotation animation if enabled
        if (rotateAnimation) {
          svg.style.animation = 'spin 10s linear infinite';
        } else {
          svg.style.animation = '';
        }
        
        // Count and prepare all drawable elements
        const drawableElements = svg.querySelectorAll('path, circle, rect, ellipse, line, polyline, polygon');
        setPathCount(drawableElements.length);
        
        // Prepare elements for animation
        drawableElements.forEach((element, index) => {
          if (element instanceof SVGGeometryElement) {
            try {
              const length = element.getTotalLength();
              
              // Store original fill for later use
              const originalFill = element.getAttribute('fill') || element.getAttribute('stroke') || strokeColor;
              element.setAttribute('data-original-fill', originalFill);
              
              // Set up stroke properties
              element.style.fill = showFill ? originalFill : 'none';
              element.style.stroke = strokeColor;
              element.style.strokeWidth = `${strokeWidth}`;
              element.style.strokeLinecap = 'round';
              element.style.strokeLinejoin = 'round';
              
              // Apply glow effect
              const glowFilter = `drop-shadow(0 0 ${glowIntensity}px ${strokeColor})`;
              element.style.filter = glowFilter;
              
              // Apply pulse effect
              if (pulseEffect) {
                element.style.animation = `pulse 2s ease-in-out infinite`;
              }
              
              // Set up animation based on style
              if (animationStyle === 'draw') {
                element.style.strokeDasharray = `${length}`;
                element.style.strokeDashoffset = `${length}`;
              } else {
                element.style.strokeDasharray = '';
                element.style.strokeDashoffset = '';
                if (['fade', 'scale', 'bounce', 'wave', 'spiral', 'pulse', 'elastic'].includes(animationStyle)) {
                  element.style.opacity = '0';
                }
                if (['scale', 'bounce', 'spiral', 'pulse', 'elastic'].includes(animationStyle)) {
                  element.style.transform = 'scale(0)';
                  element.style.transformOrigin = 'center';
                }
              }
              
              element.style.transition = 'none';
              
            } catch (error) {
              console.warn('Element does not support getTotalLength:', element);
              element.style.opacity = '0';
            }
          } else {
            element.style.opacity = '0';
          }
        });

        // Handle filled shapes by converting them to strokes if needed
        if (!showFill) {
          const filledShapes = svg.querySelectorAll('[fill]:not([fill="none"])');
          filledShapes.forEach((shape) => {
            const fillColor = shape.getAttribute('fill');
            if (fillColor && fillColor !== 'none') {
              shape.setAttribute('stroke', strokeColor);
              shape.setAttribute('fill', 'none');
              shape.setAttribute('stroke-width', `${strokeWidth}`);
            }
          });
        }
      }
    }
  }, [svgContent, svgSize, strokeColor, strokeWidth, glowIntensity, showFill, rotateAnimation, pulseEffect, animationStyle]);

  const startLoadingPreview = () => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current.querySelector('svg');
    if (!svg) return;
    
    const drawableElements = svg.querySelectorAll('path, circle, rect, ellipse, line, polyline, polygon');
    setIsAnimating(true);
    setAnimationProgress(0);
    setIsCompleted(false);
    setShowLoadingPreview(true);
    
    let completedAnimations = 0;
    const totalElements = drawableElements.length;
    const previewSpeed = 1.5;
    
    drawableElements.forEach((element, index) => {
      if (element instanceof SVGGeometryElement) {
        try {
          const length = element.getTotalLength();
          const baseDuration = Math.max(0.6, length / 250);
          const duration = baseDuration / previewSpeed;
          const delay = index * (0.2 / previewSpeed);
          
          applyAnimation(element, duration, delay, index, () => {
            completedAnimations++;
            setAnimationProgress((completedAnimations / totalElements) * 100);
            
            if (completedAnimations === totalElements) {
              setTimeout(() => {
                setIsAnimating(false);
                setAnimationProgress(100);
                setIsCompleted(true);
                
                setTimeout(() => {
                  setShowLoadingPreview(false);
                  resetAnimation();
                }, 800);
              }, 200);
            }
          });
          
        } catch (error) {
          setTimeout(() => {
            element.style.opacity = '1';
            element.style.transition = 'opacity 0.5s ease-in-out';
            completedAnimations++;
            setAnimationProgress((completedAnimations / totalElements) * 100);
          }, index * (200 / previewSpeed));
        }
      }
    });
  };

  const applyAnimation = (element: SVGGeometryElement, duration: number, delay: number, index: number, onComplete: () => void) => {
    const rainbowColors = ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'];
    
    setTimeout(() => {
      switch (animationStyle) {
        case 'draw':
          element.style.transition = `stroke-dashoffset ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`;
          element.style.strokeDashoffset = '0';
          break;
          
        case 'fade':
          element.style.transition = `opacity ${duration}s ease-in-out`;
          element.style.opacity = '1';
          break;
          
        case 'scale':
          element.style.transition = `all ${duration}s cubic-bezier(0.34, 1.56, 0.64, 1)`;
          element.style.opacity = '1';
          element.style.transform = 'scale(1)';
          break;

        case 'bounce':
          element.style.transition = `all ${duration}s cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
          element.style.opacity = '1';
          element.style.transform = 'scale(1)';
          break;

        case 'wave':
          element.style.transition = `all ${duration}s ease-in-out`;
          element.style.opacity = '1';
          element.style.transform = `translateY(0) rotate(${Math.sin(index) * 10}deg)`;
          break;

        case 'spiral':
          element.style.transition = `all ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
          element.style.opacity = '1';
          element.style.transform = 'scale(1) rotate(360deg)';
          break;

        case 'pulse':
          element.style.transition = `all ${duration}s ease-in-out`;
          element.style.opacity = '1';
          element.style.transform = 'scale(1)';
          element.style.animation = `pulse ${duration}s ease-in-out`;
          break;

        case 'elastic':
          element.style.transition = `all ${duration}s cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
          element.style.opacity = '1';
          element.style.transform = 'scale(1)';
          break;
          
        case 'rainbow':
          element.style.transition = `stroke ${duration}s ease-in-out, stroke-dashoffset ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`;
          element.style.strokeDashoffset = '0';
          
          // Animate through rainbow colors
          let colorIndex = 0;
          const colorInterval = setInterval(() => {
            element.style.stroke = rainbowColors[colorIndex % rainbowColors.length];
            colorIndex++;
          }, (duration * 1000) / rainbowColors.length);
          
          setTimeout(() => {
            clearInterval(colorInterval);
            element.style.stroke = strokeColor;
          }, duration * 1000);
          break;
      }
      
      // Add trail effect
      if (trailEffect && animationStyle === 'draw') {
        setTimeout(() => {
          const trail = element.cloneNode(true) as SVGGeometryElement;
          trail.style.stroke = strokeColor + '40'; // Semi-transparent
          trail.style.strokeWidth = `${strokeWidth * 1.5}`;
          trail.style.strokeDasharray = '';
          trail.style.strokeDashoffset = '';
          trail.style.animation = 'fadeOut 2s ease-out forwards';
          element.parentNode?.insertBefore(trail, element);
          
          setTimeout(() => {
            trail.remove();
          }, 2000);
        }, duration * 500);
      }
      
      setTimeout(onComplete, duration * 1000);
    }, 100 + delay * 1000);
  };

  const startAnimation = () => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current.querySelector('svg');
    if (!svg) return;
    
    const drawableElements = svg.querySelectorAll('path, circle, rect, ellipse, line, polyline, polygon');
    setIsAnimating(true);
    setAnimationProgress(0);
    setIsCompleted(false);
    setShowLoadingPreview(false);
    
    let completedAnimations = 0;
    const totalElements = drawableElements.length;
    
    const runAnimation = () => {
      completedAnimations = 0;
      setAnimationProgress(0);
      
      drawableElements.forEach((element, index) => {
        if (element instanceof SVGGeometryElement) {
          try {
            const length = element.getTotalLength();
            const baseDuration = Math.max(0.8, length / 200);
            const duration = baseDuration / animationSpeed;
            const delay = index * (0.3 / animationSpeed);
            
            applyAnimation(element, duration, delay, index, () => {
              completedAnimations++;
              setAnimationProgress((completedAnimations / totalElements) * 100);
              
              if (completedAnimations === totalElements) {
                setTimeout(() => {
                  setAnimationProgress(100);
                  setIsCompleted(true);
                  
                  if (isLooping) {
                    setLoopCount(prev => prev + 1);
                    // Rest period before next loop
                    setTimeout(() => {
                      resetAnimation();
                      setTimeout(() => {
                        runAnimation();
                      }, 100);
                    }, restDuration * 1000);
                  } else {
                    setIsAnimating(false);
                  }
                }, 200);
              }
            });
            
          } catch (error) {
            setTimeout(() => {
              element.style.opacity = '1';
              element.style.transition = 'opacity 0.5s ease-in-out';
              completedAnimations++;
              setAnimationProgress((completedAnimations / totalElements) * 100);
            }, index * (300 / animationSpeed));
          }
        }
      });
    };

    runAnimation();
  };

  const replayAnimation = () => {
    setLoopCount(0);
    resetAnimation();
    setTimeout(() => {
      startAnimation();
    }, 100);
  };

  const resetAnimation = () => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current.querySelector('svg');
    if (!svg) return;
    
    const allElements = svg.querySelectorAll('*');
    setAnimationProgress(0);
    setIsCompleted(false);
    
    allElements.forEach((element) => {
      if (element instanceof SVGGeometryElement) {
        try {
          const length = element.getTotalLength();
          element.style.transition = 'none';
          
          if (animationStyle === 'draw' || animationStyle === 'rainbow') {
            element.style.strokeDashoffset = `${length}`;
          } else if (['fade', 'scale', 'bounce', 'wave', 'spiral', 'pulse', 'elastic'].includes(animationStyle)) {
            element.style.opacity = '0';
          }
          
          if (['scale', 'bounce', 'spiral', 'pulse', 'elastic'].includes(animationStyle)) {
            element.style.transform = 'scale(0)';
          } else if (animationStyle === 'wave') {
            element.style.transform = 'translateY(20px) rotate(0deg)';
          }
        } catch (error) {
          element.style.transition = 'none';
          element.style.opacity = '0';
        }
      } else {
        element.style.transition = 'none';
        element.style.opacity = '0';
      }
    });
  };

  const pauseAnimation = () => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current.querySelector('svg');
    if (!svg) return;
    
    const allElements = svg.querySelectorAll('*');
    allElements.forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const currentOffset = computedStyle.strokeDashoffset;
      const currentOpacity = computedStyle.opacity;
      const currentTransform = computedStyle.transform;
      
      element.style.transition = 'none';
      element.style.strokeDashoffset = currentOffset;
      element.style.opacity = currentOpacity;
      element.style.transform = currentTransform;
    });
    
    setIsAnimating(false);
  };

  const stopLoop = () => {
    setIsLooping(false);
    setIsAnimating(false);
    setLoopCount(0);
  };

  const exportAsAnimatedSVG = () => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current.querySelector('svg');
    if (!svg) return;
    
    const clonedSvg = svg.cloneNode(true) as SVGElement;
    
    // Clean the SVG
    const allElements = clonedSvg.querySelectorAll('*');
    allElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.strokeDasharray = '';
      htmlElement.style.strokeDashoffset = '';
      htmlElement.style.transition = '';
      htmlElement.style.transitionDelay = '';
      htmlElement.style.animation = '';
      htmlElement.style.opacity = '';
      htmlElement.style.transform = '';
    });
    
    // Add CSS animation
    const style = document.createElement('style');
    const animationDuration = 4 / animationSpeed;
    const totalDuration = isLooping ? animationDuration + restDuration : animationDuration;
    
    let keyframes = '';
    switch (animationStyle) {
      case 'bounce':
        keyframes = `
          @keyframes svg-bounce {
            0% { opacity: 0; transform: scale(0); }
            ${isLooping ? (animationDuration / totalDuration * 100) : 100}% { opacity: 1; transform: scale(1); }
            ${isLooping ? '100%' : ''} { opacity: 1; transform: scale(1); }
          }
        `;
        break;
      case 'draw':
        keyframes = `
          @keyframes svg-draw {
            0% { stroke-dashoffset: 1000; }
            ${isLooping ? (animationDuration / totalDuration * 100) : 100}% { stroke-dashoffset: 0; }
            ${isLooping ? '100%' : ''} { stroke-dashoffset: 0; }
          }
        `;
        break;
      case 'fade':
        keyframes = `
          @keyframes svg-fade {
            0% { opacity: 0; }
            ${isLooping ? (animationDuration / totalDuration * 100) : 100}% { opacity: 1; }
            ${isLooping ? '100%' : ''} { opacity: 1; }
          }
        `;
        break;
      case 'scale':
        keyframes = `
          @keyframes svg-scale {
            0% { opacity: 0; transform: scale(0); }
            ${isLooping ? (animationDuration / totalDuration * 100) : 100}% { opacity: 1; transform: scale(1); }
            ${isLooping ? '100%' : ''} { opacity: 1; transform: scale(1); }
          }
        `;
        break;
      case 'wave':
        keyframes = `
          @keyframes svg-wave {
            0% { opacity: 0; transform: translateY(20px) rotate(0deg); }
            ${isLooping ? (animationDuration / totalDuration * 100) : 100}% { opacity: 1; transform: translateY(0) rotate(10deg); }
            ${isLooping ? '100%' : ''} { opacity: 1; transform: translateY(0) rotate(10deg); }
          }
        `;
        break;
      case 'spiral':
        keyframes = `
          @keyframes svg-spiral {
            0% { opacity: 0; transform: scale(0) rotate(0deg); }
            ${isLooping ? (animationDuration / totalDuration * 100) : 100}% { opacity: 1; transform: scale(1) rotate(360deg); }
            ${isLooping ? '100%' : ''} { opacity: 1; transform: scale(1) rotate(360deg); }
          }
        `;
        break;
      case 'pulse':
        keyframes = `
          @keyframes svg-pulse {
            0% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1.1); }
            ${isLooping ? (animationDuration / totalDuration * 100) : 100}% { opacity: 1; transform: scale(1); }
            ${isLooping ? '100%' : ''} { opacity: 1; transform: scale(1); }
          }
        `;
        break;
      case 'elastic':
        keyframes = `
          @keyframes svg-elastic {
            0% { opacity: 0; transform: scale(0); }
            ${isLooping ? (animationDuration / totalDuration * 100) : 100}% { opacity: 1; transform: scale(1); }
            ${isLooping ? '100%' : ''} { opacity: 1; transform: scale(1); }
          }
        `;
        break;
      case 'rainbow':
        keyframes = `
          @keyframes svg-rainbow {
            0% { stroke: #ff0000; stroke-dashoffset: 1000; }
            14% { stroke: #ff8000; }
            28% { stroke: #ffff00; }
            42% { stroke: #00ff00; }
            57% { stroke: #0080ff; }
            71% { stroke: #0000ff; }
            85% { stroke: #8000ff; }
            ${isLooping ? (animationDuration / totalDuration * 100) : 100}% { stroke: ${strokeColor}; stroke-dashoffset: 0; }
            ${isLooping ? '100%' : ''} { stroke: ${strokeColor}; stroke-dashoffset: 0; }
          }
        `;
        break;
    }
    
    style.textContent = `
      ${keyframes}
      path, circle, rect, ellipse, line, polyline, polygon {
        animation: svg-${animationStyle} ${totalDuration}s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${isLooping ? 'infinite' : 'forwards'};
        ${animationStyle === 'draw' || animationStyle === 'rainbow' ? 'stroke-dasharray: 1000;' : ''}
        stroke: ${strokeColor};
        stroke-width: ${strokeWidth};
        fill: ${showFill ? 'currentColor' : 'none'};
        stroke-linecap: round;
        stroke-linejoin: round;
        filter: drop-shadow(0 0 ${glowIntensity}px ${strokeColor});
      }
    `;
    
    clonedSvg.insertBefore(style, clonedSvg.firstChild);
    
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.replace('.svg', '')}_animated_${animationStyle}${isLooping ? '_loop' : ''}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsStaticSVG = () => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current.querySelector('svg');
    if (!svg) return;
    
    const clonedSvg = svg.cloneNode(true) as SVGElement;
    
    // Clean and prepare for static export
    const allElements = clonedSvg.querySelectorAll('*');
    allElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.strokeDasharray = '';
      htmlElement.style.strokeDashoffset = '';
      htmlElement.style.transition = '';
      htmlElement.style.transitionDelay = '';
      htmlElement.style.animation = '';
      htmlElement.style.opacity = '1';
      htmlElement.style.transform = '';
    });
    
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.replace('.svg', '')}_static.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsPNG = () => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current.querySelector('svg');
    if (!svg) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const scale = 2;
    canvas.width = svgSize * scale;
    canvas.height = svgSize * scale;
    ctx.scale(scale, scale);
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = isDarkMode ? '#1f2937' : 'white';
      ctx.fillRect(0, 0, svgSize, svgSize);
      ctx.drawImage(img, 0, 0, svgSize, svgSize);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = `${fileName.replace('.svg', '')}_${svgSize}x${svgSize}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
        }
      }, 'image/png');
      
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };

  const copyToClipboard = async () => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current.querySelector('svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    
    try {
      await navigator.clipboard.writeText(svgData);
      const button = document.activeElement as HTMLElement;
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      setTimeout(() => {
        if (button.textContent === 'Copied!') {
          button.textContent = originalText;
        }
      }, 2000);
    } catch (err) {
      console.error('Failed to copy SVG code:', err);
    }
  };

  const getControlsBackground = () => {
    return isDarkMode 
      ? 'bg-white/5 backdrop-blur-sm border-white/10' 
      : 'bg-white/50 backdrop-blur-sm border-gray-200';
  };

  const getTextColors = () => {
    return isDarkMode 
      ? { primary: 'text-white', secondary: 'text-gray-300', muted: 'text-gray-400' }
      : { primary: 'text-gray-900', secondary: 'text-gray-700', muted: 'text-gray-600' };
  };

  const textColors = getTextColors();

  return (
    <div className="w-full max-w-7xl">
      {/* Loading Preview Banner */}
      {showLoadingPreview && (
        <div className={`mb-6 p-4 rounded-2xl border backdrop-blur-sm ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/20' 
            : 'bg-gradient-to-r from-purple-100 to-cyan-100 border-purple-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              <div>
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  Loading Preview
                </h3>
                <p className={`text-xs ${textColors.muted}`}>
                  Showing how your SVG will animate
                </p>
              </div>
            </div>
            <div className={`flex items-center space-x-2 text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
              <span>{Math.round(animationProgress)}%</span>
              <div className={`w-16 h-1 rounded-full overflow-hidden ${
                isDarkMode ? 'bg-purple-900/50' : 'bg-purple-200'
              }`}>
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-cyan-400 transition-all duration-300"
                  style={{ width: `${animationProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            showLoadingPreview 
              ? 'bg-purple-400 animate-pulse' 
              : isAnimating 
                ? 'bg-emerald-400 animate-pulse' 
                : isCompleted 
                  ? 'bg-emerald-400' 
                  : 'bg-gray-400'
          }`}></div>
          <h2 className={`text-xl font-semibold truncate max-w-xs ${textColors.primary}`}>
            {fileName}
          </h2>
          <span className={`px-3 py-1 text-xs rounded-full ${
            isDarkMode 
              ? 'bg-purple-500/20 text-purple-300' 
              : 'bg-purple-100 text-purple-700'
          }`}>
            {pathCount} paths
          </span>
          {(isAnimating || showLoadingPreview) && (
            <span className={`px-3 py-1 text-xs rounded-full ${
              isDarkMode 
                ? 'bg-emerald-500/20 text-emerald-300' 
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {Math.round(animationProgress)}% drawn
            </span>
          )}
          {isCompleted && !isAnimating && !showLoadingPreview && (
            <span className={`px-3 py-1 text-xs rounded-full ${
              isDarkMode 
                ? 'bg-emerald-500/20 text-emerald-300' 
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              Complete
            </span>
          )}
          {isLooping && loopCount > 0 && (
            <span className={`px-3 py-1 text-xs rounded-full ${
              isDarkMode 
                ? 'bg-blue-500/20 text-blue-300' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              Loop #{loopCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className={`p-2 rounded-xl transition-colors ${
                isDarkMode 
                  ? 'bg-white/10 hover:bg-white/20 text-gray-300' 
                  : 'bg-black/10 hover:bg-black/20 text-gray-700'
              }`}
              disabled={showLoadingPreview}
            >
              <Download className="w-5 h-5" />
            </button>
            
            {showExportMenu && !showLoadingPreview && (
              <div className={`absolute right-0 top-12 w-56 rounded-xl shadow-xl z-10 border ${
                isDarkMode 
                  ? 'bg-gray-800/95 backdrop-blur-sm border-white/10' 
                  : 'bg-white/95 backdrop-blur-sm border-gray-200'
              }`}>
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      exportAsAnimatedSVG();
                      setShowExportMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-white/10' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Export Animated SVG</span>
                  </button>
                  <button
                    onClick={() => {
                      exportAsStaticSVG();
                      setShowExportMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-white/10' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FileImage className="w-4 h-4" />
                    <span>Export Static SVG</span>
                  </button>
                  <button
                    onClick={() => {
                      exportAsPNG();
                      setShowExportMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-white/10' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FileImage className="w-4 h-4" />
                    <span>Export as PNG</span>
                  </button>
                  <button
                    onClick={() => {
                      copyToClipboard();
                      setShowExportMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-white/10' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    <span>Copy SVG Code</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout: Left Controls, Right Preview */}
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left Side - Controls Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enhanced Controls Panel - Always Visible */}
          {!showLoadingPreview && (
            <div className={`p-6 rounded-2xl border space-y-8 h-fit ${getControlsBackground()}`}>
              {/* Creative Controls Header */}
              <div className={`flex items-center space-x-2 pb-4 border-b ${
                isDarkMode ? 'border-white/10' : 'border-gray-200'
              }`}>
                <Sparkles className="w-5 h-5 text-pink-400" />
                <h3 className={`text-lg font-semibold ${textColors.primary}`}>Animation Controls</h3>
              </div>

              {/* Basic Controls */}
              <div className="space-y-6">
                {/* Speed Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className={`text-sm font-medium ${textColors.secondary}`}>Speed</span>
                    </div>
                    <span className="text-sm text-yellow-300 font-bold">{animationSpeed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.5"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className={`flex justify-between text-xs ${textColors.muted}`}>
                    <span>Slow</span>
                    <span>~{Math.round(4 / animationSpeed)}s</span>
                    <span>Fast</span>
                  </div>
                </div>

                {/* Size Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Maximize2 className="w-4 h-4 text-cyan-400" />
                      <span className={`text-sm font-medium ${textColors.secondary}`}>Size</span>
                    </div>
                    <span className="text-sm text-cyan-300 font-bold">{svgSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="500"
                    step="25"
                    value={svgSize}
                    onChange={(e) => setSvgSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-cyan"
                  />
                  <div className={`flex justify-between text-xs ${textColors.muted}`}>
                    <span>Small</span>
                    <span>Large</span>
                  </div>
                </div>
              </div>

              {/* Loop Controls */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Infinity className="w-4 h-4 text-blue-400" />
                  <span className={`text-sm font-medium ${textColors.secondary}`}>Loop Animation</span>
                </div>
                
                <label className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg ${
                  isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={isLooping}
                    onChange={(e) => setIsLooping(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className={`text-sm ${textColors.secondary}`}>Enable infinite loop</span>
                </label>

                {isLooping && (
                  <div className="space-y-3 ml-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className={`text-sm ${textColors.secondary}`}>Rest Duration</span>
                      </div>
                      <span className="text-sm text-orange-300 font-bold">{restDuration}s</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={restDuration}
                      onChange={(e) => setRestDuration(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className={`flex justify-between text-xs ${textColors.muted}`}>
                      <span>No rest</span>
                      <span>5s pause</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Animation Style */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <span className={`text-sm font-medium ${textColors.secondary}`}>Animation Style</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'bounce', label: 'Bounce', icon: '🎾' },
                    { value: 'draw', label: 'Draw', icon: '✏️' },
                    { value: 'fade', label: 'Fade', icon: '✨' },
                    { value: 'scale', label: 'Scale', icon: '🔍' },
                    { value: 'wave', label: 'Wave', icon: '🌊' },
                    { value: 'spiral', label: 'Spiral', icon: '🌀' },
                    { value: 'pulse', label: 'Pulse', icon: '💓' },
                    { value: 'elastic', label: 'Elastic', icon: '🎪' },
                    { value: 'rainbow', label: 'Rainbow', icon: '🌈' }
                  ].map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setAnimationStyle(style.value as any)}
                      className={`p-2 rounded-xl text-xs font-medium transition-all ${
                        animationStyle === style.value
                          ? isDarkMode
                            ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                            : 'bg-purple-100 text-purple-700 border border-purple-300'
                          : isDarkMode
                            ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700'
                      }`}
                    >
                      <div className="text-sm mb-1">{style.icon}</div>
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Controls */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-pink-400" />
                  <span className={`text-sm font-medium ${textColors.secondary}`}>Color & Stroke</span>
                </div>
                
                {/* Color Picker */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      className="w-12 h-8 rounded-lg border-2 border-white/20 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none ${
                        isDarkMode 
                          ? 'bg-gray-700/50 border-gray-600 text-gray-300 focus:border-purple-500' 
                          : 'bg-white border-gray-300 text-gray-700 focus:border-purple-500'
                      }`}
                      placeholder="#8b5cf6"
                    />
                  </div>
                  
                  {/* Color Presets */}
                  <div className="grid grid-cols-4 gap-2">
                    {colorPresets.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setStrokeColor(color.value)}
                        className={`w-full h-8 rounded-lg border-2 transition-all ${
                          strokeColor === color.value 
                            ? 'border-white scale-105' 
                            : 'border-white/30 hover:border-white/60'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Stroke Width */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${textColors.muted}`}>Stroke Width</span>
                    <span className={`text-sm font-medium ${textColors.secondary}`}>{strokeWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="0.5"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>

              {/* Effects Controls */}
              <div className="space-y-4">
                <h4 className={`text-sm font-medium ${textColors.secondary}`}>Visual Effects</h4>
                
                {/* Glow Intensity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${textColors.muted}`}>Glow Intensity</span>
                    <span className={`text-sm font-medium ${textColors.secondary}`}>{glowIntensity}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={glowIntensity}
                    onChange={(e) => setGlowIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Toggle Effects */}
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg ${
                    isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                  }`}>
                    <input
                      type="checkbox"
                      checked={showFill}
                      onChange={(e) => setShowFill(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className={`text-sm ${textColors.secondary}`}>Show Fill</span>
                  </label>

                  <label className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg ${
                    isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                  }`}>
                    <input
                      type="checkbox"
                      checked={rotateAnimation}
                      onChange={(e) => setRotateAnimation(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className={`text-sm ${textColors.secondary}`}>Rotate</span>
                  </label>

                  <label className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg ${
                    isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                  }`}>
                    <input
                      type="checkbox"
                      checked={pulseEffect}
                      onChange={(e) => setPulseEffect(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className={`text-sm ${textColors.secondary}`}>Pulse</span>
                  </label>

                  <label className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg ${
                    isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                  }`}>
                    <input
                      type="checkbox"
                      checked={trailEffect}
                      onChange={(e) => setTrailEffect(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className={`text-sm ${textColors.secondary}`}>Trail</span>
                  </label>
                </div>
              </div>

              {/* Control Buttons */}
              <div className={`pt-4 border-t space-y-3 ${
                isDarkMode ? 'border-white/10' : 'border-gray-200'
              }`}>
                <button
                  onClick={isAnimating ? (isLooping ? stopLoop : pauseAnimation) : startAnimation}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isAnimating ? (
                    isLooping ? (
                      <>
                        <Pause className="w-5 h-5" />
                        <span className="font-medium">Stop Loop</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-5 h-5" />
                        <span className="font-medium">Pause</span>
                      </>
                    )
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span className="font-medium">
                        {isLooping ? 'Start Loop' : 'Start Animation'}
                      </span>
                    </>
                  )}
                </button>
                
                <div className="flex space-x-2">
                  {isCompleted && !isAnimating && (
                    <button
                      onClick={replayAnimation}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <Repeat className="w-4 h-4" />
                      <span>Replay</span>
                    </button>
                  )}
                  
                  <button
                    onClick={resetAnimation}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 shadow-lg ${
                      isDarkMode 
                        ? 'bg-white/10 hover:bg-white/20 text-gray-300' 
                        : 'bg-black/10 hover:bg-black/20 text-gray-700'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Preview Message */}
          {showLoadingPreview && (
            <div className={`p-6 rounded-2xl border ${getControlsBackground()}`}>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <p className={`text-sm mb-2 ${textColors.secondary}`}>
                    ✨ Preview Mode Active
                  </p>
                  <p className={`text-xs ${textColors.muted}`}>
                    Controls will appear once the preview completes
                  </p>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200'
                }`}>
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-cyan-400 transition-all duration-300"
                    style={{ width: `${animationProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - SVG Preview */}
        <div className="lg:col-span-3">
          <div className={`relative rounded-2xl overflow-hidden border h-fit ${getControlsBackground()}`}>
            <div 
              className="p-8 flex items-center justify-center transition-all duration-300"
              style={{ 
                minHeight: `${Math.max(svgSize + 64, 300)}px`,
                maxHeight: '80vh'
              }}
            >
              <div 
                ref={svgRef}
                className="flex items-center justify-center transition-all duration-300 ease-out"
                style={{ 
                  filter: showLoadingPreview 
                    ? `drop-shadow(0 0 30px ${strokeColor}80)` 
                    : `drop-shadow(0 0 20px ${strokeColor}60)`
                }}
              />
            </div>
            
            {/* Animation Progress Bar */}
            {(isAnimating || showLoadingPreview) && (
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200'
              }`}>
                <div 
                  className="h-full transition-all duration-300 bg-gradient-to-r from-purple-500 to-cyan-500"
                  style={{ width: `${animationProgress}%` }}
                />
              </div>
            )}

            {/* Animation Overlay */}
            {(isAnimating || showLoadingPreview) && (
              <div className={`absolute inset-0 animate-pulse pointer-events-none ${
                showLoadingPreview 
                  ? isDarkMode
                    ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10'
                    : 'bg-gradient-to-r from-purple-200/30 to-cyan-200/30'
                  : isDarkMode
                    ? 'bg-gradient-to-r from-purple-500/5 to-cyan-500/5'
                    : 'bg-gradient-to-r from-purple-100/30 to-cyan-100/30'
              }`} />
            )}

            {/* Size Indicator */}
            <div className={`absolute top-4 right-4 px-3 py-1 backdrop-blur-sm rounded-lg text-xs ${
              isDarkMode 
                ? 'bg-black/50 text-gray-300' 
                : 'bg-white/70 text-gray-700'
            }`}>
              {svgSize} × {svgSize}px
            </div>

            {/* Loading Preview Indicator */}
            {showLoadingPreview && (
              <div className={`absolute top-4 left-4 px-3 py-1 backdrop-blur-sm rounded-lg text-xs border ${
                isDarkMode 
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                  : 'bg-purple-100 text-purple-700 border-purple-300'
              }`}>
                Preview Mode
              </div>
            )}

            {/* Loop Status */}
            {isLooping && isAnimating && (
              <div className={`absolute top-4 left-4 px-3 py-1 backdrop-blur-sm rounded-lg text-xs border ${
                isDarkMode 
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                  : 'bg-blue-100 text-blue-700 border-blue-300'
              }`}>
                Loop Mode • Rest: {restDuration}s
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};