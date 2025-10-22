
export type ToolType =
  | 'crop' | 'rotate' | 'resize' | 'brightness' | 'contrast' | 'saturate'
  | 'sharpen' | 'blur' | 'grayscale' | 'sepia' | 'hue-rotate' | 'vignette'
  | 'text' | 'draw' | 'filters' | 'remove-bg' | 'enhance' | 'ai-prompt'
  | 'temperature' | 'overlay' | 'face-retouch';

export interface FilterSettings {
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  sepia: number;
  blur: number;
  'hue-rotate': number;
  temperature: number; // -100 (cool) to 100 (warm)
  vignette: number; // 0 to 100
}

export interface HistoryState {
  imageData: string;
  filters: FilterSettings;
}

export interface OverlayState {
    src: string;
    opacity: number;
    x: number;
    y: number;
    width: number;
    height: number;
}
