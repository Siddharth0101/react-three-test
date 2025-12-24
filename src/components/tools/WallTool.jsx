// src/components/tools/WallTool.jsx
import React, { useRef, useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useDispatch, useSelector } from "react-redux";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";
import { setWallStart, clearWallStart } from "../../store/toolSlice";
import { addWall } from "../../store/sceneSlice";

// Snap value to grid
const snapToGrid = (value, gridSize, enabled) => {
  if (!enabled) return value;
  return Math.round(value / gridSize) * gridSize;
};

export default function WallTool() {
  const dispatch = useDispatch();
  const selectedTool = useSelector((s) => s.tool.selectedTool);
  const wallStart = useSelector((s) => s.tool.wallStart);
  const mode = useSelector((s) => s.viewMode.mode);
  const snapEnabled = useSelector((s) => s.settings?.snapToGrid ?? true);
  const gridSize = useSelector((s) => s.settings?.gridSize ?? 0.25);
  const defaultWallHeight = useSelector((s) => s.settings?.defaultWallHeight ?? 3);
  const defaultWallThickness = useSelector((s) => s.settings?.defaultWallThickness ?? 0.15);
  const { camera, raycaster, pointer } = useThree();
  const planeRef = useRef();

  // Only active when wall tool is selected
  const isActive = selectedTool === "wall";

  const getWorldPosition = (applySnap = true) => {
    raycaster.setFromCamera(pointer, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
    
    if (applySnap) {
      return [
        snapToGrid(intersection.x, gridSize, snapEnabled),
        snapToGrid(intersection.y, gridSize, snapEnabled),
      ];
    }
    return [intersection.x, intersection.y];
  };

  const handleClick = (event) => {
    if (!isActive) return;

    event.stopPropagation();

    const point = getWorldPosition();

    if (!wallStart) {
      // First click - set start point
      dispatch(setWallStart(point));
    } else {
      // Only create wall if there's actual length
      const dx = point[0] - wallStart[0];
      const dy = point[1] - wallStart[1];
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length > 0.1) { // Minimum wall length
        dispatch(
          addWall({
            start: wallStart,
            end: point,
            height: defaultWallHeight,
            thickness: defaultWallThickness,
          })
        );
        // Set end point as new start for continuous drawing
        dispatch(setWallStart(point));
      }
    }
  };

  const handleRightClick = (event) => {
    if (!isActive) return;
    event.stopPropagation();
    // Finish wall chain - clear start point
    dispatch(clearWallStart());
  };

  const handleDoubleClick = (event) => {
    if (!isActive) return;
    event.stopPropagation();
    // Double-click also finishes the chain
    dispatch(clearWallStart());
  };

  // Don't render if not active or not in 2D mode
  if (!isActive || mode !== "2d") return null;

  return (
    <group>
      {/* Invisible plane to catch clicks */}
      <mesh
        ref={planeRef}
        position={[0, 0, 0.01]}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        onDoubleClick={handleDoubleClick}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Preview line from start point to cursor */}
      {wallStart && <WallPreview start={wallStart} />}
    </group>
  );
}

// Separate component for the preview line that follows cursor
function WallPreview({ start }) {
  const { camera, raycaster, pointer } = useThree();
  const snapEnabled = useSelector((s) => s.settings?.snapToGrid ?? true);
  const gridSize = useSelector((s) => s.settings?.gridSize ?? 0.25);
  const [cursorPos, setCursorPos] = useState(start);

  useEffect(() => {
    const updatePosition = () => {
      raycaster.setFromCamera(pointer, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      
      // Apply snapping
      const snappedX = snapToGrid(intersection.x, gridSize, snapEnabled);
      const snappedY = snapToGrid(intersection.y, gridSize, snapEnabled);
      setCursorPos([snappedX, snappedY]);
    };

    const interval = setInterval(updatePosition, 16);
    return () => clearInterval(interval);
  }, [camera, raycaster, pointer, snapEnabled, gridSize]);

  // Calculate wall length and angle
  const dx = cursorPos[0] - start[0];
  const dy = cursorPos[1] - start[1];
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  const midX = (start[0] + cursorPos[0]) / 2;
  const midY = (start[1] + cursorPos[1]) / 2;

  // Format length for display
  const displayLength = length >= 1 
    ? `${length.toFixed(2)}m` 
    : `${(length * 100).toFixed(0)}cm`;

  return (
    <group>
      {/* Preview line */}
      <Line
        points={[
          [start[0], start[1], 0.1],
          [cursorPos[0], cursorPos[1], 0.1],
        ]}
        color="#3b82f6"
        lineWidth={2}
        worldUnits={false}
        dashed
        dashSize={0.15}
        gapSize={0.08}
      />
      
      {/* Start point indicator */}
      <mesh position={[start[0], start[1], 0.1]}>
        <circleGeometry args={[0.08, 16]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
      
      {/* End point indicator (snapped position) */}
      <mesh position={[cursorPos[0], cursorPos[1], 0.1]}>
        <circleGeometry args={[0.06, 16]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
      
      {/* Snap indicator ring */}
      {snapEnabled && (
        <mesh position={[cursorPos[0], cursorPos[1], 0.09]}>
          <ringGeometry args={[0.08, 0.1, 16]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
        </mesh>
      )}

      {/* Length preview */}
      {length > 0.1 && (
        <Text
          position={[midX, midY + 0.2, 0.3]}
          rotation={[0, 0, 0]}
          fontSize={0.14}
          color="#3b82f6"
          anchorX="center"
          anchorY="middle"
          font={undefined}
          backgroundColor="white"
          padding={0.05}
        >
          {displayLength}
        </Text>
      )}
    </group>
  );
}
