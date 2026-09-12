import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';
import { Box, Skeleton, Typography, Stack, IconButton, Tooltip } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

/**
 * 3D Component Model for Hardware Inspection
 */
const HardwareInspectorModel: React.FC<{ category?: string; autoRotate: boolean }> = ({ autoRotate }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Component Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.8, 1.4, 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Detail Plates */}
      <mesh position={[0, 0, 0.22]}>
        <boxGeometry args={[2.5, 1.1, 0.05]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Cyber Core Light */}
      <mesh position={[0, 0, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 32]} />
        <meshStandardMaterial color="#00F0FF" emissive="#00F0FF" emissiveIntensity={0.6} />
      </mesh>

      {/* Heatsink Fins */}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0.8, 0]}>
          <boxGeometry args={[0.08, 0.4, 0.35]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Connector Gold Pins */}
      <mesh position={[0, -0.75, 0]}>
        <boxGeometry args={[1.8, 0.12, 0.04]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

export interface ProductViewer3DProps {
  productName?: string;
  categoryName?: string;
  fallbackImageUrl?: string;
  height?: number | string;
}

export const ProductViewer3D: React.FC<ProductViewer3DProps> = ({
  productName = 'Linh kiện PC',
  categoryName,
  fallbackImageUrl,
  height = 420,
}) => {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  if (!hasWebGL) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          background: 'rgba(19, 27, 46, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          p: 2,
        }}
      >
        {fallbackImageUrl && (
          <Box
            component="img"
            src={fallbackImageUrl}
            alt={productName}
            sx={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }}
          />
        )}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Xem ảnh 2D (Trình duyệt không hỗ trợ WebGL 3D)
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
        borderRadius: 2,
        background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.05) 0%, rgba(10, 14, 23, 0.95) 75%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
      }}
    >
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}
          />
        }
      >
        <Canvas
          gl={{ alpha: true, antialias: true }}
          camera={{ position: [0, 1.5, 4], fov: 50 }}
          style={{ width: '100%', height: '100%' }}
          role="img"
          aria-label={`Mô hình 3D tương tác của ${productName}. Kéo chuột để xoay 360 độ, cuộn để zoom.`}
        >
          <ambientLight intensity={1.0} />
          <directionalLight position={[4, 5, 4]} intensity={1.5} />
          <directionalLight position={[-4, -3, -4]} intensity={0.6} color="#00F0FF" />
          <pointLight position={[0, -2, 2]} intensity={0.8} color="#10B981" />

          <Center>
            <HardwareInspectorModel category={categoryName} autoRotate={autoRotate} />
          </Center>

          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={7}
          />
        </Canvas>
      </Suspense>

      {/* Control Bar Overlay */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10, 14, 23, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 20,
          px: 2,
          py: 0.5,
          alignItems: 'center',
        }}
      >
        <Tooltip title={autoRotate ? "Tạm dừng tự xoay" : "Bật tự xoay"}>
          <IconButton size="small" onClick={() => setAutoRotate(!autoRotate)} sx={{ color: '#00F0FF' }}>
            {autoRotate ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Đặt lại góc nhìn ban đầu">
          <IconButton size="small" onClick={handleResetView} sx={{ color: '#F8FAFC' }}>
            <RotateLeftIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.75rem', px: 1 }}>
          Kéo để xoay 360° • Cuộn để zoom
        </Typography>
      </Stack>
    </Box>
  );
};

export default ProductViewer3D;
