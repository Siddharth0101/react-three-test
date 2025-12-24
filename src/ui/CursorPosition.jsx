// src/ui/CursorPosition.jsx
import { useThree, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import * as THREE from "three";

export default function CursorPosition() {
  const mode = useSelector((s) => s.viewMode.mode);
  const snapEnabled = useSelector((s) => s.settings?.snapToGrid ?? true);
  const gridSize = useSelector((s) => s.settings?.gridSize ?? 0.25);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { camera, raycaster, pointer } = useThree();

  useFrame(() => {
    raycaster.setFromCamera(pointer, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
    
    let x = intersection.x;
    let y = intersection.y;
    
    if (snapEnabled) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }
    
    setPosition({ x, y });
  });

  if (mode !== "2d") return null;

  return (
    <Html
      calculatePosition={() => [0, 0]}
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
      }}
    >
      <div
        style={{
          background: "rgba(26, 26, 46, 0.9)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "8px",
          fontSize: "12px",
          fontFamily: "monospace",
          display: "flex",
          gap: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
      >
        <span>
          X: <strong>{position.x.toFixed(2)}m</strong>
        </span>
        <span>
          Y: <strong>{position.y.toFixed(2)}m</strong>
        </span>
        {snapEnabled && (
          <span style={{ color: "#4CAF50", fontSize: "10px" }}>● SNAP</span>
        )}
      </div>
    </Html>
  );
}

