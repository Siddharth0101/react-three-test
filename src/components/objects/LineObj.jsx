import { Line2, LineGeometry, LineMaterial } from "three-stdlib";
import { useThree } from "@react-three/fiber";
import React, { useMemo } from "react";

export default function LineObj({ points }) {
  const { size } = useThree();

  const line = useMemo(() => {
    const geometry = new LineGeometry();
    geometry.setPositions(points.flat());

    const material = new LineMaterial({
      color: "#000000",
      linewidth: 2,
      worldUnits: false
    });

    material.resolution.set(size.width, size.height);

    const line2 = new Line2(geometry, material);
    line2.computeLineDistances();
    return line2;
  }, [points, size]);

  return <primitive object={line} />;
}