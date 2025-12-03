// components/objects/SphereObj.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useThree } from "@react-three/fiber";
import { Line2, LineGeometry, LineMaterial } from "three-stdlib";
import * as THREE from "three";

export default function SphereObj({ transform, props }) {
  const mode = useSelector((state) => state.viewMode.mode);
  const { size } = useThree();

  const {
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
  } = transform || {};

  const {
    radius = 0.5,
    widthSegments = 64,  // used as circle segments in 2D mode
    heightSegments = 32, // for 3D sphere only
  } = props || {};

  // ===== 2D MODE: circle outline with constant thickness =====
  const line = useMemo(() => {
    if (mode !== "2d") return null;

    const segments = widthSegments || 64;
    const positions = [];

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = Math.cos(t) * radius;
      const y = Math.sin(t) * radius;
      positions.push(x, y, 0);
    }

    const geometry = new LineGeometry();
    geometry.setPositions(positions);

    const material = new LineMaterial({
      color: new THREE.Color("#000000"),
      linewidth: 2,        // 2px circle stroke
      worldUnits: false,
    });

    material.resolution.set(size.width, size.height);

    const line2 = new Line2(geometry, material);
    line2.computeLineDistances();
    line2.matrixAutoUpdate = true;

    return line2;
  }, [mode, radius, widthSegments, size.width, size.height]);

  if (mode === "2d") {
    if (!line) return null;
    return (
      <primitive
        object={line}
        position={position}
        rotation={rotation}
        scale={scale}
      />
    );
  }

  // ===== 3D MODE: same as before, solid sphere =====
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <sphereGeometry args={[radius, widthSegments, heightSegments]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
}