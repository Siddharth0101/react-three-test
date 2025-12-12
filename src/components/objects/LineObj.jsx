import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import { useSelector } from "react-redux";
import * as THREE from "three";

export default function LineObj({ points, props }) {
  const mode = useSelector((s) => s.viewMode.mode);
  const { thickness = 0.05 } = props || {};

  if (!points || points.length < 2) return null;

  // 2D mode — pixel perfect line
  if (mode === "2d") {
    return (
      <Line
        points={points}
        color="black"
        lineWidth={2}
        worldUnits={false}
      />
    );
  }

  // 3D mode — solid tube
  const path = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        points.map((p) => new THREE.Vector3(...p))
      ),
    [points]
  );

  return (
    <mesh>
      <tubeGeometry
        args={[path, 64, thickness, 8, false]} // segments, radius, radialSegments, closed
      />
      <meshStandardMaterial color="yellow" />
    </mesh>
  );
}