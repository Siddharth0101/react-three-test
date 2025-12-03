// src/components/objects/LinePreview.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useThree } from "@react-three/fiber";
import { Line2, LineGeometry, LineMaterial } from "three-stdlib";

export default function LinePreview({ mousePoint }) {
  const { size } = useThree();
  const currentPoints = useSelector((s) => s.tool.currentPoints);

  const line = useMemo(() => {
    if (!mousePoint || !currentPoints || currentPoints.length === 0) return null;

    const start = currentPoints[currentPoints.length - 1]; // last point
    const flat = [...start, ...mousePoint]; // [x1,y1,z1, x2,y2,z2]

    const geometry = new LineGeometry();
    geometry.setPositions(flat);

    const material = new LineMaterial({
      color: 0x888888,
      linewidth: 2,
      worldUnits: false,
    });

    material.resolution.set(size.width, size.height);

    const line2 = new Line2(geometry, material);
    line2.computeLineDistances();
    line2.matrixAutoUpdate = true;

    return line2;
  }, [mousePoint, currentPoints, size.width, size.height]);

  if (!line) return null;

  return <primitive object={line} />;
}