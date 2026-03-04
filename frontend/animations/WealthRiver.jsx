import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const RiverParticles = ({ wealth, flowRate }) => {
  const particlesRef = useRef();

  useFrame((state) => {
    if (particlesRef.current) {
        particlesRef.current.rotation.y += flowRate / 1e9;
        const color = new THREE.Color().setHSL(
          Math.min(wealth / 2e12, 0.3),
          0.8,
          0.5
        );
        particlesRef.current.material.color.set(color);
    }
  });

  return (
      <mesh ref={particlesRef}>
        <boxGeometry args={[0.1, 0.05, 0.01]} />
        <meshStandardMaterial color="#00ff9d" />
      </mesh>
  );
};

const WealthRiver = ({ wealth, flowRate }) => {
  return (
    <Canvas camera={{ position: [0, 0, 20] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      <RiverParticles wealth={wealth} flowRate={flowRate} />

      <Text
        position={[0, 5, 0]}
        fontSize={2}
        color="#00ff9d"
        anchorX="center"
        anchorY="middle"
      >
        ${(wealth / 1e12).toFixed(2)}T
      </Text>
    </Canvas>
  );
};

export default WealthRiver;
