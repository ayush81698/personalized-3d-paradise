
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ModelViewerProps {
  modelUrl: string;
  className?: string;
  autoRotate?: boolean;
  scale?: string;
  cameraControls?: boolean;
  backgroundAlpha?: number;
  fieldOfView?: string;
  rotateOnScroll?: boolean;
  rotationMultiplier?: number;
  cameraOrbit?: string;
  exposure?: string;
  height?: string;
  width?: string;
  position?: 'absolute' | 'relative' | 'fixed';
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: number;
  skyboxImage?: string;
  initialRotation?: string;
  rotationAxis?: 'x' | 'y' | 'z';
  angleX?: string;
  angleY?: string;
  angleZ?: string;
  scrollY?: number;
  onModelLoad?: () => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  modelUrl,
  className,
  autoRotate = false,
  scale = "1 1 1",
  cameraControls = true,
  backgroundAlpha = 0,
  fieldOfView = "45deg",
  rotateOnScroll = false,
  rotationMultiplier = 0.2,
  cameraOrbit = "0deg 75deg 105%",
  exposure = "0.75",
  height = "100%",
  width = "100%",
  position = "relative",
  top,
  left,
  right,
  bottom,
  zIndex = 0,
  skyboxImage,
  initialRotation = "0deg",
  rotationAxis = "y",
  angleX = "0deg",
  angleY = "0deg",
  angleZ = "0deg",
  scrollY = 0,
  onModelLoad
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(parseInt(initialRotation) || 0);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const lastScrollYRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const isMobile = useIsMobile();
  
  // Load model-viewer script
  useEffect(() => {
    if (document.querySelector('script[src*="model-viewer"]')) {
      setIsScriptLoaded(true);
      return;
    }
    
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);
    
    return () => {
      // Don't remove the script on unmount as it might be used by other components
    };
  }, []);

  // Apply mobile-specific scaling
  const mobileScale = isMobile ? "0.8 0.8 0.8" : scale;
  const mobileCameraOrbit = isMobile ? "0deg 75deg 150%" : cameraOrbit;
  const mobileFieldOfView = isMobile ? "50deg" : fieldOfView;

  // Create a throttled rotation update to improve performance
  const updateRotation = useCallback((newScrollY: number) => {
    if (!isScriptLoaded || !containerRef.current) return;
    
    const modelViewer = containerRef.current.querySelector('model-viewer');
    if (!modelViewer) return;
    
    // Calculate rotation based on scroll position with less sensitivity
    const scrollDiff = newScrollY - lastScrollYRef.current;
    const newRotation = (rotation + (scrollDiff * rotationMultiplier)) % 360;
    setRotation(newRotation);
    lastScrollYRef.current = newScrollY;
    
    // Extract the existing camera orbit values
    const orbitParts = isMobile ? mobileCameraOrbit.split(' ') : cameraOrbit.split(' ');
    
    // Use the appropriate rotation axis
    let newOrbit;
    if (rotationAxis === 'y') {
      newOrbit = `${newRotation}deg ${orbitParts[1]} ${orbitParts[2]}`;
    } else if (rotationAxis === 'x') {
      newOrbit = `${orbitParts[0]} ${newRotation}deg ${orbitParts[2]}`;
    } else {
      // For 'z' axis, we'd need to use a different approach
      newOrbit = `${orbitParts[0]} ${orbitParts[1]} ${orbitParts[2]}`;
    }
    
    modelViewer.setAttribute('camera-orbit', newOrbit);
  }, [isScriptLoaded, rotation, rotationMultiplier, isMobile, mobileCameraOrbit, cameraOrbit, rotationAxis]);

  // Use the scrollY prop for controlled rotation if rotateOnScroll is true
  useEffect(() => {
    if (!rotateOnScroll) return;
    
    // Use requestAnimationFrame to smooth out rotation updates
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      updateRotation(scrollY);
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [rotateOnScroll, scrollY, updateRotation]);
  
  // Handle model loading events
  useEffect(() => {
    const handleModelLoad = () => {
      setIsModelLoaded(true);
      console.log(`Model loaded successfully: ${modelUrl}`);
      if (onModelLoad) {
        onModelLoad();
      }
    };
    
    const handleModelError = (event: any) => {
      console.error(`Failed to load model from URL: ${modelUrl}`, event);
    };
    
    if (isScriptLoaded && containerRef.current) {
      const modelViewer = containerRef.current.querySelector('model-viewer');
      if (modelViewer) {
        modelViewer.addEventListener('load', handleModelLoad);
        modelViewer.addEventListener('error', handleModelError);
      }
    }
    
    return () => {
      if (isScriptLoaded && containerRef.current) {
        const modelViewer = containerRef.current.querySelector('model-viewer');
        if (modelViewer) {
          modelViewer.removeEventListener('load', handleModelLoad);
          modelViewer.removeEventListener('error', handleModelError);
        }
      }
    };
  }, [isScriptLoaded, modelUrl, onModelLoad]);
  
  return (
    <div 
      ref={containerRef} 
      className={cn("model-container", className)}
      style={{ 
        position, 
        zIndex, 
        height,
        width,
        top,
        left,
        right,
        bottom,
        overflow: 'hidden'
      }}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: `
            <model-viewer
              src="${modelUrl}"
              alt="3D model"
              auto-rotate="${autoRotate ? "true" : "false"}"
              rotation-per-second="30deg"
              camera-controls="${cameraControls ? "true" : "false"}"
              shadow-intensity="1"
              exposure="${exposure}"
              shadow-softness="1"
              environment-image="${skyboxImage || 'neutral'}"
              scale="${isMobile ? mobileScale : scale}"
              field-of-view="${isMobile ? mobileFieldOfView : fieldOfView}"
              style="width: 100%; height: 100%; background-color: rgba(0,0,0,${backgroundAlpha});"
              camera-orbit="${isMobile ? mobileCameraOrbit : cameraOrbit}"
              orientation="${angleX} ${angleY} ${angleZ}"
              preload
              loading="eager"
              ar
              ar-modes="webxr scene-viewer quick-look"
            ></model-viewer>
          `
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default ModelViewer;
