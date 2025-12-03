import { Line2, LineGeometry, LineMaterial } from "three-stdlib";
import { useThree } from "@react-three/fiber";
import { useSelector } from "react-redux";
import React, { useMemo } from "react";

export default function LinePreview({ mousePoint }) {
  const { size } = useThree();
  const points = useSelector(s => s.tool.currentPoints);

  const line = useMemo(() => {
    if (points.length === 0 || !mousePoint) return null;

    const geometry = new LineGeometry();
    geometry.setPositions([...points[points.length - 1], ...mousePoint]);

    const material = new LineMaterial({
      color: "#888888",
      linewidth: 2,
      worldUnits: false
    });

    material.resolution.set(size.width, size.height);

    const l = new Line2(geometry, material);
    l.computeLineDistances();
    return l;
  }, [points, mousePoint, size]);

  if (!line) return null;

  return <primitive object={line} />;
}