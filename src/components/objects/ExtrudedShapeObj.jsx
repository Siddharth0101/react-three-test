// ExtrudedShapeObj.jsx
import React, { useMemo } from "react";
import * as THREE from "three";
import { Line, Extrude } from "@react-three/drei";
import { useSelector } from "react-redux";

export default function ExtrudedShapeObj({ points, props }) {
  const mode = useSelector((s) => s.viewMode.mode);
  const { depth = 5 } = props || {};

  if (!points || points.length < 3) return null;

  // 2D -> just outline
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

  // 3D -> extruded shape
  const shape = useMemo(() => {
    const shapePoints = points.map((p) => new THREE.Vector2(p[0], p[1]));
    return new THREE.Shape(shapePoints);
  }, [points]);

  return (
    <Extrude
      args={[
        shape,
        {
          depth,
          bevelEnabled: false,
        },
      ]}
    >
      <meshStandardMaterial color="#e7dedcff" />
    </Extrude>
  );
}