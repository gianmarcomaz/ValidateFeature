"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Three.js
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function GlobeHero() {
  const globeRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Globe configuration is now handled in onGlobeReady callback

  // Use default texture URLs from CDN (works without local files)
  // Replace with local textures in public/globe/ if desired
  const defaultTextureUrl = "https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-blue-marble.jpg";
  const defaultBumpUrl = "https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-topology.png";

  if (!isMounted) {
    return (
      <div className="pointer-events-none absolute right-8 top-28 hidden lg:block h-[320px] w-[320px] opacity-90 z-10">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 blur-2xl" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute right-8 top-28 hidden lg:block h-[320px] w-[320px] opacity-90 z-10">
      {/* Subtle glow behind globe */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 blur-2xl" />
      
      {/* Globe container */}
      <div className="relative h-full w-full">
        <Globe
          width={320}
          height={320}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={defaultTextureUrl}
          bumpImageUrl={defaultBumpUrl}
          showAtmosphere={true}
          atmosphereColor="#22d3ee"
          atmosphereAltitude={0.15}
          enablePointerInteraction={false}
          onGlobeReady={(globe: any) => {
            // Store globe instance and configure auto-rotation
            globeRef.current = globe;
            console.log("Globe rendered successfully");
            setTimeout(() => {
              try {
                if (globe && typeof globe.controls === 'function') {
                  const controls = globe.controls();
                  if (controls) {
                    controls.autoRotate = true;
                    controls.autoRotateSpeed = 0.6;
                    controls.enableZoom = false;
                    controls.enablePan = false;
                    controls.minDistance = 200;
                    controls.maxDistance = 200;
                    console.log("Globe auto-rotation enabled");
                  }
                }
              } catch (e) {
                console.error("Globe controls error:", e);
              }
            }, 100);
          }}
        />
      </div>
    </div>
  );
}

// Note: Add licensed earth textures to public/globe/:
// - earth-dark.jpg (dark earth texture for globe surface ~1024x512 recommended)
// - earth-bump.png (bump map for surface detail ~1024x512 recommended)
// 
// You can find free textures at:
// - https://www.solarsystemscope.com/textures/
// - https://visibleearth.nasa.gov/

