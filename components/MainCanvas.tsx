
import React, { forwardRef, useEffect, useLayoutEffect, useState, useRef } from 'react';
import { FilterSettings, OverlayState } from '../types';

interface MainCanvasProps {
  imageSrc: string;
  filters: FilterSettings;
  overlay: OverlayState | null;
}

const MainCanvas = forwardRef<HTMLCanvasElement, MainCanvasProps>(({ imageSrc, filters, overlay }, ref) => {
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const overlayImageRef = useRef<HTMLImageElement | null>(null);

    useLayoutEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const parent = containerRef.current.parentElement;
                if(parent) {
                    setContainerSize({
                        width: parent.offsetWidth - 32, // Subtract padding
                        height: parent.offsetHeight - 32
                    });
                }
            }
        };
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    
    useEffect(() => {
        if(overlay?.src) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = overlay.src;
            img.onload = () => {
                overlayImageRef.current = img;
                // Force re-render
                 drawCanvas();
            }
        } else {
            overlayImageRef.current = null;
        }
    }, [overlay?.src])

    const drawCanvas = () => {
        const canvas = (ref as React.RefObject<HTMLCanvasElement>)?.current;
        const ctx = canvas?.getContext('2d', { willReadFrequently: true });

        if (!canvas || !ctx || !imageSrc || containerSize.width === 0) return;

        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = imageSrc;

        image.onload = () => {
            const canvasAspectRatio = containerSize.width / containerSize.height;
            const imageAspectRatio = image.width / image.height;
            
            let drawWidth, drawHeight;

            if (imageAspectRatio > canvasAspectRatio) {
                drawWidth = containerSize.width;
                drawHeight = drawWidth / imageAspectRatio;
            } else {
                drawHeight = containerSize.height;
                drawWidth = drawHeight * imageAspectRatio;
            }
            
            canvas.width = image.width;
            canvas.height = image.height;

            // Apply CSS filters
            const filterString = Object.entries(filters)
                .filter(([key]) => !['temperature', 'vignette'].includes(key))
                .map(([key, value]) => {
                    if (key === 'blur') return `${key}(${value}px)`;
                    if (key === 'hue-rotate') return `${key}(${value}deg)`;
                    return `${key}(${value}%)`;
                })
                .join(' ');

            ctx.filter = filterString;
            ctx.drawImage(image, 0, 0, image.width, image.height);
            ctx.filter = 'none'; // Reset for canvas-based effects

            // Apply Temperature
            if (filters.temperature !== 0) {
                const temp = filters.temperature;
                const alpha = Math.abs(temp) / 250;
                ctx.globalCompositeOperation = 'overlay';
                if (temp > 0) ctx.fillStyle = `rgba(255, 165, 0, ${alpha})`;
                else ctx.fillStyle = `rgba(0, 165, 255, ${alpha})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = 'source-over';
            }
            
            // Apply Overlay
            if(overlay && overlayImageRef.current) {
                ctx.globalAlpha = overlay.opacity;
                const overlayImg = overlayImageRef.current;
                const overlayAspectRatio = overlayImg.width / overlayImg.height;
                let ovDrawWidth = canvas.width, ovDrawHeight = canvas.width / overlayAspectRatio;
                if(ovDrawHeight > canvas.height){
                    ovDrawHeight = canvas.height;
                    ovDrawWidth = ovDrawHeight * overlayAspectRatio;
                }
                const ovX = (canvas.width - ovDrawWidth) / 2;
                const ovY = (canvas.height - ovDrawHeight) / 2;
                ctx.drawImage(overlayImg, ovX, ovY, ovDrawWidth, ovDrawHeight);
                ctx.globalAlpha = 1.0;
            }

            // Apply Vignette
            if (filters.vignette > 0) {
                const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.width/2 - (filters.vignette * canvas.width / 200), canvas.width/2, canvas.height/2, canvas.width/2);
                gradient.addColorStop(0, 'rgba(0,0,0,0)');
                gradient.addColorStop(1, `rgba(0,0,0,${filters.vignette / 100})`);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        };
    }

    useEffect(() => {
       drawCanvas();
    }, [imageSrc, filters, overlay, ref, containerSize]);

    return (
        <div ref={containerRef} className="w-full h-full flex items-center justify-center">
             <canvas ref={ref} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </div>
    );
});

MainCanvas.displayName = 'MainCanvas';
export default MainCanvas;
