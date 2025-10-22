
import React, { useRef } from 'react';
import { UploadIcon, DownloadIcon, UserIcon, LogoutIcon, UndoIcon, RedoIcon, ZoomInIcon, ZoomOutIcon, RefreshIcon } from './Icons';

interface HeaderProps {
    user: string;
    onLogout: () => void;
    onImageUpload: (file: File) => void;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    hasImage: boolean;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    zoom: number;
    onZoomChange: (zoom: number) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onImageUpload, canvasRef, hasImage, onUndo, onRedo, canUndo, canRedo, zoom, onZoomChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageUpload(e.target.files[0]);
        }
    };

    const handleDownload = () => {
        if (canvasRef.current) {
            const link = document.createElement('a');
            link.download = `edited-${Date.now()}.png`;
            link.href = canvasRef.current.toDataURL('image/png');
            link.click();
        }
    };
    
    const handleZoomIn = () => onZoomChange(Math.min(zoom + 0.1, 3));
    const handleZoomOut = () => onZoomChange(Math.max(zoom - 0.1, 0.2));
    const resetZoom = () => onZoomChange(1);

    return (
        <header className="bg-light-surface dark:bg-dark-surface shadow-md h-16 flex items-center justify-between px-4 z-20 shrink-0">
            <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-primary">STANfx</h1>
            </div>

            <div className="flex items-center space-x-1 md:space-x-2">
                 <button onClick={onUndo} disabled={!canUndo} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Undo">
                    <UndoIcon className="h-5 w-5"/>
                </button>
                 <button onClick={onRedo} disabled={!canRedo} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Redo">
                    <RedoIcon className="h-5 w-5"/>
                </button>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-2"></div>
                <button onClick={handleZoomOut} disabled={!hasImage} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Zoom Out">
                    <ZoomOutIcon className="h-5 w-5"/>
                </button>
                 <button onClick={resetZoom} disabled={!hasImage} className="text-sm font-semibold p-2 rounded-full hover:bg-gray-200 dark:hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-12" title="Reset Zoom">
                    {Math.round(zoom * 100)}%
                </button>
                 <button onClick={handleZoomIn} disabled={!hasImage} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Zoom In">
                    <ZoomInIcon className="h-5 w-5"/>
                </button>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
                <button
                    onClick={handleUploadClick}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md bg-secondary dark:bg-secondary hover:bg-secondary-hover dark:hover:bg-secondary-hover text-white transition-colors"
                >
                    <UploadIcon className="h-5 w-5" />
                    <span className="hidden md:inline">Upload</span>
                </button>
                <button
                    onClick={handleDownload}
                    disabled={!hasImage}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    <DownloadIcon className="h-5 w-5" />
                    <span className="hidden md:inline">Download</span>
                </button>
                <div className="flex items-center space-x-2 pl-2 border-l border-gray-200 dark:border-gray-600">
                    <UserIcon className="h-6 w-6 text-gray-500"/>
                    <span className="text-sm font-medium hidden lg:inline">{user}</span>
                     <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-secondary transition-colors" title="Logout">
                         <LogoutIcon className="h-5 w-5" />
                     </button>
                </div>
            </div>
        </header>
    );
};

export default Header;