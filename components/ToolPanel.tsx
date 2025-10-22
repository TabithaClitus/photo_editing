
import React, { useState, useEffect } from 'react';
import { ToolType, FilterSettings, OverlayState } from '../types';
import { RotateCcwIcon, RotateCwIcon, FlipHorizontalIcon, FlipVerticalIcon } from './Icons';

interface ToolPanelProps {
  activeTool: ToolType | null;
  filters: FilterSettings;
  overlay: OverlayState | null;
  onFilterChange: (filter: keyof FilterSettings, value: number) => void;
  onApply: () => void;
  onResetFilters: () => void;
  onAIPrompt: (prompt: string) => void;
  onRemoveBackground: () => void;
  onAutoEnhance: () => void;
  onFaceRetouch: () => void;
  onSharpen: () => void;
  onRotate: (degrees: number) => void;
  onFlip: (direction: 'horizontal' | 'vertical') => void;
  onResize: (width: number, height: number) => void;
  onOverlayChange: (overlay: OverlayState | null) => void;
  image: string | null;
}

const Slider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min?: number; max?: number; step?: number; }> = ({ label, value, onChange, min = 0, max = 200, step = 1 }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-sm">
        <label className="font-medium">{label}</label>
        <span>{value}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary" />
  </div>
);

const ToolPanel: React.FC<ToolPanelProps> = (props) => {
    const { activeTool, filters, onFilterChange, onApply, onResetFilters, onAIPrompt, onRemoveBackground, onAutoEnhance, onFaceRetouch, onSharpen, onRotate, onFlip, onResize, onOverlayChange, overlay, image } = props;
    const [prompt, setPrompt] = useState('');
    const [resize, setResize] = useState({ width: 0, height: 0, aspect: true });

    useEffect(() => {
        if (image && activeTool === 'resize') {
            const img = new Image();
            img.onload = () => setResize({ width: img.width, height: img.height, aspect: true });
            img.src = image;
        }
    }, [image, activeTool]);

    const handleAIPromptSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAIPrompt(prompt);
        setPrompt('');
    };

    const handleResizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newDim = { ...resize, [name]: parseInt(value, 10) || 0 };
        if (resize.aspect && image) {
            const img = new Image();
            img.onload = () => {
                const originalAspect = img.width / img.height;
                if (name === 'width') {
                    newDim.height = Math.round(newDim.width / originalAspect);
                } else {
                    newDim.width = Math.round(newDim.height * originalAspect);
                }
                setResize(newDim);
            };
            img.src = image;
        } else {
            setResize(newDim);
        }
    }

    const handleResizeSubmit = () => {
        if (resize.width > 0 && resize.height > 0) {
            onResize(resize.width, resize.height);
        }
    };
    
    const handleOverlayUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    onOverlayChange({
                        src: ev.target?.result as string,
                        opacity: 1,
                        x: 0, y: 0, width: img.width, height: img.height
                    });
                }
                img.src = ev.target?.result as string;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    }

    const adjustmentTools: { id: keyof FilterSettings, name: string, min?: number, max?: number }[] = [
        { id: 'brightness', name: 'Brightness', min: 0, max: 200 },
        { id: 'contrast', name: 'Contrast', min: 0, max: 200 },
        { id: 'saturate', name: 'Saturation', min: 0, max: 200 },
        { id: 'temperature', name: 'Temperature', min: -100, max: 100 },
        { id: 'grayscale', name: 'Grayscale', min: 0, max: 100 },
        { id: 'sepia', name: 'Sepia', min: 0, max: 100 },
        { id: 'blur', name: 'Blur', min: 0, max: 20 },
        { id: 'vignette', name: 'Vignette', min: 0, max: 100 },
        { id: 'hue-rotate', name: 'Hue', min: 0, max: 360 },
    ];
    
    const isAdjustmentTool = activeTool && adjustmentTools.some(t => t.id === activeTool);
    const isAiTool = activeTool && ['remove-bg', 'enhance', 'face-retouch', 'sharpen'].includes(activeTool);

    return (
        <div className="w-64 bg-light-surface dark:bg-dark-surface p-4 shadow-lg overflow-y-auto flex flex-col animate-fadeIn">
          <h3 className="text-lg font-semibold mb-4 capitalize">{activeTool?.replace('-', ' ')}</h3>
          
          <div className="flex-1 space-y-6">
            {isAdjustmentTool && adjustmentTools.filter(t => t.id === activeTool).map(tool => (
                <Slider key={tool.id} label={tool.name} min={tool.min} max={tool.max}
                    value={filters[tool.id as keyof FilterSettings]}
                    onChange={(e) => onFilterChange(tool.id as keyof FilterSettings, Number(e.target.value))} />
            ))}

            {activeTool === 'rotate' && (
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onRotate(-90)} className="flex items-center justify-center space-x-2 p-2 rounded-md bg-gray-200 dark:bg-secondary hover:bg-gray-300 dark:hover:bg-secondary-hover transition-colors"><RotateCcwIcon className="h-5 w-5" /><span>Left</span></button>
                    <button onClick={() => onRotate(90)} className="flex items-center justify-center space-x-2 p-2 rounded-md bg-gray-200 dark:bg-secondary hover:bg-gray-300 dark:hover:bg-secondary-hover transition-colors"><RotateCwIcon className="h-5 w-5" /><span>Right</span></button>
                    <button onClick={() => onFlip('horizontal')} className="flex items-center justify-center space-x-2 p-2 rounded-md bg-gray-200 dark:bg-secondary hover:bg-gray-300 dark:hover:bg-secondary-hover transition-colors"><FlipHorizontalIcon className="h-5 w-5" /><span>Horizontal</span></button>
                    <button onClick={() => onFlip('vertical')} className="flex items-center justify-center space-x-2 p-2 rounded-md bg-gray-200 dark:bg-secondary hover:bg-gray-300 dark:hover:bg-secondary-hover transition-colors"><FlipVerticalIcon className="h-5 w-5" /><span>Vertical</span></button>
                </div>
            )}
            
            {activeTool === 'resize' && (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <input type="number" name="width" value={resize.width} onChange={handleResizeChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-light-surface dark:bg-secondary" />
                        <span className="font-semibold">x</span>
                        <input type="number" name="height" value={resize.height} onChange={handleResizeChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-light-surface dark:bg-secondary" />
                    </div>
                    <div className="flex items-center">
                        <input id="aspect" type="checkbox" checked={resize.aspect} onChange={(e) => setResize(r => ({...r, aspect: e.target.checked}))} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="aspect" className="ml-2 block text-sm">Lock aspect ratio</label>
                    </div>
                    <button onClick={handleResizeSubmit} className="w-full py-2 px-4 rounded-md text-white bg-primary hover:bg-primary-hover transition-colors">Apply Resize</button>
                </div>
            )}

            {activeTool === 'overlay' && (
                <div className="space-y-4">
                    <input type="file" onChange={handleOverlayUpload} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                    {overlay && (
                       <>
                         <Slider label="Opacity" min={0} max={100} value={overlay.opacity * 100} onChange={e => onOverlayChange({...overlay, opacity: Number(e.target.value)/100})} />
                         <p className="text-xs text-gray-500 dark:text-gray-400">Overlay is centered. For more control, use the 'AI Edit' tool.</p>
                       </>
                    )}
                </div>
            )}

            {activeTool === 'ai-prompt' && (
                <form onSubmit={handleAIPromptSubmit} className="space-y-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Describe the edit you want. e.g., "make the sky a vibrant sunset".</p>
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter your prompt..." className="w-full p-2 border rounded-md bg-light-surface dark:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary" rows={4} />
                    <button type="submit" disabled={!prompt} className="w-full py-2 px-4 rounded-md text-white bg-primary hover:bg-primary-hover disabled:bg-gray-500 transition-colors">Apply AI Edit</button>
                </form>
            )}

            {isAiTool && (
                <div className="space-y-3">
                     <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activeTool === 'remove-bg' && 'Automatically detect and remove the background.'}
                        {activeTool === 'enhance' && 'Improve brightness, contrast, and color balance with one click.'}
                        {activeTool === 'face-retouch' && 'Perform a natural-looking retouch on faces.'}
                        {activeTool === 'sharpen' && 'Increase image detail and clarity using AI.'}
                     </p>
                    <button onClick={() => {
                        if (activeTool === 'remove-bg') onRemoveBackground();
                        if (activeTool === 'enhance') onAutoEnhance();
                        if (activeTool === 'face-retouch') onFaceRetouch();
                        if (activeTool === 'sharpen') onSharpen();
                    }} className="w-full py-2 px-4 rounded-md text-white bg-primary hover:bg-primary-hover transition-colors">
                        {`Apply ${activeTool.replace('-', ' ')}`}
                    </button>
                </div>
            )}
          </div>
          
          {(isAdjustmentTool || activeTool === 'overlay') && (
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <button onClick={onApply} className="w-full py-2 px-4 rounded-md text-white bg-primary hover:bg-primary-hover transition-colors">Apply</button>
                    <button onClick={onResetFilters} className="w-full py-2 px-4 rounded-md text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-secondary hover:bg-gray-300 dark:hover:bg-secondary-hover transition-colors">Reset</button>
                </div>
            )}
        </div>
    );
};

export default ToolPanel;
