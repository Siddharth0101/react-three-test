// src/components/objects/WallObj.jsx
import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";
import { selectObject } from "../../store/toolSlice";

export default function WallObj({ id, start, end, props, height: heightProp = 3, thickness: thicknessProp = 0.15 }) {
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.viewMode.mode);
  const selectedTool = useSelector((s) => s.tool.selectedTool);
  const selectedObjectId = useSelector((s) => s.tool.selectedObjectId);
  const showMeasurements = useSelector((s) => s.settings?.showMeasurements ?? true);
  
  const isSelected = selectedObjectId === id;

  // Handle both formats: 
  // 1. start/end arrays (from wall tool)
  // 2. props.x1,y1,x2,y2 (from AI)
  // Ensure we always have valid numbers
  const getWallStart = () => {
    if (start && Array.isArray(start) && start.length >= 2 && 
        typeof start[0] === 'number' && typeof start[1] === 'number' &&
        !isNaN(start[0]) && !isNaN(start[1])) {
      return start;
    }
    if (props && typeof props.x1 === 'number' && typeof props.y1 === 'number' &&
        !isNaN(props.x1) && !isNaN(props.y1)) {
      return [props.x1, props.y1];
    }
    return [0, 0];
  };
  
  const getWallEnd = () => {
    if (end && Array.isArray(end) && end.length >= 2 && 
        typeof end[0] === 'number' && typeof end[1] === 'number' &&
        !isNaN(end[0]) && !isNaN(end[1])) {
      return end;
    }
    if (props && typeof props.x2 === 'number' && typeof props.y2 === 'number' &&
        !isNaN(props.x2) && !isNaN(props.y2)) {
      return [props.x2, props.y2];
    }
    return [0, 0];
  };
  
  const wallStart = getWallStart();
  const wallEnd = getWallEnd();
  const height = props?.height || heightProp;
  const thickness = props?.thickness || thicknessProp;

  // Calculate wall geometry
  const wallGeometry = useMemo(() => {
    const [x1, y1] = wallStart;
    const [x2, y2] = wallEnd;

    // Direction vector
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) return null;

    // Center position
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;

    // Rotation angle
    const angle = Math.atan2(dy, dx);

    // Normal vector (perpendicular to wall)
    const nx = -dy / length;
    const ny = dx / length;

    return { cx, cy, length, angle, x1, y1, x2, y2, nx, ny };
  }, [wallStart, wallEnd]);

  if (!wallGeometry) return null;

  const { cx, cy, length, angle, x1, y1, x2, y2, nx, ny } = wallGeometry;
  const halfThickness = thickness / 2;

  // Format length for display
  const displayLength = length >= 1 
    ? `${length.toFixed(2)}m` 
    : `${(length * 100).toFixed(0)}cm`;

  // Handle wall click for selection
  const handleClick = (e) => {
    if (selectedTool === "select" && mode === "2d") {
      e.stopPropagation();
      dispatch(selectObject(id));
    }
  };

  // Wall color based on selection state
  const wallColor = isSelected ? "#2196F3" : "#1a1a2e";
  const selectionOutlineColor = "#2196F3";

  // 2D mode - render wall with rounded corners and measurement
  if (mode === "2d") {
    // Offset for dimension text (above the wall)
    const textOffset = 0.25;
    const textX = cx + nx * textOffset;
    const textY = cy + ny * textOffset;

    return (
      <group onClick={handleClick} style={{ cursor: selectedTool === "select" ? "pointer" : "default" }}>
        {/* Selection highlight */}
        {isSelected && (
          <>
            <mesh position={[cx, cy, -0.01]} rotation={[0, 0, angle]}>
              <planeGeometry args={[length + 0.1, thickness + 0.1]} />
              <meshBasicMaterial color={selectionOutlineColor} transparent opacity={0.3} />
            </mesh>
            {/* Selection corners */}
            <mesh position={[x1, y1, 0.25]}>
              <circleGeometry args={[0.06, 8]} />
              <meshBasicMaterial color={selectionOutlineColor} />
            </mesh>
            <mesh position={[x2, y2, 0.25]}>
              <circleGeometry args={[0.06, 8]} />
              <meshBasicMaterial color={selectionOutlineColor} />
            </mesh>
          </>
        )}

        {/* Main wall body */}
        <mesh position={[cx, cy, 0]} rotation={[0, 0, angle]}>
          <planeGeometry args={[length, thickness]} />
          <meshBasicMaterial color={wallColor} />
        </mesh>
        
        {/* Start cap (circle for smooth corners) */}
        <mesh position={[x1, y1, 0]}>
          <circleGeometry args={[halfThickness, 16]} />
          <meshBasicMaterial color={wallColor} />
        </mesh>
        
        {/* End cap (circle for smooth corners) */}
        <mesh position={[x2, y2, 0]}>
          <circleGeometry args={[halfThickness, 16]} />
          <meshBasicMaterial color={wallColor} />
        </mesh>

        {/* Measurements - only show if enabled */}
        {showMeasurements && (
          <>
            {/* Dimension line - start tick */}
            <Line
              points={[
                [x1 + nx * 0.08, y1 + ny * 0.08, 0.2],
                [x1 + nx * 0.18, y1 + ny * 0.18, 0.2],
              ]}
              color="#666666"
              lineWidth={1}
            />

            {/* Dimension line - end tick */}
            <Line
              points={[
                [x2 + nx * 0.08, y2 + ny * 0.08, 0.2],
                [x2 + nx * 0.18, y2 + ny * 0.18, 0.2],
              ]}
              color="#666666"
              lineWidth={1}
            />

            {/* Dimension line - connecting line */}
            <Line
              points={[
                [x1 + nx * 0.13, y1 + ny * 0.13, 0.2],
                [x2 + nx * 0.13, y2 + ny * 0.13, 0.2],
              ]}
              color="#666666"
              lineWidth={1}
            />

            {/* Dimension text */}
            <Text
              position={[textX, textY, 0.3]}
              rotation={[0, 0, angle]}
              fontSize={0.12}
              color="#333333"
              anchorX="center"
              anchorY="middle"
              font={undefined}
            >
              {displayLength}
            </Text>
          </>
        )}
      </group>
    );
  }

  // 3D mode - render as extruded box with cylinder caps at corners
  return (
    <group>
      {/* Main wall body */}
      <mesh position={[cx, height / 2, cy]} rotation={[0, -angle, 0]}>
        <boxGeometry args={[length, height, thickness]} />
        <meshStandardMaterial color="#e8e4e1" />
      </mesh>
      
      {/* Start corner cylinder */}
      <mesh position={[x1, height / 2, y1]}>
        <cylinderGeometry args={[halfThickness, halfThickness, height, 16]} />
        <meshStandardMaterial color="#e8e4e1" />
      </mesh>
      
      {/* End corner cylinder */}
      <mesh position={[x2, height / 2, y2]}>
        <cylinderGeometry args={[halfThickness, halfThickness, height, 16]} />
        <meshStandardMaterial color="#e8e4e1" />
      </mesh>
    </group>
  );
}
