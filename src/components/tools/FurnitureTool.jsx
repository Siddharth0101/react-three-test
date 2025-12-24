// src/components/tools/FurnitureTool.jsx
import React, { useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useDispatch, useSelector } from "react-redux";
import * as THREE from "three";
import { addFurniture } from "../../store/sceneSlice";
import { selectDefaultTool } from "../../store/toolSlice";
import { FURNITURE_TYPES } from "../objects/FurnitureObj";

// Snap value to grid
const snapToGrid = (value, gridSize, enabled) => {
  if (!enabled) return value;
  return Math.round(value / gridSize) * gridSize;
};

export default function FurnitureTool() {
  const dispatch = useDispatch();
  const selectedTool = useSelector((s) => s.tool.selectedTool);
  const mode = useSelector((s) => s.viewMode.mode);
  const snapEnabled = useSelector((s) => s.settings?.snapToGrid ?? true);
  const gridSize = useSelector((s) => s.settings?.gridSize ?? 0.25);
  const { camera, raycaster, pointer } = useThree();
  const [cursorPos, setCursorPos] = useState([0, 0]);
  const [rotation, setRotation] = useState(0);

  // Check if furniture tool is active
  const isActive = typeof selectedTool === "object" && selectedTool?.tool === "furniture";
  const furnitureType = isActive ? selectedTool.furnitureType : null;
  const config = furnitureType ? FURNITURE_TYPES[furnitureType] : null;

  // Update cursor position
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      raycaster.setFromCamera(pointer, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      
      const x = snapToGrid(intersection.x, gridSize, snapEnabled);
      const y = snapToGrid(intersection.y, gridSize, snapEnabled);
      setCursorPos([x, y]);
    }, 16);

    return () => clearInterval(interval);
  }, [isActive, camera, raycaster, pointer, snapEnabled, gridSize]);

  // Handle rotation with R key
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.key === "r" || e.key === "R") {
        setRotation((prev) => prev + Math.PI / 4); // Rotate 45 degrees
      }
      if (e.key === "Escape") {
        dispatch(selectDefaultTool());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, dispatch]);

  const handleClick = (e) => {
    if (!isActive || !furnitureType) return;
    e.stopPropagation();

    dispatch(addFurniture({
      furnitureType,
      position: cursorPos,
      rotation,
    }));
  };

  if (!isActive || mode !== "2d" || !config) return null;

  const width = config.width;
  const depth = config.depth;

  return (
    <group>
      {/* Click plane */}
      <mesh position={[0, 0, 0.01]} onClick={handleClick}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Furniture preview */}
      <group 
        position={[cursorPos[0], cursorPos[1], 0.2]} 
        rotation={[0, 0, rotation]}
      >
        {/* Preview shape */}
        {config.shape === "circle" ? (
          <mesh>
            <circleGeometry args={[width / 2, 32]} />
            <meshBasicMaterial color={config.color} transparent opacity={0.7} />
          </mesh>
        ) : (
          <mesh>
            <planeGeometry args={[width, depth]} />
            <meshBasicMaterial color={config.color} transparent opacity={0.7} />
          </mesh>
        )}

        {/* Outline */}
        <lineSegments>
          <edgesGeometry 
            args={[
              config.shape === "circle" 
                ? new THREE.CircleGeometry(width / 2, 32)
                : new THREE.PlaneGeometry(width, depth)
            ]} 
          />
          <lineBasicMaterial color="#2196F3" />
        </lineSegments>

        {/* Direction indicator */}
        <mesh position={[0, (config.shape === "circle" ? width / 2 : depth / 2) - 0.05, 0.01]}>
          <planeGeometry args={[width * 0.3, 0.04]} />
          <meshBasicMaterial color="#2196F3" />
        </mesh>

        {/* Label */}
        <mesh position={[0, -depth / 2 - 0.15, 0.01]}>
          <planeGeometry args={[0.8, 0.15]} />
          <meshBasicMaterial color="rgba(33, 150, 243, 0.9)" />
        </mesh>
      </group>

      {/* Snap indicator */}
      {snapEnabled && (
        <mesh position={[cursorPos[0], cursorPos[1], 0.15]}>
          <ringGeometry args={[0.08, 0.1, 16]} />
          <meshBasicMaterial color="#2196F3" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

