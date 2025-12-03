// components/objects/BoxObj.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useThree } from "@react-three/fiber";
import { Line2, LineGeometry, LineMaterial } from "three-stdlib";
import * as THREE from "three";

export default function BoxObj({ transform, props }) {
  const mode = useSelector((state) => state.viewMode.mode);
  const { size } = useThree(); // for pixel-based line resolution

  const {
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
  } = transform || {};

  const {
    width = 1,
    height = 1,
    depth = 1,
  } = props || {};

  // ===== 2D MODE: constant-thickness border using Line2 =====
  const line = useMemo(() => {
    if (mode !== "2d") return null;

    const halfW = width / 2;
    const halfH = height / 2;

    // x, y, z sequence for LineGeometry
    const positions = [
      -halfW, -halfH, 0,
       halfW, -halfH, 0,
       halfW,  halfH, 0,
      -halfW,  halfH, 0,
      -halfW, -halfH, 0,
    ];

    const geometry = new LineGeometry();
    geometry.setPositions(positions);

    const material = new LineMaterial({
      color: new THREE.Color("#000000"),
      linewidth: 2,        // thickness in *screen pixels*
      worldUnits: false,   // important: pixel units
    });

    // resolution = renderer size in pixels
    material.resolution.set(size.width, size.height);

    const line2 = new Line2(geometry, material);
    line2.computeLineDistances();
    line2.matrixAutoUpdate = true;

    return line2;
  }, [mode, width, height, size.width, size.height]);

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

  // ===== 3D MODE: normal solid box =====
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
}