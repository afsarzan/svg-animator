import React, { useCallback, useState } from 'react';
import { Upload, File, X, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File, content: string) => void;
  isUploading: boolean;
  isDarkMode: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isUploading, isDarkMode }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const processFile = async (file: File) => {
    if (!file.type.includes('svg')) {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 3000);
      return;
    }

    try {
      const content = await file.text();
      onFileUpload(file, content);
      setUploadStatus('success');
      setTimeout(() => setUploadStatus('idle'), 2000);
    } catch (error) {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'success': return 'text-emerald-400 border-emerald-400/50';
      case 'error': return 'text-red-400 border-red-400/50';
      default: 
        if (dragActive) {
          return 'text-purple-400 border-purple-400/50';
        }
        return isDarkMode ? 'text-gray-400 border-gray-600' : 'text-gray-600 border-gray-300';
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'success': return <CheckCircle className="w-8 h-8" />;
      case 'error': return <X className="w-8 h-8" />;
      default: return <Upload className="w-8 h-8" />;
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'success': return 'SVG uploaded successfully!';
      case 'error': return 'Please upload a valid SVG file';
      default: return dragActive ? 'Drop your SVG file here' : 'Drop SVG file here or click to browse';
    }
  };

  const getBackgroundClasses = () => {
    if (isDarkMode) {
      return 'backdrop-blur-sm bg-white/5 hover:bg-white/10';
    } else {
      return 'backdrop-blur-sm bg-white/50 hover:bg-white/70';
    }
  };

  const getTextClasses = () => {
    if (isDarkMode) {
      return {
        primary: 'text-gray-200',
        secondary: 'text-gray-500'
      };
    } else {
      return {
        primary: 'text-gray-800',
        secondary: 'text-gray-600'
      };
    }
  };

  const textClasses = getTextClasses();

  return (
    <div className="w-full max-w-2xl">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${getBackgroundClasses()} ${getStatusColor()}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".svg,image/svg+xml"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`transition-transform duration-300 ${dragActive ? 'scale-110' : 'scale-100'}`}>
            {getStatusIcon()}
          </div>
          
          <div className="space-y-2">
            <p className={`text-lg font-medium ${textClasses.primary}`}>
              {getStatusText()}
            </p>
            <p className={`text-sm ${textClasses.secondary}`}>
              SVG files only • Max 10MB
            </p>
          </div>
          
          {!isUploading && (
            <div className={`flex items-center space-x-2 text-xs ${textClasses.secondary}`}>
              <File className="w-4 h-4" />
              <span>Supports all SVG formats</span>
            </div>
          )}
        </div>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>
        )}
      </div>
    </div>
  );
};