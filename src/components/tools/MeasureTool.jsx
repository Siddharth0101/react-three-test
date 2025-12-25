// src/components/tools/MeasureTool.jsx
import { useState, useEffect, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { useSelector } from "react-redux";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";

export default function MeasureTool() {
  const selectedTool = useSelector((s) => s.tool.selectedTool);
  const mode = useSelector((s) => s.viewMode.mode);
  const snapToGrid = useSelector((s) => s.settings?.snapToGrid ?? true);
  const gridSize = useSelector((s) => s.settings?.gridSize ?? 0.25);
  const { camera, raycaster, pointer } = useThree();

  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [cursorPos, setCursorPos] = useState([0, 0]);
  const [measurements, setMeasurements] = useState([]); // Store temporary measurements

  const isActive = selectedTool === "measure";

  // Get world position from pointer
  const getWorldPosition = useCallback(() => {
    raycaster.setFromCamera(pointer, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
    
    let x = intersection.x;
    let y = intersection.y;
    
    // Snap to grid if enabled
    if (snapToGrid) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }
    
    return [x, y];
  }, [camera, raycaster, pointer, snapToGrid, gridSize]);

  // Update cursor position
  useEffect(() => {
    if (!isActive || mode !== "2d") return;

    const interval = setInterval(() => {
      const pos = getWorldPosition();
      setCursorPos(pos);
      if (startPoint && !endPoint) {
        // Update live measurement
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isActive, mode, getWorldPosition, startPoint, endPoint]);

  // Clear measurements when tool changes
  useEffect(() => {
    if (!isActive) {
      setStartPoint(null);
      setEndPoint(null);
    }
  }, [isActive]);

  const handleClick = useCallback(
    (event) => {
      if (!isActive) return;
      event.stopPropagation();

      if (!startPoint) {
        setStartPoint(cursorPos);
      } else {
        // Complete measurement
        const newMeasurement = {
          id: Date.now(),
          start: startPoint,
          end: cursorPos,
        };
        setMeasurements((prev) => [...prev, newMeasurement]);
        setStartPoint(null);
        setEndPoint(null);
      }
    },
    [isActive, startPoint, cursorPos]
  );

  const handleRightClick = useCallback(
    (event) => {
      if (!isActive) return;
      event.preventDefault();
      event.stopPropagation();
      
      // Cancel current measurement
      setStartPoint(null);
      setEndPoint(null);
    },
    [isActive]
  );

  const clearMeasurements = useCallback(() => {
    setMeasurements([]);
  }, []);

  // Calculate distance
  const calculateDistance = (p1, p2) => {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Format distance for display
  const formatDistance = (dist) => {
    if (dist >= 1) {
      return `${dist.toFixed(2)}m`;
    }
    return `${(dist * 100).toFixed(0)}cm`;
  };

  if (!isActive || mode !== "2d") return null;

  const currentDistance = startPoint ? calculateDistance(startPoint, cursorPos) : 0;
  const angle = startPoint ? Math.atan2(cursorPos[1] - startPoint[1], cursorPos[0] - startPoint[0]) : 0;

  return (
    <group>
      {/* Click catcher */}
      <mesh
        position={[0, 0, 0.01]}
        onClick={handleClick}
        onContextMenu={handleRightClick}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Cursor indicator */}
      <group position={[cursorPos[0], cursorPos[1], 0.4]}>
        {/* Crosshair */}
        <Line
          points={[[-0.08, 0, 0], [0.08, 0, 0]]}
          color="#ef4444"
          lineWidth={2}
          worldUnits={false}
        />
        <Line
          points={[[0, -0.08, 0], [0, 0.08, 0]]}
          color="#ef4444"
          lineWidth={2}
          worldUnits={false}
        />
        {/* Circle */}
        <mesh>
          <ringGeometry args={[0.06, 0.08, 24]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Active measurement line */}
      {startPoint && (
        <group>
          {/* Main measurement line */}
          <Line
            points={[
              [startPoint[0], startPoint[1], 0.35],
              [cursorPos[0], cursorPos[1], 0.35],
            ]}
            color="#ef4444"
            lineWidth={2}
            worldUnits={false}
          />

          {/* Start point marker */}
          <mesh position={[startPoint[0], startPoint[1], 0.36]}>
            <circleGeometry args={[0.05, 16]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>

          {/* End ticks */}
          {currentDistance > 0.1 && (
            <>
              {/* Start tick */}
              <Line
                points={[
                  [startPoint[0] - Math.sin(angle) * 0.08, startPoint[1] + Math.cos(angle) * 0.08, 0.35],
                  [startPoint[0] + Math.sin(angle) * 0.08, startPoint[1] - Math.cos(angle) * 0.08, 0.35],
                ]}
                color="#ef4444"
                lineWidth={2}
                worldUnits={false}
              />
              {/* End tick */}
              <Line
                points={[
                  [cursorPos[0] - Math.sin(angle) * 0.08, cursorPos[1] + Math.cos(angle) * 0.08, 0.35],
                  [cursorPos[0] + Math.sin(angle) * 0.08, cursorPos[1] - Math.cos(angle) * 0.08, 0.35],
                ]}
                color="#ef4444"
                lineWidth={2}
                worldUnits={false}
              />
            </>
          )}

          {/* Distance label */}
          {currentDistance > 0.05 && (
            <group
              position={[
                (startPoint[0] + cursorPos[0]) / 2,
                (startPoint[1] + cursorPos[1]) / 2,
                0.4,
              ]}
            >
              {/* Background */}
              <mesh rotation={[0, 0, angle]}>
                <planeGeometry args={[0.6, 0.18]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
              <Text
                rotation={[0, 0, angle > Math.PI / 2 || angle < -Math.PI / 2 ? angle + Math.PI : angle]}
                fontSize={0.1}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
              >
                {formatDistance(currentDistance)}
              </Text>
            </group>
          )}
        </group>
      )}

      {/* Stored measurements */}
      {measurements.map((m) => {
        const dist = calculateDistance(m.start, m.end);
        const ang = Math.atan2(m.end[1] - m.start[1], m.end[0] - m.start[0]);
        
        return (
          <group key={m.id}>
            <Line
              points={[
                [m.start[0], m.start[1], 0.32],
                [m.end[0], m.end[1], 0.32],
              ]}
              color="#dc2626"
              lineWidth={1.5}
              worldUnits={false}
              dashed
              dashSize={0.05}
              gapSize={0.025}
            />
            {/* Start marker */}
            <mesh position={[m.start[0], m.start[1], 0.33]}>
              <circleGeometry args={[0.03, 12]} />
              <meshBasicMaterial color="#dc2626" />
            </mesh>
            {/* End marker */}
            <mesh position={[m.end[0], m.end[1], 0.33]}>
              <circleGeometry args={[0.03, 12]} />
              <meshBasicMaterial color="#dc2626" />
            </mesh>
            {/* Label */}
            <group
              position={[
                (m.start[0] + m.end[0]) / 2,
                (m.start[1] + m.end[1]) / 2,
                0.35,
              ]}
            >
              <mesh rotation={[0, 0, ang]}>
                <planeGeometry args={[0.5, 0.14]} />
                <meshBasicMaterial color="#dc2626" transparent opacity={0.9} />
              </mesh>
              <Text
                rotation={[0, 0, ang > Math.PI / 2 || ang < -Math.PI / 2 ? ang + Math.PI : ang]}
                fontSize={0.08}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {formatDistance(dist)}
              </Text>
            </group>
          </group>
        );
      })}

      {/* Clear button if there are measurements */}
      {measurements.length > 0 && (
        <mesh
          position={[cursorPos[0] + 0.3, cursorPos[1] + 0.2, 0.5]}
          onClick={(e) => {
            e.stopPropagation();
            clearMeasurements();
          }}
        >
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#666" />
        </mesh>
      )}
    </group>
  );
}

