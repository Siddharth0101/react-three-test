// src/components/objects/LineObj.jsx
import React from "react";
import { Line } from "@react-three/drei";

export default function LineObj({ points }) {
  if (!points || points.length < 2) return null;

  return (
    <Line
      points={points}
      color="black"
      lineWidth={2}
      worldUnits={false}
      dashed={false}
    />
  );
}