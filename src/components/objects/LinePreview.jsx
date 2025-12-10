// src/components/objects/LinePreview.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Line } from "@react-three/drei";

export default function LinePreview({ mousePoint }) {
  const currentPoints = useSelector((s) => s.tool.currentPoints);

  if (!mousePoint || !currentPoints || currentPoints.length === 0)
    return null;

  const start = currentPoints[currentPoints.length - 1];

  return (
    <Line
      points={[start, mousePoint]}
      color="#888"
      lineWidth={2}
      worldUnits={false}
      dashed={false}
    />
  );
}