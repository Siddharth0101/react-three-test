// src/components/objects/LineObj.jsx
import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Line2, LineGeometry, LineMaterial } from "three-stdlib";

export default function LineObj({ points }) {
  const { size } = useThree();

  const line = useMemo(() => {
    if (!points || points.length < 2) return null;

    const flat = points.flat(); // [x1,y1,z1,x2,y2,z2,...]

    const geometry = new LineGeometry();
    geometry.setPositions(flat);

    const material = new LineMaterial({
      color: 0x000000,
      linewidth: 2,     // 2px
      worldUnits: false,
    });

    material.resolution.set(size.width, size.height);

    const line2 = new Line2(geometry, material);
    line2.computeLineDistances();
    line2.matrixAutoUpdate = true;

    return line2;
  }, [points, size.width, size.height]);

  if (!line) return null;

  return <primitive object={line} />;
}