import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../ThemeContext';

interface Node {
  id: string;
  name: string;
  type: 'file' | 'folder';
  position: [number, number, number];
}

const ProjectNode: React.FC<{ node: Node, isDark: boolean }> = ({ node, isDark }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={node.position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          {node.type === 'folder' ? (
            <boxGeometry args={[0.8, 0.8, 0.8]} />
          ) : (
            <sphereGeometry args={[0.4, 32, 32]} />
          )}
          <MeshDistortMaterial 
            color={node.type === 'folder' ? (isDark ? '#6a1b9a' : '#9333ea') : (isDark ? '#ab47bc' : '#c084fc')} 
            speed={2} 
            distort={0.3} 
            radius={1}
          />
        </mesh>
      </Float>
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color={isDark ? "white" : "#1e1b4b"}
        anchorX="center"
        anchorY="middle"
      >
        {node.name}
      </Text>
    </group>
  );
};

const ProjectVisualizer: React.FC = () => {
  const { settings } = useTheme();
  const isDark = settings.theme === 'dark';
  
  const nodes = useMemo(() => {
    const items: Node[] = [
      { id: '1', name: 'src', type: 'folder', position: [0, 0, 0] },
      { id: '2', name: 'App.tsx', type: 'file', position: [2, 1, 0] },
      { id: '3', name: 'main.tsx', type: 'file', position: [2, -1, 0] },
      { id: '4', name: 'components', type: 'folder', position: [-2, 1, 0] },
      { id: '5', name: 'Editor.tsx', type: 'file', position: [-4, 2, 0] },
      { id: '6', name: 'Sidebar.tsx', type: 'file', position: [-4, 0, 0] },
    ];
    return items;
  }, []);

  return (
    <div className={`w-full h-full rounded-2xl overflow-hidden border transition-colors duration-500 relative ${
      isDark ? 'bg-purple-950/20 border-white/5' : 'bg-white border-gray-200 shadow-inner'
    }`}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={isDark ? 0.5 : 0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
        
        {nodes.map((node) => (
          <ProjectNode key={node.id} node={node} isDark={isDark} />
        ))}

        {/* Connections */}
        <line>
          <bufferGeometry attach="geometry">
            <float32BufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, 0, 2, 1, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color={isDark ? "#4a148c" : "#a855f7"} linewidth={2} />
        </line>

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      
      <div className={`absolute bottom-4 left-4 p-4 pointer-events-none rounded-xl border backdrop-blur-md ${
        isDark ? 'bg-purple-900/40 border-white/10' : 'bg-white/60 border-gray-200'
      }`}>
        <h3 className={`text-sm font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>3D Architecture View</h3>
        <p className={`text-xs ${isDark ? 'text-purple-400/70' : 'text-gray-500'}`}>Interactive project dependency graph</p>
      </div>
    </div>
  );
};

export default ProjectVisualizer;
