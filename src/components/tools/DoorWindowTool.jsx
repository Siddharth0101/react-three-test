// src/components/tools/DoorWindowTool.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { useDispatch, useSelector } from "react-redux";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { addDoor, addWindow } from "../../store/sceneSlice";

export default function DoorWindowTool() {
  const dispatch = useDispatch();
  const selectedTool = useSelector((s) => s.tool.selectedTool);
  const mode = useSelector((s) => s.viewMode.mode);
  const walls = useSelector((s) =>
    s.scene.objects.filter((o) => o.type === "wall")
  );
  const { camera, raycaster, pointer } = useThree();

  const [hoverWall, setHoverWall] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0.5);
  const [cursorPos, setCursorPos] = useState([0, 0]);

  const isActive = selectedTool === "door" || selectedTool === "window";

  // Get world position from pointer
  const getWorldPosition = useCallback(() => {
    raycaster.setFromCamera(pointer, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
    return [intersection.x, intersection.y];
  }, [camera, raycaster, pointer]);

  // Find nearest wall and position along it
  const findNearestWall = useCallback(
    (point) => {
      if (walls.length === 0) return null;

      let nearestWall = null;
      let nearestDist = Infinity;
      let nearestT = 0.5;

      for (const wall of walls) {
        const [x1, y1] = wall.start;
        const [x2, y2] = wall.end;
        const [px, py] = point;

        // Vector from start to end
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSq = dx * dx + dy * dy;

        if (lengthSq === 0) continue;

        // Project point onto wall line
        let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
        t = Math.max(0.1, Math.min(0.9, t)); // Clamp to avoid edges

        // Closest point on wall
        const closestX = x1 + t * dx;
        const closestY = y1 + t * dy;

        // Distance from point to closest point on wall
        const dist = Math.sqrt(
          (px - closestX) * (px - closestX) + (py - closestY) * (py - closestY)
        );

        if (dist < nearestDist && dist < 0.5) {
          nearestDist = dist;
          nearestWall = wall;
          nearestT = t;
        }
      }

      return nearestWall ? { wall: nearestWall, t: nearestT } : null;
    },
    [walls]
  );

  // Update hover state
  useEffect(() => {
    if (!isActive || mode !== "2d") {
      setHoverWall(null);
      return;
    }

    const interval = setInterval(() => {
      const pos = getWorldPosition();
      setCursorPos(pos);

      const result = findNearestWall(pos);
      if (result) {
        setHoverWall(result.wall);
        setHoverPosition(result.t);
      } else {
        setHoverWall(null);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isActive, mode, getWorldPosition, findNearestWall]);

  const handleClick = useCallback(
    (event) => {
      if (!isActive || !hoverWall) return;

      event.stopPropagation();

      if (selectedTool === "door") {
        dispatch(
          addDoor({
            wallId: hoverWall.id,
            position: hoverPosition,
          })
        );
      } else if (selectedTool === "window") {
        dispatch(
          addWindow({
            wallId: hoverWall.id,
            position: hoverPosition,
          })
        );
      }
    },
    [isActive, hoverWall, hoverPosition, selectedTool, dispatch]
  );

  // Calculate preview position - MUST be called before any returns
  const previewPos = useMemo(() => {
    if (!hoverWall) return null;

    const [x1, y1] = hoverWall.start;
    const [x2, y2] = hoverWall.end;
    const x = x1 + (x2 - x1) * hoverPosition;
    const y = y1 + (y2 - y1) * hoverPosition;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    return { x, y, angle };
  }, [hoverWall, hoverPosition]);

  const width = selectedTool === "door" ? 0.9 : 1.0;

  // Early return AFTER all hooks
  if (!isActive || mode !== "2d") return null;

  return (
    <group>
      {/* Click catcher */}
      <mesh position={[0, 0, 0.01]} onClick={handleClick}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Preview indicator */}
      {previewPos && hoverWall && (
        <group>
          {/* Preview rectangle */}
          <mesh
            position={[previewPos.x, previewPos.y, 0.3]}
            rotation={[0, 0, previewPos.angle]}
          >
            <planeGeometry args={[width, hoverWall.thickness * 2.5]} />
            <meshBasicMaterial
              color={selectedTool === "door" ? "#2563eb" : "#0ea5e9"}
              transparent
              opacity={0.5}
            />
          </mesh>

          {/* Guide lines to show snap */}
          <Line
            points={[
              [cursorPos[0], cursorPos[1], 0.3],
              [previewPos.x, previewPos.y, 0.3],
            ]}
            color={selectedTool === "door" ? "#2563eb" : "#0ea5e9"}
            lineWidth={1}
            worldUnits={false}
            dashed
            dashSize={0.1}
            gapSize={0.05}
          />
        </group>
      )}

      {/* No wall nearby indicator */}
      {!hoverWall && (
        <mesh position={[cursorPos[0], cursorPos[1], 0.3]}>
          <ringGeometry args={[0.08, 0.12, 16]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}
