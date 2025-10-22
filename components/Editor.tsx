
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ToolType, FilterSettings, HistoryState, OverlayState } from '../types';
import * as geminiService from '../services/geminiService';
import Header from './Header';
import Sidebar from './Sidebar';
import MainCanvas from './MainCanvas';
import ToolPanel from './ToolPanel';
import UploadPlaceholder from './UploadPlaceholder';

interface EditorProps {
  user: string;
  onLogout: () => void;
}

const INITIAL_FILTERS: FilterSettings = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  'hue-rotate': 0,
  blur: 0,
  temperature: 0,
  vignette: 0,
};

const Editor: React.FC<EditorProps> = ({ user, onLogout }) => {
  const [image, setImage] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [filters, setFilters] = useState<FilterSettings>(INITIAL_FILTERS);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [overlay, setOverlay] = useState<OverlayState | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateHistory = useCallback((newImageData: string, newFilters: FilterSettings = INITIAL_FILTERS) => {
    const newState: HistoryState = { imageData: newImageData, filters: newFilters };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setImage(newImageData);
    setFilters(newFilters);
    localStorage.setItem(`photo-editor-image-${user}`, newImageData);
  }, [history, historyIndex, user]);
  
  useEffect(() => {
    const savedImage = localStorage.getItem(`photo-editor-image-${user}`);
    if (savedImage) {
        setImage(savedImage);
        const initialState = { imageData: savedImage, filters: INITIAL_FILTERS };
        setHistory([initialState]);
        setHistoryIndex(0);
    }
  }, [user]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const initialState = { imageData: result, filters: INITIAL_FILTERS };
      setHistory([initialState]);
      setHistoryIndex(0);
      setImage(result);
      setFilters(INITIAL_FILTERS);
      setOverlay(null);
      setZoom(1);
      localStorage.setItem(`photo-editor-image-${user}`, result);
    };
    reader.readAsDataURL(file);
  };

  const handleFilterChange = (filter: keyof FilterSettings, value: number) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
  };

  const applyCurrentStateToHistory = (newImageData: string) => {
      updateHistory(newImageData);
      setOverlay(null);
      setFilters(INITIAL_FILTERS);
  }

  const applyFilters = () => {
    if (!canvasRef.current) return;
    applyCurrentStateToHistory(canvasRef.current.toDataURL('image/png'));
  };
  
  const resetFilters = () => {
      setFilters(INITIAL_FILTERS);
  }

  const handleToolSelect = (tool: ToolType | null) => {
    if(activeTool && activeTool !== tool && !['remove-bg', 'enhance', 'ai-prompt', 'face-retouch', 'sharpen'].includes(activeTool)){
        // Apply changes from sliders when switching tools
        applyFilters();
    }
    setActiveTool(tool);
  };
  
  const executeAIOperation = async (operation: (img: string, ...args: any[]) => Promise<string>, message: string, ...args: any[]) => {
      if (!image) return;
      setIsLoading(true);
      setLoadingMessage(message);
      try {
        const currentImage = canvasRef.current?.toDataURL('image/png') || image;
        const result = await operation(currentImage, ...args);
        updateHistory(result);
      } catch (error) {
        console.error("AI operation failed:", error);
        alert("An error occurred with the AI operation. Please check your API key and try again.");
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
        setActiveTool(null);
      }
  };

  const performDestructiveTransformation = (transformation: (img: HTMLImageElement) => string) => {
      if (!image) return;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
          const newDataUrl = transformation(img);
          updateHistory(newDataUrl);
          setActiveTool(null);
      };
      img.src = image;
  }

  const handleRotate = (degrees: number) => {
    performDestructiveTransformation((img) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const is90or270 = Math.abs(degrees) === 90 || Math.abs(degrees) === 270;
        canvas.width = is90or270 ? img.height : img.width;
        canvas.height = is90or270 ? img.width : img.height;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(degrees * Math.PI / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        return canvas.toDataURL('image/png');
    });
  };

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
      performDestructiveTransformation((img) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.translate(direction === 'horizontal' ? canvas.width : 0, direction === 'vertical' ? canvas.height : 0);
        ctx.scale(direction === 'horizontal' ? -1 : 1, direction === 'vertical' ? -1 : 1);
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL('image/png');
    });
  };

    const handleResize = (width: number, height: number) => {
        performDestructiveTransformation(img => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, width, height);
            return canvas.toDataURL('image/png');
        });
    };

  const handleAIPrompt = (prompt: string) => {
    if (prompt) executeAIOperation(geminiService.applyAIPrompt, 'Applying AI magic...', prompt);
  };
  const handleRemoveBackground = () => executeAIOperation(geminiService.removeBackground, 'Removing background...');
  const handleAutoEnhance = () => executeAIOperation(geminiService.autoEnhance, 'Auto-enhancing image...');
  const handleFaceRetouch = () => executeAIOperation(geminiService.faceRetouch, 'Retouching face...');
  const handleSharpen = () => executeAIOperation(geminiService.sharpenImage, 'Sharpening image...');

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevState = history[newIndex];
      setImage(prevState.imageData);
      setFilters(prevState.filters);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextState = history[newIndex];
      setImage(nextState.imageData);
      setFilters(nextState.filters);
    }
  };
  
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  
  return (
    <div className="flex flex-col h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50 animate-fadeIn">
          <div className="w-16 h-16 border-4 border-t-primary border-gray-600 rounded-full animate-spinner"></div>
          <p className="mt-4 text-lg text-white">{loadingMessage}</p>
        </div>
      )}
      <Header 
        user={user} 
        onLogout={onLogout} 
        onImageUpload={handleImageUpload} 
        canvasRef={canvasRef}
        hasImage={!!image}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        zoom={zoom}
        onZoomChange={setZoom}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onToolSelect={handleToolSelect} activeTool={activeTool} />
        {activeTool && 
            <ToolPanel 
                activeTool={activeTool} 
                filters={filters}
                overlay={overlay} 
                onFilterChange={handleFilterChange}
                onApply={applyFilters}
                onResetFilters={resetFilters}
                onAIPrompt={handleAIPrompt}
                onRemoveBackground={handleRemoveBackground}
                onAutoEnhance={handleAutoEnhance}
                onFaceRetouch={handleFaceRetouch}
                onSharpen={handleSharpen}
                onRotate={handleRotate}
                onFlip={handleFlip}
                onResize={handleResize}
                onOverlayChange={setOverlay}
                image={image}
            />
        }
        <main className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-light-bg dark:bg-secondary/20 overflow-auto">
          {image ? (
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}>
                <MainCanvas ref={canvasRef} imageSrc={image} filters={filters} overlay={overlay} />
            </div>
          ) : (
            <UploadPlaceholder onImageUpload={handleImageUpload} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Editor;
