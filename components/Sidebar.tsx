import React from 'react';
import { ToolType } from '../types';
import { BrightnessIcon, ContrastIcon, SaturateIcon, GrayscaleIcon, SepiaIcon, HueIcon, BlurIcon, CutIcon, StarIcon, SparklesIcon, SharpenIcon, TemperatureIcon, VignetteIcon, RotateCcwIcon, ResizeIcon, LayersIcon, FaceRetouchIcon } from './Icons';

interface SidebarProps {
  onToolSelect: (tool: ToolType | null) => void;
  activeTool: ToolType | null;
}

interface Tool {
    id: ToolType;
    name: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const toolSections: { title: string; tools: Tool[] }[] = [
    {
        title: 'Adjust',
        tools: [
            { id: 'brightness', name: 'Brightness', icon: BrightnessIcon },
            { id: 'contrast', name: 'Contrast', icon: ContrastIcon },
            { id: 'saturate', name: 'Saturation', icon: SaturateIcon },
            { id: 'temperature', name: 'Temperature', icon: TemperatureIcon },
            { id: 'vignette', name: 'Vignette', icon: VignetteIcon },
            { id: 'hue-rotate', name: 'Hue', icon: HueIcon },
            { id: 'blur', name: 'Blur', icon: BlurIcon },
            { id: 'grayscale', name: 'Grayscale', icon: GrayscaleIcon },
            { id: 'sepia', name: 'Sepia', icon: SepiaIcon },
        ],
    },
    {
        title: 'Transform',
        tools: [
            { id: 'rotate', name: 'Rotate', icon: RotateCcwIcon },
            { id: 'resize', name: 'Resize', icon: ResizeIcon },
            { id: 'overlay', name: 'Overlay', icon: LayersIcon },
        ],
    },
    {
        title: 'AI Tools',
        tools: [
            { id: 'enhance', name: 'Enhance', icon: StarIcon },
            { id: 'remove-bg', name: 'Remove BG', icon: CutIcon },
            { id: 'sharpen', name: 'Sharpen', icon: SharpenIcon },
            { id: 'face-retouch', name: 'Face Retouch', icon: FaceRetouchIcon },
            { id: 'ai-prompt', name: 'AI Edit', icon: SparklesIcon },
        ]
    }
];

const Sidebar: React.FC<SidebarProps> = ({ onToolSelect, activeTool }) => {
  return (
    <aside className="w-20 bg-light-surface dark:bg-dark-surface shadow-lg flex flex-col items-center py-4 z-10 overflow-y-auto">
      <nav className="flex-1 w-full">
        {toolSections.map((section, index) => (
            <div key={section.title}>
                {index > 0 && <div className="w-10/12 h-px bg-gray-200 dark:bg-gray-700 mx-auto my-3" />}
                <ul className="space-y-1">
                {section.tools.map((tool) => (
                    <li key={tool.id}>
                    <button
                        onClick={() => onToolSelect(activeTool === tool.id ? null : tool.id)}
                        className={`w-full flex flex-col items-center justify-center p-2 rounded-lg transition-colors group ${
                        activeTool === tool.id
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-200 dark:hover:bg-secondary'
                        }`}
                        title={tool.name}
                    >
                        <tool.icon className="h-6 w-6" />
                        <span className="text-[10px] mt-1 text-center">{tool.name}</span>
                    </button>
                    </li>
                ))}
                </ul>
            </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;