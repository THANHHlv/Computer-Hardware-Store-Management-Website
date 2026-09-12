import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Box, Skeleton, Typography } from '@mui/material';

// Helper to check WebGL availability
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

/**
 * Procedural 3D PC Component: Futuristic High-Performance Gaming GPU
 * Features rotating RGB fans, heatsink fins, glowing PCB traces, and metallic shroud.
 */
const FuturisticGPU: React.FC<{ shouldReduceMotion: boolean }> = ({ shouldReduceMotion }) => {
  const fanRef1 = useRef<THREE.Group>(null);
  const fanRef2 = useRef<THREE.Group>(null);
  const fanRef3 = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!shouldReduceMotion) {
      const speed = delta * 3.5;
      if (fanRef1.current) fanRef1.current.rotation.z += speed;
      if (fanRef2.current) fanRef2.current.rotation.z -= speed;
      if (fanRef3.current) fanRef3.current.rotation.z += speed;
    }
  });

  // Procedural Fan Blades
  const renderFan = (key: string) => {
    const blades = [];
    const bladeCount = 9;
    for (let i = 0; i < bladeCount; i++) {
      const angle = (i / bladeCount) * Math.PI * 2;
      blades.push(
        <mesh key={`${key}-blade-${i}`} position={[Math.cos(angle) * 0.28, Math.sin(angle) * 0.28, 0]} rotation={[0, 0, angle + 0.3]}>
          <boxGeometry args={[0.3, 0.08, 0.02]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
        </mesh>
      );
    }
    return (
      <group>
        {/* Fan Central Hub with Glowing Cyber Ring */}
        <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.06, 32]} />
          <meshStandardMaterial color="#0A0E17" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <ringGeometry args={[0.12, 0.16, 32]} />
          <meshBasicMaterial color="#00F0FF" />
        </mesh>
        {blades}
      </group>
    );
  };

  return (
    <group rotation={[0.15, -0.35, 0]}>
      {/* Main PCB Board */}
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[3.8, 1.8, 0.08]} />
        <meshStandardMaterial color="#0b1120" roughness={0.7} metalness={0.5} />
      </mesh>

      {/* PCI-e Gold Finger Connector */}
      <mesh position={[0, -0.98, -0.2]}>
        <boxGeometry args={[2.2, 0.15, 0.04]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Heatsink Aluminum Fin Block */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[3.6, 1.6, 0.22]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.25} metalness={0.9} />
      </mesh>

      {/* Outer Armor Shroud (Chiseled Cyber Black) */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[3.7, 1.7, 0.12]} />
        <meshStandardMaterial color="#131b2e" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Top Neon RGB Light Bar */}
      <mesh position={[0, 0.86, 0.08]}>
        <boxGeometry args={[3.5, 0.04, 0.08]} />
        <meshBasicMaterial color="#00F0FF" />
      </mesh>
      
      {/* Bottom Neon Accent */}
      <mesh position={[0, -0.86, 0.08]}>
        <boxGeometry args={[3.5, 0.04, 0.08]} />
        <meshBasicMaterial color="#10B981" />
      </mesh>

      {/* 3 Cooling Fans */}
      <group ref={fanRef1} position={[-1.15, 0, 0.18]}>
        {renderFan('fan1')}
      </group>
      <group ref={fanRef2} position={[0, 0, 0.18]}>
        {renderFan('fan2')}
      </group>
      <group ref={fanRef3} position={[1.15, 0, 0.18]}>
        {renderFan('fan3')}
      </group>

      {/* Heatpipes (Copper / Chrome) */}
      <mesh position={[0, 0.55, 0.05]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 3.4, 16]} />
        <meshStandardMaterial color="#fb923c" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.55, 0.05]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 3.4, 16]} />
        <meshStandardMaterial color="#fb923c" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

export interface HeroPCModelProps {
  height?: number | string;
}

export const HeroPCModel: React.FC<HeroPCModelProps> = ({ height = 440 }) => {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!hasWebGL) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(0,240,255,0.08) 0%, rgba(16,185,129,0.08) 100%)',
          border: '1px solid rgba(0,240,255,0.2)',
          p: 3,
        }}
      >
        <Box
          component="img"
          src="https://nguyencongpc.vn/media/news/3781-vga-bundle-may-2025-2000x1000px-01.jpg"
          alt="PC Hardware Showcase"
          sx={{ maxWidth: '85%', maxHeight: '75%', objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.3))' }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Card đồ họa PC cao cấp - RTX Series
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height,
        position: 'relative',
        cursor: 'grab',
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)' }}
          />
        }
      >
        <Canvas
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0, 4.5], fov: 45 }}
          style={{ width: '100%', height: '100%' }}
          role="img"
          aria-label="Interactive 3D Gaming PC Hardware GPU showcase. Drag to rotate and inspect."
        >
          {/* Lighting */}
          <ambientLight intensity={0.9} />
          <directionalLight position={[5, 6, 5]} intensity={1.8} color="#ffffff" />
          <pointLight position={[-4, -3, 3]} intensity={1.5} color="#00F0FF" />
          <pointLight position={[4, 3, 2]} intensity={1.2} color="#10B981" />

          {/* Gentle Floating Effect */}
          <Float speed={prefersReduced ? 0 : 2} rotationIntensity={0.2} floatIntensity={0.4}>
            <FuturisticGPU shouldReduceMotion={prefersReduced} />
          </Float>

          {/* OrbitControls with restrained angles for best viewing & no flipping */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={!prefersReduced}
            autoRotateSpeed={1.0}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.7}
            minAzimuthAngle={-Math.PI / 2.5}
            maxAzimuthAngle={Math.PI / 2.5}
          />
        </Canvas>
      </Suspense>

      {/* Subtle Hint Badge */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          background: 'rgba(10, 14, 23, 0.7)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
          pointerEvents: 'none',
        }}
      >
        <Typography variant="caption" sx={{ color: '#00F0FF', fontWeight: 600, fontSize: '0.7rem' }}>
          3D INTERACTIVE • KÉO ĐỂ XOAY
        </Typography>
      </Box>
    </Box>
  );
};

export default HeroPCModel;
